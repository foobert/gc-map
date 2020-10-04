import m from "mithril";
import { getMap } from "../map";
import state from "../state";

// highlighted circle for selected Geocache
var selectedCircle = null;

// waypoint markers
var waypointMarkers = [];

const Geocache = {
  view: vnode => {
    const gc = vnode.attrs.gc;
    if (!gc) return;

    selectGeocache(gc);

    return [
      m(
        "h1.geocache__title",
        {
          class: gc.parsed.disabled ? "geocache__title--disabled" : ""
        },
        gc.parsed.name
      ),
      m(".geocache-stats", [
        m(
          GeocacheItem,
          { label: "Code" },
          m(
            "a",
            { href: "https://coord.info/" + gc.id, target: "_blank" },
            gc.id
          )
        ),
        m(GeocacheItem, { label: "Coordinates" }, formatCoordinates(gc.parsed)),
        m(
          GeocacheItem,
          { label: "Kind" },
          `${gc.parsed.size} ${gc.parsed.type}`
        ),
        m(GeocacheItem, { label: "Difficulty" }, gc.parsed.difficulty),
        m(GeocacheItem, { label: "Terrain" }, gc.parsed.terrain),
        m(GeocacheItem, { label: "Favorites" }, gc.parsed.favpoints),
        m(GeocacheItem, { label: "Fetched" }, daysAgo(gc.api_date)),
        m(
          GeocacheItem,
          { label: "Hint" },
          gc.parsed.hint ? gc.parsed.hint : "n/a"
        )
      ])
    ];
  }
};

const GeocacheItem = {
  view: vnode =>
    m(".map-control-detail-stats-wrapper", [
      m(
        "span.map-control-detail-stats-wrapper--key.mdl-color-text--grey-600",
        vnode.attrs.label
      ),
      m("span.map-control-detail-stats-wrapper--value", ...vnode.children)
    ])
};

const Attribute = {
  view: vnode =>
    m(
      "svg.geocache__attribute[xmlns='http://www.w3.org/2000/svg'][xmlns:xlink='http://www.w3.org/1999/xlink'][viewBox='0 0 40 40']",
      { height: 30, width: 30 },
      [
        m("use", {
          "xlink:href": "icons/attributes.svg#" + vnode.attrs.id
        }),
        vnode.attrs.active
          ? null
          : [
              m("rect", {
                x: 1,
                y: 1,
                rx: 5,
                ry: 5,
                width: 38,
                height: 38,
                stroke: "red",
                fill: "transparent",
                "stroke-width": 2
              }),
              m("line", {
                x1: 2,
                y1: 38,
                x2: 38,
                y2: 2,
                stroke: "red",
                "stroke-width": 2
              })
            ]
      ]
    )
};

function formatCoordinates({ lat, lon }) {
  const f = (coord, pos, neg) => {
    const deg = Math.floor(coord);
    const min = (coord - deg) * 60;
    const prefix = coord < 0 ? neg : pos;
    return `${prefix} ${deg}\u00b0 ${min.toFixed(3)}`;
  };
  return `${f(lat, "N", "S")} ${f(lon, "E", "W")}`;
}

function daysAgo(date) {
  const delta = new Date() - Date.parse(date);
  const days = Math.floor(delta / 1000 / 60 / 60 / 24);
  switch (days) {
    case 0:
      return "less than 24 hrs ago";
    case 1:
      return "a day ago";
    default:
      return days + " days ago";
  }
}

// Select Geocache on map
function selectGeocache(gc) {
  let map = getMap();
  if (!map) {
    return;
  }

  // remove circle from old selected Geocache
  if (selectedCircle != null) {
    map.removeLayer(selectedCircle);
  }

  // remove all waypoint markers
  waypointMarkers.forEach(waypointMarker => map.removeLayer(waypointMarker));
  waypointMarkers = [];

  // check if Geocache is selected
  if (state.map.details.open) {
    // draw circle on selected Geocache
    selectedCircle = L.circle([gc.parsed.lat, gc.parsed.lon], {
      color: "red",
      fillColor: "#f03",
      fillOpacity: 0.5,
      radius: 200
    }).addTo(map);

    let lats = [gc.parsed.lat];
    let lons = [gc.parsed.lon];

    // create marker for waypoints
    if (gc.parsed.waypoints) {
      gc.parsed.waypoints.forEach(waypoint => {
        if (waypoint.lat != null && waypoint.lon != null) {
          lats.push(waypoint.lat);
          lons.push(waypoint.lon);
          let waypointMarker = L.marker([waypoint.lat, waypoint.lon], {
            keyboard: false,
            clickable: false,
            dragable: false,
            title: waypoint.name
          }).addTo(map);
          waypointMarker.bindPopup(waypoint.name + "</br>" + waypoint.comment);
          waypointMarkers.push(waypointMarker);
        }
      });
    }

    // center Geocache
    map.panTo(calculateCenter(lats, lons));
  }
}

function calculateCenter(lats, lons) {
  // Todo: muss auch für negative werte funktionieren!
  let centerLat = 0;
  let centerLon = 0;
  lats.forEach(lat => (centerLat += lat));
  lons.forEach(lon => (centerLon += lon));
  centerLat = centerLat / lats.length;
  centerLon = centerLon / lons.length;
  return [centerLat, centerLon];
}

export default Geocache;
