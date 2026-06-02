#!/usr/bin/env python3
"""SurfDash v2 pipeline entrypoint — fetch, triangulate, score, forecast."""

from __future__ import annotations

import logging
import sys

from config import STATIONS
from db import (
    get_beaches_with_stations,
    get_connection,
    get_recent_observations,
    insert_observation,
    purge_old_observations,
    replace_beach_forecast,
    upsert_beach_status,
)
from fetch_ndbc import fetch_station_reading
from forecast import generate_forecast
from score import score_status
from triangulate import triangulate

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


def main() -> int:
    readings = {}
    for station_id in STATIONS:
        logger.info("Fetching station %s", station_id)
        reading = fetch_station_reading(station_id)
        if reading:
            readings[station_id.upper()] = reading
            logger.info(
                "  observed_at=%s wave_m=%s swell_m=%s",
                reading.observed_at,
                reading.wave_height_m,
                reading.swell_height_m,
            )
        else:
            logger.warning("  No reading for %s", station_id)

    with get_connection() as conn:
        for station_id, reading in readings.items():
            insert_observation(conn, reading)

        beaches = get_beaches_with_stations(conn)
        for beach in beaches:
            stations = beach["stations"]
            nearshore = readings.get(stations.get("nearshore", ""))
            offshore = readings.get(stations.get("offshore", ""))
            met = readings.get(stations.get("met", ""))

            if not any([nearshore, offshore, met]):
                logger.warning("Skipping beach %s — no station data", beach["slug"])
                continue

            status = triangulate(nearshore, offshore, met)
            scored = score_status(status)
            upsert_beach_status(conn, beach["beach_id"], status, scored)
            logger.info(
                "Beach %s: %s ft, rating=%s, label=%s",
                beach["slug"],
                status.wave_height_ft,
                scored.rating,
                scored.status_label,
            )

            nearshore_id = stations.get("nearshore")
            history = get_recent_observations(conn, nearshore_id) if nearshore_id else []
            forecast_rows = generate_forecast(status, scored, history)
            replace_beach_forecast(conn, beach["beach_id"], forecast_rows)

        deleted = purge_old_observations(conn)
        logger.info("Purged %s observations older than retention window", deleted)

    logger.info("Pipeline complete")
    return 0


if __name__ == "__main__":
    sys.exit(main())
