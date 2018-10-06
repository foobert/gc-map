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
