import CanvasTile from "./canvas-tile";

export default class ZoomedCanvasTile extends CanvasTile {
  async loadGeocaches() {
    return [];
  }

  async render() {
    const ctx = this.canvas.getContext("2d");
    ctx.font = "16pt Arial";
    ctx.fillStyle = "black";
    ctx.lineWidth = 1;
    ctx.fillText("zoom in :-(", this.size.x / 2, this.size.y / 2);
  }
}
