"""4-hour daytime-only forecast generation."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Optional
from zoneinfo import ZoneInfo

from config import DAYTIME_END_HOUR, DAYTIME_START_HOUR, FORECAST_HOURS, LOCAL_TZ
from score import ScoredStatus, score_status
from triangulate import TriangulatedStatus, triangulate
from fetch_ndbc import StationReading


@dataclass
class ForecastRow:
    forecast_hour: datetime
    wave_height_ft: Optional[float]
    swell_period_sec: Optional[float]
    wind_speed_kts: Optional[float]
    rating: str
    status_label: str


def _is_daytime(dt: datetime) -> bool:
    local = dt.astimezone(LOCAL_TZ)
    return DAYTIME_START_HOUR <= local.hour < DAYTIME_END_HOUR


def _next_daytime_hours(start: datetime, count: int) -> List[datetime]:
    hours: List[datetime] = []
    cursor = start.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
    while len(hours) < count:
        if _is_daytime(cursor):
            hours.append(cursor)
        cursor += timedelta(hours=1)
        if (cursor - start).days > 3:
            break
    return hours


def generate_forecast(
    current: TriangulatedStatus,
    scored: ScoredStatus,
    history_nearshore: List[StationReading],
) -> List[ForecastRow]:
    """Simple trend extrapolation from last few nearshore wave readings."""
    trend_delta = 0.0
    if len(history_nearshore) >= 2:
        recent = history_nearshore[0].wave_height_m or 0
        older = history_nearshore[min(len(history_nearshore) - 1, 3)].wave_height_m or 0
        if recent and older:
            trend_delta = (recent - older) / max(len(history_nearshore) - 1, 1)

    rows: List[ForecastRow] = []
    base_wave_m = (current.wave_height_ft or 0) / 3.28084

    for i, hour in enumerate(_next_daytime_hours(current.observed_at, FORECAST_HOURS), start=1):
        projected_m = base_wave_m + trend_delta * i
        projected_ft = round(max(0, projected_m) * 3.28084, 1)

        projected_status = TriangulatedStatus(
            observed_at=hour,
            wave_height_ft=projected_ft,
            swell_period_sec=current.swell_period_sec,
            swell_direction_deg=current.swell_direction_deg,
            wind_speed_kts=current.wind_speed_kts,
            wind_direction_deg=current.wind_direction_deg,
            air_temp_f=current.air_temp_f,
            water_temp_f=current.water_temp_f,
            nearshore_wave_ft=projected_ft,
            offshore_swell_ft=current.offshore_swell_ft,
            offshore_swell_period_sec=current.offshore_swell_period_sec,
            offshore_swell_direction_deg=current.offshore_swell_direction_deg,
            pressure_hpa=current.pressure_hpa,
            visibility_nm=current.visibility_nm,
        )
        projected_score = score_status(projected_status)

        rows.append(
            ForecastRow(
                forecast_hour=hour,
                wave_height_ft=projected_ft,
                swell_period_sec=current.swell_period_sec,
                wind_speed_kts=current.wind_speed_kts,
                rating=projected_score.rating,
                status_label=projected_score.status_label,
            )
        )

    return rows
