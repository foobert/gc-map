import { lookup } from "../tree";

const CanvasLayer = L.GridLayer.extend({
  createTile: function(coord) {
    const size = this.getTileSize();

    const tile = L.DomUtil.create("canvas", "leaflet-tile");
    tile.width = size.x;
    tile.height = size.y;

    //const coordinates = toCoordinates(coord);
    const quadKey = toQuadKey(coord.x, coord.y, coord.z).join("");
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
      //print(`lat: ${coordinates.lat} lon: ${coordinates.lon}`);
      print(`quad: ${quadKey}`);
      print(`res: ${gcs.length}`);
      print(`cache: ${gcs.cache}`);
    });

    return tile;
  }
});

function toCoordinates(tile) {
  const n = Math.pow(2, tile.z);
  const lon = tile.x / n * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * tile.y / n)));
  const lat = latRad / Math.PI * 180;
  return { lat, lon };
}

function toQuadKey(tileX, tileY, zoom) {
  let quadKey = [];
  for (let i = zoom; i > 0; i--) {
    let digit = 0;
    const mask = 1 << (i - 1);
    if ((tileX & mask) !== 0) {
      digit++;
    }
    if ((tileY & mask) !== 0) {
      digit += 2;
    }
    quadKey.push(digit);
  }
  return quadKey;
}

export default function create(map) {
  const layer = new CanvasLayer();
  map.addLayer(layer);
}
