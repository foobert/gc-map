import { lookup } from "../tree";
import { toQuadKey, toCoordinates } from "../math";

const CanvasLayer = L.GridLayer.extend({
  createTile: function(coord) {
    const size = this.getTileSize();

    const tile = L.DomUtil.create("canvas", "leaflet-tile");
    tile.width = size.x;
    tile.height = size.y;

    const coordinates = toCoordinates(coord);
    const coordinatesLowerRight = toCoordinates({
      x: coord.x + 1,
      y: coord.y + 1,
      z: coord.z
    });
    const quadKey = toQuadKey(coord.x, coord.y, coord.z).join("");
    const gcsPromise = lookup(quadKey);

    const ctx = tile.getContext("2d");

    gcsPromise.then(gcs => {
      for (const gc of gcs) {
        if (!gc.parsed) {
          continue;
        }

        const position = {
          x:
            Math.sign(coordinates.lon) *
            (gc.parsed.lon - coordinates.lon) /
            Math.abs(coordinates.lon - coordinatesLowerRight.lon) *
            size.x,
          y:
            (coordinates.lat - gc.parsed.lat) /
            Math.abs(coordinates.lat - coordinatesLowerRight.lat) *
            size.y
        };

        if (
          position.x < 0 ||
          position.x > size.x ||
          position.y < 0 ||
          position.y > size.y
        ) {
          continue;
        }

        const ageInDays = computeAgeInDays(gc);
        let color = ageToColor(ageInDays);
        ctx.beginPath();
        ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
        ctx.strokeStyle = "white";
        ctx.fillStyle = color;
        ctx.lineWidth = 0;
        ctx.fill();
        ctx.stroke();
      }
    });

    return tile;
  }
});

function computeAgeInDays(gc) {
  return Math.max(
    0,
    Math.min(
      255,
      Math.floor((Date.now() - Date.parse(gc.api_date)) / (1000 * 60 * 60 * 24))
    )
  );
}

function ageToColor(ageInDays) {
  const perc = 100 - 100 * Math.min(1, ageInDays / 90);
  let r,
    g,
    b = 0;
  if (perc < 50) {
    r = 255;
    g = Math.round(5.1 * perc);
  } else {
    g = 255;
    r = Math.round(510 - 5.1 * perc);
  }
  const h = r * 0x10000 + g * 0x100 + b * 0x1;
  return "#" + ("000000" + h.toString(16)).slice(-6);
}

export default function create() {
  return new CanvasLayer();
}
