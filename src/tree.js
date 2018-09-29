import m from "mithril";
import debugSetup from "debug";
const debug = debugSetup("gc:map:tree");

const maxZoom = 16;
const root = { data: [], key: "" };

export async function lookup(quadkey) {
  // try to find node at quadkey
  // if there is a node, return results
  // else do fetch() and insert into tree
  //
  // tree insert:
  // walk tree, add quadkey at node
  // continue walking tree up to max zoom, inserting quad partitions

  // todo propagate up if we have all four keys?

  const node = walk(quadkey);
  if (node && node.loaded) {
    debug("Cache HIT at %s", quadkey);
    let tmp = node.data.slice();
    tmp.cache = "hit";
    return tmp;
  } else {
    debug("Cache MISS at %s", quadkey);
    const data = await fetch(quadkey);
    insert(quadkey, data);
    let tmp = data.slice();
    tmp.cache = "miss";
    return tmp;
  }
}

function walk(quadkey) {
  let node = root;
  for (const k of quadkey) {
    if (!node[k]) {
      return null;
    }
    node = node[k];
  }
  return node;
}

async function fetch(quadkey) {
  return m
    .request({
      method: "POST",
      url: "http://localhost:8080/api/graphql",
      data: {
        query:
          "{ geocaches(quadkey: " +
          JSON.stringify(quadkey) +
          ") { totalCount next nodes { id api_date parsed { lat lon name type } } } }"
      }
    })
    .then(res => res.data.geocaches.nodes);
}

function insert(quadkey, data) {
  let node = root;
  let path = "";
  for (const k of quadkey) {
    path += k;
    if (!node[k]) {
      node[k] = { data: [], parent: node, key: path };
    }
    node = node[k];
  }
  node.data = node.data.concat(data);
  node.loaded = true;

  propagateDown(node, quadkey);
  propagateUp(node);
}

function propagateDown(node, quadkey) {
  if (zoom(quadkey) === maxZoom) {
    return;
  }
  let buckets = split(quadkey, node.data);
  for (let i = 0; i < 4; i++) {
    if (!node[i]) {
      node[i] = {
        data: buckets[i],
        parent: node,
        key: quadkey + i,
        loaded: true
      };
      debug("Propagate down from %s to %s", node.key, node[i].key);
      propagateDown(node[i], quadkey + i);
    }
  }
}

function propagateUp(node) {
  const parent = node.parent;
  if (!parent || parent.loaded) {
    return;
  }

  if ([0, 1, 2, 3].every(x => parent[x] && parent[x].loaded)) {
    const data = [0, 1, 2, 3].reduce((s, x) => s.concat(parent[x].data), []);
    parent.data = data;
    parent.loaded = true;
    debug("Propagate up from %s to %s", node.key, parent.key);
    propagateUp(parent);
  }
}

function zoom(quadkey) {
  return quadkey.length;
}

function split(quadkey, data) {
  let nextZoom = zoom(quadkey) + 1;
  let buckets = [[], [], [], []];
  const mask = 1;

  for (let d of data) {
    const { parsed: { lat, lon } } = d;
    const { x: tileX, y: tileY } = toTile(lat, lon, nextZoom);
    let digit = 0;
    if ((tileX & mask) !== 0) digit += 1;
    if ((tileY & mask) !== 0) digit += 2;
    buckets[digit].push(d);
  }
  return buckets;
}

export function toTile(lat, lon, zoom) {
  const latRad = lat * Math.PI / 180;
  const n = Math.pow(2, zoom);
  const xtile = parseInt((lon + 180.0) / 360.0 * n);
  const ytile = parseInt(
    (1.0 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) /
      2.0 *
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
  const lon = tile.x / n * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * tile.y / n)));
  const lat = latRad / Math.PI * 180;
  return { lat, lon };
}
