import m from "mithril";
import button from "./button";
import { getMap } from "./map";
import d from "debug";
const debug = d("gc:map:location");

var marker = null;
var centerPosition;
var lastAccuracy = null;
var searching = false;

// initialized and started geo location
function init() {
  debug("init");
  centerPosition = true;
  let map = getMap();
  map.locate({ watch: true, enableHighAccuracy: true });
  map.on("locationfound", onLocationFound);
  map.on("locationerror", onLocationError);
  map.on("zoomend", onZoom);
}

// stoped geolocation and cleanup
function close() {
  debug("close");
  let map = getMap();
  map.off("locationfound", onLocationFound);
  map.off("locationerror", onLocationError);
  map.off("zoomend", onZoom);
  let map = getMap();
  map.stopLocate();
  if (marker != null) {
    map.removeLayer(marker);
    marker = null;
  }
  lastAccuracy = null;
}

// update the marker of the local position
// first update by enable center the map to to current position
function onLocationFound(e) {
  debug("update location %o, %d", e.latlng, e.accuracy);
  let map = getMap();
  lastAccuracy = e.accuracy;
  if (centerPosition) {
    map.panTo(e.latlng);
    centerPosition = false;
  }
  let radius = getRadiusForLocationMarker(map);
  if (marker != null) {
    marker.setLatLng(e.latlng);
    marker.setRadius(radius);
  } else {
    marker = L.circleMarker(e.latlng, { radius: radius }).addTo(map);
  }
}

// calculate the radius of the location marker in relation to the zoom level
function getRadiusForLocationMarker(map) {
  // see https://wiki.openstreetmap.org/wiki/Zoom_levels
  const c = 40075016.686;
  const meterPerPixel =
    (c * Math.abs(Math.cos((map.getCenter().lat * Math.PI) / 180))) /
    Math.pow(2, map.getZoom() + 8);

  debug(
    "radius: accuracy: %d, zoom: %d, m per px: %f",
    lastAccuracy,
    map.getZoom(),
    meterPerPixel
  );

  return Math.max(1, lastAccuracy / meterPerPixel);
}

// show information that localisation didn't work
function onLocationError(e) {
  debug("location error %o", e);
  alert(e.message);
}

function onZoom() {
  if (marker != null && lastAccuracy != null) {
    marker.setRadius(getRadiusForLocationMarker(getMap()));
  }
}

function toggleLocation() {
  searching = !searching;
  if (searching) {
    init();
  } else {
    close();
  }
}

const LocationButton = {
  view: () =>
    m(".location", [
      m(
        button,
        {
          class: "location__button",
          onclick: toggleLocation
        },
        [
          m(
            "i.material-icons",
            searching ? "location_searching" : "location_disabled"
          )
        ]
      )
    ])
};

export default LocationButton;
