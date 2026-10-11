// Vite emits stable, hashed URLs for the verified local image collection.
const images = import.meta.glob('../assets/geo-verified/*.{jpg,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export function geoAsset(filename) {
  const url = images[`../assets/geo-verified/${filename}`]
  if (!url) throw new Error(`Missing verified geography image: ${filename}`)
  return url
}

export function geoAvifAsset(jpegFilename) {
  return geoAsset(jpegFilename.replace(/\.jpg$/, '.avif'))
}

// Keep a small set of fixed transformations within the Images Free allowance.
// Cloudflare currently cannot use our AVIF files as transformation sources, so
// transform the verified JPEG originals and keep the originals as a fallback.
export function geoOptimizedAsset(jpegFilename, width) {
  const original = geoAsset(jpegFilename)
  if (typeof window === 'undefined' || window.location.hostname !== 'geo.kongnoma279.com') return original
  const source = new URL(original, window.location.href)
  return `/cdn-cgi/image/width=${width},quality=82,format=auto,onerror=redirect${source.pathname}`
}
