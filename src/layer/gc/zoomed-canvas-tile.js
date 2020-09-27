import CanvasTile from "./canvas-tile";
import { fetchCountRequest } from "../../tree";

export default class ZoomedCanvasTile extends CanvasTile {
  async loadGeocaches() {
    return [];
  }

  async render() {
    const ctx = this.canvas.getContext("2d");
    ctx.font = "16pt Arial";
    ctx.fillStyle = "black";
    ctx.lineWidth = 1;
    // show number of geocaches in this tile
    ctx.fillText(
      await fetchCountRequest(this.quadKey),
      this.size.x / 2,
      this.size.y / 2
    );
  }
}
