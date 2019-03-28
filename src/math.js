export function toTile(lat, lon, zoom) {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const xtile = parseInt(((lon + 180.0) / 360.0) * n);
  const ytile = parseInt(
    ((1.0 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) /
      2.0) *
      n
  );
  return { x: xtile, y: ytile };
}

export function toQuadKey(tileX, tileY, zoom) {
  let quadKey = [];
  for (let i = zoom; i > 0; i--) {
    let digit = 0;
    const mask = 1 << (i - 1);
    if ((tileX & mask) !== 0) {
      digit++;
    }
    if ((tileY & mask) !== 0) {
      digit += 2;
    }
    quadKey.push(digit);
  }
  return quadKey;
}

export function toCoordinates(tile) {
  const n = Math.pow(2, tile.z);
  const lon = (tile.x / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * tile.y) / n)));
  const lat = (latRad / Math.PI) * 180;
  return { lat, lon };
}
