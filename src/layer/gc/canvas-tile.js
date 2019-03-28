import d from "debug";
import m from "mithril";
import { toCoordinates, toQuadKey } from "../../math";
import { lookup } from "../../tree";
import state from "../../state";

const debug = d("gc:map:layer:gc:canvas-tile");

export default class CanvasTile {
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
    this.canvas.addEventListener("click", this.onClick.bind(this));
    this.clickMap = [];
    this.gcs = this.loadGeocaches();
  }

  async loadGeocaches() {
    return lookup(this.quadKey);
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
    this.renderGeocaches(await this.gcs);
  }

  renderGeocaches(gcs) {
    for (const gc of gcs) {
      if (this.shouldRender(gc)) {
        this.pushClickMap(gc);
        const position = this.getPosition(gc.parsed.lat, gc.parsed.lon);
        this.renderGeocache(gc, position);
      }
    }
  }

  shouldRender(gc) {
    if (!gc.parsed) {
      console.log(gc);
      return false;
    }

    if (this.isFiltered(gc)) {
      return false;
    }

    const position = this.getPosition(gc.parsed.lat, gc.parsed.lon);
    if (
      position.x < 0 ||
      position.x > this.size.x ||
      position.y < 0 ||
      position.y > this.size.y
    ) {
      return false;
    }
    return true;
  }

  pushClickMap(gc) {
    const position = this.getPosition(gc.parsed.lat, gc.parsed.lon);
    this.clickMap.push({ position, gc });
  }

  isFiltered(gc) {
    return !state.map.filter.types[gc.parsed.type];
  }

  onClick(e) {
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
}
