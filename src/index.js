import m from "mithril";
import { init, toggleLayer } from "./map";
import { getInflightRequests } from "./tree";

let root = document.body;

const Map2 = {
  view: () => [
    m(".sidebar", [
      m("ul.mdl-list", [
        m("li.mdl-list__item", [
          m(
            "label.mdl-switch.mdl-js-switch.mdl-js-ripple-effect",
            { for: "switch-1" },
            [
              m("input#switch-1.mdl-switch__input", {
                type: "checkbox",
                checked: true
              }),
              m("span.mdl-switch__label", {}, "Debug Layer")
            ]
          )
        ]),
        m("li.mdl-list__item", [
          m(
            "label.mdl-switch.mdl-js-switch.mdl-js-ripple-effect",
            { for: "switch-2" },
            [
              m("input#switch-2.mdl-switch__input", {
                type: "checkbox",
                checked: true
              }),
              m("span.mdl-switch__label", {}, "Age Layer")
            ]
          )
        ])
      ])
    ]),
    m("#map")
  ]
};

const Map = {
  view: () => m("#map")
};

const ProgressBar = {
  view: () =>
    m(
      ".map-requests.mdl-progress.mdl-js-progress.mdl-progress__indeterminate",
      getInflightRequests() === 0 ? { style: "display:none" } : {}
    )
};

const Drawer = {
  view: () =>
    m(".mdl-layout__drawer", [
      m("span.mdl-layout-title", "Title"),
      m("nav.mdl-navigation", [
        m("a.mdl-navigation__link", "foo"),
        m("a.mdl-navigation__link", "bar")
      ])
    ])
};

const Header = {
  view: () =>
    m("header.mdl-layout__header", [
      m(".mdl-layout__header-row", [
        m("span.mdl-layout-title", "GC Map"),
        m(".mdl-layout-spacer"),
        m("nav.mdl-navigation", [
          m("a.mdl-navigation__link", "foo"),
          m("a.mdl-navigation__link", "bar")
        ])
      ])
    ])
};

const Content = {
  view: () => m("main.mdl-layout__content", [m(Map), m(ProgressBar)])
};

const Layout = {
  view: () => m(".mdl-layout.mdl-js-layout", [m(Header), m(Drawer), m(Content)])
};

const Root = {
  view: () => m("#root", [m(Layout)])
};

m.mount(root, Root);

// FIXME probably shouldn't do this to mithril
const mapElement = document.getElementById("map");
init(mapElement);
