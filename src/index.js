import m from "mithril";
import { init } from "./map";

let root = document.body;

const Map = {
  view: () => m("div", { id: "mapid" })
};

const Hello = {
  view: () => m("main", [m("h1", "Test"), m(Map)])
};

m.mount(root, Hello);

// FIXME probably shouldn't do this to mithril
const mapElement = document.getElementById("mapid");
init(mapElement);
