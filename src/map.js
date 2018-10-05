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

let map;

export function init(element) {
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

  toggleLayer("osm");
  toggleLayer("gc");
}

export function toggleLayer(name) {
  let l = layers[name];

  if (map.hasLayer(l)) {
    map.removeLayer(l);
  } else {
    map.addLayer(l);
  }
}
