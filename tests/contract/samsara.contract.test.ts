import { describe, expect, test } from "bun:test";
import { create } from "@bufbuild/protobuf";

import { loadSamsaraFixtureSet } from "../../src/fixtures/load-provider-fixture";
import { normalizeProviderPayload } from "../../src/services/normalization-service";
import { GeofenceTransitionType } from "../../gen/ts/logistics/enums_pb";
import {
  NormalizeProviderPayloadRequestSchema,
  NormalizeProviderPayloadResponseSchema,
} from "../../gen/ts/services/normalization/service_pb";
import {
  expectOfficialDocsMetadata,
  readJson,
  serializeMessage,
} from "./support";

describe("Samsara canonical fixtures", () => {
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
  const geofenceEntryWebhookMetadata = readJson<any>(
    "tests/fixtures/providers/samsara/geofence-entry-webhook/metadata.json",
  );
  const geofenceExitWebhookMetadata = readJson<any>(
    "tests/fixtures/providers/samsara/geofence-exit-webhook/metadata.json",
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
      geofenceEntryWebhookMetadata,
      geofenceExitWebhookMetadata,
    ].forEach(expectOfficialDocsMetadata);

    expect(feedCursorMetadata.notes.includes("endCursor")).toBe(true);
    expect(geofenceEntryWebhookMetadata.notes.includes("entry")).toBe(true);
    expect(geofenceExitWebhookMetadata.notes.includes("exit")).toBe(true);
  });

  test("provider contract checks", () => {
    const payload = loadSamsaraFixtureSet();

    expect(payload.drivers[0]?.id).toBe("88668");
    expect(payload.drivers[0]?.normalizedProjection?.providerDriverId).toBe(
      "88668",
    );
    expect(payload.vehicles[0]?.normalizedProjection?.vin).toBe(
      "1FUJGLDR9CSBC1234",
    );
    expect(payload.hosLogs[0]?.normalizedProjection?.dutyStatus).toBe(
      "offDuty",
    );
    expect(payload.gpsLocations[0]?.normalizedProjection?.speedKilometersPerHour).toBe(
      88.51,
    );
    expect(payload.checkpoints[0]?.cursor).toBe("cursor-123");
    expect(payload.dvirs[0]?.normalizedProjection?.defectDescriptions.length).toBe(
      1,
    );
    expect(payload.geofenceWebhookEvents[0]?.providerEventType).toBe(
      "GeofenceEntry",
    );
    expect(payload.geofenceWebhookEvents[0]?.normalizedProjection?.transitionType).toBe(
      GeofenceTransitionType.ENTRY,
    );
    expect(payload.geofenceWebhookEvents[1]?.providerEventType).toBe(
      "GeofenceExit",
    );
    expect(payload.geofenceWebhookEvents[1]?.source?.rawPayloadJson?.includes("\"eventType\":\"GeofenceExit\"")).toBe(
      true,
    );
  });

  test("canonical golden checks", () => {
    const payload = loadSamsaraFixtureSet();
    const request = create(NormalizeProviderPayloadRequestSchema, {
      providerPayload: {
        case: "samsara",
        value: payload,
      },
    });
    const normalized = normalizeProviderPayload(request);
    const golden = readJson<any>("tests/fixtures/normalized/samsara/canonical.json");
    const serialized = serializeMessage(
      NormalizeProviderPayloadResponseSchema,
      normalized,
    );

    expect(normalized.drivers[0]?.driverId).toBe("88668");
    expect(normalized.vehicles[0]?.vehicleId).toBe("28147498");
    expect(normalized.hosEvents[0]?.driverId).toBe("88668");
    expect(normalized.gpsLocations[0]?.vehicleId).toBe("28147498");
    expect(normalized.geofenceEvents[0]?.geofenceId).toBe("494123");
    expect(normalized.geofenceEvents[0]?.transitionType).toBe(
      GeofenceTransitionType.ENTRY,
    );
    expect(normalized.geofenceEvents[1]?.transitionType).toBe(
      GeofenceTransitionType.EXIT,
    );
    expect(normalized.warnings).toContain(
      "Samsara HOS clocks are captured in the provider payload but are not projected into the normalization response.",
    );
    expect(serialized).toEqual(golden);
  });
});
