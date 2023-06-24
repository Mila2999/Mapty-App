'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;
  constructor(coords, distance, duration) {
    // this.date = ...
    //this.id =...
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  click() {
    this.clicks++;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadance) {
    super(coords, distance, duration);
    this.cadance = cadance;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this;
  }
}
// const run1 = new Running([39, -12], 5.2, 26, 200);
// const cycling1 = new Cycling([39, -12], 27, 92, 500);
// console.log(run1, cycling1);

////////////////////////////////////////////////////////////
// APLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  constructor() {
    // Get user`s position
    this._getPosition();
    // Get data from local storage
    this._getLocalStorage();
    this._editLocalStorage();
    //Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    // Change the type of field
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),

        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    //233 Displying the map using Leaflet Library (hoated version)
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    // Helper functions
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng; // coords
    let workout;

    // If workout is running then create the running {}
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) || // if number
        !allPositive(distance, duration, cadence) // if positive
      )
        return alert('Inputs has to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
      //   this.#workouts.push(workout);
    }

    // If workout is cycling then create the cycling {}
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // Check if data is valid
      !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration);
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add (push) new object to the workout array
    this.#workouts.push(workout);
    // console.log(workout);

    // Render workout on the map as marker
    this._renderWorkoutMarker(workout);

    // Render worout on the list
    this._renderWorkout(workout);

    // Hide the form + Clear inputs fields
    this._hideForm();

    // Set local storage to all workouts
    this._setLocalStorage();
  }

  _newWorkout(e) {
    e.preventDefault();
    // Helper functions
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng; // coords
    let workout;

    // If workout is running then create the running {}
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) || // if number
        !allPositive(distance, duration, cadence) // if positive
      )
        return alert('Inputs has to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
      //   this.#workouts.push(workout);
    }

    // If workout is cycling then create the cycling {}
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // Check if data is valid
      !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration);
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add (push) new object to the workout array
    this.#workouts.push(workout);
    // console.log(workout);

    // Render workout on the map as marker
    this._renderWorkoutMarker(workout);

    // Render worout on the list
    this._renderWorkout(workout);

    // Hide the form + Clear inputs fields
    this._hideForm();

    // Set local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        //234 display and slyle popup
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴🏻‍♂️'} ${workout.description}`
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <button class="workout__edit-${workout.id}">Edit</button>
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴🏻‍♂️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
        </div>
    `;
    if (workout.type === 'running')
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadance}</span>
            <span class="workout__unit">spm</span>
        </div>
      </li> 
    `;
    if (workout.type === 'cycling')
      html += ` </div>
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
       </div>
     </li> 
     `;

    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    console.log(workoutEl);
    if (!workoutEl) return;
    // get data from workouts array
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    console.log(workout);
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // using the pablic interface
    // workout.click();
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);
    if (!data) return;
    //Restoring the data
    this.#workouts = data;
    //Render stored workouts in the list
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }
  _editLocalStorage() {
    this.#workouts.forEach(work => {
      const currentId = work.id;
      let edit = document.querySelector(`.workout__edit-${currentId}`);

      const EditFunc = function () {
        const workById = document.querySelector(`[data-id="${currentId}"]`);
        this.#workouts.map(workout => {
          console.log(workout.id);
          const workoutById = document.querySelector(
            `[data-id="${workout.id}"]`
          );
          workoutById.style.display = 'grid';
        });
        workById.style.display = 'none';
        form.classList.remove('hidden');

        if (work.type !== inputType.value) {
          this._toggleElevationField();
        }

        inputType.value = work.type;
        inputDistance.value = work.distance;
        inputDuration.value = work.duration;
        inputCadence.value = work.cadance;
        inputElevation.value = work.elevationGain; // work.Cycling ? work.elevationGain: work.cadance
      };

      //   edit.addEventListener('click', EditFunc.bind(this));
    });
  }
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}
const app = new App();

//232 Using the Geolocation API

//235 Rendering workout form
//new event handler
