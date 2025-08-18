import { prisma as defaultPrisma } from "@/lib/prisma";

export const EARTH_RADIUS_M = 6_371_000;

/**
 * Compute Haversine distance between two points in meters.
 */
export function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/**
 * Parse near and radius query params from URL.
 * - near: "lat,lng"
 * - radius: number in meters (default 0)
 */
export function parseGeoParamsFromUrl(url: URL): {
  hasGeo: boolean;
  centerLat: number | null;
  centerLng: number | null;
  radiusMeters: number;
} {
  const near = url.searchParams.get("near"); // "lat,lng"
  const radiusMeters = Number(url.searchParams.get("radius") || "0");

  if (!near || !radiusMeters || Number.isNaN(radiusMeters) || radiusMeters <= 0) {
    return { hasGeo: false, centerLat: null, centerLng: null, radiusMeters: 0 };
  }

  const [latStr, lngStr] = near.split(",");
  const centerLat = Number(latStr);
  const centerLng = Number(lngStr);

  if (!Number.isFinite(centerLat) || !Number.isFinite(centerLng)) {
    return { hasGeo: false, centerLat: null, centerLng: null, radiusMeters: 0 };
  }

  return { hasGeo: true, centerLat, centerLng, radiusMeters };
}

/**
 * Get Project ids within a radius (meters) from a center point.
 * Uses spherical law of cosines on the database for coarse filtering.
 */
export async function queryProjectIdsWithinRadius(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  prisma = defaultPrisma,
): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM "Project"
    WHERE (
      ${EARTH_RADIUS_M} * acos(
        cos(radians(${centerLat})) * cos(radians("latitude"))
        * cos(radians("longitude") - radians(${centerLng}))
        + sin(radians(${centerLat})) * sin(radians("latitude"))
      )
    ) < ${radiusMeters}
  `;
  return rows.map((r) => r.id);
}

/**
 * Get Idea ids within a radius (meters) from a center point.
 * Uses the same approach as projects.
 */
export async function queryIdeaIdsWithinRadius(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  prisma = defaultPrisma,
): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM "Idea"
    WHERE (
      ${EARTH_RADIUS_M} * acos(
        cos(radians(${centerLat})) * cos(radians("latitude"))
        * cos(radians("longitude") - radians(${centerLng}))
        + sin(radians(${centerLat})) * sin(radians("latitude"))
      )
    ) < ${radiusMeters}
  `;
  return rows.map((r) => r.id);
}
