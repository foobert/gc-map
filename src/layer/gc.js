import d from "debug";
const debug = d("gc:map:layer:gc");

// ugh, hack
import state, { save } from "../state";
import m from "mithril";

import { lookup } from "../tree";
import { toCoordinates, toQuadKey } from "../math";
import lookupIcon from "../icons";

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

class CanvasTile {
  constructor(layer, coord) {
    this.layer = layer;
    this.coordinates = toCoordinates(coord);
    this.coordinatesLowerRight = toCoordinates({
      x: coord.x + 1,
      y: coord.y + 1,
      z: coord.z
    });
    this.zoom = coord.z;
    this.quadKey = toQuadKey(coord.x, coord.y, coord.z).join("");
    this.size = layer.getTileSize();
    this.canvas = this.createCanvasElement();

    this.canvas.addEventListener("click", onClick.bind(this.tile));
    this.canvas.clickMap = [];
  }

  createCanvasElement() {
    const tile = L.DomUtil.create("canvas", "leaflet-tile");
    tile.width = this.size.x;
    tile.height = this.size.y;
    return tile;
  }

  getPosition(lat, lon) {
    return {
      x:
        ((lon - this.coordinates.lon) /
          Math.abs(this.coordinates.lon - this.coordinatesLowerRight.lon)) *
        this.size.x,
      y:
        ((this.coordinates.lat - lat) /
          Math.abs(this.coordinates.lat - this.coordinatesLowerRight.lat)) *
        this.size.y
    };
  }

  async render() {
    if (this.zoom < 11) {
      this.renderZoomedOut();
    } else {
      let gcs = await lookup(this.quadKey);
      this.renderGeocaches(gcs);
    }
  }

  renderZoomedOut() {
    const ctx = this.canvas.getContext("2d");
    ctx.font = "16pt Arial";
    ctx.fillStyle = "black";
    ctx.lineWidth = 1;
    ctx.fillText("zoom in :-(", this.size.x / 2, this.size.y / 2);
  }

  renderGeocaches(gcs) {
    for (const gc of gcs) {
      this.renderGeocache(gc);
    }
  }

  renderGeocache(gc) {
    if (!gc.parsed) {
      console.log(gc);
      return;
    }

    if (isFiltered(gc)) {
      return;
    }

    const position = this.getPosition(gc.parsed.lat, gc.parsed.lon);
    if (
      position.x < 0 ||
      position.x > this.size.x ||
      position.y < 0 ||
      position.y > this.size.y
    ) {
      return;
    }

    this.canvas.clickMap.push({ position, gc });

    if (this.zoom < 13) {
      this.renderDot(gc, position);
    } else {
      this.renderIcon(gc, position);
    }
  }

  renderDot(gc, position) {
    const ctx = this.canvas.getContext("2d");
    ctx.globalAlpha =
      this.zoom == 0
        ? 0.0001
        : this.zoom < 12
          ? 0.01 * ((this.zoom * this.zoom * this.zoom) / 30)
          : 1;
    ctx.beginPath();
    ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.fillStyle = this.lookupColor(gc);
    ctx.lineWidth = 0;
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  lookupColor(gc) {
    switch (gc.parsed.type) {
      case "traditional":
        return "#02874d";
      case "multi":
        return "#e98300";
      case "mystery":
        return "#0052f8";
      case "letterbox":
        return "#123a8c";
      case "earth":
        return "#205910";
      case "virtual":
      case "webcam":
        return "#009bbb";
      case "wherigo":
        return "#7196ba";
      case "cito":
        return "#029f4c";
      case "event":
        return "#90040b";
      default:
        return "#ffffff";
    }
  }

  renderIcon(gc, position) {
    const image = lookupIcon(gc);
    const center = {
      x:
        Math.max(
          image.width / 2,
          Math.min(this.size.x - image.width / 2, position.x)
        ) -
        image.width / 2,
      y:
        Math.max(
          image.height / 2,
          Math.min(this.size.y - image.height / 2, position.y)
        ) -
        image.height / 2
    };
    const ctx = this.canvas.getContext("2d");
    ctx.drawImage(image, center.x, center.y);
  }
}

const CanvasLayer = L.GridLayer.extend({
  createTile: function(coord, done) {
    const tile = new CanvasTile(this, coord);
    tile
      .render()
      .then(() => done(null, tile.canvas))
      .catch(err => done(err));
    return tile.canvas;
  }
});
function onClick(e) {
  const diff = ({ position }, e) =>
    (position.x - e.offsetX) ** 2 + (position.y - e.offsetY) ** 2;
  let sorted = this.clickMap.sort((a, b) => diff(a, e) - diff(b, e));
  if (sorted.length > 0 && diff(sorted[0], e) < 400) {
    debug("Click on geocache %o", sorted[0].gc);
    state.map.details.gc = sorted[0].gc;
    state.map.details.open = true;
  } else {
    //state.map.details.gc = null;
    state.map.details.open = false;
  }
  m.redraw();
}

function isFiltered(gc) {
  if (!state.map.filter.types[gc.parsed.type]) {
    return true;
  }
  return false;
}
