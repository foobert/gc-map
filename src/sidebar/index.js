import m from "mithril";
import state, { save } from "../state";
import Button, { CloseButton } from "../button";
import Filter from "./filter";
import Layers from "./layer";

function openMapFilter(e) {
  e.preventDefault();
  state.map.filter.open = true;
  save();
}

function closeMapFilter(e) {
  e.preventDefault();
  state.map.filter.open = false;
  save();
}

const Sidebar = {
  view: vnode => [
    state.map.filter.open ? m(".sidebar__shader") : [],
    m(
      Button,
      {
        class: [
          "sidebar__button",
          "mdl-js-ripple-effect",
          "mdl-button--colored"
        ].join(" "),
        onclick: openMapFilter
      },
      [m("i.material-icons", "settings")]
    ),
    m(
      ".sidebar",
      {
        class: state.map.filter.open ? "" : "sidebar--closed"
      },
      [
        m(CloseButton, {
          onclick: closeMapFilter
        }),
        m(Filter),
        m(Layers)
      ]
    )
  ]
};

export default Sidebar;
