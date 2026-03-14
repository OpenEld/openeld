import { describe, expect, test } from "bun:test";
import { create } from "@bufbuild/protobuf";

import { loadMotiveFixtureSet } from "../../src/fixtures/load-provider-fixture";
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

describe("Motive canonical fixtures", () => {
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
    const payload = loadMotiveFixtureSet();

    expect(payload.drivers[0]?.normalizedProjection?.providerDriverId).toBe("156");
    expect(payload.vehicles[0]?.normalizedProjection?.providerVehicleId).toBe("6620");
    expect(payload.hosLogs[0]?.normalizedProjection?.providerEventId).toBe("221");
    expect(payload.hosClocks[0]?.normalizedProjection?.remainingSeconds).toBe(
      39600,
    );
    expect(payload.gpsLocations[0]?.normalizedProjection?.providerLocationId).toBe(
      "af5b6e0d-c442-414c-88d2-d95e5cb7affe",
    );
    expect(payload.dvirs[0]?.normalizedProjection?.providerDvirId).toBe("9");
    expect(payload.checkpoints[0]?.pageToken).toBe("1/25");
  });

  test("canonical golden checks", () => {
    const payload = loadMotiveFixtureSet();
    const request = create(NormalizeProviderPayloadRequestSchema, {
      providerPayload: {
        case: "motive",
        value: payload,
      },
    });
    const normalized = normalizeProviderPayload(request);
    const golden = readJson<any>("tests/fixtures/normalized/motive/canonical.json");
    const serialized = serializeMessage(
      NormalizeProviderPayloadResponseSchema,
      normalized,
    );

    expect(normalized.drivers[0]?.driverId).toBe("156");
    expect(normalized.vehicles[0]?.vehicleId).toBe("6620");
    expect(normalized.hosEvents[0]?.eventId).toBe("221");
    expect(normalized.gpsLocations[0]?.locationId).toBe(
      "af5b6e0d-c442-414c-88d2-d95e5cb7affe",
    );
    expect(normalized.warnings).toContain(
      "Motive sync checkpoint page-sync remains page-based at 1/25.",
    );
    expect(serialized).toEqual(golden);
  });
});
