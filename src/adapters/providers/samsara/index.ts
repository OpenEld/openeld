import { create } from "@bufbuild/protobuf";

import {
  SourceProvider,
  SourceRecordSchema,
} from "../../../../gen/ts/common/metadata/source_pb";
import {
  GeoLocationSchema,
  GeoPointSchema,
  LocationDescriptionSchema,
} from "../../../../gen/ts/common/primitives/location_pb";
import {
  EldAuthProfileSchema,
  EldDriverRecordSchema,
  EldDvirRecordSchema,
  EldGpsLocationRecordSchema,
  EldHosClockRecordSchema,
  EldHosEventRecordSchema,
  EldPayloadMetadataSchema,
  EldProviderAccountSchema,
  EldSupportedDomainsSchema,
  EldSyncCheckpointSchema,
  EldSyncProfileSchema,
  EldVehicleRecordSchema,
} from "../../../../gen/ts/providers/eld/shared/common_pb";
import {
  SamsaraDiagnosticRecordSchema,
  SamsaraDriverRecordSchema,
  SamsaraDvirRecordSchema,
  SamsaraHosClockRecordSchema,
  SamsaraHosLogRecordSchema,
  SamsaraPayloadSchema,
  SamsaraVehicleLocationRecordSchema,
  SamsaraVehicleRecordSchema,
  type SamsaraPayload,
} from "../../../../gen/ts/providers/eld/samsara/contracts_pb";
import type { ProviderAdapter } from "../../provider-adapter";
import {
  createGeoPoint,
  createTimestampFromIso,
  normalizeEldPayload,
} from "../../../normalization/project-eld-payload";

const PROVIDER_ACCOUNT_ID = "samsara-docs-account";
const CARRIER_ID = "samsara-docs-carrier";
const CAPTURED_AT = "2026-03-14T00:00:00Z";

function splitName(name?: string) {
  if (!name) {
    return ["", ""];
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  return [parts[0] ?? "", parts.slice(1).join(" ")];
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function createSamsaraSourceRecord(
  recordType: string,
  primaryExternalId: string,
  nativeStatus?: string,
) {
  return create(SourceRecordSchema, {
    provider: SourceProvider.SAMSARA,
    providerAccountId: PROVIDER_ACCOUNT_ID,
    providerRecordType: recordType,
    primaryExternalId,
    nativeStatus,
  });
}

function collectProjection<T>(value?: T) {
  return value ? [value] : [];
}

export function buildSamsaraPayload(fixtures: {
  drivers: any;
  vehicles: any;
  hosLogs: any;
  hosClocks?: any;
  vehicleLocations: any;
  dvirs: any;
  feedCursor: any;
}): SamsaraPayload {
  const cursor = fixtures.feedCursor?.pagination?.endCursor;
  const hasMore = fixtures.feedCursor?.pagination?.hasNextPage ?? false;

  return create(SamsaraPayloadSchema, {
    metadata: create(EldPayloadMetadataSchema, {
      account: create(EldProviderAccountSchema, {
        providerAccountId: PROVIDER_ACCOUNT_ID,
        carrierId: CARRIER_ID,
        authProfile: create(EldAuthProfileSchema, {
          authMethod: "docs-example",
          environment: "documentation",
        }),
      }),
      syncProfile: create(EldSyncProfileSchema, {
        syncModel: "cursor",
        supportsWebhooks: false,
        supportsCursor: true,
        supportsPagePolling: false,
        supportsVersionToken: false,
        requiresTimeWindowing: false,
        rateLimitNotes: "Honor documented backoff guidance when polling feed cursors.",
      }),
      supportedDomains: create(EldSupportedDomainsSchema, {
        drivers: true,
        vehicles: true,
        assignments: false,
        hosEvents: true,
        hosClocks: true,
        gpsLocations: true,
        dvirs: true,
        diagnostics: false,
      }),
      cursor,
      providerApiVersion: "public-docs",
      pulledAt: createTimestampFromIso(CAPTURED_AT),
    }),
    drivers: (fixtures.drivers?.data ?? []).map((driver: any) =>
      create(SamsaraDriverRecordSchema, {
        id: String(driver.id),
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        driverActivationStatus: driver.driverActivationStatus,
        eldExempt: driver.eldExempt,
        username: driver.username,
        normalizedProjection: create(EldDriverRecordSchema, {
          providerDriverId: String(driver.id),
          ...(() => {
            const [firstName, lastName] = splitName(driver.name);
            return {
              firstName,
              lastName,
            };
          })(),
          fullName: driver.name,
          licenseNumber: driver.licenseNumber,
          status: driver.driverActivationStatus,
          source: createSamsaraSourceRecord(
            "driver",
            String(driver.id),
            driver.driverActivationStatus,
          ),
        }),
      }),
    ),
    vehicles: (fixtures.vehicles?.data ?? []).map((vehicle: any) =>
      create(SamsaraVehicleRecordSchema, {
        id: String(vehicle.id),
        name: vehicle.name,
        vin: vehicle.vin,
        licensePlate: vehicle.licensePlate,
        obdOdometerMeters: vehicle.obdOdometerMeters,
        engineSeconds: vehicle.engineSeconds,
        eldDeviceId: vehicle.eldDeviceId,
        normalizedProjection: create(EldVehicleRecordSchema, {
          providerVehicleId: String(vehicle.id),
          vin: vehicle.vin,
          name: vehicle.name,
          licensePlate: vehicle.licensePlate,
          odometerMeters: vehicle.obdOdometerMeters,
          engineHoursSeconds: vehicle.engineSeconds,
          eldDeviceId: vehicle.eldDeviceId,
          source: createSamsaraSourceRecord("vehicle", String(vehicle.id)),
        }),
      }),
    ),
    hosLogs: (fixtures.hosLogs?.data ?? []).map((log: any) =>
      create(SamsaraHosLogRecordSchema, {
        id: String(log.id),
        driverId: log.driverId ? String(log.driverId) : undefined,
        vehicleId: log.vehicleId ? String(log.vehicleId) : undefined,
        startTime: createTimestampFromIso(log.startTime),
        endTime: createTimestampFromIso(log.endTime),
        hosStatusType: log.hosStatusType,
        origin: log.origin,
        startLocation:
          typeof log.startLocation?.latitude === "number" &&
          typeof log.startLocation?.longitude === "number"
            ? create(GeoLocationSchema, {
                point: create(GeoPointSchema, {
                  latitude: log.startLocation.latitude,
                  longitude: log.startLocation.longitude,
                }),
                description: log.startLocation.description
                  ? create(LocationDescriptionSchema, {
                      description: log.startLocation.description,
                    })
                  : undefined,
              })
            : undefined,
        remark: log.remark,
        certified: log.certified,
        sequenceNumber: log.sequenceNumber,
        normalizedProjection: create(EldHosEventRecordSchema, {
          providerEventId: String(log.id),
          providerDriverId: log.driverId ? String(log.driverId) : undefined,
          providerVehicleId: log.vehicleId ? String(log.vehicleId) : undefined,
          eventTimestamp: createTimestampFromIso(log.startTime),
          dutyStatus: log.hosStatusType,
          eventType: "duty_status_change",
          position: createGeoPoint(
            log.startLocation?.latitude,
            log.startLocation?.longitude,
          ),
          annotation: log.remark,
          origin: log.origin,
          recordStatus: "active",
          odometerMeters: log.odometerMeters,
          engineHoursSeconds: log.engineHoursSeconds,
          source: createSamsaraSourceRecord(
            "hos_log",
            String(log.id),
            log.hosStatusType,
          ),
        }),
      }),
    ),
    hosClocks: (fixtures.hosClocks?.data ?? []).map((clock: any) =>
      create(SamsaraHosClockRecordSchema, {
        driverId: String(clock.driver?.id),
        cycleRemainingSeconds:
          typeof clock.clocks?.cycle?.cycleRemainingDurationMs === "number"
            ? clock.clocks.cycle.cycleRemainingDurationMs / 1000
            : undefined,
        shiftRemainingSeconds:
          typeof clock.clocks?.shift?.shiftRemainingDurationMs === "number"
            ? clock.clocks.shift.shiftRemainingDurationMs / 1000
            : undefined,
        driveRemainingSeconds:
          typeof clock.clocks?.drive?.driveRemainingDurationMs === "number"
            ? clock.clocks.drive.driveRemainingDurationMs / 1000
            : undefined,
        breakRemainingSeconds:
          typeof clock.clocks?.break?.timeUntilBreakDurationMs === "number"
            ? clock.clocks.break.timeUntilBreakDurationMs / 1000
            : undefined,
        normalizedProjection: create(EldHosClockRecordSchema, {
          providerClockId: `clock-${String(clock.driver?.id)}`,
          providerDriverId: String(clock.driver?.id),
          clockType: clock.currentDutyStatus?.hosStatusType,
          remainingSeconds:
            typeof clock.clocks?.drive?.driveRemainingDurationMs === "number"
              ? clock.clocks.drive.driveRemainingDurationMs / 1000
              : undefined,
          resetsAt: createTimestampFromIso(
            clock.clocks?.cycle?.cycleStartedAtTime,
          ),
          source: createSamsaraSourceRecord(
            "hos_clock",
            `clock-${String(clock.driver?.id)}`,
            clock.currentDutyStatus?.hosStatusType,
          ),
        }),
      }),
    ),
    gpsLocations: (fixtures.vehicleLocations?.data ?? []).map((location: any) =>
      create(SamsaraVehicleLocationRecordSchema, {
        vehicleId: String(location.vehicleId),
        driverId: location.driverId ? String(location.driverId) : undefined,
        time: createTimestampFromIso(location.time),
        latitude: location.gps?.latitude,
        longitude: location.gps?.longitude,
        speedMilesPerHour: location.gps?.speedMilesPerHour,
        headingDegrees: location.gps?.headingDegrees,
        normalizedProjection: create(EldGpsLocationRecordSchema, {
          providerLocationId: String(location.vehicleId),
          providerVehicleId: String(location.vehicleId),
          providerDriverId: location.driverId ? String(location.driverId) : undefined,
          timestamp: createTimestampFromIso(location.time),
          position: createGeoPoint(
            location.gps?.latitude,
            location.gps?.longitude,
          ),
          speedKilometersPerHour:
            typeof location.gps?.speedMilesPerHour === "number"
              ? round(location.gps.speedMilesPerHour * 1.60934)
              : undefined,
          headingDegrees: location.gps?.headingDegrees,
          engineHoursSeconds: location.obdEngineSeconds,
          source: createSamsaraSourceRecord(
            "vehicle_location",
            String(location.vehicleId),
          ),
        }),
      }),
    ),
    dvirs: (fixtures.dvirs?.data ?? []).map((dvir: any) =>
      create(SamsaraDvirRecordSchema, {
        id: String(dvir.id),
        driverId: dvir.driverId ? String(dvir.driverId) : undefined,
        vehicleId: dvir.vehicleId ? String(dvir.vehicleId) : undefined,
        inspectionTime: createTimestampFromIso(dvir.createdAtTime),
        inspectionType: dvir.inspectionType,
        isSafeToDrive: dvir.safetyStatus === "safe",
        defects: (dvir.defects ?? []).map((defect: any) => defect.comment ?? defect.defectType),
        mechanicNotes: dvir.defects?.[0]?.mechanicNotes,
        normalizedProjection: create(EldDvirRecordSchema, {
          providerDvirId: String(dvir.id),
          providerDriverId: dvir.driverId ? String(dvir.driverId) : undefined,
          providerVehicleId: dvir.vehicleId ? String(dvir.vehicleId) : undefined,
          inspectionTime: createTimestampFromIso(dvir.createdAtTime),
          inspectionType: dvir.inspectionType,
          isSafeToDrive: dvir.safetyStatus === "safe",
          defectDescriptions: (dvir.defects ?? []).map(
            (defect: any) => defect.comment ?? defect.defectType,
          ),
          mechanicNotes: dvir.defects?.[0]?.mechanicNotes,
          source: createSamsaraSourceRecord("dvir", String(dvir.id), dvir.safetyStatus),
        }),
      }),
    ),
    diagnostics: [] as ReturnType<typeof create<typeof SamsaraDiagnosticRecordSchema>>[],
    checkpoints: [
      create(EldSyncCheckpointSchema, {
        providerAccountId: PROVIDER_ACCOUNT_ID,
        resourceName: "vehicle-locations",
        cursor,
      }),
    ],
  });
}

export const samsaraProviderAdapter: ProviderAdapter<"samsara"> = {
  provider: "samsara",
  normalize(payload) {
    const warnings: string[] = [];

    if (payload.hosClocks.length > 0) {
      warnings.push(
        "Samsara HOS clocks are captured in the provider payload but are not projected into the normalization response.",
      );
    }

    return normalizeEldPayload(
      SourceProvider.SAMSARA,
      payload.metadata,
      payload.drivers.flatMap((record) => collectProjection(record.normalizedProjection)),
      payload.vehicles.flatMap((record) => collectProjection(record.normalizedProjection)),
      payload.vehicleAssignments,
      payload.hosLogs.flatMap((record) => collectProjection(record.normalizedProjection)),
      payload.gpsLocations.flatMap((record) =>
        collectProjection(record.normalizedProjection),
      ),
      payload.dvirs.flatMap((record) => collectProjection(record.normalizedProjection)),
      warnings,
    );
  },
};
