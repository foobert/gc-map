import m from "mithril";
import state from "./state";
import { upgradeElement } from "./util";

function openMapFilter(e) {
  e.preventDefault();
  state.map.filter.open = true;
}

function closeMapFilter(e) {
  e.preventDefault();
  state.map.filter.open = false;
}

function filterUser(e) {
  e.preventDefault();
  const input = e.target.querySelector("#sample1");
  const username = input.value;
  // use date for sorting later
  state.map.filter.users[username] = new Date();
  // TODO how to get the hint text back?!
  input.value = null;
}

function unfilterUser(e, name) {
  e.preventDefault();
  delete state.map.filter.users[name];
}

const Filter = {
  view: () => [
    m(MapFilterButton),
    m(
      "div.map-filter",
      {
        class: state.map.filter.open ? "map-filter--open" : "map-filter--closed"
      },
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
              Object.keys(state.map.filter.users).map(name =>
                m(FoundFilterChip, { name })
              )
            )
          ])
        ])
      ]
    )
  ]
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

const MapFilterButton = {
  view: () =>
    m(
      "button.map-filter-button.type-filter.mdl-button.mdl-js-button.mdl-button--fab.mdl-js-ripple-effect.mdl-button--mini-fab.mdl-button--colored",
      {
        onclick: openMapFilter
      },
      [m("i.material-icons", "search")]
    ),
  oncreate: upgradeElement
};

export default Filter;
