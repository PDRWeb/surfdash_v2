"""Postgres / Supabase database helpers."""

from __future__ import annotations

import logging
import os
from contextlib import contextmanager
from typing import Any, Dict, List, Optional

import psycopg2
import psycopg2.extras

from config import RETENTION_DAYS
from fetch_ndbc import StationReading
from forecast import ForecastRow
from triangulate import TriangulatedStatus
from score import ScoredStatus

logger = logging.getLogger(__name__)


def get_database_url() -> str:
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL environment variable is required")
    return url


@contextmanager
def get_connection():
    conn = psycopg2.connect(get_database_url())
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def insert_observation(conn, reading: StationReading) -> None:
    sql = """
        INSERT INTO station_observations (
            station_id, observed_at,
            wave_height_m, wave_period_sec, wave_direction_deg,
            swell_height_m, swell_period_sec, swell_direction_deg,
            wind_wave_height_m, wind_wave_period_sec,
            wind_speed_ms, wind_direction_deg, wind_gust_ms,
            air_temp_c, water_temp_c, pressure_hpa, visibility_nm
        ) VALUES (
            %(station_id)s, %(observed_at)s,
            %(wave_height_m)s, %(wave_period_sec)s, %(wave_direction_deg)s,
            %(swell_height_m)s, %(swell_period_sec)s, %(swell_direction_deg)s,
            %(wind_wave_height_m)s, %(wind_wave_period_sec)s,
            %(wind_speed_ms)s, %(wind_direction_deg)s, %(wind_gust_ms)s,
            %(air_temp_c)s, %(water_temp_c)s, %(pressure_hpa)s, %(visibility_nm)s
        )
        ON CONFLICT (station_id, observed_at) DO UPDATE SET
            wave_height_m = EXCLUDED.wave_height_m,
            wave_period_sec = EXCLUDED.wave_period_sec,
            wave_direction_deg = EXCLUDED.wave_direction_deg,
            swell_height_m = EXCLUDED.swell_height_m,
            swell_period_sec = EXCLUDED.swell_period_sec,
            swell_direction_deg = EXCLUDED.swell_direction_deg,
            wind_wave_height_m = EXCLUDED.wind_wave_height_m,
            wind_wave_period_sec = EXCLUDED.wind_wave_period_sec,
            wind_speed_ms = EXCLUDED.wind_speed_ms,
            wind_direction_deg = EXCLUDED.wind_direction_deg,
            wind_gust_ms = EXCLUDED.wind_gust_ms,
            air_temp_c = EXCLUDED.air_temp_c,
            water_temp_c = EXCLUDED.water_temp_c,
            pressure_hpa = EXCLUDED.pressure_hpa,
            visibility_nm = EXCLUDED.visibility_nm
    """
    with conn.cursor() as cur:
        cur.execute(sql, {
            "station_id": reading.station_id,
            "observed_at": reading.observed_at,
            "wave_height_m": reading.wave_height_m,
            "wave_period_sec": reading.wave_period_sec,
            "wave_direction_deg": reading.wave_direction_deg,
            "swell_height_m": reading.swell_height_m,
            "swell_period_sec": reading.swell_period_sec,
            "swell_direction_deg": reading.swell_direction_deg,
            "wind_wave_height_m": reading.wind_wave_height_m,
            "wind_wave_period_sec": reading.wind_wave_period_sec,
            "wind_speed_ms": reading.wind_speed_ms,
            "wind_direction_deg": reading.wind_direction_deg,
            "wind_gust_ms": reading.wind_gust_ms,
            "air_temp_c": reading.air_temp_c,
            "water_temp_c": reading.water_temp_c,
            "pressure_hpa": reading.pressure_hpa,
            "visibility_nm": reading.visibility_nm,
        })


def upsert_beach_status(
    conn,
    beach_id: int,
    status: TriangulatedStatus,
    scored: ScoredStatus,
) -> None:
    sql = """
        INSERT INTO beach_status (
            beach_id, observed_at,
            wave_height_ft, swell_period_sec, swell_direction_deg,
            wind_speed_kts, wind_direction_deg, air_temp_f, water_temp_f,
            nearshore_wave_ft, offshore_swell_ft, offshore_swell_period_sec,
            offshore_swell_direction_deg, pressure_hpa, visibility_nm,
            total_score, rating, status_label, updated_at
        ) VALUES (
            %(beach_id)s, %(observed_at)s,
            %(wave_height_ft)s, %(swell_period_sec)s, %(swell_direction_deg)s,
            %(wind_speed_kts)s, %(wind_direction_deg)s, %(air_temp_f)s, %(water_temp_f)s,
            %(nearshore_wave_ft)s, %(offshore_swell_ft)s, %(offshore_swell_period_sec)s,
            %(offshore_swell_direction_deg)s, %(pressure_hpa)s, %(visibility_nm)s,
            %(total_score)s, %(rating)s, %(status_label)s, NOW()
        )
        ON CONFLICT (beach_id) DO UPDATE SET
            observed_at = EXCLUDED.observed_at,
            wave_height_ft = EXCLUDED.wave_height_ft,
            swell_period_sec = EXCLUDED.swell_period_sec,
            swell_direction_deg = EXCLUDED.swell_direction_deg,
            wind_speed_kts = EXCLUDED.wind_speed_kts,
            wind_direction_deg = EXCLUDED.wind_direction_deg,
            air_temp_f = EXCLUDED.air_temp_f,
            water_temp_f = EXCLUDED.water_temp_f,
            nearshore_wave_ft = EXCLUDED.nearshore_wave_ft,
            offshore_swell_ft = EXCLUDED.offshore_swell_ft,
            offshore_swell_period_sec = EXCLUDED.offshore_swell_period_sec,
            offshore_swell_direction_deg = EXCLUDED.offshore_swell_direction_deg,
            pressure_hpa = EXCLUDED.pressure_hpa,
            visibility_nm = EXCLUDED.visibility_nm,
            total_score = EXCLUDED.total_score,
            rating = EXCLUDED.rating,
            status_label = EXCLUDED.status_label,
            updated_at = NOW()
    """
    with conn.cursor() as cur:
        cur.execute(sql, {
            "beach_id": beach_id,
            "observed_at": status.observed_at,
            "wave_height_ft": status.wave_height_ft,
            "swell_period_sec": status.swell_period_sec,
            "swell_direction_deg": status.swell_direction_deg,
            "wind_speed_kts": status.wind_speed_kts,
            "wind_direction_deg": status.wind_direction_deg,
            "air_temp_f": status.air_temp_f,
            "water_temp_f": status.water_temp_f,
            "nearshore_wave_ft": status.nearshore_wave_ft,
            "offshore_swell_ft": status.offshore_swell_ft,
            "offshore_swell_period_sec": status.offshore_swell_period_sec,
            "offshore_swell_direction_deg": status.offshore_swell_direction_deg,
            "pressure_hpa": status.pressure_hpa,
            "visibility_nm": status.visibility_nm,
            "total_score": scored.total_score,
            "rating": scored.rating,
            "status_label": scored.status_label,
        })


def replace_beach_forecast(conn, beach_id: int, rows: List[ForecastRow]) -> None:
    with conn.cursor() as cur:
        cur.execute("DELETE FROM beach_forecast WHERE beach_id = %s", (beach_id,))
        for row in rows:
            cur.execute(
                """
                INSERT INTO beach_forecast (
                    beach_id, forecast_hour, wave_height_ft, swell_period_sec,
                    wind_speed_kts, rating, status_label
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    beach_id,
                    row.forecast_hour,
                    row.wave_height_ft,
                    row.swell_period_sec,
                    row.wind_speed_kts,
                    row.rating,
                    row.status_label,
                ),
            )


def purge_old_observations(conn) -> int:
    with conn.cursor() as cur:
        cur.execute(
            f"DELETE FROM station_observations WHERE observed_at < NOW() - INTERVAL '{RETENTION_DAYS} days'"
        )
        return cur.rowcount


def get_beaches_with_stations(conn) -> List[Dict[str, Any]]:
    sql = """
        SELECT b.id AS beach_id, b.slug, bs.role, bs.station_id
        FROM beaches b
        JOIN beach_stations bs ON bs.beach_id = b.id
        ORDER BY b.display_order, bs.role
    """
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(sql)
        rows = cur.fetchall()

    beaches: Dict[int, Dict[str, Any]] = {}
    for row in rows:
        bid = row["beach_id"]
        if bid not in beaches:
            beaches[bid] = {"beach_id": bid, "slug": row["slug"], "stations": {}}
        beaches[bid]["stations"][row["role"]] = row["station_id"]
    return list(beaches.values())


def get_recent_observations(conn, station_id: str, limit: int = 6) -> List[StationReading]:
    sql = """
        SELECT station_id, observed_at,
               wave_height_m, wave_period_sec, wave_direction_deg,
               swell_height_m, swell_period_sec, swell_direction_deg,
               wind_speed_ms, wind_direction_deg, air_temp_c, water_temp_c
        FROM station_observations
        WHERE station_id = %s
        ORDER BY observed_at DESC
        LIMIT %s
    """
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(sql, (station_id, limit))
        rows = cur.fetchall()

    readings: List[StationReading] = []
    for row in rows:
        readings.append(
            StationReading(
                station_id=row["station_id"],
                observed_at=row["observed_at"],
                wave_height_m=row["wave_height_m"],
                wave_period_sec=row["wave_period_sec"],
                wave_direction_deg=row["wave_direction_deg"],
                swell_height_m=row["swell_height_m"],
                swell_period_sec=row["swell_period_sec"],
                wind_speed_ms=row["wind_speed_ms"],
                wind_direction_deg=row["wind_direction_deg"],
                air_temp_c=row["air_temp_c"],
                water_temp_c=row["water_temp_c"],
            )
        )
    return readings
