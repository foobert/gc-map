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

        if (this._tileZoom < 10) {
          ctx.beginPath();
          ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
          ctx.strokeStyle = "white";
          ctx.fillStyle = lookupColor(gc);
          ctx.lineWidth = 0;
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.drawImage(lookupIcon(gc), position.x, position.y);
        }
      }
    });

    return tile;
  },
  popup: L.popup(),
  onClick: function(e) {
    const { lat, lng: lon } = e.latlng;
    const tile = toTile(lat, lon, mymap.getZoom());
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

export default function create(map) {
  const layer = new CanvasLayer();
  //mymap.on("click", e => layer.onClick(e));
  window.foo = layer;
  map.addLayer(layer);
}
