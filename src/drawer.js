import m from "mithril";
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
