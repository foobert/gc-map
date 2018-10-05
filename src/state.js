import d from "debug";
const debug = d("gc:map:state");

let state = {
  map: {
    filter: {
      open: false,
      users: {},
      types: {
        traditional: true,
        multi: true
      },
      favpoints: null
    },
    types: {
      open: false
    },
    details: {
      open: false,
      gc: null
    },
    center: [51.340081, 12.375837],
    zoom: 13
  }
};

load();

export default state;

export function save() {
  localStorage.setItem("state", JSON.stringify(state));
  debug("Saved state %O", state);
}

export function load() {
  const json = localStorage.getItem("state");
  if (json) {
    Object.assign(state, JSON.parse(localStorage.state));
  }
  if (!state.map.filter.types) {
    state.map.filter.types = {};
  }
}
