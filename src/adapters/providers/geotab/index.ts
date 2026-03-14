import { create } from "@bufbuild/protobuf";

import {
  SourceProvider,
  SourceRecordSchema,
} from "../../../../gen/ts/common/metadata/source_pb";
import {
  EldAuthProfileSchema,
  EldDriverRecordSchema,
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
  GeotabDeviceRecordSchema,
  GeotabDiagnosticRecordSchema,
  GeotabDriverRegulationRecordSchema,
  GeotabDutyStatusLogRecordSchema,
  GeotabLogRecordSchema,
  GeotabPayloadSchema,
  GeotabUserRecordSchema,
  type GeotabPayload,
} from "../../../../gen/ts/providers/eld/geotab/contracts_pb";
import type { ProviderAdapter } from "../../provider-adapter";
import {
  createGeoPoint,
  createTimestampFromIso,
  normalizeEldPayload,
} from "../../../normalization/project-eld-payload";

const PROVIDER_ACCOUNT_ID = "geotab-docs-account";
const CARRIER_ID = "geotab-docs-carrier";
const CAPTURED_AT = "2026-03-14T00:00:00Z";

function createGeotabSourceRecord(
  recordType: string,
  primaryExternalId: string,
  nativeStatus?: string,
) {
  return create(SourceRecordSchema, {
    provider: SourceProvider.GEOTAB,
    providerAccountId: PROVIDER_ACCOUNT_ID,
    providerRecordType: recordType,
    primaryExternalId,
    nativeStatus,
  });
}

function collectProjection<T>(value?: T) {
  return value ? [value] : [];
}

export function buildGeotabPayload(fixtures: {
  users: any;
  devices: any;
  dutyStatusLogs: any;
  driverRegulations: any;
  logRecords: any;
  getfeed: any;
}): GeotabPayload {
  const fromVersion = fixtures.getfeed?.feedResult?.fromVersion;
  const toVersion = fixtures.getfeed?.feedResult?.toVersion;

  return create(GeotabPayloadSchema, {
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
        syncModel: "version",
        supportsWebhooks: false,
        supportsCursor: false,
        supportsPagePolling: false,
        supportsVersionToken: true,
        requiresTimeWindowing: true,
      }),
      supportedDomains: create(EldSupportedDomainsSchema, {
        drivers: true,
        vehicles: true,
        assignments: false,
        hosEvents: true,
        hosClocks: true,
        gpsLocations: true,
        dvirs: false,
        diagnostics: false,
      }),
      providerApiVersion: "public-docs",
      pulledAt: createTimestampFromIso(CAPTURED_AT),
    }),
    users: (fixtures.users?.result ?? []).map((user: any) =>
      create(GeotabUserRecordSchema, {
        id: String(user.Id),
        firstName: user.FirstName,
        lastName: user.LastName,
        activeTo: user.ActiveTo,
        employeeNo: user.EmployeeNo,
        normalizedProjection: create(EldDriverRecordSchema, {
          providerDriverId: String(user.Id),
          firstName: user.FirstName,
          lastName: user.LastName,
          fullName: [user.FirstName, user.LastName].filter(Boolean).join(" "),
          licenseNumber: user.EmployeeNo,
          status:
            user.ActiveTo === "9999-12-31T23:59:59Z" ? "active" : "inactive",
          email: user.Name,
          source: createGeotabSourceRecord(
            "user",
            String(user.Id),
            user.ActiveTo === "9999-12-31T23:59:59Z" ? "active" : "inactive",
          ),
        }),
      }),
    ),
    devices: (fixtures.devices?.result ?? []).map((device: any) =>
      create(GeotabDeviceRecordSchema, {
        id: String(device.Id),
        name: device.Name,
        vehicleIdentificationNumber: device.VehicleIdentificationNumber,
        odometerMeters: device.Odometer,
        engineHoursSeconds: device.EngineHours,
        normalizedProjection: create(EldVehicleRecordSchema, {
          providerVehicleId: String(device.Id),
          vin: device.VehicleIdentificationNumber,
          name: device.Name,
          odometerMeters: device.Odometer,
          engineHoursSeconds: device.EngineHours,
          eldDeviceId: device.SerialNumber,
          source: createGeotabSourceRecord("device", String(device.Id)),
        }),
      }),
    ),
    dutyStatusLogs: (fixtures.dutyStatusLogs?.result ?? []).map((log: any) =>
      create(GeotabDutyStatusLogRecordSchema, {
        id: String(log.Id),
        driverId: log.Driver?.Id ? String(log.Driver.Id) : undefined,
        deviceId: log.Device?.Id ? String(log.Device.Id) : undefined,
        dateTime: createTimestampFromIso(log.DateTime),
        status: log.Status,
        type: String(log.EventType),
        origin: log.Origin,
        recordStatus: String(log.EventRecordStatus),
        latitude: log.Location?.Latitude,
        longitude: log.Location?.Longitude,
        odometerMeters: log.Odometer,
        engineHoursSeconds: log.EngineHours,
        normalizedProjection: create(EldHosEventRecordSchema, {
          providerEventId: String(log.Id),
          providerDriverId: log.Driver?.Id ? String(log.Driver.Id) : undefined,
          providerVehicleId: log.Device?.Id ? String(log.Device.Id) : undefined,
          eventTimestamp: createTimestampFromIso(log.DateTime),
          dutyStatus: log.Status,
          eventType: "duty_status_change",
          position: createGeoPoint(log.Location?.Latitude, log.Location?.Longitude),
          origin: log.Origin,
          recordStatus: String(log.EventRecordStatus),
          odometerMeters: log.Odometer,
          engineHoursSeconds: log.EngineHours,
          source: createGeotabSourceRecord("duty_status_log", String(log.Id), log.Status),
        }),
      }),
    ),
    driverRegulations: (fixtures.driverRegulations?.result ?? []).map(
      (regulation: any) =>
        create(GeotabDriverRegulationRecordSchema, {
          driverId: String(regulation.Driver?.Id),
          regulation: regulation.CurrentDutyStatus,
          drivingRemainingSeconds: regulation.Availability?.Driving,
          cycleRemainingSeconds: regulation.Availability?.Cycle,
          breakRemainingSeconds: regulation.Availability?.Break,
          normalizedProjection: create(EldHosClockRecordSchema, {
            providerClockId: String(regulation.Id),
            providerDriverId: String(regulation.Driver?.Id),
            clockType: regulation.CurrentDutyStatus,
            remainingSeconds: regulation.Availability?.Driving,
            source: createGeotabSourceRecord(
              "driver_regulation",
              String(regulation.Id),
              regulation.CurrentDutyStatus,
            ),
          }),
        }),
    ),
    logRecords: (fixtures.logRecords?.result ?? []).map((log: any) =>
      create(GeotabLogRecordSchema, {
        id: String(log.Id),
        deviceId: log.Device?.Id ? String(log.Device.Id) : undefined,
        driverId: log.Driver?.Id ? String(log.Driver.Id) : undefined,
        dateTime: createTimestampFromIso(log.DateTime),
        latitude: log.Latitude,
        longitude: log.Longitude,
        speedKilometersPerHour: log.Speed,
        headingDegrees: log.Bearing,
        normalizedProjection: create(EldGpsLocationRecordSchema, {
          providerLocationId: String(log.Id),
          providerVehicleId: log.Device?.Id ? String(log.Device.Id) : undefined,
          providerDriverId: log.Driver?.Id ? String(log.Driver.Id) : undefined,
          timestamp: createTimestampFromIso(log.DateTime),
          position: createGeoPoint(log.Latitude, log.Longitude),
          speedKilometersPerHour: log.Speed,
          headingDegrees: log.Bearing,
          source: createGeotabSourceRecord("log_record", String(log.Id)),
        }),
      }),
    ),
    inspections: [],
    diagnostics: [] as ReturnType<typeof create<typeof GeotabDiagnosticRecordSchema>>[],
    checkpoints: [
      create(EldSyncCheckpointSchema, {
        providerAccountId: PROVIDER_ACCOUNT_ID,
        resourceName: fixtures.getfeed?.typeName,
        versionToken: toVersion,
        cursor: fromVersion,
      }),
    ],
  });
}

export const geotabProviderAdapter: ProviderAdapter<"geotab"> = {
  provider: "geotab",
  normalize(payload) {
    const warnings: string[] = [];
    const checkpoint = payload.checkpoints[0];

    if (checkpoint?.versionToken) {
      warnings.push(
        `Geotab feed advances version tokens from ${checkpoint.cursor ?? "unknown"} to ${checkpoint.versionToken}.`,
      );
    }

    if (payload.driverRegulations.length > 0) {
      warnings.push(
        "Geotab driver regulation clocks are captured in the provider payload but are not projected into the normalization response.",
      );
    }

    return normalizeEldPayload(
      SourceProvider.GEOTAB,
      payload.metadata,
      payload.users.flatMap((record) => collectProjection(record.normalizedProjection)),
      payload.devices.flatMap((record) => collectProjection(record.normalizedProjection)),
      payload.vehicleAssignments,
      payload.dutyStatusLogs.flatMap((record) =>
        collectProjection(record.normalizedProjection),
      ),
      payload.logRecords.flatMap((record) => collectProjection(record.normalizedProjection)),
      payload.inspections.flatMap((record) => collectProjection(record.normalizedProjection)),
      warnings,
    );
  },
};
