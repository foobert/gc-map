let root = document.body;

const Map = {
  view: () => m("div", { id: "mapid" })
};

const Hello = {
  view: () =>
    m("main", [
      m("h1", "Test"),
      m(Map)
      //m("p", `Geocaches: ${geocaches.length} of ${totalCount}`)
      //m("ul", geocaches.map(gc => m("li", gc.parsed.name)))
    ])
};

m.mount(root, Hello);
