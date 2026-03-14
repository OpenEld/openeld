import { describe, expect, test } from "bun:test";

import { buildGeotabCanonicalSnapshot } from "../../src/fixture-normalization";
import { expectOfficialDocsMetadata, readJson } from "./support";

describe("Geotab canonical fixtures", () => {
  const usersMetadata = readJson<any>(
    "tests/fixtures/providers/geotab/users/metadata.json",
  );
  const devicesMetadata = readJson<any>(
    "tests/fixtures/providers/geotab/devices/metadata.json",
  );
  const dutyStatusLogsMetadata = readJson<any>(
    "tests/fixtures/providers/geotab/duty-status-logs/metadata.json",
  );
  const driverRegulationsMetadata = readJson<any>(
    "tests/fixtures/providers/geotab/driver-regulations/metadata.json",
  );
  const logRecordsMetadata = readJson<any>(
    "tests/fixtures/providers/geotab/log-records/metadata.json",
  );
  const getfeedMetadata = readJson<any>(
    "tests/fixtures/providers/geotab/getfeed/metadata.json",
  );

  const users = readJson<any>("tests/fixtures/providers/geotab/users/raw.json");
  const devices = readJson<any>("tests/fixtures/providers/geotab/devices/raw.json");
  const dutyStatusLogs = readJson<any>(
    "tests/fixtures/providers/geotab/duty-status-logs/raw.json",
  );
  const driverRegulations = readJson<any>(
    "tests/fixtures/providers/geotab/driver-regulations/raw.json",
  );
  const logRecords = readJson<any>(
    "tests/fixtures/providers/geotab/log-records/raw.json",
  );
  const getfeed = readJson<any>(
    "tests/fixtures/providers/geotab/getfeed/raw.json",
  );

  test("fixture provenance checks", () => {
    [
      usersMetadata,
      devicesMetadata,
      dutyStatusLogsMetadata,
      driverRegulationsMetadata,
      logRecordsMetadata,
      getfeedMetadata,
    ].forEach(expectOfficialDocsMetadata);

    expect(usersMetadata.notes.includes("property-doc-verified")).toBe(true);
  });

  test("provider contract checks", () => {
    expect(typeof users.result[0].Id).toBe("string");
    expect(typeof users.result[0].FirstName).toBe("string");
    expect(typeof users.result[0].EmployeeNo).toBe("string");

    expect(typeof devices.result[0].Id).toBe("string");
    expect(typeof devices.result[0].Name).toBe("string");

    expect(typeof dutyStatusLogs.result[0].Id).toBe("string");
    expect(typeof dutyStatusLogs.result[0].Driver.Id).toBe("string");
    expect(typeof dutyStatusLogs.result[0].Location.Latitude).toBe("number");
    expect(typeof dutyStatusLogs.result[0].EngineHours).toBe("number");

    expect(typeof driverRegulations.result[0].Availability.Driving).toBe("number");
    expect(Array.isArray(driverRegulations.result[0].Violations)).toBe(true);

    expect(typeof logRecords.result[0].Speed).toBe("number");
    expect(typeof getfeed.feedResult.toVersion).toBe("string");
  });

  test("canonical golden checks", () => {
    const normalized = buildGeotabCanonicalSnapshot({
      users,
      devices,
      dutyStatusLogs,
      driverRegulations,
      logRecords,
      getfeed,
    });
    const golden = readJson<any>("tests/fixtures/normalized/geotab/canonical.json");

    expect(normalized.sync.kind).toBe("version");
    expect(normalized.sync.token).toBe("4");
    expect(normalized.sync.hasMore).toBeNull();
    expect(normalized).toEqual(golden);
  });
});
