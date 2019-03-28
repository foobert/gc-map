import DotCanvasTile from "./dot-canvas-tile";
import IconCanvasTile from "./icon-canvas-tile";
import ZoomedCanvasTile from "./zoomed-canvas-tile";

// ugh, hack
import state, { save } from "../../state";

let hack;
export default function create() {
  hack = new CanvasLayer();
  return hack;
}

export function toggleTypeFilter(type) {
  if (state.map.filter.types[type]) {
    state.map.filter.types[type] = false;
  } else {
    state.map.filter.types[type] = true;
  }
  save();
  if (hack) {
    hack.redraw();
  }
}

export function getTypeFilter(type) {
  return state.map.filter.types[type];
}

const CanvasLayer = L.GridLayer.extend({
  createTile: function(coord, done) {
    let tile;
    if (coord.z < 11) {
      tile = new ZoomedCanvasTile(this, coord);
    } else if (coord.z < 13) {
      tile = new DotCanvasTile(this, coord);
    } else {
      tile = new IconCanvasTile(this, coord);
    }
    tile
      .render()
      .then(() => done(null, tile.canvas))
      .catch(err => done(err));
    return tile.canvas;
  }
});
