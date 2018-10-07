import m from "mithril";

import Map from "./map";
import ProgressBar from "./progress";
import Sidebar from "./sidebar";
import Detail from "./detail";
import TypeFilter from "./filter/types";
import { load } from "./state";

const Root = {
  view: () => m("#root", [m(Layout)])
};

const Layout = {
  view: () =>
    m(".mdl-layout.mdl-js-layout", [
      // m(Header),
      m(Content)
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

const Content = {
  view: () =>
    m("main.mdl-layout__content", [
      m(Map),
      m(Detail, [m(TypeFilter)]),
      m(Sidebar),
      m(ProgressBar)
    ])
};

load();
m.mount(document.body, Root);
