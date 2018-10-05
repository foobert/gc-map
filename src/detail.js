import d from "debug";
const debug = d("gc:map:detail");
import m from "mithril";
import state from "./state";
import icons from "./icons";
import { upgradeElement } from "./util";

// TODO move to state?
import { toggleTypeFilter, getTypeFilter } from "./layer/gc";

const Detail = {
  view: () =>
    m(
      ".map-controls",
      {
        class: state.map.details.open ? "" : "map-controls--closed"
      },
      [
        m(".anchor", [m(FloatTypeFilter)]),
        m(".map-control-detail", m(Geocache, { gc: state.map.details.gc }))
      ]
    )
};

const DetailValue = {
  view: vnode =>
    m(".map-control-detail-stats-wrapper", [
      m(
        "span.map-control-detail-stats-wrapper--key.mdl-color-text--grey-600",
        vnode.attrs.label
      ),
      m("span.map-control-detail-stats-wrapper--value", ...vnode.children)
    ])
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

const Geocache = {
  view: vnode => {
    const gc = vnode.attrs.gc;
    if (!gc) return;
    return [
      m(
        "h1.map-control-detail--title",
        {
          class: gc.parsed.disabled ? "map-control-detail--title__disabled" : ""
        },
        gc.parsed.name
      ),
      m(".map-control-detail-stats", [
        m(
          DetailValue,
          { label: "Code" },
          m("a", { href: "https://coord.info/" + gc.id }, gc.id)
        ),
        m(DetailValue, { label: "Coordinates" }, formatCoordinates(gc.parsed)),
        m(
          DetailValue,
          { label: "Kind" },
          `${gc.parsed.size} ${gc.parsed.type}`
        ),
        m(DetailValue, { label: "Difficulty" }, gc.parsed.difficulty),
        m(DetailValue, { label: "Terrain" }, gc.parsed.terrain),
        m(DetailValue, { label: "Favorites" }, gc.parsed.favpoints),
        m(DetailValue, { label: "Fetched" }, daysAgo(gc.api_date))
      ])
    ];
  }
};

const FloatTypeFilter = {
  view: () =>
    m(
      ".buttons",
      { class: state.map.types.open ? "buttons-open" : "buttons-closed" },
      [
        m(TypeFilterButton, { type: "mystery" }),
        m(TypeFilterButton, { type: "webcam" }),
        m(TypeFilterButton, { type: "virtual" }),
        m(TypeFilterButton, { type: "cito" }),
        m(TypeFilterButton, { type: "event" }),
        m(TypeFilterButton, { type: "letterbox" }),
        m(TypeFilterButton, { type: "earth" }),
        m(TypeFilterButton, { type: "wherigo" }),
        m(TypeFilterButton, { type: "multi" }),
        m(TypeFilterButton, { type: "traditional" }),
        m(
          "button.map-typeFilter.mdl-button.mdl-js-button.mdl-button--fab.mdl-button--colored.mdl-button--mini-fab",
          {
            onclick: () => {
              state.map.types.open ^= true;
            }
          },
          [m("i.material-icons", "add")]
        )
      ]
    )
};

const TypeFilterButton = {
  view: vnode =>
    m(
      "button.type-filter.mdl-button.mdl-js-button.mdl-button--fab.mdl-button--mini-fab",
      {
        class: `type-filter--${vnode.attrs.type}`,
        onclick: () => toggleTypeFilter(vnode.attrs.type)
      },
      [
        m("img", {
          src: icons(vnode.attrs.type).src,
          class: getTypeFilter(vnode.attrs.type) ? "" : "type-filter--disabled"
        })
      ]
    ),
  oncreate: upgradeElement
};

export default Detail;
