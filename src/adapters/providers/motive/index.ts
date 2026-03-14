import { create } from "@bufbuild/protobuf";

import {
  SourceProvider,
  SourceRecordSchema,
} from "../../../../gen/ts/common/metadata/source_pb";
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
  MotiveDiagnosticRecordSchema,
  MotiveDriverRecordSchema,
  MotiveDvirRecordSchema,
  MotiveHosClockRecordSchema,
  MotiveLogRecordSchema,
  MotivePayloadSchema,
  MotiveVehicleLocationRecordSchema,
  MotiveVehicleRecordSchema,
  type MotivePayload,
} from "../../../../gen/ts/providers/eld/motive/contracts_pb";
import type { ProviderAdapter } from "../../provider-adapter";
import {
  createGeoPoint,
  createTimestampFromIso,
  normalizeEldPayload,
} from "../../../normalization/project-eld-payload";

const PROVIDER_ACCOUNT_ID = "motive-docs-account";
const CARRIER_ID = "motive-docs-carrier";
const CAPTURED_AT = "2026-03-14T00:00:00Z";

function createMotiveSourceRecord(
  recordType: string,
  primaryExternalId: string,
  nativeStatus?: string,
) {
  return create(SourceRecordSchema, {
    provider: SourceProvider.MOTIVE,
    providerAccountId: PROVIDER_ACCOUNT_ID,
    providerRecordType: recordType,
    primaryExternalId,
    nativeStatus,
  });
}

function collectProjection<T>(value?: T) {
  return value ? [value] : [];
}

export function buildMotivePayload(fixtures: {
  drivers: any;
  vehicles: any;
  hosLogs: any;
  vehicleLocations: any;
  pageSync: any;
}): MotivePayload {
  const pageNumber = fixtures.pageSync?.pagination?.page_no ?? fixtures.vehicles?.pagination?.page_no;
  const perPage = fixtures.pageSync?.pagination?.per_page ?? fixtures.vehicles?.pagination?.per_page;
  const total = fixtures.pageSync?.pagination?.total ?? fixtures.vehicles?.pagination?.total;
  const pageToken =
    typeof pageNumber === "number" && typeof perPage === "number"
      ? `${pageNumber}/${perPage}`
      : undefined;
  const hasAdditionalPages =
    typeof pageNumber === "number" &&
    typeof perPage === "number" &&
    typeof total === "number"
      ? pageNumber * perPage < total
      : false;

  return create(MotivePayloadSchema, {
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
        syncModel: "page",
        supportsWebhooks: false,
        supportsCursor: false,
        supportsPagePolling: true,
        supportsVersionToken: false,
        requiresTimeWindowing: false,
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
      providerApiVersion: "public-docs",
      pulledAt: createTimestampFromIso(CAPTURED_AT),
    }),
    drivers: (fixtures.drivers?.users ?? []).map((entry: any) => {
      const driver = entry.user ?? {};
      return create(MotiveDriverRecordSchema, {
        id: String(driver.id),
        firstName: driver.first_name,
        lastName: driver.last_name,
        driversLicenseNumber: driver.drivers_license_number,
        status: driver.status,
        email: driver.email ?? undefined,
        phone: driver.phone ?? undefined,
        normalizedProjection: create(EldDriverRecordSchema, {
          providerDriverId: String(driver.id),
          firstName: driver.first_name,
          lastName: driver.last_name,
          fullName: [driver.first_name, driver.last_name].filter(Boolean).join(" "),
          licenseNumber: driver.drivers_license_number,
          status: driver.status,
          email: driver.email ?? undefined,
          phone: driver.phone ?? undefined,
          source: createMotiveSourceRecord("driver", String(driver.id), driver.status),
        }),
      });
    }),
    vehicles: (fixtures.vehicles?.vehicles ?? []).map((entry: any) => {
      const vehicle = entry.vehicle ?? {};
      return create(MotiveVehicleRecordSchema, {
        id: String(vehicle.id),
        number: vehicle.number,
        vin: vehicle.vin || undefined,
        currentOdometerMiles:
          typeof vehicle.true_odometer === "number"
            ? vehicle.true_odometer
            : typeof vehicle.odometer === "number"
              ? vehicle.odometer
              : undefined,
        engineHours:
          typeof vehicle.true_engine_hours === "number"
            ? vehicle.true_engine_hours
            : typeof vehicle.engine_hours === "number"
              ? vehicle.engine_hours
              : undefined,
        normalizedProjection: create(EldVehicleRecordSchema, {
          providerVehicleId: String(vehicle.id),
          vin: vehicle.vin || undefined,
          name: vehicle.number,
          licensePlate: vehicle.license_plate_number || undefined,
          make: vehicle.make ?? undefined,
          model: vehicle.model ?? undefined,
          year:
            typeof vehicle.year === "string" ? Number.parseInt(vehicle.year, 10) : undefined,
          odometerMeters:
            typeof vehicle.true_odometer === "number"
              ? vehicle.true_odometer * 1609.34
              : typeof vehicle.odometer === "number"
                ? vehicle.odometer * 1609.34
                : undefined,
          engineHoursSeconds:
            typeof vehicle.true_engine_hours === "number"
              ? vehicle.true_engine_hours * 3600
              : typeof vehicle.engine_hours === "number"
                ? vehicle.engine_hours * 3600
                : undefined,
          eldDeviceId: vehicle.eld_device?.identifier,
          source: createMotiveSourceRecord("vehicle", String(vehicle.id), vehicle.status),
        }),
      });
    }),
    hosLogs: (fixtures.hosLogs?.logs ?? []).flatMap((entry: any) => {
      const log = entry.log ?? {};
      const driver = log.driver ?? {};
      const vehicles = log.vehicles ?? [];
      const primaryVehicleId = vehicles[0]?.vehicle?.id;
      const events = (log.events ?? []).map((eventEntry: any) => {
        const event = eventEntry.event ?? {};
        return create(MotiveLogRecordSchema, {
          id: String(event.id),
          driverId: driver.id ? String(driver.id) : undefined,
          vehicleId: primaryVehicleId ? String(primaryVehicleId) : undefined,
          startTime: createTimestampFromIso(event.start_time),
          endTime: createTimestampFromIso(event.end_time),
          status: event.type,
          origin: event.is_manual ? "driver" : "auto",
          annotation: event.notes ?? event.location ?? undefined,
          normalizedProjection: create(EldHosEventRecordSchema, {
            providerEventId: String(event.id),
            providerDriverId: driver.id ? String(driver.id) : undefined,
            providerVehicleId: primaryVehicleId ? String(primaryVehicleId) : undefined,
            eventTimestamp: createTimestampFromIso(event.start_time),
            dutyStatus: event.type,
            eventType: "duty_status_change",
            annotation: event.notes ?? event.location ?? undefined,
            origin: event.is_manual ? "driver" : "auto",
            recordStatus: "active",
            source: createMotiveSourceRecord("hos_log", String(event.id), event.type),
          }),
        });
      });

      return events;
    }),
    hosClocks: (fixtures.pageSync?.users ?? []).map((entry: any) => {
      const user = entry.user ?? {};
      return create(MotiveHosClockRecordSchema, {
        driverId: String(user.id),
        driveRemainingSeconds: user.available_time?.drive,
        shiftRemainingSeconds: user.available_time?.shift,
        cycleRemainingSeconds: user.available_time?.cycle,
        breakRemainingSeconds: user.available_time?.break,
        normalizedProjection: create(EldHosClockRecordSchema, {
          providerClockId: `clock-${String(user.id)}`,
          providerDriverId: String(user.id),
          clockType: user.duty_status,
          remainingSeconds: user.available_time?.drive,
          resetsAt: createTimestampFromIso(user.last_cycle_reset?.end_time),
          source: createMotiveSourceRecord("hos_clock", `clock-${String(user.id)}`, user.duty_status),
        }),
      });
    }),
    gpsLocations: (fixtures.vehicleLocations?.vehicles ?? []).map((entry: any) => {
      const vehicle = entry.vehicle ?? {};
      const location = vehicle.current_location ?? {};
      const driver = vehicle.current_driver ?? {};
      return create(MotiveVehicleLocationRecordSchema, {
        id: String(location.id ?? vehicle.id),
        vehicleId: vehicle.id ? String(vehicle.id) : undefined,
        driverId: driver.id ? String(driver.id) : undefined,
        locatedAt: createTimestampFromIso(location.located_at),
        latitude: location.lat,
        longitude: location.lon,
        speedKilometersPerHour:
          typeof location.speed === "number" ? location.speed * 1.60934 : undefined,
        headingDegrees: location.bearing,
        normalizedProjection: create(EldGpsLocationRecordSchema, {
          providerLocationId: String(location.id ?? vehicle.id),
          providerVehicleId: vehicle.id ? String(vehicle.id) : undefined,
          providerDriverId: driver.id ? String(driver.id) : undefined,
          timestamp: createTimestampFromIso(location.located_at),
          position: createGeoPoint(location.lat, location.lon),
          speedKilometersPerHour:
            typeof location.speed === "number" ? location.speed * 1.60934 : undefined,
          headingDegrees: location.bearing,
          odometerMeters:
            typeof location.true_odometer === "number"
              ? location.true_odometer * 1609.34
              : undefined,
          engineHoursSeconds:
            typeof location.true_engine_hours === "number"
              ? location.true_engine_hours * 3600
              : undefined,
          source: createMotiveSourceRecord(
            "vehicle_location",
            String(location.id ?? vehicle.id),
          ),
        }),
      });
    }),
    dvirs: (fixtures.hosLogs?.logs ?? []).flatMap((entry: any) => {
      const log = entry.log ?? {};
      const driver = log.driver ?? {};
      return (log.inspection_reports ?? []).map((inspectionEntry: any) => {
        const report = inspectionEntry.inspection_report ?? {};
        const vehicle = report.vehicle ?? {};

        return create(MotiveDvirRecordSchema, {
          id: String(report.id),
          driverId: driver.id ? String(driver.id) : undefined,
          vehicleId: vehicle.id ? String(vehicle.id) : undefined,
          inspectionTime: createTimestampFromIso(report.time),
          inspectionType: report.inspection_type,
          isSafeToDrive: report.status === "corrected",
          defectDescriptions:
            report.status && report.status !== "corrected" ? [report.status] : [],
          mechanicNotes: report.location,
          normalizedProjection: create(EldDvirRecordSchema, {
            providerDvirId: String(report.id),
            providerDriverId: driver.id ? String(driver.id) : undefined,
            providerVehicleId: vehicle.id ? String(vehicle.id) : undefined,
            inspectionTime: createTimestampFromIso(report.time),
            inspectionType: report.inspection_type,
            isSafeToDrive: report.status === "corrected",
            defectDescriptions:
              report.status && report.status !== "corrected" ? [report.status] : [],
            mechanicNotes: report.location,
            source: createMotiveSourceRecord("dvir", String(report.id), report.status),
          }),
        });
      });
    }),
    diagnostics: [] as ReturnType<typeof create<typeof MotiveDiagnosticRecordSchema>>[],
    checkpoints: [
      create(EldSyncCheckpointSchema, {
        providerAccountId: PROVIDER_ACCOUNT_ID,
        resourceName: "page-sync",
        pageToken,
      }),
    ],
  });
}

export const motiveProviderAdapter: ProviderAdapter<"motive"> = {
  provider: "motive",
  normalize(payload) {
    const warnings: string[] = [];
    const pageToken = payload.checkpoints[0]?.pageToken;
    const resourceName = payload.checkpoints[0]?.resourceName;

    if (pageToken && resourceName) {
      warnings.push(
        `Motive sync checkpoint ${resourceName} remains page-based at ${pageToken}.`,
      );
    }

    if (payload.hosClocks.length > 0) {
      warnings.push(
        "Motive HOS availability clocks are captured in the provider payload but are not projected into the normalization response.",
      );
    }

    return normalizeEldPayload(
      SourceProvider.MOTIVE,
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
