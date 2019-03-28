import m from "mithril";
import debugSetup from "debug";
const debug = debugSetup("gc:map:tree");
import state from "./state";
import { lookup as cacheLookup } from "./cache";

const maxZoom = 11;
let inflightRequests = 0;
const backendUrl =
  localStorage.getItem("backend") || "https://gc.funkenburg.net/api/graphql";
debug("Using backend %s", backendUrl);

export function reset() {}

export function getInflightRequests() {
  return inflightRequests;
}

export async function lookup(quadkey) {
  const expanded = expandQuadkey(quadkey);
  const all = await Promise.all(expanded.map(lookupSingle));
  return all.flat();
}

async function lookupSingle(quadkey) {
  return cacheLookup(quadkey, fetch);
}

function expandQuadkey(quadkey) {
  quadkey = quadkey.substr(0, maxZoom);
  if (quadkey.length >= maxZoom) {
    return [quadkey];
  }

  return ["0", "1", "2", "3"].map(k => expandQuadkey(quadkey + k)).flat();
}

async function fetch(quadkey) {
  inflightRequests++;
  return m
    .request({
      method: "POST",
      url: backendUrl,
      data: {
        query:
          "{ geocaches(quadkey: " +
          JSON.stringify(quadkey) +
          ", exclude: " +
          JSON.stringify(Object.keys(state.map.filter.users || {})) +
          ") { nodes { id api_date parsed { lat lon name type size difficulty terrain hint disabled favpoints attributes { id active }} } } }"
      }
    })
    .then(res => {
      inflightRequests--;
      return res.data.geocaches.nodes;
    })
    .catch(() => {
      inflightRequests--;
      return [];
    });
}

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
