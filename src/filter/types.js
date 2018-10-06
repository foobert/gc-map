import m from "mithril";
import state, { save } from "../state";
import icons from "../icons";
import button from "../button";

// TODO move to state?
import { toggleTypeFilter, getTypeFilter } from "../layer/gc";

function toggleVisibility() {
  state.map.types.open ^= true;
  save();
}

const FloatingContainer = {
  view: () =>
    m(
      ".filter-types",
      { class: state.map.types.open ? "" : "filter-types--closed" },
      [
        m(TypeButton, { type: "mystery" }),
        m(TypeButton, { type: "webcam" }),
        m(TypeButton, { type: "virtual" }),
        m(TypeButton, { type: "cito" }),
        m(TypeButton, { type: "event" }),
        m(TypeButton, { type: "letterbox" }),
        m(TypeButton, { type: "earth" }),
        m(TypeButton, { type: "wherigo" }),
        m(TypeButton, { type: "multi" }),
        m(TypeButton, { type: "traditional" }),
        m(
          button,
          {
            class:
              "filter-types__button mdl-button--colored mdl-js-ripple-effect",
            onclick: toggleVisibility
          },
          [m("i.material-icons", "add")]
        )
      ]
    )
};

const TypeButton = {
  view: vnode =>
    m(
      button,
      {
        class: "filter-types__button",
        onclick: () => toggleTypeFilter(vnode.attrs.type)
      },
      [
        m("img", {
          src: icons(vnode.attrs.type).src,
          class: getTypeFilter(vnode.attrs.type)
            ? ""
            : "filter-types__button--disabled"
        })
      ]
    )
};

export default FloatingContainer;
