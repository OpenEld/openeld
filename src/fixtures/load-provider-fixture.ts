import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildGeotabPayload } from "../adapters/providers/geotab";
import { buildMotivePayload } from "../adapters/providers/motive";
import { buildSamsaraPayload } from "../adapters/providers/samsara";

const REPO_ROOT = new URL("../../", import.meta.url).pathname;

export function readProviderFixtureJson<T>(...segments: string[]) {
  return JSON.parse(
    readFileSync(join(REPO_ROOT, ...segments), "utf8"),
  ) as T;
}

export function loadSamsaraFixtureSet() {
  return buildSamsaraPayload({
    drivers: readProviderFixtureJson("tests/fixtures/providers/samsara/drivers/raw.json"),
    vehicles: readProviderFixtureJson("tests/fixtures/providers/samsara/vehicles/raw.json"),
    hosLogs: readProviderFixtureJson("tests/fixtures/providers/samsara/hos-logs/raw.json"),
    hosClocks: readProviderFixtureJson("tests/fixtures/providers/samsara/hos-clocks/raw.json"),
    vehicleLocations: readProviderFixtureJson(
      "tests/fixtures/providers/samsara/vehicle-locations/raw.json",
    ),
    dvirs: readProviderFixtureJson("tests/fixtures/providers/samsara/dvirs/raw.json"),
    feedCursor: readProviderFixtureJson(
      "tests/fixtures/providers/samsara/feed-cursor/raw.json",
    ),
    geofenceWebhookEvents: [
      readProviderFixtureJson(
        "tests/fixtures/providers/samsara/geofence-entry-webhook/raw.json",
      ),
      readProviderFixtureJson(
        "tests/fixtures/providers/samsara/geofence-exit-webhook/raw.json",
      ),
    ],
  });
}

export function loadMotiveFixtureSet() {
  return buildMotivePayload({
    drivers: readProviderFixtureJson("tests/fixtures/providers/motive/drivers/raw.json"),
    vehicles: readProviderFixtureJson("tests/fixtures/providers/motive/vehicles/raw.json"),
    hosLogs: readProviderFixtureJson("tests/fixtures/providers/motive/hos-logs/raw.json"),
    vehicleLocations: readProviderFixtureJson(
      "tests/fixtures/providers/motive/vehicle-locations/raw.json",
    ),
    pageSync: readProviderFixtureJson("tests/fixtures/providers/motive/page-sync/raw.json"),
  });
}

export function loadGeotabFixtureSet() {
  return buildGeotabPayload({
    users: readProviderFixtureJson("tests/fixtures/providers/geotab/users/raw.json"),
    devices: readProviderFixtureJson("tests/fixtures/providers/geotab/devices/raw.json"),
    dutyStatusLogs: readProviderFixtureJson(
      "tests/fixtures/providers/geotab/duty-status-logs/raw.json",
    ),
    driverRegulations: readProviderFixtureJson(
      "tests/fixtures/providers/geotab/driver-regulations/raw.json",
    ),
    logRecords: readProviderFixtureJson(
      "tests/fixtures/providers/geotab/log-records/raw.json",
    ),
    getfeed: readProviderFixtureJson("tests/fixtures/providers/geotab/getfeed/raw.json"),
  });
}
