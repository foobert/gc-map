import { lookup, toTile, toCoordinates, toQuadKey } from "../tree";
import lookupIcon from "../icons";

function lookupColor(gc) {
  switch (gc.parsed.type) {
    case "traditional":
      return "#23db35";
    case "multi":
      return "#db8b23";
    default:
      return "#23c2db";
  }
}

const filters = {
  types: ["traditional", "multi"]
};

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
          console.log(gc);
          continue;
        }

        if (isFiltered(gc)) {
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

        //ctx.fillStyle = "blue";
        //ctx.fillRect(dx - 5, dy - 5, 10, 10);

        if (
          position.x < 0 ||
          position.x > size.x ||
          position.y < 0 ||
          position.y > size.y
        ) {
          continue;
        }

        if (coord.z < 13) {
          ctx.beginPath();
          ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
          ctx.strokeStyle = "white";
          ctx.fillStyle = lookupColor(gc);
          ctx.lineWidth = 0;
          ctx.fill();
          ctx.stroke();
        } else {
          const image = lookupIcon(gc);
          const center = {
            x:
              Math.max(
                image.width / 2,
                Math.min(size.x - image.width / 2, position.x)
              ) -
              image.width / 2,
            y:
              Math.max(
                image.height / 2,
                Math.min(size.y - image.height / 2, position.y)
              ) -
              image.height / 2
          };
          ctx.drawImage(image, center.x, center.y);
        }
      }
    });

    return tile;
  }
});

function isFiltered(gc) {
  if (filters.types.indexOf(gc.parsed.type) < 0) {
    return true;
  }
  if (filters.favpoints > gc.parsed.favpoints) {
    return true;
  }
  return false;
}

export default function create() {
  return new CanvasLayer();
}
