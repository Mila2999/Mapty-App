'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map;
let mapEvent;
//232 Using the Geolocation API
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
      //233 Displying the map using Leaflet Library (hoated version)
      const coords = [latitude, longitude];
      map = L.map('map').setView(coords, 13);
      //   console.log(map);
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      //handling clicks on map
      map.on('click', function (mapE) {
        mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
      });
    }, //sucsess
    function () {
      alert('Could not get your position');
    } //errow
  );
}
//235 Rendering workout form
//new event handler
form.addEventListener('submit', function (e) {
  e.preventDefault();
  // Clear inputs fields
  inputDistance.values =
    inputDuration.values =
    inputCadence.values =
    inputElevation.values =
      '';
  //Display the marker
  console.log(mapEvent);
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      //234 display and slyle popup
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup ',
      })
    )
    .setPopupContent('Workout')
    .openPopup();
});
// Change the type of field
inputType.addEventListener('change', function name() {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
