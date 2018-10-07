import m from "mithril";
import state, { save } from "../state";

function filterUser(e) {
  e.preventDefault();
  const input = e.target.querySelector("#sample1");
  const username = input.value;
  // use date for sorting later
  state.map.filter.users[username] = new Date();
  // TODO how to get the hint text back?!
  //input.value = null;
  document.querySelector("form").reset();
  save();
}

function unfilterUser(e, name) {
  e.preventDefault();
  delete state.map.filter.users[name];
  save();
}

const Filter = {
  view: () => [
    m("h1.sidebar__title", "Filter"),
    m("div", [
      m("form", { action: "#", onsubmit: filterUser }, [
        m("h2.sidebar__subtitle", "Hide found geocaches"),
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
};

const FoundFilterChip = {
  view: vnode =>
    m("span.sidebar-username.mdl-chip.mdl-chip--contact.mdl-chip--deletable", [
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
    ])
};

export default Filter;
