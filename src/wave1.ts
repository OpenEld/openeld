export type SyncMode = "cursor" | "page" | "version";

export interface CanonicalDriver {
  id: string;
  firstName: string | null;
  lastName: string | null;
  status: string | null;
  username: string | null;
}

export interface CanonicalVehicle {
  id: string;
  name: string | null;
  vin: string | null;
  licensePlate: string | null;
}

export interface CanonicalHosEvent {
  id: string;
  driverId: string | null;
  vehicleId: string | null;
  status: string | null;
  startTime: string | null;
  endTime: string | null;
  latitude: number | null;
  longitude: number | null;
  note: string | null;
}

export interface CanonicalGpsLocation {
  id: string;
  vehicleId: string | null;
  driverId: string | null;
  timestamp: string | null;
  latitude: number | null;
  longitude: number | null;
  speedKph: number | null;
  headingDegrees: number | null;
}

export interface CanonicalDvir {
  id: string;
  driverId: string | null;
  vehicleId: string | null;
  inspectionTime: string | null;
  isSafeToDrive: boolean | null;
  defectCount: number;
}

export interface CanonicalSyncState {
  kind: SyncMode;
  token: string;
  hasMore: boolean | null;
}

export interface Wave1Golden {
  provider: string;
  fixtureAuthority: "official-docs";
  drivers: CanonicalDriver[];
  vehicles: CanonicalVehicle[];
  hosEvents: CanonicalHosEvent[];
  gpsLocations: CanonicalGpsLocation[];
  dvirs: CanonicalDvir[];
  sync: CanonicalSyncState;
}

const MPH_TO_KPH = 1.60934;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function toId(value: unknown): string {
  return String(value);
}

function splitName(name: string | null | undefined): {
  firstName: string | null;
  lastName: string | null;
} {
  if (!name) {
    return { firstName: null, lastName: null };
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null };
  }

  return {
    firstName: parts[0] ?? null,
    lastName: parts.slice(1).join(" ") || null,
  };
}

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  return value.length > 0 ? value : null;
}

function optionalNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function uniqueById<T extends { id: string }>(values: T[]): T[] {
  const unique = new Map<string, T>();

  for (const value of values) {
    unique.set(value.id, value);
  }

  return Array.from(unique.values()).sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}

function sortById<T extends { id: string }>(values: T[]): T[] {
  return [...values].sort((left, right) => left.id.localeCompare(right.id));
}

export function normalizeSamsaraWave1(fixtures: {
  drivers: any;
  vehicles: any;
  hosLogs: any;
  vehicleLocations: any;
  dvirs: any;
  feedCursor: any;
}): Wave1Golden {
  const drivers = uniqueById(
    (fixtures.drivers.data ?? []).map((driver: any) => {
      const { firstName, lastName } = splitName(driver.name);

      return {
        id: toId(driver.id),
        firstName,
        lastName,
        status: optionalString(driver.driverActivationStatus),
        username: optionalString(driver.username),
      };
    }),
  );

  const vehicles = uniqueById(
    (fixtures.vehicles.data ?? []).map((vehicle: any) => ({
      id: toId(vehicle.id),
      name: optionalString(vehicle.name),
      vin: optionalString(vehicle.vin),
      licensePlate: optionalString(vehicle.licensePlate),
    })),
  );

  const hosEvents = sortById(
    (fixtures.hosLogs.data ?? []).map((log: any) => ({
      id: toId(log.id),
      driverId: optionalString(log.driverId),
      vehicleId: optionalString(log.vehicleId),
      status: optionalString(log.hosStatusType),
      startTime: optionalString(log.startTime),
      endTime: optionalString(log.endTime),
      latitude: optionalNumber(log.startLocation?.latitude),
      longitude: optionalNumber(log.startLocation?.longitude),
      note: optionalString(log.remark),
    })),
  );

  const gpsLocations = sortById(
    (fixtures.vehicleLocations.data ?? []).map((location: any) => ({
      id: toId(location.vehicleId),
      vehicleId: optionalString(location.vehicleId),
      driverId: null,
      timestamp: optionalString(location.time),
      latitude: optionalNumber(location.gps?.latitude),
      longitude: optionalNumber(location.gps?.longitude),
      speedKph:
        typeof location.gps?.speedMilesPerHour === "number"
          ? round(location.gps.speedMilesPerHour * MPH_TO_KPH)
          : null,
      headingDegrees: optionalNumber(location.gps?.headingDegrees),
    })),
  );

  const dvirs = sortById(
    (fixtures.dvirs.data ?? []).map((dvir: any) => ({
      id: toId(dvir.id),
      driverId: optionalString(dvir.driverId),
      vehicleId: optionalString(dvir.vehicleId),
      inspectionTime: optionalString(dvir.createdAtTime),
      isSafeToDrive:
        typeof dvir.safetyStatus === "string"
          ? dvir.safetyStatus === "safe"
          : null,
      defectCount: Array.isArray(dvir.defects) ? dvir.defects.length : 0,
    })),
  );

  return {
    provider: "samsara",
    fixtureAuthority: "official-docs",
    drivers,
    vehicles,
    hosEvents,
    gpsLocations,
    dvirs,
    sync: {
      kind: "cursor",
      token: toId(fixtures.feedCursor.pagination?.endCursor ?? ""),
      hasMore:
        typeof fixtures.feedCursor.pagination?.hasNextPage === "boolean"
          ? fixtures.feedCursor.pagination.hasNextPage
          : null,
    },
  };
}

export function normalizeMotiveWave1(fixtures: {
  drivers: any;
  vehicles: any;
  hosLogs: any;
  vehicleLocations: any;
  pageSync: any;
}): Wave1Golden {
  const canonicalDrivers: CanonicalDriver[] = [];

  for (const entry of fixtures.drivers.users ?? []) {
    const driver = entry.user;
    canonicalDrivers.push({
      id: toId(driver.id),
      firstName: optionalString(driver.first_name),
      lastName: optionalString(driver.last_name),
      status: optionalString(driver.status),
      username: optionalString(driver.username),
    });
  }

  for (const entry of fixtures.hosLogs.logs ?? []) {
    const driver = entry.log?.driver;
    if (driver) {
      canonicalDrivers.push({
        id: toId(driver.id),
        firstName: optionalString(driver.first_name),
        lastName: optionalString(driver.last_name),
        status: optionalString(driver.status),
        username: optionalString(driver.username),
      });
    }
  }

  for (const entry of fixtures.vehicleLocations.vehicles ?? []) {
    const driver = entry.vehicle?.current_driver;
    if (driver) {
      canonicalDrivers.push({
        id: toId(driver.id),
        firstName: optionalString(driver.first_name),
        lastName: optionalString(driver.last_name),
        status: optionalString(driver.status),
        username: optionalString(driver.username),
      });
    }
  }

  for (const entry of fixtures.pageSync.users ?? []) {
    const driver = entry.user;
    canonicalDrivers.push({
      id: toId(driver.id),
      firstName: optionalString(driver.first_name),
      lastName: optionalString(driver.last_name),
      status: optionalString(driver.status),
      username: optionalString(driver.username),
    });
  }

  const drivers = uniqueById(canonicalDrivers);

  const canonicalVehicles: CanonicalVehicle[] = [];

  for (const entry of fixtures.drivers.users ?? []) {
    const vehicle = entry.user?.current_vehicle;
    if (vehicle) {
      canonicalVehicles.push({
        id: toId(vehicle.id),
        name: optionalString(vehicle.number),
        vin: optionalString(vehicle.vin),
        licensePlate: null,
      });
    }
  }

  for (const entry of fixtures.vehicles.vehicles ?? []) {
    const vehicle = entry.vehicle;
    canonicalVehicles.push({
      id: toId(vehicle.id),
      name: optionalString(vehicle.number),
      vin: optionalString(vehicle.vin),
      licensePlate: optionalString(vehicle.license_plate_number),
    });
  }

  for (const entry of fixtures.hosLogs.logs ?? []) {
    for (const vehicleEntry of entry.log?.vehicles ?? []) {
      const vehicle = vehicleEntry.vehicle;
      canonicalVehicles.push({
        id: toId(vehicle.id),
        name: optionalString(vehicle.number),
        vin: optionalString(vehicle.vin),
        licensePlate: null,
      });
    }
  }

  for (const entry of fixtures.vehicleLocations.vehicles ?? []) {
    const vehicle = entry.vehicle;
    canonicalVehicles.push({
      id: toId(vehicle.id),
      name: optionalString(vehicle.number),
      vin: optionalString(vehicle.vin),
      licensePlate: null,
    });
  }

  const vehicles = uniqueById(canonicalVehicles);

  const hosEvents = sortById(
    (fixtures.hosLogs.logs ?? []).flatMap((entry: any) =>
      (entry.log?.events ?? []).map((eventEntry: any) => ({
        id: toId(eventEntry.event.id),
        driverId: toId(entry.log.driver.id),
        vehicleId: toId(entry.log.vehicles?.[0]?.vehicle?.id ?? ""),
        status: optionalString(eventEntry.event.type),
        startTime: optionalString(eventEntry.event.start_time),
        endTime: optionalString(eventEntry.event.end_time),
        latitude: null,
        longitude: null,
        note: optionalString(eventEntry.event.location),
      })),
    ),
  );

  const gpsLocations = sortById(
    (fixtures.vehicleLocations.vehicles ?? []).map((entry: any) => ({
      id: toId(entry.vehicle.id),
      vehicleId: toId(entry.vehicle.id),
      driverId: toId(entry.vehicle.current_driver?.id ?? ""),
      timestamp: optionalString(entry.vehicle.current_location?.located_at),
      latitude: optionalNumber(entry.vehicle.current_location?.lat),
      longitude: optionalNumber(entry.vehicle.current_location?.lon),
      speedKph:
        typeof entry.vehicle.current_location?.speed === "number"
          ? round(entry.vehicle.current_location.speed * MPH_TO_KPH)
          : null,
      headingDegrees: optionalNumber(entry.vehicle.current_location?.bearing),
    })),
  );

  const dvirs = sortById(
    (fixtures.hosLogs.logs ?? []).flatMap((entry: any) =>
      (entry.log?.inspection_reports ?? []).map((reportEntry: any) => ({
        id: toId(reportEntry.inspection_report.id),
        driverId: toId(entry.log.driver.id),
        vehicleId: toId(reportEntry.inspection_report.vehicle.id),
        inspectionTime: optionalString(reportEntry.inspection_report.time),
        isSafeToDrive:
          typeof reportEntry.inspection_report.status === "string"
            ? reportEntry.inspection_report.status !== "rejected"
            : null,
        defectCount: 0,
      })),
    ),
  );

  return {
    provider: "motive",
    fixtureAuthority: "official-docs",
    drivers,
    vehicles,
    hosEvents,
    gpsLocations,
    dvirs,
    sync: {
      kind: "page",
      token: `${fixtures.pageSync.pagination?.page_no ?? ""}/${fixtures.pageSync.pagination?.per_page ?? ""}`,
      hasMore:
        typeof fixtures.pageSync.pagination?.total === "number" &&
        typeof fixtures.pageSync.pagination?.per_page === "number"
          ? fixtures.pageSync.pagination.total > fixtures.pageSync.pagination.per_page
          : null,
    },
  };
}

export function normalizeGeotabWave1(fixtures: {
  users: any;
  devices: any;
  dutyStatusLogs: any;
  driverRegulations: any;
  logRecords: any;
  getfeed: any;
}): Wave1Golden {
  const drivers = uniqueById(
    (fixtures.users.result ?? []).map((user: any) => ({
      id: toId(user.Id),
      firstName: optionalString(user.FirstName),
      lastName: optionalString(user.LastName),
      status:
        typeof user.ActiveTo === "string" && user.ActiveTo.startsWith("9999")
          ? "active"
          : "inactive",
      username: optionalString(user.Name),
    })),
  );

  const vehicles = uniqueById(
    (fixtures.devices.result ?? []).map((device: any) => ({
      id: toId(device.Id),
      name: optionalString(device.Name),
      vin: optionalString(device.SerialNumber),
      licensePlate: null,
    })),
  );

  const hosEvents = sortById(
    (fixtures.dutyStatusLogs.result ?? []).map((log: any) => ({
      id: toId(log.Id),
      driverId: toId(log.Driver?.Id ?? ""),
      vehicleId: toId(log.Device?.Id ?? ""),
      status: optionalString(log.Status),
      startTime: optionalString(log.DateTime),
      endTime: null,
      latitude: optionalNumber(log.Location?.Latitude),
      longitude: optionalNumber(log.Location?.Longitude),
      note: optionalString(log.Origin),
    })),
  );

  const gpsLocations = sortById(
    (fixtures.logRecords.result ?? []).map((record: any) => ({
      id: toId(record.Id),
      vehicleId: toId(record.Device?.Id ?? ""),
      driverId: null,
      timestamp: optionalString(record.DateTime),
      latitude: optionalNumber(record.Latitude),
      longitude: optionalNumber(record.Longitude),
      speedKph: optionalNumber(record.Speed),
      headingDegrees: null,
    })),
  );

  return {
    provider: "geotab",
    fixtureAuthority: "official-docs",
    drivers,
    vehicles,
    hosEvents,
    gpsLocations,
    dvirs: [],
    sync: {
      kind: "version",
      token: toId(fixtures.getfeed.feedResult?.toVersion ?? ""),
      hasMore: null,
    },
  };
}
