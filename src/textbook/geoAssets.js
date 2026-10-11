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
