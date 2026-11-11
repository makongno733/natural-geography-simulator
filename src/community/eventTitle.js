const eventTypes = [
  [/^Super Typhoon\s+(.+)$/i, '超强台风'],
  [/^Tropical Storm\s+(.+)$/i, '热带风暴'],
  [/^Tropical Cyclone\s+(.+)$/i, '热带气旋'],
  [/^Typhoon\s+(.+)$/i, '台风'],
  [/^Hurricane\s+(.+)$/i, '飓风'],
  [/^Storm\s+(.+)$/i, '风暴'],
  [/^Iceberg\s+(.+)$/i, '冰山'],
  [/^Wildfire\s+(.+)$/i, '野火'],
  [/^Prescribed Fire\s+(.+)$/i, '计划烧除'],
]

export function eventDisplayTitle(title) {
  for (const [pattern, label] of eventTypes) {
    const match = title.match(pattern)
    if (match) return `${label} ${match[1]}`
  }
  return title
}
