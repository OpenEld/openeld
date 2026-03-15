import { create } from "@bufbuild/protobuf";
import { describe, expect, test } from "bun:test";

import {
  createOpenEldClient,
  SourceProvider,
  SyncResourceType,
} from "../../src";
import { readJson } from "../contract/support";

const samsaraRaw = {
  drivers: readJson<any>("tests/fixtures/providers/samsara/drivers/raw.json"),
  vehicles: readJson<any>("tests/fixtures/providers/samsara/vehicles/raw.json"),
  hosLogs: readJson<any>("tests/fixtures/providers/samsara/hos-logs/raw.json"),
  hosClocks: readJson<any>("tests/fixtures/providers/samsara/hos-clocks/raw.json"),
  vehicleLocations: readJson<any>(
    "tests/fixtures/providers/samsara/vehicle-locations/raw.json",
  ),
  dvirs: readJson<any>("tests/fixtures/providers/samsara/dvirs/raw.json"),
  feedCursor: readJson<any>("tests/fixtures/providers/samsara/feed-cursor/raw.json"),
  geofenceWebhookEvents: [
    readJson<any>("tests/fixtures/providers/samsara/geofence-entry-webhook/raw.json"),
    readJson<any>("tests/fixtures/providers/samsara/geofence-exit-webhook/raw.json"),
  ],
};

const motiveRaw = {
  drivers: readJson<any>("tests/fixtures/providers/motive/drivers/raw.json"),
  vehicles: readJson<any>("tests/fixtures/providers/motive/vehicles/raw.json"),
  hosLogs: readJson<any>("tests/fixtures/providers/motive/hos-logs/raw.json"),
  vehicleLocations: readJson<any>(
    "tests/fixtures/providers/motive/vehicle-locations/raw.json",
  ),
  pageSync: readJson<any>("tests/fixtures/providers/motive/page-sync/raw.json"),
};

describe("OpenEld client", () => {
  test("normalizes provider input through the samsara namespace", async () => {
    const client = createOpenEldClient();
    const result = await client.providers.samsara.normalize(samsaraRaw, {
      tenantId: "tenant-1",
    });

    expect(result.provider).toBe("samsara");
    expect(result.request.tenantId).toBe("tenant-1");
    expect(result.request.providerPayload.case).toBe("samsara");
    expect(result.payload.$typeName).toBe("openeld.providers.eld.samsara.v1.SamsaraPayload");
    expect(result.response.drivers[0]?.driverId).toBe("88668");
    expect(result.response.gpsLocations[0]?.locationId).toBe("28147498");
    expect(result.response.geofenceEvents).toHaveLength(2);
    expect(result.response.geofenceEvents[0]?.geofenceId).toBe("494123");
    expect(result.warnings).toContain(
      "Samsara HOS clocks are captured in the provider payload but are not projected into the normalization response.",
    );
  });

  test("builds advanced normalization requests without oneof boilerplate", async () => {
    const client = createOpenEldClient();
    const payload = client.providers.motive.buildPayload(motiveRaw);
    const request = client.normalization.toRequest("motive", payload, {
      tenantId: "tenant-2",
    });
    const response = await client.normalization.normalize(request);
    const serialized = client.normalization.toJson(response);

    expect(request.providerPayload.case).toBe("motive");
    expect(request.tenantId).toBe("tenant-2");
    expect(response.vehicles[0]?.vehicleId).toBe("6620");
    expect(serialized.warnings).toContain(
      "Motive sync checkpoint page-sync remains page-based at 1/25.",
    );
  });

  test("exposes supported providers from the registry-backed namespace", () => {
    const client = createOpenEldClient();

    expect(client.providers.supported()).toEqual(["samsara", "motive", "geotab"]);
    expect(client.providers.has("geotab")).toBe(true);
    expect(client.providers.has("samsara")).toBe(true);
  });

  test("query and sync facades require configured transport invokers", async () => {
    const client = createOpenEldClient();

    await expect(client.query.listDrivers({})).rejects.toThrow(
      "OpenELD query.listDrivers requires a configured query transport invoker.",
    );

    await expect(
      client.sync.getCheckpoint({
        provider: SourceProvider.SAMSARA,
        scope: {
          tenantId: "tenant-1",
          resourceType: SyncResourceType.DRIVERS,
        },
      }),
    ).rejects.toThrow(
      "OpenELD sync.getSyncCheckpoint requires a configured sync transport invoker.",
    );
  });

  test("query and sync facades delegate to configured transport invokers", async () => {
    const calls: string[] = [];

    const invoker = async (method: Parameters<NonNullable<Parameters<typeof createOpenEldClient>[0]>["transports"]["query"]>[0], request: any) => {
      calls.push(`${method.parent.name}.${method.localName}`);

      if (method.localName === "listDrivers") {
        return create(method.output, {});
      }

      if (method.localName === "getSyncCheckpoint") {
        return create(method.output, {});
      }

      return create(method.output, request);
    };

    const client = createOpenEldClient({
      transports: {
        query: invoker,
        sync: invoker,
      },
    });

    const queryResponse = await client.query.listDrivers({});
    const syncResponse = await client.sync.getCheckpoint({
      provider: SourceProvider.SAMSARA,
      scope: {
        tenantId: "tenant-1",
        resourceType: SyncResourceType.DRIVERS,
      },
    });

    expect(queryResponse.$typeName).toBe(
      "openeld.services.query.v1.ListDriversResponse",
    );
    expect(syncResponse.$typeName).toBe(
      "openeld.services.sync.v1.GetSyncCheckpointResponse",
    );
    expect(calls).toEqual([
      "QueryService.listDrivers",
      "SyncService.getSyncCheckpoint",
    ]);
  });
});
