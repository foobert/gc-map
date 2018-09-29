import { lookup, toQuadKey, toCoordinates } from "../tree";

const CanvasLayer = L.GridLayer.extend({
  createTile: function(coord) {
    const size = this.getTileSize();

    const tile = L.DomUtil.create("canvas", "leaflet-tile");
    tile.width = size.x;
    tile.height = size.y;

    const coordinates = toCoordinates(coord);
    const quadKey = toQuadKey(coord.x, coord.y, coord.z).join("");
    const lat = coordinates.lat.toPrecision(6);
    const lon = coordinates.lon.toPrecision(6);
    const gcsPromise = lookup(quadKey);

    const ctx = tile.getContext("2d");

    gcsPromise.then(gcs => {
      ctx.strokeStyle = gcs.cache == "hit" ? "green" : "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, size.x, size.y);
      ctx.font = "16pt Arial";
      const lineHeight = 20;
      let y = 20;

      const print = s => {
        ctx.fillText(s, 10, y);
        y += lineHeight;
      };

      ctx.fillStyle = "black";
      print(`x: ${coord.x} y: ${coord.y} z: ${coord.z}`);
      print(`size: ${size.x} x ${size.y}`);
      print(`lat: ${lat} lon: ${lon}`);
      print(`quad: ${quadKey}`);
      print(`res: ${gcs.length}`);
      print(`cache: ${gcs.cache}`);
    });

    return tile;
  }
});

export default function create(map) {
  const layer = new CanvasLayer();
  map.addLayer(layer);
}
