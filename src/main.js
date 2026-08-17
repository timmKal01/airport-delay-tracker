import { Actor, log } from 'apify';
import { fetchAirportStatus } from './faa.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { airportCodes = [] } = input;

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const STATUS_CHECK_EVENT = 'airport-status-check';

const records = await fetchAirportStatus({ airportCodes });

for (const record of records) {
    await Actor.pushData(record);
}

await Actor.charge({ eventName: STATUS_CHECK_EVENT });

log.info(`Pushed ${records.length} airport status record(s)`);

await Actor.exit();
