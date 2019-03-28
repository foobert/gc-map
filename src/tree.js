import m from "mithril";
import PQueue from "p-queue";
import debugSetup from "debug";
import state from "./state";
import { lookup as cacheLookup } from "./cache";

const debug = debugSetup("gc:map:tree");
const maxZoom = 11;
const backendUrl = getBackendUrl();
const queue = new PQueue({ concurrency: 10 });
let inflightRequests = 0;

export function reset() {
  // obsolete?
}

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
  return queue.add(() => fetchRequest(quadkey));
}

function getBackendUrl() {
  const defaultUrl = "https://gc.funkenburg.net/api/graphql";
  const override = localStorage.getItem("backend");
  const backendUrl = override || defaultUrl;
  debug("Using backend %s", backendUrl);
  return backendUrl;
}

async function fetchRequest(quadkey) {
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
