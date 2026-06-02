"""Triangulate beach conditions from nearshore, offshore, and met stations."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from config import C_TO_F, M_TO_FT, MS_TO_KTS
from fetch_ndbc import StationReading


@dataclass
class TriangulatedStatus:
    observed_at: datetime
    wave_height_ft: Optional[float]
    swell_period_sec: Optional[float]
    swell_direction_deg: Optional[float]
    wind_speed_kts: Optional[float]
    wind_direction_deg: Optional[float]
    air_temp_f: Optional[float]
    water_temp_f: Optional[float]
    nearshore_wave_ft: Optional[float]
    offshore_swell_ft: Optional[float]
    offshore_swell_period_sec: Optional[float]
    offshore_swell_direction_deg: Optional[float]
    pressure_hpa: Optional[float]
    visibility_nm: Optional[float]


def _ft(m: Optional[float]) -> Optional[float]:
    if m is None:
        return None
    return round(m * M_TO_FT, 1)


def _f(c: Optional[float]) -> Optional[float]:
    if c is None:
        return None
    return round(C_TO_F(c), 1)


def _kts(ms: Optional[float]) -> Optional[float]:
    if ms is None:
        return None
    return round(ms * MS_TO_KTS, 1)


def triangulate(
    nearshore: Optional[StationReading],
    offshore: Optional[StationReading],
    met: Optional[StationReading],
) -> TriangulatedStatus:
    observed_at = datetime.now(timezone.utc)
    for reading in (nearshore, offshore, met):
        if reading and reading.observed_at:
            ts = reading.observed_at
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            if ts > observed_at:
                observed_at = ts

    nearshore_wave_ft = _ft(nearshore.wave_height_m if nearshore else None)
    offshore_swell_ft = _ft(
        (offshore.swell_height_m if offshore and offshore.swell_height_m else None)
        or (offshore.wave_height_m if offshore else None)
    )

    swell_period = None
    swell_dir = None
    if offshore:
        swell_period = offshore.swell_period_sec or offshore.wave_period_sec
        swell_dir = offshore.swell_direction_deg or offshore.wave_direction_deg
    if swell_period is None and nearshore:
        swell_period = nearshore.wave_period_sec

    water_temp_f = _f(nearshore.water_temp_c if nearshore else None)
    if water_temp_f is None and met:
        water_temp_f = _f(met.water_temp_c)

    air_temp_f = _f(met.air_temp_c if met else None)
    if air_temp_f is None and offshore:
        air_temp_f = _f(offshore.air_temp_c)

    return TriangulatedStatus(
        observed_at=observed_at,
        wave_height_ft=nearshore_wave_ft,
        swell_period_sec=round(swell_period, 1) if swell_period else None,
        swell_direction_deg=swell_dir,
        wind_speed_kts=_kts(met.wind_speed_ms if met else None),
        wind_direction_deg=met.wind_direction_deg if met else None,
        air_temp_f=air_temp_f,
        water_temp_f=water_temp_f,
        nearshore_wave_ft=nearshore_wave_ft,
        offshore_swell_ft=offshore_swell_ft,
        offshore_swell_period_sec=round(offshore.swell_period_sec or offshore.wave_period_sec, 1)
        if offshore and (offshore.swell_period_sec or offshore.wave_period_sec)
        else None,
        offshore_swell_direction_deg=offshore.swell_direction_deg or offshore.wave_direction_deg if offshore else None,
        pressure_hpa=round(met.pressure_hpa, 1) if met and met.pressure_hpa else None,
        visibility_nm=round(met.visibility_nm, 1) if met and met.visibility_nm else None,
    )
