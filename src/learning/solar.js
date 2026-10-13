// Classroom approximation: declination varies sinusoidally over a 365-day year.
// Values near solstices/equinoxes are illustrative, not an ephemeris.
const radians = degrees => degrees * Math.PI / 180
const degrees = radiansValue => radiansValue * 180 / Math.PI

export function solarDeclination(dayOfYear) {
  return -23.44 * Math.cos(2 * Math.PI * (dayOfYear + 10) / 365)
}

export function noonSolarAltitude(latitude, declination) {
  return Math.max(0, 90 - Math.abs(latitude - declination))
}

export function daylightHours(latitude, declination) {
  const tangentProduct = -Math.tan(radians(latitude)) * Math.tan(radians(declination))
  if (tangentProduct <= -1) return 24
  if (tangentProduct >= 1) return 0
  return 24 * Math.acos(tangentProduct) / Math.PI
}

export function shadowLength(height, altitude) {
  if (altitude <= 0) return Infinity
  return height / Math.tan(radians(altitude))
}

export function distanceKm(a, b) {
  const deltaLat = radians(b.lat - a.lat)
  const deltaLon = radians(b.lon - a.lon)
  const chord = Math.sin(deltaLat / 2) ** 2
    + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(deltaLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(chord)))
}

export function mapPoint(lon, lat) {
  return { x: (lon + 180) / 360 * 720, y: (90 - lat) / 180 * 360 }
}
