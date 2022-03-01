const simpleStringMap = [
  "1111111",
  "1000001",
  "1000001",
  "1000001",
  "1000001",
  "1000001",
  "1000001",
  "1111111",
]

export function generateSimpleMap() {
  return convertToArrayMap(simpleStringMap)
}

export function convertToArrayMap(stringMap: string[]) {
  return stringMap.map((row) => row.split("").map((value) => value == "1"))
}

// TODO: Check for other players, direction, etc.
export function walkable(x, y, map) {
  if (map[y][x]) {
    return false
  }

  return true
}
