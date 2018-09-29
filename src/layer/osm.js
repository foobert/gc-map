export default function create(map) {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "foo",
    maxZoom: 18
  }).addTo(map);
}
