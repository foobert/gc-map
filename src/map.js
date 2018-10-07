import m from "mithril";
import d from "debug";
const debug = d("gc:map:map");

import state, { save } from "./state";

import osmLayer from "./layer/osm";
import debugLayer from "./layer/debug";
import ageLayer from "./layer/age";
import gcLayer from "./layer/gc";

const layers = {
  osm: osmLayer(),
  debug: debugLayer(),
  age: ageLayer(),
  gc: gcLayer()
};

// leaflet will manage this object
let map;

const Map = {
  view: vnode => [m("#map"), vnode.children],
  oncreate: vnode => init(vnode.dom)
};

function init(element) {
  debug("Initializing map on %o", element);
  map = L.map(element, { attributionControl: false, zoomControl: false });

  map.on("moveend", () => {
    state.map.center = map.getCenter();
    state.map.zoom = map.getZoom();
    save();
  });

  if (state.map.center && state.map.zoom) {
    map.setView(state.map.center, state.map.zoom);
  } else {
    map.setView([51.3, 12.3], 13);
  }

  for (var layer of state.map.layers) {
    enableLayer(layer);
  }
}

export function enableLayer(name) {
  let l = layers[name];
  if (!map.hasLayer(l)) {
    map.addLayer(l);
  }
  if (state.map.layers.findIndex(x => x === name) === -1) {
    state.map.layers.push(name);
    save();
  }
}

export function disableLayer(name) {
  let l = layers[name];
  if (map.hasLayer(l)) {
    map.removeLayer(l);
  }
  const idx = state.map.layers.findIndex(x => x === name);
  if (idx >= 0) {
    state.map.layers.splice(idx, 1);
    save();
  }
}

export default Map;
