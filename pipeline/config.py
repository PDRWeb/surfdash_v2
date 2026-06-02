"""Pipeline configuration — stations, units, retention."""

from zoneinfo import ZoneInfo

STATIONS = ["41009", "41113", "TRDF1"]

NDBC_REALTIME_URL = "https://www.ndbc.noaa.gov/data/realtime2/{station_id}.txt"

NDBC_SPEC_URL = "https://www.ndbc.noaa.gov/data/realtime2/{station_id}.spec"

SPEC_LAG_WARN_MINUTES = 60

RETENTION_DAYS = 7

FORECAST_HOURS = 4

DAYTIME_START_HOUR = 6
DAYTIME_END_HOUR = 20

LOCAL_TZ = ZoneInfo("America/New_York")

M_TO_FT = 3.28084
MS_TO_KTS = 1.94384
C_TO_F = lambda c: (c * 9.0 / 5.0) + 32 if c is not None else None
INHG_TO_HPA = 33.8639
