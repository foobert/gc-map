import d from "debug";
const debug = d("gc:map:filter");
import m from "mithril";
import { upgradeElement } from "../util";
import state, { save } from "../state";
import { enableLayer, disableLayer } from "../map";

const Layers = {
  view: () => [
    m("h1.sidebar__title", "Layers"),
    m("div", [
      m(Checkbox, { layer: "gc" }, "Geocaches"),
      m(Checkbox, { layer: "age" }, "Fetch age"),
      m(Checkbox, { layer: "debug" }, "Debug")
    ])
  ]
};

const Checkbox = {
  view: vnode =>
    m(
      "label.mdl-checkbox.mdl-js-checkbox.mdl-js-ripple-effect",
      {
        for: `toggle-layer-${vnode.attrs.layer}`
      },
      [
        m("input.mdl-checkbox__input[type=checkbox]", {
          id: `toggle-layer-${vnode.attrs.layer}`,
          checked: state.map.layers.includes(vnode.attrs.layer) ? "yes" : "",
          oninput: e => {
            e.preventDefault();
            debug(e);
            if (e.target.checked) {
              enableLayer(vnode.attrs.layer);
            } else {
              disableLayer(vnode.attrs.layer);
            }
          }
        }),
        m("span.mdl-checkbox__label", vnode.children)
      ]
    ),
  oncreate: upgradeElement
};

export default Layers;
