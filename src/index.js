import d from "debug";
const debug = d("gc:map");
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
  view: () => [m("#map"), m(MapFilter), m(FloatTypeFilter)]
};

const ProgressBar = {
  view: () =>
    m(
      ".map-requests.mdl-progress.mdl-js-progress.mdl-progress__indeterminate",
      getInflightRequests() === 0 ? { style: "display:none" } : {}
    )
};

const FoundFilterChip = {
  view: vnode =>
    m(
      "span.map-filter-user__chip.mdl-chip.mdl-chip--contact.mdl-chip--deletable",
      [
        m("i.material-icons.mdl-chip__contact", "sentiment_very_satisfied"),
        m("span.mdl-chip__text", vnode.attrs.name),
        m(
          "a.mdl-chip__action",
          {
            onclick: e => {
              unfilterUser(e, vnode.attrs.name);
            }
          },
          [m("i.material-icons", "cancel")]
        )
      ]
    )
};

const Drawer = {
  view: () =>
    m(".mdl-layout__drawer", [
      m("span.mdl-layout-title", "Title"),
      m("nav.mdl-navigation", [
        m("a.mdl-navigation__link", "foo"),
        m("a.mdl-navigation__link", "bar"),
        m("div", [
          m(
            "button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect",
            "Button"
          ),
          m("form", { action: "#" }, [
            m("input.mdl-slider.mdl-js-slider[type=range]", {
              min: 0,
              max: 100,
              value: 0
            }),
            m(".mdl-textfield.mdl-js-textfield", [
              m("input.mdl-textfield__input", { type: "text", id: "sample1" }),
              m("label.mdl-textfield__label", { for: "sample1" }, "Text...")
            ]),
            m(
              "ul.mdl-list",
              ["foobert", "signux"].map(name =>
                m("li.mdl-list__item", m(FoundFilterChip, { name }))
              )
            )
          ])
        ])
      ])
    ])
};

let mapFilterIsOpen = false;

function closeMapFilter(e) {
  e.preventDefault();
  mapFilterIsOpen = false;
}

function openMapFilter(e) {
  e.preventDefault();
  mapFilterIsOpen = true;
}

let filteredUsers = {};

function filterUser(e) {
  e.preventDefault();
  const input = e.target.querySelector("#sample1");
  const username = input.value;
  // use date for sorting later
  filteredUsers[username] = new Date();
  // TODO how to get the hint text back?!
  input.value = null;
}

function unfilterUser(e, name) {
  e.preventDefault();
  delete filteredUsers[name];
}

const MapFilter = {
  view: () => [
    m(MapFilterButton),
    m(
      "div.map-filter",
      { class: mapFilterIsOpen ? "map-filter--open" : "map-filter--closed" },
      [
        m("h1", "Filter"),
        m(
          "a.map-filter-close",
          { onclick: closeMapFilter },
          m("i.material-icons", "close")
        ),
        m("div", [
          m("form", { action: "#", onsubmit: filterUser }, [
            m("h2", "Exclude found GCs"),
            m(".mdl-textfield.mdl-js-textfield", [
              m("input.mdl-textfield__input", {
                type: "text",
                id: "sample1"
              }),
              m("label.mdl-textfield__label", { for: "sample1" }, "Username...")
            ]),
            m(
              "div",
              Object.keys(filteredUsers).map(name =>
                m(FoundFilterChip, { name })
              )
            )
          ])
        ])
      ]
    )
  ]
};

const Header = {
  view: () =>
    m("header.mdl-layout__header", [
      m(".mdl-layout__header-row", [
        m("span.mdl-layout-title", "GC Map"),
        m(".mdl-layout-spacer"),
        m("nav.mdl-navigation", [
          m("a.mdl-navigation__link", "foo"),
          m("a.mdl-navigation__link", "bar"),
          m(
            "a.mdl-navigation__link",
            {
              href: "",
              onclick: e => {
                e.preventDefault();
                console.log("foo");
              }
            },
            "Jump to current Position"
          )
        ])
      ])
    ])
};

let showTypeFilters = false;

function upgradeElement(vnode) {
  if (typeof componentHandler === "undefined") {
    return;
  }
  componentHandler.upgradeElement(vnode.dom);
}

const LocateMeButton = {
  view: () =>
    m(
      "button.locate-me.mdl-button.mdl-js-button.mdl-button--primary",
      {
        onclick: () => {}
      },
      [m("i.material-icons", "my_location")]
    ),
  oncreate: upgradeElement
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

const MapFilterButton = {
  view: vnode =>
    m(
      "button.map-filter-button.type-filter.mdl-button.mdl-js-button.mdl-button--fab.mdl-js-ripple-effect.mdl-button--mini-fab.mdl-button--colored",
      {
        onclick: openMapFilter
      },
      [m("i.material-icons", "search")]
    ),
  oncreate: upgradeElement
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
  view: () =>
    m(".mdl-layout.mdl-js-layout", [m(Header), /*m(Drawer),*/ m(Content)])
};

const Root = {
  view: () => m("#root", [m(Layout)])
};

m.mount(root, Root);

// FIXME probably shouldn't do this to mithril
const mapElement = document.getElementById("map");
init(mapElement);
