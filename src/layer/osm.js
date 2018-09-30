export default function create() {
  return L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "foo",
    maxZoom: 18
  });
}
