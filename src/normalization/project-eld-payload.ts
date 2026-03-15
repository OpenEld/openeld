import { create } from "@bufbuild/protobuf";
import { TimestampSchema } from "@bufbuild/protobuf/wkt";

import {
  SourceProvider,
  SourceRecordSchema,
} from "../../gen/ts/common/metadata/source_pb";
import { GeoPointSchema } from "../../gen/ts/common/primitives/location_pb";
import { TimeRangeSchema } from "../../gen/ts/common/primitives/time_pb";
import {
  EngineHoursSchema,
  HeadingSchema,
  OdometerReadingSchema,
  SpeedSchema,
} from "../../gen/ts/common/units/measurements_pb";
import {
  DriverSchema,
} from "../../gen/ts/logistics/driver_pb";
import { DvirDefectSchema, DvirSchema } from "../../gen/ts/logistics/dvir_pb";
import {
  DriverStatus,
  DutyStatus,
  EventOrigin,
  EventType,
  GeofenceTransitionType,
  HosEventCode,
  HosRuleset,
  InspectionType,
  RecordStatus,
} from "../../gen/ts/logistics/enums_pb";
import { GeofenceEventSchema, type GeofenceEvent } from "../../gen/ts/logistics/geofence_event_pb";
import { GpsLocationSchema } from "../../gen/ts/logistics/gps_location_pb";
import {
  HosAnnotationSchema,
  HosEventSchema,
} from "../../gen/ts/logistics/hos_event_pb";
import { VehicleSchema } from "../../gen/ts/logistics/vehicle_pb";
import {
  TrailerReferenceSchema,
  VehicleAssignmentSchema,
} from "../../gen/ts/logistics/vehicle_assignment_pb";
import {
  type EldDriverRecord,
  type EldDvirRecord,
  type EldGpsLocationRecord,
  type EldHosEventRecord,
  type EldPayloadMetadata,
  type EldVehicleAssignmentRecord,
  type EldVehicleRecord,
} from "../../gen/ts/providers/eld/shared/common_pb";
import {
  NormalizeProviderPayloadResponseSchema,
} from "../../gen/ts/services/normalization/service_pb";

function splitName(fullName?: string): [string, string] {
  if (!fullName) {
    return ["", ""];
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return ["", ""];
  }

  if (parts.length === 1) {
    return [parts[0] ?? "", ""];
  }

  return [parts[0] ?? "", parts.slice(1).join(" ")];
}

function toTimestamp(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const milliseconds = date.getTime();
  const seconds = Math.trunc(milliseconds / 1000);
  const nanos = (milliseconds % 1000) * 1_000_000;

  return create(TimestampSchema, {
    seconds: BigInt(seconds),
    nanos,
  });
}

function toGeoPoint(latitude?: number | null, longitude?: number | null) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return undefined;
  }

  return create(GeoPointSchema, { latitude, longitude });
}

function toOdometer(meters?: number | null) {
  if (typeof meters !== "number") {
    return undefined;
  }

  return create(OdometerReadingSchema, { meters });
}

function toEngineHours(seconds?: number | null) {
  if (typeof seconds !== "number") {
    return undefined;
  }

  return create(EngineHoursSchema, { seconds });
}

function toSpeed(kilometersPerHour?: number | null) {
  if (typeof kilometersPerHour !== "number") {
    return undefined;
  }

  return create(SpeedSchema, { kilometersPerHour });
}

function toHeading(degrees?: number | null) {
  if (typeof degrees !== "number") {
    return undefined;
  }

  return create(HeadingSchema, { degrees });
}

function mapDriverStatus(status?: string) {
  switch (status?.trim().toLowerCase()) {
    case "active":
      return DriverStatus.ACTIVE;
    case "inactive":
      return DriverStatus.INACTIVE;
    case "deactivated":
      return DriverStatus.DEACTIVATED;
    default:
      return DriverStatus.UNSPECIFIED;
  }
}

function mapDutyStatus(status?: string) {
  const normalized = status?.trim().toLowerCase().replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "offduty":
    case "off_duty":
      return DutyStatus.OFF_DUTY;
    case "sleeper":
    case "sleeper_berth":
      return DutyStatus.SLEEPER_BERTH;
    case "driving":
      return DutyStatus.DRIVING;
    case "on_duty":
    case "on_duty_not_driving":
    case "onduty":
    case "ondutynotdriving":
      return DutyStatus.ON_DUTY_NOT_DRIVING;
    case "personal_conveyance":
      return DutyStatus.PERSONAL_CONVEYANCE;
    case "yard_move":
      return DutyStatus.YARD_MOVE;
    case "wait_time":
      return DutyStatus.WAIT_TIME;
    default:
      return DutyStatus.UNSPECIFIED;
  }
}

function mapEventType(eventType?: string, dutyStatus?: string) {
  const normalized = eventType?.trim().toLowerCase().replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "intermediate_log":
      return EventType.INTERMEDIATE_LOG;
    case "special_driving_condition":
      return EventType.SPECIAL_DRIVING_CONDITION;
    case "certification":
      return EventType.CERTIFICATION;
    case "login":
    case "logout":
    case "login_logout":
      return EventType.LOGIN_LOGOUT;
    case "engine_power":
      return EventType.ENGINE_POWER;
    case "malfunction":
    case "diagnostic":
    case "malfunction_or_diagnostic":
      return EventType.MALFUNCTION_OR_DIAGNOSTIC;
    default:
      return dutyStatus ? EventType.DUTY_STATUS_CHANGE : EventType.UNSPECIFIED;
  }
}

function mapEventCode(eventType?: string, dutyStatus?: string) {
  const normalizedDutyStatus = mapDutyStatus(dutyStatus);
  switch (normalizedDutyStatus) {
    case DutyStatus.OFF_DUTY:
      return HosEventCode.OFF_DUTY;
    case DutyStatus.SLEEPER_BERTH:
      return HosEventCode.SLEEPER_BERTH;
    case DutyStatus.DRIVING:
      return HosEventCode.DRIVING;
    case DutyStatus.ON_DUTY_NOT_DRIVING:
      return HosEventCode.ON_DUTY_NOT_DRIVING;
    case DutyStatus.PERSONAL_CONVEYANCE:
      return HosEventCode.PERSONAL_CONVEYANCE;
    case DutyStatus.YARD_MOVE:
      return HosEventCode.YARD_MOVE;
    case DutyStatus.WAIT_TIME:
      return HosEventCode.WAIT_TIME;
    default:
      break;
  }

  switch (eventType?.trim().toLowerCase().replace(/[\s-]+/g, "_")) {
    case "intermediate_log":
      return HosEventCode.INTERMEDIATE_LOG;
    case "login":
      return HosEventCode.LOGIN;
    case "logout":
      return HosEventCode.LOGOUT;
    case "engine_power_up":
      return HosEventCode.ENGINE_POWER_UP;
    case "engine_shutdown":
      return HosEventCode.ENGINE_SHUTDOWN;
    case "certification":
      return HosEventCode.CERTIFICATION;
    case "malfunction":
      return HosEventCode.MALFUNCTION;
    case "diagnostic":
      return HosEventCode.DIAGNOSTIC;
    default:
      return HosEventCode.UNSPECIFIED;
  }
}

function mapOrigin(origin?: string) {
  switch (origin?.trim().toLowerCase()) {
    case "auto":
    case "automatic":
      return EventOrigin.AUTO;
    case "driver":
    case "manual":
      return EventOrigin.DRIVER;
    case "other_user":
      return EventOrigin.OTHER_USER;
    case "unidentified":
      return EventOrigin.UNIDENTIFIED;
    default:
      return EventOrigin.UNSPECIFIED;
  }
}

function mapRecordStatus(status?: string) {
  switch (status?.trim().toLowerCase()) {
    case "1":
    case "active":
      return RecordStatus.ACTIVE;
    case "inactive_changed":
      return RecordStatus.INACTIVE_CHANGED;
    case "inactive_change_requested":
      return RecordStatus.INACTIVE_CHANGE_REQUESTED;
    case "inactive_change_rejected":
      return RecordStatus.INACTIVE_CHANGE_REJECTED;
    default:
      return RecordStatus.UNSPECIFIED;
  }
}

function mapInspectionType(inspectionType?: string) {
  switch (inspectionType?.trim().toLowerCase().replace(/[\s-]+/g, "_")) {
    case "pre_trip":
      return InspectionType.PRE_TRIP;
    case "post_trip":
      return InspectionType.POST_TRIP;
    case "interim":
      return InspectionType.INTERIM;
    default:
      return InspectionType.UNSPECIFIED;
  }
}

function buildSourceRecord(
  provider: SourceProvider,
  providerRecordType: string,
  primaryExternalId: string,
  metadata?: EldPayloadMetadata,
  nativeStatus?: string,
) {
  return create(SourceRecordSchema, {
    provider,
    providerAccountId: metadata?.account?.providerAccountId,
    providerRecordType,
    primaryExternalId,
    nativeStatus,
    syncCursor:
      metadata?.cursor ??
      metadata?.syncProfile?.syncModel ??
      metadata?.providerApiVersion,
  });
}

function projectDriverRecord(
  provider: SourceProvider,
  carrierId: string,
  record: EldDriverRecord,
  metadata?: EldPayloadMetadata,
) {
  const [firstName, lastName] =
    record.firstName || record.lastName
      ? [record.firstName ?? "", record.lastName ?? ""]
      : splitName(record.fullName);

  return create(DriverSchema, {
    driverId: record.providerDriverId,
    carrierId,
    firstName,
    lastName,
    licenseNumber: record.licenseNumber,
    eldExempt: false,
    hosRuleset: HosRuleset.UNSPECIFIED,
    status: mapDriverStatus(record.status),
    email: record.email,
    phone: record.phone,
    source:
      record.source ??
      buildSourceRecord(
        provider,
        "driver",
        record.providerDriverId,
        metadata,
        record.status,
      ),
  });
}

function projectVehicleRecord(
  provider: SourceProvider,
  carrierId: string,
  record: EldVehicleRecord,
  metadata?: EldPayloadMetadata,
) {
  return create(VehicleSchema, {
    vehicleId: record.providerVehicleId,
    carrierId,
    vin: record.vin ?? "",
    name: record.name ?? record.providerVehicleId,
    licensePlate: record.licensePlate,
    make: record.make,
    model: record.model,
    year: record.year,
    odometer: toOdometer(record.odometerMeters),
    engineHours: toEngineHours(record.engineHoursSeconds),
    eldDeviceId: record.eldDeviceId,
    source:
      record.source ??
      buildSourceRecord(
        provider,
        "vehicle",
        record.providerVehicleId,
        metadata,
      ),
  });
}

function projectAssignmentRecord(
  provider: SourceProvider,
  record: EldVehicleAssignmentRecord,
  metadata?: EldPayloadMetadata,
) {
  if (!record.providerDriverId || !record.providerVehicleId) {
    return undefined;
  }

  return create(VehicleAssignmentSchema, {
    assignmentId: record.providerAssignmentId,
    driverId: record.providerDriverId,
    vehicleId: record.providerVehicleId,
    codriverId: record.providerCodriverId,
    assignmentTimeRange:
      record.startTime || record.endTime
        ? create(TimeRangeSchema, {
            startTime: record.startTime,
            endTime: record.endTime,
          })
        : undefined,
    trailers: record.trailerIdentifiers.map((name) =>
      create(TrailerReferenceSchema, { name }),
    ),
    shippingDocNumber: record.shippingDocNumber,
    source:
      record.source ??
      buildSourceRecord(
        provider,
        "vehicle_assignment",
        record.providerAssignmentId,
        metadata,
      ),
  });
}

function projectHosEventRecord(
  provider: SourceProvider,
  record: EldHosEventRecord,
  metadata?: EldPayloadMetadata,
) {
  if (!record.providerDriverId || !record.eventTimestamp) {
    return undefined;
  }

  return create(HosEventSchema, {
    eventId: record.providerEventId,
    driverId: record.providerDriverId,
    vehicleId: record.providerVehicleId,
    eventTimestamp: record.eventTimestamp,
    eventType: mapEventType(record.eventType, record.dutyStatus),
    eventCode: mapEventCode(record.eventType, record.dutyStatus),
    dutyStatus: mapDutyStatus(record.dutyStatus),
    position: record.position,
    odometer: toOdometer(record.odometerMeters),
    engineHours: toEngineHours(record.engineHoursSeconds),
    origin: mapOrigin(record.origin),
    recordStatus: mapRecordStatus(record.recordStatus),
    annotation: record.annotation
      ? create(HosAnnotationSchema, { text: record.annotation })
      : undefined,
    certified: false,
    sequenceNumber: 0,
    source:
      record.source ??
      buildSourceRecord(
        provider,
        "hos_event",
        record.providerEventId,
        metadata,
        record.dutyStatus,
      ),
  });
}

function projectGpsLocationRecord(
  provider: SourceProvider,
  record: EldGpsLocationRecord,
  metadata?: EldPayloadMetadata,
) {
  if (!record.providerVehicleId || !record.timestamp || !record.position) {
    return undefined;
  }

  return create(GpsLocationSchema, {
    locationId: record.providerLocationId,
    vehicleId: record.providerVehicleId,
    driverId: record.providerDriverId,
    timestamp: record.timestamp,
    position: record.position,
    speed: toSpeed(record.speedKilometersPerHour),
    heading: toHeading(record.headingDegrees),
    odometer: toOdometer(record.odometerMeters),
    engineHours: toEngineHours(record.engineHoursSeconds),
    source:
      record.source ??
      buildSourceRecord(
        provider,
        "gps_location",
        record.providerLocationId,
        metadata,
      ),
  });
}

function projectDvirRecord(
  provider: SourceProvider,
  record: EldDvirRecord,
  metadata?: EldPayloadMetadata,
) {
  if (!record.providerDriverId || !record.providerVehicleId || !record.inspectionTime) {
    return undefined;
  }

  return create(DvirSchema, {
    dvirId: record.providerDvirId,
    driverId: record.providerDriverId,
    vehicleId: record.providerVehicleId,
    inspectionType: mapInspectionType(record.inspectionType),
    inspectionTime: record.inspectionTime,
    isSafeToDrive: record.isSafeToDrive ?? false,
    defects: record.defectDescriptions.map((description, index) =>
      create(DvirDefectSchema, {
        defectId: `${record.providerDvirId}-defect-${index + 1}`,
        title: description,
        description,
        repaired: false,
        repairedVerified: false,
        mechanicNotes: record.mechanicNotes,
      }),
    ),
    mechanicNotes: record.mechanicNotes,
    source:
      record.source ??
      buildSourceRecord(
        provider,
        "dvir",
        record.providerDvirId,
        metadata,
      ),
  });
}

export function normalizeEldPayload(
  provider: SourceProvider,
  metadata: EldPayloadMetadata | undefined,
  driverRecords: readonly EldDriverRecord[],
  vehicleRecords: readonly EldVehicleRecord[],
  assignmentRecords: readonly EldVehicleAssignmentRecord[],
  hosEventRecords: readonly EldHosEventRecord[],
  gpsLocationRecords: readonly EldGpsLocationRecord[],
  dvirRecords: readonly EldDvirRecord[],
  geofenceEvents: readonly GeofenceEvent[] = [],
  warnings: readonly string[] = [],
) {
  const carrierId = metadata?.account?.carrierId ?? "docs-carrier";

  return create(NormalizeProviderPayloadResponseSchema, {
    drivers: driverRecords.map((record) =>
      projectDriverRecord(provider, carrierId, record, metadata),
    ),
    vehicles: vehicleRecords.map((record) =>
      projectVehicleRecord(provider, carrierId, record, metadata),
    ),
    vehicleAssignments: assignmentRecords
      .map((record) => projectAssignmentRecord(provider, record, metadata))
      .filter((record) => record !== undefined),
    hosEvents: hosEventRecords
      .map((record) => projectHosEventRecord(provider, record, metadata))
      .filter((record) => record !== undefined),
    gpsLocations: gpsLocationRecords
      .map((record) => projectGpsLocationRecord(provider, record, metadata))
      .filter((record) => record !== undefined),
    dvirs: dvirRecords
      .map((record) => projectDvirRecord(provider, record, metadata))
      .filter((record) => record !== undefined),
    geofenceEvents: geofenceEvents.map((event) =>
      create(GeofenceEventSchema, {
        geofenceEventId: event.geofenceEventId,
        geofenceId: event.geofenceId,
        geofenceName: event.geofenceName,
        assetId: event.assetId,
        vehicleId: event.vehicleId,
        driverId: event.driverId,
        transitionType:
          event.transitionType || GeofenceTransitionType.UNSPECIFIED,
        eventTime: event.eventTime,
        position: event.position,
        providerEventLabel: event.providerEventLabel,
        source: event.source,
        audit: event.audit,
      }),
    ),
    warnings: [...warnings],
  });
}

export function createTimestampFromIso(value?: string | null) {
  return toTimestamp(value);
}

export function createGeoPoint(latitude?: number | null, longitude?: number | null) {
  return toGeoPoint(latitude, longitude);
}
