import d from "debug";
const debug = d("gc:map:layer:gc");

// ugh, hack
import state, { save } from "../state";
import m from "mithril";

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

let hack;

export function toggleTypeFilter(type) {
  if (state.map.filter.types[type]) {
    state.map.filter.types[type] = false;
  } else {
    state.map.filter.types[type] = true;
  }
  save();
  if (hack) {
    hack.redraw();
  }
}

export function getTypeFilter(type) {
  return state.map.filter.types[type];
}

const CanvasLayer = L.GridLayer.extend({
  createTile: function(coord, done) {
    const size = this.getTileSize();

    const tile = L.DomUtil.create("canvas", "leaflet-tile");
    tile.width = size.x;
    tile.height = size.y;

    tile.addEventListener("click", onClick.bind(tile));

    tile.clickMap = [];

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

        tile.clickMap.push({ position, gc });

        if (coord.z < 13) {
          ctx.globalAlpha = coord.z < 11 ? 0.1 : 1;
          ctx.beginPath();
          ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
          ctx.strokeStyle = "white";
          ctx.fillStyle = lookupColor(gc);
          ctx.lineWidth = 0;
          ctx.fill();
          ctx.stroke();
          ctx.globalAlpha = 1;
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

      done(null, tile);
    });

    return tile;
  }
});
function onClick(e) {
  const diff = ({ position }, e) =>
    (position.x - e.offsetX) ** 2 + (position.y - e.offsetY) ** 2;
  let sorted = this.clickMap.sort((a, b) => diff(a, e) - diff(b, e));
  debug(sorted);
  if (sorted.length > 0 && diff(sorted[0], e) < 400) {
    debug("HIT %d %o", diff(sorted[0], e), sorted[0].gc);
    state.map.details.gc = sorted[0].gc;
    state.map.details.open = true;
  } else {
    //state.map.details.gc = null;
    state.map.details.open = false;
  }
  m.redraw();
}

function isFiltered(gc) {
  if (!state.map.filter.types[gc.parsed.type]) {
    return true;
  }
  if (state.map.filter.favpoints > gc.parsed.favpoints) {
    return true;
  }
  return false;
}

export default function create() {
  hack = new CanvasLayer();
  hack.on({ click: e => debug("foo", e) });
  return hack;
}
