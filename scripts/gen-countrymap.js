// Generates src/lib/countrymap.json: { [iso2]: 'M...Z' } SVG outline per
// country, projected equirectangular onto the same 1000x500 frame as
// src/lib/worldmap.json (x = (lon+180)/360*1000, y = (90-lat)/180*500).
// Source: @amcharts/amcharts4-geodata worldLow GeoJSON from node_modules.
// Run from the repo root: node scripts/gen-countrymap.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const geo = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/@amcharts/amcharts4-geodata/json/worldLow.json'), 'utf8'));

const W = 1000, H = 500;
const px = lon => (lon + 180) / 360 * W;
const py = lat => (90 - lat) / 180 * H;
const r1 = n => Math.round(n * 10) / 10;

const ringToPath = (ring) => {
  let d = '';
  let prevX = null, prevY = null;
  ring.forEach(([lon, lat]) => {
    const x = r1(px(lon)), y = r1(py(lat));
    if (x === prevX && y === prevY) return; // rounding collapsed the point
    d += (d ? 'L' : 'M') + x + ' ' + y;
    prevX = x; prevY = y;
  });
  return d ? d + 'Z' : '';
};

const out = {};
geo.features.forEach(feature => {
  const iso = feature.id;
  if (!iso) return;
  const geom = feature.geometry;
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  // outer rings only; holes are invisible at this scale
  const d = polys.map(poly => ringToPath(poly[0])).filter(Boolean).join('');
  if (d) out[iso] = d;
});

const json = JSON.stringify(out);
fs.writeFileSync(path.join(root, 'src/lib/countrymap.json'), json);
console.log('countries:', Object.keys(out).length, 'bytes:', json.length);
