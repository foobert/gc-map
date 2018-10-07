import m from "mithril";
import { j, upgradeElement } from "./util";

export default {
  view: vnode =>
    m(
      j(
        "button",
        "mdl-button",
        "mdl-js-button",
        "mdl-button--fab",
        "mdl-button--mini-fab"
      ),
      vnode.attrs,
      vnode.children
    ),
  oncreate: upgradeElement
};

export const PlainButton = {
  view: vnode =>
    m(j("button", "mdl-button", "mdl-js-button"), vnode.attrs, vnode.children),
  oncreate: upgradeElement
};

export const CloseButton = {
  view: vnode =>
    m(
      "button.mdl-button.mdl-js-button.mdl-button--icon[style=float:right]",
      vnode.attrs,
      m("i.material-icons", "close")
    ),
  oncreate: upgradeElement
};
