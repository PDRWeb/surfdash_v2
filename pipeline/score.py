"""Surf quality scoring and status labels."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from triangulate import TriangulatedStatus


@dataclass
class ScoredStatus:
    total_score: int
    rating: str
    status_label: str


def _wind_score(wind_kts: Optional[float], swell_dir: Optional[float], wind_dir: Optional[float]) -> int:
    if wind_kts is None:
        return 10
    if wind_kts < 5:
        return 20
    if wind_kts < 10:
        return 15
    if wind_kts < 15:
        return 8
    return 3


def _wave_height_score(ft: Optional[float]) -> int:
    if ft is None:
        return 0
    if ft < 1:
        return 5
    if ft < 3:
        return 15
    if ft < 5:
        return 25
    if ft < 8:
        return 28
    return 20


def _period_score(sec: Optional[float]) -> int:
    if sec is None:
        return 0
    if sec < 6:
        return 5
    if sec < 9:
        return 15
    if sec < 12:
        return 22
    return 25


def _rating_from_score(score: int) -> str:
    if score >= 80:
        return "EPIC"
    if score >= 65:
        return "EXCELLENT"
    if score >= 50:
        return "GOOD"
    if score >= 35:
        return "FAIR"
    if score >= 20:
        return "POOR"
    return "FLAT"


def _status_label(status: TriangulatedStatus) -> str:
    near = status.nearshore_wave_ft or 0
    off = status.offshore_swell_ft or 0
    period = status.swell_period_sec or 0
    wind = status.wind_speed_kts or 0

    if near < 1 and off < 1:
        return "FLAT"
    if off > near + 1.5:
        return "BUILDING"
    if near > off + 1.0 and wind > 12:
        return "WIND CHOP"
    if near >= 5 and period >= 10:
        return "HEAVY SWELL"
    if period >= 9 and wind < 10:
        return "CLEAN SWELL"
    if wind > 15:
        return "BLOWN OUT"
    return "ACTIVE"


def score_status(status: TriangulatedStatus) -> ScoredStatus:
    wave_score = _wave_height_score(status.wave_height_ft)
    period_score = _period_score(status.swell_period_sec)
    swell_score = min(20, period_score)
    wind_score = _wind_score(status.wind_speed_kts, status.swell_direction_deg, status.wind_direction_deg)
    weather_score = 5 if status.air_temp_f and 65 <= status.air_temp_f <= 90 else 3

    total = min(100, wave_score + period_score + swell_score + wind_score + weather_score)
    rating = _rating_from_score(total)
    label = _status_label(status)

    return ScoredStatus(total_score=total, rating=rating, status_label=label)
