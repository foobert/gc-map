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
        class: state.map.details.open
          ? "map-controls--open"
          : "map-controls--closed"
      },
      [m(FloatTypeFilter), m(".map-control-detail", "foo")]
    )
};

const FloatTypeFilter = {
  view: () => [
    m(
      "button.map-typeFilter.mdl-button.mdl-js-button.mdl-button--fab.mdl-button--colored.mdl-button--mini-fab",
      {
        onclick: () => {
          state.map.types.open ^= true;
        }
      },
      [m("i.material-icons", "add")]
    ),
    state.map.types.open
      ? [
          m(TypeFilterButton, { type: "traditional" }),
          m(TypeFilterButton, { type: "multi" }),
          m(TypeFilterButton, { type: "wherigo" }),
          m(TypeFilterButton, { type: "event" }),
          m(TypeFilterButton, { type: "earth" }),
          m(TypeFilterButton, { type: "virtual" }),
          m(TypeFilterButton, { type: "letterbox" }),
          m(TypeFilterButton, { type: "cito" }),
          m(TypeFilterButton, { type: "webcam" }),
          m(TypeFilterButton, { type: "mystery" })
        ]
      : []
  ]
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
