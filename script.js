const places = {
  campus: { type: 'Campus', name: 'Texas Tech University', coordinates: [33.5845, -101.8784], summary: 'Select a housing marker to compare its listed price and commute with the Texas Tech campus.', priceLabel: 'Case study', price: 'TTU', details: [['Purpose', 'College campus'], ['Explore', 'Choose A, B, or C']] },
  ulofts: { type: 'Option A · Student housing', name: 'U Lofts', coordinates: [33.58594, -101.86999], summary: 'A nearby, furnished option that markets a social student lifestyle.', priceLabel: 'Advertised rent', price: '$899', details: [['Reported distance', '2 min walk'], ['Layout', '2 bed / 2 bath'], ['Amenities', 'Pool · gym · study'], ['Transit', 'No shuttle/bus']] },
  troubadour: { type: 'Option B · Student housing', name: 'Troubadour', coordinates: [33.5809, -101.8703], summary: 'A nearby furnished option marketed as luxury or resort-style social living.', priceLabel: 'Advertised rent', price: '$1,100–1,200', details: [['Reported distance', '3 min walk'], ['Layout', '2 bed / 2 bath'], ['Amenities', 'Pool · gym · study'], ['Transit', 'No shuttle/bus']] },
  wildwood: { type: 'Option C · Student housing', name: 'Wildwood', coordinates: [33.6135, -101.8941], summary: 'The lowest listed option in this comparison, farther from campus but with shuttle/bus access.', priceLabel: 'Advertised rent', price: '$750–819', details: [['Reported drive', '10 min'], ['Reported walk', '1 hr 21 min'], ['Amenities', 'Pool · gym · study'], ['Transit', 'Shuttle/bus access']] }
};

const type = document.querySelector('#placeType');
const name = document.querySelector('#placeName');
const summary = document.querySelector('#placeSummary');
const priceRow = document.querySelector('#priceRow');
const details = document.querySelector('#placeDetails');
const routeButton = document.querySelector('#routeButton');
const map = L.map('liveMap', { zoomControl: true, scrollWheelZoom: true, attributionControl: false }).setView(places.campus.coordinates, 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

const campusIcon = L.divIcon({ className: 'map-pin-wrap', html: '<span class="leaflet-pin campus-pin">TTU</span>', iconSize: [52, 52], iconAnchor: [26, 26] });
const housingIcon = letter => L.divIcon({ className: 'map-pin-wrap', html: `<span class="leaflet-pin housing-pin">${letter}</span>`, iconSize: [40, 40], iconAnchor: [20, 20] });
const letters = { ulofts: 'A', troubadour: 'B', wildwood: 'C' };

Object.entries(places).forEach(([key, place]) => {
  L.marker(place.coordinates, { icon: key === 'campus' ? campusIcon : housingIcon(letters[key]) })
    .addTo(map).bindTooltip(place.name, { direction: 'top', offset: [0, -20] })
    .on('click', () => renderPlace(key));
});

let selected = 'campus';
let routeControl;
function renderPlace(key) {
  selected = key;
  const place = places[key];
  type.textContent = place.type;
  name.textContent = place.name;
  summary.textContent = place.summary;
  priceRow.innerHTML = `<span>${place.priceLabel}</span><strong>${place.price}</strong>`;
  details.innerHTML = place.details.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
  routeButton.disabled = key === 'campus';
  routeButton.textContent = key === 'campus' ? 'Select housing to show route' : 'Show route to campus ↗';
  if (routeControl) { map.removeControl(routeControl); routeControl = null; }
  if (key !== 'campus') map.flyTo(place.coordinates, key === 'wildwood' ? 13 : 16, { duration: .7 });
}

routeButton.addEventListener('click', () => {
  if (selected === 'campus') return;
  if (routeControl) { map.removeControl(routeControl); routeControl = null; routeButton.textContent = 'Show route to campus ↗'; return; }
  routeControl = L.Routing.control({
    waypoints: [L.latLng(places[selected].coordinates), L.latLng(places.campus.coordinates)],
    lineOptions: { styles: [{ color: '#e05e3e', opacity: .95, weight: 5 }] },
    addWaypoints: false, draggableWaypoints: false, fitSelectedRoutes: true, show: false, createMarker: () => null
  }).on('routesfound', () => { routeButton.textContent = 'Route shown · hide route ↗'; }).addTo(map);
});
