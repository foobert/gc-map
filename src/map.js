import { lookup as treeLookup } from "./tree";
export function init(element) {
  const mymap = L.map(element).setView([51.3, 12.29], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "foo",
    maxZoom: 18
  }).addTo(mymap);

  const images = {
    fallback: document.getElementById("fallback")
  };

  for (let x of [
    "traditional",
    "multi",
    "wherigo",
    "event",
    "mystery",
    "earth",
    "virtual",
    "letterbox",
    "cito",
    "webcam"
  ]) {
    images[x] = document.getElementById(x);
  }

  const colors = {
    traditional: "#23db35",
    multi: "#db8b23",
    fallback: "#23c2db"
  };

  //const tileTree = new QuadTileTree();

  const filters = {
    types: ["traditional", "multi"]
  };

  function isFiltered(gc) {
    if (filters.types.indexOf(gc.parsed.type) < 0) {
      return true;
    }
    if (filters.favpoints > gc.parsed.favpoints) {
      return true;
    }
    return false;
  }

  function computeAgeInDays(gc) {
    return Math.max(
      0,
      Math.min(
        255,
        Math.floor(
          (Date.now() - Date.parse(gc.api_date)) / (1000 * 60 * 60 * 24)
        )
      )
    );
  }

  function lookup(quadKey) {
    return treeLookup(quadKey);
    return m
      .request({
        method: "GET",
        url: "http://localhost:8080/api/graphql",
        data: {
          query:
            "{ geocaches(quadkey: " +
            JSON.stringify(quadKey) +
            ") { totalCount next nodes { id api_date parsed { lat lon name } } } }"
        }
      })
      .then(function(response) {
        let data = response.data.geocaches.nodes;
        return data;
      });
  }

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
      //const gcs = tileTree.get({ x: coord.x, y: coord.y, zoom: coord.z });
      const gcs = [];
      const quadKey = toQuadKey(coord.x, coord.y, coord.z).join("");
      const gcsPromise = lookup(quadKey);

      const ctx = tile.getContext("2d");

      gcsPromise.then(gcs => {
        //console.log(gcs);
        for (const gc of gcs) {
          //console.log(gc);
          //if (isFiltered(gc)) {
          //continue;
          //}
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

          //const ageInDays = computeAgeInDays(gc);
          //let color = ageToColor(ageInDays);
          let color = "#ff0000";
          if (gcs.cache == "hit") {
            color = "#00ff00";
          }
          //console.log(gc.api_date, ageInDays, color);
          ctx.beginPath();
          ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
          ctx.strokeStyle = "white";
          ctx.fillStyle = color;
          ctx.lineWidth = 0;
          ctx.fill();
          ctx.stroke();
        }
        if (true) {
          ctx.strokeStyle = gcs.cache == "hit" ? "green" : "red";
          ctx.lineWidth = 10;
          ctx.strokeRect(0, 0, size.x, size.y);
          ctx.font = "16pt Arial";

          ctx.fillStyle = "black";
          ctx.fillText(`x: ${coord.x} y: ${coord.y} z: ${coord.z}`, 10, 20);
          //ctx.fillText(`size: ${size.x} x ${size.y}`, 10, 35);
          //ctx.fillText(`lat: ${coordinates.lat} lon: ${coordinates.lon}`, 10, 50);
          ctx.fillText(`quad: ${quadKey}`, 10, 65);
          ctx.fillText(`res: ${gcs.length}`, 10, 80);
        }
      });

      return tile;
    },
    popup: L.popup(),
    onClick: function(e) {
      const { lat, lng: lon } = e.latlng;
      const tile = toTile(lat, lon, mymap.getZoom());
    }
  });

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

  const layer = new CanvasLayer();
  //mymap.on("click", e => layer.onClick(e));
  mymap.addLayer(layer);

  /*
fetch("https://gc.funkenburg.net/api/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },
  body: JSON.stringify({
    query:
      "{ geocaches { id parsed { lat lon name terrain difficulty type } } }"
  })
})
  /**/
  /**/
  function center(lat, lon) {
    if (lat == null && lon == null) {
      console.log("locating position");
      mymap.locate();
    } else {
      console.log("centering on " + lat + ", " + lon);
      mymap.setView({ lat, lon });
    }
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
}
