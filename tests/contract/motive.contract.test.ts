import { describe, expect, test } from "bun:test";

import { normalizeMotiveWave1 } from "../../src/wave1";
import { expectOfficialDocsMetadata, readJson } from "./support";

describe("Motive Wave 1 fixtures", () => {
  const driversMetadata = readJson<any>(
    "tests/fixtures/providers/motive/drivers/metadata.json",
  );
  const vehiclesMetadata = readJson<any>(
    "tests/fixtures/providers/motive/vehicles/metadata.json",
  );
  const hosLogsMetadata = readJson<any>(
    "tests/fixtures/providers/motive/hos-logs/metadata.json",
  );
  const vehicleLocationsMetadata = readJson<any>(
    "tests/fixtures/providers/motive/vehicle-locations/metadata.json",
  );
  const pageSyncMetadata = readJson<any>(
    "tests/fixtures/providers/motive/page-sync/metadata.json",
  );

  const drivers = readJson<any>("tests/fixtures/providers/motive/drivers/raw.json");
  const vehicles = readJson<any>(
    "tests/fixtures/providers/motive/vehicles/raw.json",
  );
  const hosLogs = readJson<any>(
    "tests/fixtures/providers/motive/hos-logs/raw.json",
  );
  const vehicleLocations = readJson<any>(
    "tests/fixtures/providers/motive/vehicle-locations/raw.json",
  );
  const pageSync = readJson<any>(
    "tests/fixtures/providers/motive/page-sync/raw.json",
  );

  test("fixture provenance checks", () => {
    [
      driversMetadata,
      vehiclesMetadata,
      hosLogsMetadata,
      vehicleLocationsMetadata,
      pageSyncMetadata,
    ].forEach(expectOfficialDocsMetadata);

    expect(pageSyncMetadata.notes.includes("page based")).toBe(true);
  });

  test("provider contract checks", () => {
    expect(typeof drivers.users[0].user.id).toBe("number");
    expect(typeof drivers.users[0].user.first_name).toBe("string");
    expect(typeof drivers.users[0].user.current_location.lat).toBe("number");
    expect(typeof drivers.users[0].user.current_vehicle.id).toBe("number");

    expect(typeof vehicles.vehicles[0].vehicle.id).toBe("number");
    expect(typeof vehicles.vehicles[0].vehicle.number).toBe("string");
    expect(typeof vehicles.pagination.page_no).toBe("number");

    expect(typeof hosLogs.logs[0].log.driver.id).toBe("number");
    expect(typeof hosLogs.logs[0].log.events[0].event.type).toBe("string");
    expect(typeof hosLogs.logs[0].log.events[0].event.start_time).toBe("string");
    expect(typeof hosLogs.logs[0].log.inspection_reports[0].inspection_report.id).toBe(
      "number",
    );

    expect(typeof vehicleLocations.vehicles[0].vehicle.current_location.lat).toBe(
      "number",
    );
    expect(typeof vehicleLocations.vehicles[0].vehicle.current_location.speed).toBe(
      "number",
    );

    expect(typeof pageSync.users[0].user.available_time.drive).toBe("number");
    expect(typeof pageSync.pagination.page_no).toBe("number");
  });

  test("canonical golden checks", () => {
    const normalized = normalizeMotiveWave1({
      drivers,
      vehicles,
      hosLogs,
      vehicleLocations,
      pageSync,
    });
    const golden = readJson<any>("tests/fixtures/normalized/motive/wave1.json");

    expect(normalized.sync.kind).toBe("page");
    expect(normalized.sync.token).toBe("1/25");
    expect(normalized.sync.hasMore).toBe(false);
    expect(normalized).toEqual(golden);
  });
});
