import * as cheerio from 'cheerio';

const BASE_URL = 'https://nasstatus.faa.gov/api/airport-status-information';

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 15_000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        let res;
        try {
            res = await fetch(url, { headers: { Connection: 'close' }, signal: controller.signal });
        } catch (err) {
            lastError = err.name === 'AbortError' ? new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`) : err;
            if (attempt < MAX_ATTEMPTS) {
                await sleep(1000 * 2 ** (attempt - 1));
                continue;
            }
            throw lastError;
        } finally {
            clearTimeout(timeoutId);
        }
        if (res.ok) return res;
        if (!TRANSIENT_STATUSES.has(res.status)) {
            throw new Error(`FAA NAS status API request failed: ${res.status} ${res.statusText}`);
        }
        lastError = new Error(`FAA NAS status API request failed: ${res.status} ${res.statusText}`);
        if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
    }
    throw lastError;
}

/** Known FAA feed field tags, normalized to friendlier names. Unknown tags pass through as-is
 *  since the feed's category set (Ground Delay/Ground Stop/Closures/Arr-Dep Delay) isn't fully
 *  documented and can add fields without notice. */
const FIELD_MAP = {
    ARPT: 'airport',
    Reason: 'reason',
    Avg: 'avgDelay',
    Max: 'maxDelay',
    Min: 'minDelay',
    Start: 'start',
    Reopen: 'reopen',
    EndTime: 'endTime',
    Trend: 'trend',
    Type: 'type',
};

export async function fetchAirportStatus({ airportCodes }) {
    const res = await fetchWithRetry(BASE_URL);
    const xml = await res.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    const updateTime = $('Update_Time').first().text().trim();
    const wanted = airportCodes?.length
        ? new Set(airportCodes.map((c) => c.toUpperCase().trim()))
        : null;

    const records = [];

    $('Delay_type').each((_, delayTypeEl) => {
        const $delayType = $(delayTypeEl);
        const category = $delayType.children('Name').first().text().trim();

        // The list child is whichever sibling isn't <Name> — its tag name varies by category
        // (Ground_Delay_List, Ground_Stop_List, Airport_Closure_List, Arrival_Departure_Delay_List).
        $delayType.children().not('Name').each((__, listEl) => {
            $(listEl)
                .children()
                .each((___, recordEl) => {
                    const $record = $(recordEl);
                    const record = { category, updateTime };

                    $record.children().each((____, fieldEl) => {
                        const tag = fieldEl.tagName ?? fieldEl.name;
                        const key = FIELD_MAP[tag] ?? tag;
                        record[key] = $(fieldEl).text().trim();
                    });

                    if (wanted && !(record.airport && wanted.has(record.airport.toUpperCase()))) {
                        return;
                    }
                    records.push(record);
                });
        });
    });

    return records;
}
