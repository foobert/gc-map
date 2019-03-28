import CanvasTile from "./canvas-tile";
import lookupIcon from "../../icons";

export default class IconCanvasTile extends CanvasTile {
  renderGeocache(gc, position) {
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
