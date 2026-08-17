# Airport Delay Tracker — FAA Live NAS Status

Get current US airport ground delays, ground stops, and closures
straight from the official FAA National Airspace System status feed:
airport, reason, average/max delay, and closure windows.

Built for travel ops, logistics, and corporate travel teams who need
current airport-impact status without checking fly.faa.gov by hand.

## Input

```json
{
  "airportCodes": []
}
```

| Field | Type | Description |
|---|---|---|
| `airportCodes` | array of strings (optional) | Limit to specific airports by 3-letter FAA/IATA code, e.g. `["JFK", "ORD", "LAX"]`. Leave empty to return every airport currently affected nationwide. |

## Output

One record per active delay/closure entry. The exact fields depend on
the category (ground delay programs report `avgDelay`/`maxDelay`;
closures report `start`/`reopen`; ground stops report `endTime`):

```json
{
  "category": "Ground Delay Programs",
  "updateTime": "Mon Aug 17 18:53:26 2026 GMT",
  "airport": "SFO",
  "reason": "low ceilings",
  "avgDelay": "43 minutes",
  "maxDelay": "1 hour and 55 minutes"
}
```

```json
{
  "category": "Airport Closures",
  "updateTime": "Mon Aug 17 18:53:26 2026 GMT",
  "airport": "LAX",
  "reason": "!LAX 05/277 LAX AD AP CLSD TO NON SKED TRANSIENT GA ACFT ...",
  "start": "May 27 at 18:26 UTC.",
  "reopen": "May 28 at 16:00 UTC."
}
```

At any given time only a handful of airports are affected — a check
that finds none still returns no items but is billed once.

## How it works

Direct calls to the official [FAA NAS status
feed](https://nasstatus.faa.gov/api/airport-status-information) (the
same live data source behind fly.faa.gov) — no proxy, no key, no
scraping. Public U.S. government data, updated continuously by the
FAA as conditions change.

## Pricing note

Billed per **check**, not per record returned — one charge whether the
check returns 0 records or 50.
