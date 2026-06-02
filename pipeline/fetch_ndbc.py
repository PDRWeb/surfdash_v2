"""Fetch and parse NOAA NDBC realtime stdmet files."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

import requests

from config import NDBC_REALTIME_URL, NDBC_SPEC_URL, SPEC_LAG_WARN_MINUTES

logger = logging.getLogger(__name__)

MISSING = "MM"


@dataclass
class StationReading:
    station_id: str
    observed_at: datetime
    wave_height_m: Optional[float] = None
    wave_period_sec: Optional[float] = None
    wave_direction_deg: Optional[float] = None
    swell_height_m: Optional[float] = None
    swell_period_sec: Optional[float] = None
    swell_direction_deg: Optional[float] = None
    wind_wave_height_m: Optional[float] = None
    wind_wave_period_sec: Optional[float] = None
    wind_speed_ms: Optional[float] = None
    wind_direction_deg: Optional[float] = None
    wind_gust_ms: Optional[float] = None
    air_temp_c: Optional[float] = None
    water_temp_c: Optional[float] = None
    pressure_hpa: Optional[float] = None
    visibility_nm: Optional[float] = None


@dataclass
class NdbcTable:
    col: dict[str, int]
    rows: list[list[str]]


def _parse_float(value: str) -> Optional[float]:
    value = value.strip()
    if not value or value == MISSING:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _parse_wdir(value: str) -> Optional[float]:
    """Parse WDIR which may be compass label or degrees."""
    value = value.strip()
    if not value or value == MISSING:
        return None
    try:
        return float(value)
    except ValueError:
        compass = {
            "N": 0, "NNE": 22.5, "NE": 45, "ENE": 67.5,
            "E": 90, "ESE": 112.5, "SE": 135, "SSE": 157.5,
            "S": 180, "SSW": 202.5, "SW": 225, "WSW": 247.5,
            "W": 270, "WNW": 292.5, "NW": 315, "NNW": 337.5,
        }
        return compass.get(value.upper())


def _c_from_f(value: str) -> Optional[float]:
    f = _parse_float(value)
    if f is None:
        return None
    return (f - 32) * 5.0 / 9.0


def _temp_c(raw: str) -> Optional[float]:
    if raw and _parse_float(raw) and float(raw.strip()) > 50:
        return _c_from_f(raw)
    return _parse_float(raw)


def _normalize_header_column(name: str) -> str:
    """Strip NDBC '#' prefix; preserve case (MM=month, mm=minute, hh=hour)."""
    return name.lstrip("#")


def _parse_ndbc_table(text: str) -> Optional[NdbcTable]:
    lines = [line for line in text.splitlines() if line.strip()]
    if len(lines) < 2:
        return None

    header = lines[0].split()
    data_rows = [
        line.split()
        for line in lines[1:]
        if not line.startswith("#") and not line.startswith("YY")
    ]
    if not data_rows:
        return None

    col = {_normalize_header_column(name): idx for idx, name in enumerate(header)}
    return NdbcTable(col=col, rows=data_rows)


def _row_get(col: dict[str, int], row: list[str], name: str) -> str:
    idx = col.get(name)
    if idx is None or idx >= len(row):
        return MISSING
    return row[idx]


def _observed_at_from_row(col: dict[str, int], row: list[str]) -> Optional[datetime]:
    try:
        yy = _row_get(col, row, "YY")
        mm = _row_get(col, row, "MM")
        dd = _row_get(col, row, "DD")
        hh = _row_get(col, row, "hh")
        minute = _row_get(col, row, "mm")
        if MISSING in (yy, mm, dd, hh, minute):
            return None
        year_raw = int(yy)
        year = 2000 + year_raw if year_raw < 100 else year_raw
        return datetime(
            year, int(mm), int(dd), int(hh), int(minute), tzinfo=timezone.utc
        )
    except (ValueError, TypeError):
        return None


def _observed_at_from_row_or_fallback(
    station_id: str, col: dict[str, int], row: list[str]
) -> datetime:
    observed_at = _observed_at_from_row(col, row)
    if observed_at is not None:
        return observed_at
    logger.warning(
        "Failed to parse timestamp for station %s (YY=%s MM=%s DD=%s hh=%s mm=%s)",
        station_id,
        _row_get(col, row, "YY"),
        _row_get(col, row, "MM"),
        _row_get(col, row, "DD"),
        _row_get(col, row, "hh"),
        _row_get(col, row, "mm"),
    )
    return datetime.now(timezone.utc)


def _time_index(table: NdbcTable) -> dict[datetime, list[str]]:
    index: dict[datetime, list[str]] = {}
    for row in table.rows:
        observed_at = _observed_at_from_row(table.col, row)
        if observed_at is not None and observed_at not in index:
            index[observed_at] = row
    return index


def _common_latest_time(
    txt_times: set[datetime], spec_times: set[datetime]
) -> Optional[datetime]:
    common = txt_times & spec_times
    return max(common) if common else None


def _fetch_ndbc_text(url: str, station_id: str, *, log_errors: bool = True) -> Optional[str]:
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as exc:
        if log_errors:
            logger.error("Failed to fetch %s: %s", station_id, exc)
        else:
            logger.debug("No supplemental data at %s for %s: %s", url, station_id, exc)
        return None
    return response.text


def _txt_fields_from_row(col: dict[str, int], row: list[str]) -> dict[str, Optional[float]]:
    return {
        "wave_height_m": _parse_float(_row_get(col, row, "WVHT")),
        "wave_period_sec": _parse_float(_row_get(col, row, "DPD")),
        "wave_direction_deg": _parse_wdir(_row_get(col, row, "MWD")),
        "wind_speed_ms": _parse_float(_row_get(col, row, "WSPD")),
        "wind_direction_deg": _parse_wdir(_row_get(col, row, "WDIR")),
        "wind_gust_ms": _parse_float(_row_get(col, row, "GST")),
        "air_temp_c": _temp_c(_row_get(col, row, "ATMP")),
        "water_temp_c": _temp_c(_row_get(col, row, "WTMP")),
        "pressure_hpa": _parse_float(_row_get(col, row, "PRES")),
        "visibility_nm": _parse_float(_row_get(col, row, "VIS")),
    }


def _spec_fields_from_row(col: dict[str, int], row: list[str]) -> dict[str, Optional[float]]:
    return {
        "swell_height_m": _parse_float(_row_get(col, row, "SwH")),
        "swell_period_sec": _parse_float(_row_get(col, row, "SwP")),
        "swell_direction_deg": _parse_wdir(_row_get(col, row, "SwD")),
        "wind_wave_height_m": _parse_float(_row_get(col, row, "WWH")),
        "wind_wave_period_sec": _parse_float(_row_get(col, row, "WWP")),
    }


def fetch_station_reading(station_id: str) -> Optional[StationReading]:
    station_id = station_id.upper()
    text = _fetch_ndbc_text(NDBC_REALTIME_URL.format(station_id=station_id), station_id)
    if text is None:
        return None

    txt_table = _parse_ndbc_table(text)
    if txt_table is None:
        logger.warning("No data lines for station %s", station_id)
        return None

    txt_index = _time_index(txt_table)
    if not txt_index:
        logger.warning("No parseable timestamps in txt for station %s", station_id)
        return None

    spec_text = _fetch_ndbc_text(
        NDBC_SPEC_URL.format(station_id=station_id), station_id, log_errors=False
    )
    spec_table = _parse_ndbc_table(spec_text) if spec_text else None
    spec_index = _time_index(spec_table) if spec_table else {}

    matched_at: Optional[datetime] = None
    spec_row: Optional[list[str]] = None

    if spec_index:
        matched_at = _common_latest_time(set(txt_index), set(spec_index))
        txt_latest = max(txt_index)
        spec_latest = max(spec_index)
        if matched_at is None:
            logger.warning(
                "No common timestamp between txt and spec for %s; storing txt-only without swell",
                station_id,
            )
        else:
            spec_row = spec_index[matched_at]
            lag_min = (txt_latest - matched_at).total_seconds() / 60
            logger.info(
                "Station %s: txt_latest=%s spec_latest=%s matched=%s lag_min=%.0f",
                station_id,
                txt_latest,
                spec_latest,
                matched_at,
                lag_min,
            )
            if lag_min > SPEC_LAG_WARN_MINUTES:
                logger.warning(
                    "Station %s matched timestamp lags txt latest by %.0f min",
                    station_id,
                    lag_min,
                )

    if matched_at is not None:
        txt_row = txt_index[matched_at]
        observed_at = matched_at
    else:
        txt_row = txt_table.rows[0]
        observed_at = _observed_at_from_row_or_fallback(station_id, txt_table.col, txt_row)

    txt_fields = _txt_fields_from_row(txt_table.col, txt_row)
    spec_fields = (
        _spec_fields_from_row(spec_table.col, spec_row)
        if spec_row is not None and spec_table is not None
        else {}
    )

    return StationReading(
        station_id=station_id,
        observed_at=observed_at,
        wave_height_m=txt_fields["wave_height_m"],
        wave_period_sec=txt_fields["wave_period_sec"],
        wave_direction_deg=txt_fields["wave_direction_deg"],
        swell_height_m=spec_fields.get("swell_height_m"),
        swell_period_sec=spec_fields.get("swell_period_sec"),
        swell_direction_deg=spec_fields.get("swell_direction_deg"),
        wind_wave_height_m=spec_fields.get("wind_wave_height_m"),
        wind_wave_period_sec=spec_fields.get("wind_wave_period_sec"),
        wind_speed_ms=txt_fields["wind_speed_ms"],
        wind_direction_deg=txt_fields["wind_direction_deg"],
        wind_gust_ms=txt_fields["wind_gust_ms"],
        air_temp_c=txt_fields["air_temp_c"],
        water_temp_c=txt_fields["water_temp_c"],
        pressure_hpa=txt_fields["pressure_hpa"],
        visibility_nm=txt_fields["visibility_nm"],
    )
