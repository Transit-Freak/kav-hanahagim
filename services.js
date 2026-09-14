// Operator-owned endpoints only. Leave empty until provisioned and verified.
// Tile template: https://YOUR_HOST/tiles/{z}/{x}/{y}.png
// OSRM endpoint: https://YOUR_HOST/osrm (CORS required if cross-origin).
window.DriverServices = Object.freeze({
  tilesUrl: '',
  maxNativeZoom: 18,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
  osrmUrl: '',
});
