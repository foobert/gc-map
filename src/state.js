import d from "debug";
const debug = d("gc:map:state");

let state = {
  map: {
    filter: {
      open: false,
      users: {}
    },
    types: {
      open: false
    },
    details: {
      open: false,
      gc: null
    },
    center: [51.3, 12.3],
    zoom: 13
  }
};

load();

export default state;

export function save() {
  localStorage.setItem("state", JSON.stringify(state));
  debug("Saved state");
}

export function load() {
  const json = localStorage.getItem("state");
  if (json) {
    Object.assign(state, JSON.parse(localStorage.state));
  } else {
    Object.assign(state, {
      map: {
        filter: {
          open: false,
          users: {}
        },
        types: {
          open: false
        },
        details: {
          open: false,
          gc: null
        }
      }
    });
  }
}
