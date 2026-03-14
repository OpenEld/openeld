import { describe, expect, test } from "bun:test";
import { create } from "@bufbuild/protobuf";

import { loadGeotabFixtureSet } from "../../src/fixtures/load-provider-fixture";
import { normalizeProviderPayload } from "../../src/services/normalization-service";
import {
  NormalizeProviderPayloadRequestSchema,
  NormalizeProviderPayloadResponseSchema,
} from "../../gen/ts/services/normalization/service_pb";
import {
  expectOfficialDocsMetadata,
  readJson,
  serializeMessage,
} from "./support";

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
    const payload = loadGeotabFixtureSet();

    expect(payload.users[0]?.normalizedProjection?.providerDriverId).toBe("b1");
    expect(payload.devices[0]?.normalizedProjection?.providerVehicleId).toBe("d1");
    expect(payload.dutyStatusLogs[0]?.normalizedProjection?.providerEventId).toBe(
      "dsl-1",
    );
    expect(payload.driverRegulations[0]?.normalizedProjection?.remainingSeconds).toBe(
      39600,
    );
    expect(payload.logRecords[0]?.normalizedProjection?.providerLocationId).toBe(
      "lr-1",
    );
    expect(payload.checkpoints[0]?.versionToken).toBe("4");
  });

  test("canonical golden checks", () => {
    const payload = loadGeotabFixtureSet();
    const request = create(NormalizeProviderPayloadRequestSchema, {
      providerPayload: {
        case: "geotab",
        value: payload,
      },
    });
    const normalized = normalizeProviderPayload(request);
    const golden = readJson<any>("tests/fixtures/normalized/geotab/canonical.json");
    const serialized = serializeMessage(
      NormalizeProviderPayloadResponseSchema,
      normalized,
    );

    expect(normalized.drivers[0]?.driverId).toBe("b1");
    expect(normalized.vehicles[0]?.vehicleId).toBe("d1");
    expect(normalized.hosEvents[0]?.eventId).toBe("dsl-1");
    expect(normalized.gpsLocations[0]?.locationId).toBe("lr-1");
    expect(normalized.warnings).toContain(
      "Geotab feed advances version tokens from 3 to 4.",
    );
    expect(serialized).toEqual(golden);
  });
});
