import m from "mithril";
import { init, toggleLayer } from "./map";
import { toggleTypeFilter, getTypeFilter } from "./layer/gc";
import { getInflightRequests } from "./tree";
import icons from "./icons";

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
  view: () => [m("#map"), m(FloatTypeFilter)]
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

let showTypeFilters = false;

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
  oncreate: vnode => componentHandler.upgradeElement(vnode.dom)
};

const FloatTypeFilter = {
  view: () => [
    m(
      "button.map-typeFilter.mdl-button.mdl-js-button.mdl-button--fab.mdl-button--colored.mdl-button--mini-fab",
      {
        onclick: () => {
          showTypeFilters ^= true;
        }
      },
      [m("i.material-icons", "add")]
    ),
    showTypeFilters
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
