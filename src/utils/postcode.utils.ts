import axios from "axios";

type PostcodeQuery = { postcode: string } | { lat: number; lng: number };

export async function getPostcodeData(query: PostcodeQuery) {
  try {
    let res;
    if ("postcode" in query && query.postcode.length >= 5) {
      // Query by postcode string
      res = await axios.get(`https://api.postcodes.io/postcodes/${query.postcode}`);
      const { latitude, longitude, country, admin_ward: ward, admin_district: district } = res.data.result;

      return {
        lat: latitude,
        lng: longitude,
        addressLines: [
          res.data.result.thoroughfare || res.data.result.street || res.data.result.parish || "",
          [ward, district].filter(Boolean).join(", "),
          country || "",
        ],
        addressCoords: `${latitude?.toFixed(5)}, ${longitude?.toFixed(5)}`,
        postcode: query.postcode,
        what3words: res.data.result?.what3words || "",
      };
    } else if ("lat" in query && "lng" in query) {
      // Query by lat/lng
      res = await axios.get(`https://api.postcodes.io/postcodes?lon=${query.lng}&lat=${query.lat}`);
      const result = res.data.result?.[0];
      if (!result) return null;
      const { postcode, latitude, longitude, country, admin_ward: ward, admin_district: district } = result;

      return {
        lat: latitude,
        lng: longitude,
        addressLines: [
          result.thoroughfare || result.street || result.parish || "",
          [ward, district].filter(Boolean).join(", "),
          country || "",
        ],
        addressCoords: `${latitude?.toFixed(5)}, ${longitude?.toFixed(5)}`,
        postcode: postcode || "",
        what3words: result.what3words || "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function isValidPostcode(value: string): boolean {
  const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
  return postcodeRegex.test(value);
}
export function formatPostcode(value: string): string {
  return value
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})/, "$1 $2");
}
