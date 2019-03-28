import CanvasTile from "./canvas-tile";

export default class DotCanvasTile extends CanvasTile {
  renderGeocache(gc, position) {
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
}
