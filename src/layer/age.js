import { lookup } from "../tree";

const CanvasLayer = L.GridLayer.extend({
  createTile: function(coord) {
    const size = this.getTileSize();

    const tile = L.DomUtil.create("canvas", "leaflet-tile");
    tile.width = size.x;
    tile.height = size.y;

    const coordinates = toCoordinates(coord);
    const coordinatesLowerRight = toCoordinates({
      x: coord.x + 1,
      y: coord.y + 1,
      z: coord.z
    });
    const quadKey = toQuadKey(coord.x, coord.y, coord.z).join("");
    const gcsPromise = lookup(quadKey);

    const ctx = tile.getContext("2d");

    gcsPromise.then(gcs => {
      for (const gc of gcs) {
        const position = {
          x:
            Math.sign(coordinates.lon) *
            (gc.parsed.lon - coordinates.lon) /
            Math.abs(coordinates.lon - coordinatesLowerRight.lon) *
            size.x,
          y:
            (coordinates.lat - gc.parsed.lat) /
            Math.abs(coordinates.lat - coordinatesLowerRight.lat) *
            size.y
        };

        //if (!gc.parsed) {
        //console.log(gc);
        //continue;
        //}

        //ctx.fillStyle = "blue";
        //ctx.fillRect(dx - 5, dy - 5, 10, 10);

        if (
          position.x < 0 ||
          position.x > size.x ||
          position.y < 0 ||
          position.y > size.y
        ) {
          continue;
        }

        const ageInDays = computeAgeInDays(gc);
        let color = ageToColor(ageInDays);
        ctx.beginPath();
        ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
        ctx.strokeStyle = "white";
        ctx.fillStyle = color;
        ctx.lineWidth = 0;
        ctx.fill();
        ctx.stroke();
      }
    });

    return tile;
  }
});

function computeAgeInDays(gc) {
  return Math.max(
    0,
    Math.min(
      255,
      Math.floor((Date.now() - Date.parse(gc.api_date)) / (1000 * 60 * 60 * 24))
    )
  );
}

function ageToColor(ageInDays) {
  const perc = 100 - 100 * Math.min(1, ageInDays / 90);
  let r,
    g,
    b = 0;
  if (perc < 50) {
    r = 255;
    g = Math.round(5.1 * perc);
  } else {
    g = 255;
    r = Math.round(510 - 5.1 * perc);
  }
  const h = r * 0x10000 + g * 0x100 + b * 0x1;
  return "#" + ("000000" + h.toString(16)).slice(-6);
}

function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}

function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }

  return [r * 255, g * 255, b * 255];
}

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

function toTile(lat, lon, zoom) {
  const latRad = lat * Math.PI / 180;
  const n = Math.pow(2, zoom);
  const xtile = parseInt((lon + 180.0) / 360.0 * n);
  const ytile = parseInt(
    (1.0 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) /
      2.0 *
      n
  );
  return { x: xtile, y: ytile };
}

export default function create(map) {
  const layer = new CanvasLayer();
  //mymap.on("click", e => layer.onClick(e));
  map.addLayer(layer);
}
