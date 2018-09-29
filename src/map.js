import osmLayer from "./layer/osm";
import debugLayer from "./layer/debug";
import ageLayer from "./layer/age";
import gcLayer from "./layer/gc";

export function init(element) {
  const map = L.map(element).setView([51.3, 12.29], 13);

  osmLayer(map);
  //ageLayer(map);
  //debugLayer(map);
  gcLayer(map);
}
