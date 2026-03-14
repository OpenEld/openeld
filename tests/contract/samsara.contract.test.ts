import { describe, expect, test } from "bun:test";

import { normalizeSamsaraWave1 } from "../../src/wave1";
import { expectOfficialDocsMetadata, readJson } from "./support";

describe("Samsara Wave 1 fixtures", () => {
  const driversMetadata = readJson<any>(
    "tests/fixtures/providers/samsara/drivers/metadata.json",
  );
  const vehiclesMetadata = readJson<any>(
    "tests/fixtures/providers/samsara/vehicles/metadata.json",
  );
  const hosLogsMetadata = readJson<any>(
    "tests/fixtures/providers/samsara/hos-logs/metadata.json",
  );
  const hosClocksMetadata = readJson<any>(
    "tests/fixtures/providers/samsara/hos-clocks/metadata.json",
  );
  const vehicleLocationsMetadata = readJson<any>(
    "tests/fixtures/providers/samsara/vehicle-locations/metadata.json",
  );
  const dvirsMetadata = readJson<any>(
    "tests/fixtures/providers/samsara/dvirs/metadata.json",
  );
  const feedCursorMetadata = readJson<any>(
    "tests/fixtures/providers/samsara/feed-cursor/metadata.json",
  );

  const drivers = readJson<any>("tests/fixtures/providers/samsara/drivers/raw.json");
  const vehicles = readJson<any>(
    "tests/fixtures/providers/samsara/vehicles/raw.json",
  );
  const hosLogs = readJson<any>(
    "tests/fixtures/providers/samsara/hos-logs/raw.json",
  );
  const hosClocks = readJson<any>(
    "tests/fixtures/providers/samsara/hos-clocks/raw.json",
  );
  const vehicleLocations = readJson<any>(
    "tests/fixtures/providers/samsara/vehicle-locations/raw.json",
  );
  const dvirs = readJson<any>("tests/fixtures/providers/samsara/dvirs/raw.json");
  const feedCursor = readJson<any>(
    "tests/fixtures/providers/samsara/feed-cursor/raw.json",
  );

  test("fixture provenance checks", () => {
    [
      driversMetadata,
      vehiclesMetadata,
      hosLogsMetadata,
      hosClocksMetadata,
      vehicleLocationsMetadata,
      dvirsMetadata,
      feedCursorMetadata,
    ].forEach(expectOfficialDocsMetadata);

    expect(feedCursorMetadata.notes.includes("endCursor")).toBe(true);
  });

  test("provider contract checks", () => {
    expect(typeof drivers.data[0].id).toBe("string");
    expect(typeof drivers.data[0].name).toBe("string");
    expect(typeof drivers.data[0].driverActivationStatus).toBe("string");

    expect(typeof vehicles.data[0].id).toBe("string");
    expect(typeof vehicles.data[0].vin).toBe("string");

    expect(typeof hosLogs.data[0].startTime).toBe("string");
    expect(typeof hosLogs.data[0].endTime).toBe("string");
    expect(typeof hosLogs.data[0].hosStatusType).toBe("string");
    expect(typeof hosLogs.data[0].startLocation.latitude).toBe("number");
    expect(typeof hosLogs.data[0].startLocation.longitude).toBe("number");

    expect(typeof hosClocks.data[0].driver.id).toBe("string");
    expect(typeof hosClocks.data[0].clocks.cycle.cycleRemainingDurationMs).toBe(
      "number",
    );
    expect(typeof hosClocks.data[0].clocks.drive.driveRemainingDurationMs).toBe(
      "number",
    );

    expect(typeof vehicleLocations.data[0].gps.speedMilesPerHour).toBe("number");
    expect(typeof vehicleLocations.pagination.endCursor).toBe("string");
    expect(typeof vehicleLocations.pagination.hasNextPage).toBe("boolean");

    expect(typeof dvirs.data[0].safetyStatus).toBe("string");
    expect(Array.isArray(dvirs.data[0].defects)).toBe(true);
  });

  test("canonical golden checks", () => {
    const normalized = normalizeSamsaraWave1({
      drivers,
      vehicles,
      hosLogs,
      vehicleLocations,
      dvirs,
      feedCursor,
    });
    const golden = readJson<any>("tests/fixtures/normalized/samsara/wave1.json");

    expect(normalized.sync.kind).toBe("cursor");
    expect(normalized.sync.token).toBe("cursor-123");
    expect(normalized.sync.hasMore).toBe(true);
    expect(normalized).toEqual(golden);
  });
});
