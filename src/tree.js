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
    console.log("HIT " + quadkey);
    let tmp = node.data.slice();
    tmp.cache = "hit";
    return tmp;
  } else {
    console.log("MISS " + quadkey);
    const data = await fetch(quadkey);
    insert(quadkey, data);
    let tmp = data.slice();
    tmp.cache = "miss";
    return tmp;
    //return data;
  }
}

function walk(quadkey) {
  let currentNode = root;
  for (const k of quadkey) {
    if (!currentNode[k]) {
      return null;
    }
    currentNode = currentNode[k];
  }
  return currentNode;
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
    .then(function(response) {
      let data = response.data.geocaches.nodes;
      return data;
    });
}

function insert(quadkey, data) {
  let currentNode = root;
  let path = "";
  for (const k of quadkey) {
    path += k;
    if (!currentNode[k]) {
      currentNode[k] = { data: [], parent: currentNode, key: path };
    }
    currentNode = currentNode[k];
  }
  currentNode.data = currentNode.data.concat(data);
  currentNode.loaded = true;

  propagateDown(currentNode, quadkey);
  propagateUp(currentNode);
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
      //console.log("propagate down from " + node.key + " to " + node[i].key);
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
    //console.log("propagate up from " + node.key + " to " + parent.key);
    propagateUp(parent);
  }
}

function zoom(quadkey) {
  return quadkey.length;
}

function split(quadkey, data) {
  let nextZoom = zoom(quadkey) + 1;
  let buckets = [[], [], [], []];
  const n = Math.pow(2, nextZoom);
  const mask = 1;

  for (let d of data) {
    let digit = 0;
    const { parsed: { lat, lon } } = d;
    const latRad = lat * Math.PI / 180;
    const tileX = parseInt((lon + 180) / 360 * n);
    const tileY = parseInt(
      (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n
    );
    if ((tileX & mask) !== 0) digit += 1;
    if ((tileY & mask) !== 0) digit += 2;
    //const t = toTile(lat, lon, nextZoom);
    //console.log(digit, toQuadKey(t.x, t.y, nextZoom).join(""));
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
