import m from "mithril";
import button from "./button";
import { getMap } from "./map";
import d from "debug";
const debug = d("gc:map:location");

var marker;
var centerPosition;
var lastAccuracy;
var searching = false;

// initialized and started geo location
function init() {
  centerPosition = true;
  let map = getMap();
  map.locate({ watch: true, enableHighAccuracy: true });
  map.on("locationfound", onLocationFound);
  map.on("locationerror", onLocationError);
  map.on("zoomend", onZoom);
}

// stoped geolocation and cleanup
function close() {
  let map = getMap();
  map.stopLocate();
  map.removeLayer(marker);
  marker = undefined;
  lastAccuracy = undefined;
}

// update the marker of the local position
// first update by enable center the map to to current position
function onLocationFound(e) {
  let map = getMap();
  lastAccuracy = e.accuracy;
  if (centerPosition) {
    map.panTo(e.latlng);
    centerPosition = false;
  }
  let radius = getRadiusForLocationMarker(map);
  if (marker != undefined) {
    marker.setLatLng(e.latlng);
    marker.setRadius(radius);
  } else {
    marker = L.circleMarker(e.latlng, { radius: radius }).addTo(map);
  }
}

// calculate the radius of the location marker in relation to the zoom level
function getRadiusForLocationMarker(map) {
  if (map.getZoom() < map.getMaxZoom() - 6) {
    return 1;
  }
  let zoomThreshold = 1 / (1 + 2 * (map.getMaxZoom() - map.getZoom()));
  let radius = Math.round(lastAccuracy * zoomThreshold);
  if (radius < 1) {
    radius = 1;
  }
  return radius;
}

// show information that localisation didn't work
function onLocationError(e) {
  alert(e.message);
}

function onZoom() {
  if (marker != undefined && lastAccuracy != undefined) {
    marker.setRadius(getRadiusForLocationMarker(getMap()));
  }
}

function toggleLocation() {
  console.log("enable Location");
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
          class: "location__button--main location__button--enabled",
          id: "location_button",
          onclick: toggleLocation
        },
        [
          m(
            "i.material-icons",
            { foo: searching },
            searching ? "location_searching" : "location_disabled"
          )
        ]
      )
    ])
};

export default LocationButton;
