import { getApp } from 'firebase/app';

const EMISSIONS_API = 'https://travelimpactmodel.googleapis.com/v1/flights:computeTypicalFlightEmissions';

let airportsPromise = null;

// Note: lazy import keeps the ~180 KB dataset out of the main bundle,
// it is only fetched once the flight dialog needs it
export const loadAirports = () => {
  if (!airportsPromise) {
    airportsPromise = import('./airports.json').then(module => module.default);
  }
  return airportsPromise;
};

let worldMapPromise = null;

// world landmass pre-projected to a 1000x500 equirectangular SVG path,
// lazy for the same reason as the airports
export const loadWorldMap = () => {
  if (!worldMapPromise) {
    worldMapPromise = import('./worldmap.json').then(module => module.default);
  }
  return worldMapPromise;
};

// great-circle distance between two airports in km (haversine)
const haversine = ([lat1, lon1], [lat2, lon2]) => {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// rough economy per-km factors by haul length, used when the model
// has no data for a market (kg CO2e per passenger km)
const estimateCO2 = (km) => {
  const factor = km < 1500 ? 0.14 : km < 4000 ? 0.11 : 0.1;
  return Math.round(km * factor);
};

const fetchEmissions = async (origin, destination) => {
  const apiKey = getApp().options.apiKey;
  const response = await fetch(`${EMISSIONS_API}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markets: [{ origin, destination }] })
  });
  if (!response.ok) {
    throw new Error(`Travel Impact Model API responded with ${response.status}`);
  }
  const payload = await response.json();
  const emissions = payload.typicalFlightEmissions && payload.typicalFlightEmissions[0];
  const grams = emissions && emissions.emissionsGramsPerPax && emissions.emissionsGramsPerPax.economy;
  return grams ? Math.round(grams / 1000) : null;
};

// resolves a single leg into { km, co2 (kg/pax, economy), estimated }
export const resolveLeg = async (origin, destination) => {
  const airports = await loadAirports();
  const from = airports[origin];
  const to = airports[destination];
  if (!from || !to) {
    throw new Error('Unknown airport code');
  }
  const km = haversine(from, to);
  try {
    const co2 = await fetchEmissions(origin, destination);
    if (co2) {
      return { km, co2, estimated: false };
    }
  } catch (error) {
    console.log(error);
  }
  return { km, co2: estimateCO2(km), estimated: true };
};

export const formatKm = (km) => {
  return `${String(Math.round(km)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} km`;
};

// legs store kg, the log displays tonnes
export const formatCO2 = (kg) => {
  return `${(kg / 1000).toFixed(2)} t`;
};

const EARTH_CIRCUMFERENCE_KM = 40075;
const MOON_DISTANCE_KM = 384400;

// playful context stats for the total distance flown
export const kmComparisons = (km) => {
  if (!km) {
    return [];
  }
  const around = km / EARTH_CIRCUMFERENCE_KM;
  const moon = km / MOON_DISTANCE_KM;
  return [
    { value: `${around >= 10 ? Math.round(around) : around.toFixed(1)}×`, label: 'around the world' },
    moon >= 1
      ? { value: `${moon.toFixed(1)}×`, label: 'to the moon' }
      : { value: `${Math.round(moon * 100)}%`, label: 'way to the moon' }
  ];
};

export const flightYear = (flight) => {
  return new Date(flight.date * 1000).getFullYear();
};

export const flightTotals = (flight) => {
  const legs = flight.legs || [];
  return {
    km: legs.reduce((sum, leg) => sum + (leg.km || 0), 0),
    co2: legs.reduce((sum, leg) => sum + (leg.co2 || 0), 0)
  };
};
