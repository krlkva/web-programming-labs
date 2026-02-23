//// VARIABLES

const PERIODS = {0: 'night', 1: 'morning', 2: 'afternoon', 3: 'evening'};
const WEEKDAYS = {0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TMPR_COLORS = {
  140: '#ffb0b0',
  130: '#ffd7b0',
  120: '#fff7b0',
  110: '#dfffb0',
  100: '#b0ffed',
  90: '#b0f1ff',
  80: '#b0d7ff',
  70: '#b0c0ff',
  0: '#9e9aff'
}
const NDAYS = 3;
let mapCountries = []
let mapLocations = {
  'St Petersburg': [59.938886, 30.313838],
  'Veliky Novgorod': [58.523342, 31.267735],
  'Moscow': [55.763263, 37.613748],
  'Yekaterinburg': [56.882507, 60.543053],
  'Novosibirsk': [55.055589, 82.910959],
}
let currMapLocations = {};
let locations = [];
let curr_location = '';
let curr_target = document.getElementsByClassName('current-location__geolocation')[0];

//// HELPERS

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}


function round(number, precision = 1){
  return Math.round(
    number * Math.pow(10, precision)
  ) / Math.pow(10, precision);
}


function capitalize(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}


function getListedPlaces(){
  let listedPlaces = [];
  for (let location of locations){
    listedPlaces.unshift(location.place);
  }
  return listedPlaces;
}

function animatePopup(popup){
  let animationSpeed = 250;
  popup.classList.remove('hidden');
  popup.animate(
  [
    { opacity: 0, transform: 'translateY(-2rem)' },
    { opacity: 1, transform: 'translateY(0)' },
  ], 
  {
    duration: animationSpeed,
    iterations: 1,
  });
}

//// START

if (localStorage.getItem('locations')){
  locations = JSON.parse(localStorage.getItem('locations'));
}


async function setupPage(){
  getCountries();
  populateElemLocations();
  refreshWeatherData();
}


//// LOGIC

// Country and city selects

let countriesLists = document.getElementsByClassName('datalist-countries');

for (let i = 0; i < countriesLists.length; i++){
  let list = countriesLists[i];
  let mode = 'default';
  if (i == 0){
    mode = 'curr';
  }
  let respectiveCity = list.parentNode.parentNode.getElementsByClassName('add-location__city')[0];
  respectiveCity.classList.add('hidden');
  let input = list.parentNode.getElementsByTagName('input')[0];
  input.value = '';
  let select = list.getElementsByTagName('select')[0];
  select.addEventListener('change', (event) => {
    processNewCountry(event, list, mode);
  })
  let set_btn = list.parentNode.getElementsByClassName('set-country-btn')[0];
  set_btn.addEventListener('click', (event) => {
    processNewCountry(event, list, mode)
  });
}

function populateCountriesLists(){
  let countriesLists = document.getElementsByClassName('datalist-countries');
  for (let list of countriesLists){
    let selectList = list.getElementsByTagName('select')[0];
    selectList.textContent = '';
    for (let [place, id] of Object.entries(mapCountries)){
      let elemPlace = document.createElement('option');
      elemPlace.value = capitalize(place);
      selectList.appendChild(elemPlace);
    }
  }
}

function processNewCountry(event, list, mode='default'){
  let country_select = list.parentNode.getElementsByTagName('input')[0];
  let error_popup = document.getElementsByClassName('invalid-country-input')[0];
  let error_city_popup = document.getElementsByClassName('invalid-input')[0];
  let respectiveCity = list.parentNode.parentNode.getElementsByClassName('add-location__city')[0];
  respectiveCity.classList.add('hidden');
  if (country_select.value.toLowerCase() in mapCountries){
    error_popup.classList.add('hidden');
    respectiveCity.classList.remove('hidden');
    fetchCities(mapCountries[country_select.value.toLowerCase()], mode)
  }
  else{
    error_popup.classList.remove('hidden');
    error_city_popup.classList.add('hidden');
    animatePopup(error_popup);
  }
}

async function getCountries(){
  const requestURL =
    "https://plida.github.io/cities-info/countries.json";
  const request = new Request(requestURL);

  const response = await fetch(request);
  const cities = await response.json();
  
  for (let country of cities){
    mapCountries[country.name.toLowerCase()] = country.id;
  }

  populateCountriesLists();
}


let citiesLists = document.getElementsByClassName('datalist-cities');
for (let i = 0; i < citiesLists.length; i++){
  let input = citiesLists[i].parentNode.getElementsByTagName('input')[0];
  input.value = '';
  let select = citiesLists[i].getElementsByTagName('select')[0]; 
  select.addEventListener('change', () => {
      if (i > 1){
        let mode = 'default'; 
      }
      else{
        let mode = 'curr';
      }
      processNewCity(citiesLists[i], mode);
    }
  )
}

function populateCitiesLists(){
  let citiesLists = document.getElementsByClassName('datalist-cities');
  for (let i = 0; i < citiesLists.length; i++){
    let list = citiesLists[i];
    let selectList = list.getElementsByTagName('select')[0];
    selectList.textContent = '';
    if (i == 0){
      for (let [place, coords] of Object.entries(currMapLocations)){
        let elemPlace = document.createElement('option');
        elemPlace.value = capitalize(place);
        selectList.appendChild(elemPlace);
    }}
    else{
      for (let [place, coords] of Object.entries(mapLocations)){
        let elemPlace = document.createElement('option');
        elemPlace.value = capitalize(place);
        selectList.appendChild(elemPlace);
    }
    }
  }
}

async function fetchCities(country_id, mode) {
  const requestURL =
    "https://plida.github.io/cities-info/cities.json";
  const request = new Request(requestURL);

  const response = await fetch(request);
  const cities = await response.json();
  
  if (mode == 'curr'){
    currMapLocations = {};
    for (let city of cities){
      if (city.country_id == country_id){
        currMapLocations[city.name.toLowerCase()] = [city.latitude, city.longitude];
      }
    }
  }
  else{
    mapLocations = {};
    for (let city of cities){
      if (city.country_id == country_id){
        mapLocations[city.name.toLowerCase()] = [city.latitude, city.longitude];
      }
    }
  }

  populateCitiesLists();
}

function processNewCity(list, mode = 'default'){
  let city_select = list.parentNode.getElementsByTagName('input')[0];
  let error_popup = document.getElementsByClassName('invalid-input')[0];
  let repeat_popup = document.getElementsByClassName('repeat-input')[0];

  repeat_popup.classList.add('hidden');
  error_popup.classList.add('hidden');
  let value = city_select.value.toLowerCase();
  if (getListedPlaces().includes(value) && mode == 'default'){
    repeat_popup.classList.remove('hidden');
    animatePopup(repeat_popup);
    return;
  }

  if (mode == 'curr' && value in currMapLocations){
    addCurrentLocation(currMapLocations[value][0], currMapLocations[value][1]);
  }
  else if (mode == 'default' && value in mapLocations){
    createLocationEntry(value)
  }
  else{
    error_popup.classList.remove('hidden');
    animatePopup(error_popup);
  }
}


let add_current_btns = document.getElementsByClassName('add-current-btn');
for (let btn of add_current_btns){
  let list = btn.parentNode.getElementsByTagName('datalist')[0];
  let add_select = btn.parentNode.getElementsByTagName('input')[0];
  add_select.value = "";
  btn.addEventListener('click', () => {
    curr_target = document.getElementsByClassName('current-location__manual')[0];
    processNewCity(list, 'curr');
    curr_loc_man_ch.classList.add('hidden');
    curr_loc_man.classList.remove('hidden');
  });
}

let add_city_btns = document.getElementsByClassName('add-city-btn');
for (let btn of add_city_btns){
  let list = btn.parentNode.getElementsByTagName('datalist')[0];
  btn.addEventListener('click', () => {processNewCity(list, 'default')});
}

// Weather API

async function getWeather(latitude, longitude){
  const apiURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&timezone=auto`;
  try {
    let response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    let days = await response.json();
    return parseWeatherData(days)
  } catch (error) {
    console.error(error.message);
    return -1;
  }
}


function parseWeatherData(data){
  let days = [];
  let temperatures = data.hourly.temperature_2m;
  for (let i = 0; i < 7; i++){
    let periods = [];
    for (let k = 0; k < 4; k++){
      let avgTemp = 0;
      let minTemp = 1000;
      let maxTemp = -1000;
      for (let j = 24 * i + (6 * k); j < 24 * (i) + (6 * (k+1)); j++){
        let roundTemp = round(temperatures[j], 1);
        avgTemp += roundTemp; 
        if (roundTemp < minTemp){
          minTemp = roundTemp;
        }
        if (roundTemp > maxTemp){
          maxTemp = roundTemp;
        }
      }
      avgTemp = round(avgTemp / 6, 1);
      periods.push([avgTemp, minTemp, maxTemp]);
    }
    days.push([data.hourly.time[i*24], periods]);
  }
  return days;
}


const refresh_btn = document.getElementById('refresh-btn');
refresh_btn.addEventListener('click', () =>{
  refreshWeatherData();
})

async function refreshWeatherData(){
  let elemLocationsList = document.getElementsByClassName('location-data');
  let elemLocList = curr_target.getElementsByTagName('ul')[0];
  currentWeather.classList.add('hidden');
  elemLocList.textContent = 'loading...';
  if (curr_location != ""){
    let result = await getWeather(curr_location.latitude, curr_location.longitude);
    if (result == -1){
      elemLocList.textContent = 'An error has occured. Please try refreshing.';
      curr_location.weather = '';
    }
    else{
      curr_location.weather = result;
    }
  }
  
  for (let i = 0; i < locations.length; i++){
    if (elemLocationsList.length < 3){
      break;
    }
    
    let elemLocList = elemLocationsList[i+2].getElementsByTagName('ul')[0];
    elemLocList.textContent = 'loading...';
    sleep(100);
    let result = await getWeather(locations[i].latitude, locations[i].longitude);
    if (result == -1){
      elemLocList.textContent = 'An error has occured. Please try refreshing.';
      locations[i].weather = '';
    }
    else{
      locations[i].weather = result;
    }
  }
  
  localStorage.setItem('locations', JSON.stringify(locations));

  populateCurrentLocation();
  populateElemLocations();
}

// Current location

const watchCurrGeo = navigator.geolocation.watchPosition(
  (position) => {
    curr_target = document.getElementsByClassName('current-location__geolocation')[0];
    if (curr_location == ''){
      addCurrentLocation(position.coords.latitude, position.coords.longitude);
      curr_loc_geo.classList.remove('hidden');
      curr_loc_man_ch.classList.add('hidden');
    }
  },
  () => {
    curr_target = document.getElementsByClassName('current-location__manual')[0];
    curr_loc_geo.classList.add('hidden');
    curr_loc_man_ch.classList.remove('hidden');
  }
);

async function addCurrentLocation(latitude, longitude){
  let elemLocList = curr_target.getElementsByTagName('ul')[0];
  let entry = {latitude: latitude, longitude: longitude, data: '', place: 'Current location'};
  let result = await getWeather(entry.latitude, entry.longitude);
  if (result == -1){
    elemLocList.textContent = 'An error has occured. Please try refreshing.';
    return;
  }
  else{
    entry.weather = result;
  }
  if (curr_location != entry){
    curr_location = entry;
    populateCurrentLocation();
  }
}


async function populateCurrentLocation(){
  if (curr_location == ""){
    return;
  }
  let elemLocList = curr_target.getElementsByTagName('ul')[0];
  elemLocList.textContent = '';
  fillElemLocation(curr_location, elemLocList);
  // current weather
  currentWeather.classList.remove('hidden');
  let current_weather = document.getElementsByClassName('current-weather')[0].getElementsByTagName('span')[0];
  let index = Math.floor(new Date().getHours() / 6);
  let value = curr_location.weather[0][1][index][0];
  let current_weather_image = document.getElementsByClassName('current-weather')[0].getElementsByTagName('img')[0];
  current_weather_image.src = './media/icon_' + PERIODS[index] + '.png';
  let degree = value + '°C';
  if (value > 0) {degree = '+' + degree}
  current_weather.textContent = value + '°C';
}

// Other locations

async function populateElemLocations(){
  let elemLocationsList = document.getElementsByClassName('location-data');
  
  while (elemLocationsList.length > 2){  // the first 2 elements are for current location
    elemLocationsList[2].remove();
  }

  for (let i = 0; i < locations.length; i++){
    createElemLocation(locations[i]);
    let elemLocList = elemLocationsList[i+2].getElementsByTagName('ul')[0];
    elemLocList.textContent = '';
    fillElemLocation(locations[i], elemLocList);
  }
}

async function createLocationEntry(place){
  place = place.toLowerCase();
  if (getListedPlaces().includes(place) || place == ""){
    return;
  }
  if (place in mapLocations == false){
    return;
  }
  let entry = {latitude: mapLocations[place][0], longitude: mapLocations[place][1], data: '', place: place};
  let result = await getWeather(entry.latitude, entry.longitude);
  if (result == -1){
    alert('An error has occured. Please try adding the entry again.');
    return;
  }
  else{
    entry.weather = result;
  }
  locations.unshift(entry);
  populateElemLocations();
  localStorage.setItem('locations', JSON.stringify(locations));
}

//// DOM

const curr_loc_geo = document.getElementsByClassName('current-location__geolocation')[0];
curr_loc_geo.classList.remove('hidden');
const curr_loc_man_ch = document.getElementsByClassName('current-location__manual-choice')[0];
curr_loc_man_ch.classList.add('hidden');
const curr_loc_man = document.getElementsByClassName('current-location__manual')[0];
curr_loc_man.classList.add('hidden');
const currentWeather = document.getElementsByClassName('current-weather')[0];
currentWeather.classList.add('hidden');

const curr_loc_man_btn = curr_loc_man.getElementsByTagName('button')[0];
curr_loc_man_btn.addEventListener('click', () => {
  curr_target = document.getElementsByClassName('current-location__manual')[0];
  curr_location = '';
  currentWeather.classList.add('hidden');
  curr_loc_geo.classList.add('hidden');
  curr_loc_man_ch.classList.remove('hidden');
  curr_loc_man.classList.add('hidden');
})

function createElemLocation(location){
  let elemLocations = document.getElementsByClassName('locations')[0];
  let locationData = document.createElement('section');
  locationData.classList.add('location-data');
  elemLocations.appendChild(locationData);

  let locationInfo = document.createElement('div');
  locationInfo.classList.add('location-data__info');
  locationData.appendChild(locationInfo);
  let locationHeader = document.createElement('h3');
  locationHeader.textContent = capitalize(location.place);
  locationInfo.appendChild(locationHeader);
  let locationRemove = document.createElement('button');
  locationRemove.classList.add('location__remove-btn');
  locationRemove.addEventListener('click', (event) => {
      let indToRemove = locations.indexOf(location);
      if (indToRemove != -1){
        locations.splice(indToRemove, 1);
        event.target.parentNode.parentNode.remove();
        localStorage.setItem('locations', JSON.stringify(locations));
      }
    }
  )
  locationInfo.appendChild(locationRemove);

  let locationByDay = document.createElement('div');
  locationByDay.classList.add('location-data-byday');
  locationData.appendChild(locationByDay);
  let locationList = document.createElement('ul');
  locationByDay.appendChild(locationList);
}

function fillElemLocation(location, list){
  if (location.weather == undefined){
    return;
  }
  for (let i = 0; i < NDAYS; i++){
    if (location.weather == ''){
      let span = document.createElement('span');
      span.textContent = 'An error has occured. Please try refreshing.';
      list.appendChild(span);
      break;
    }
    let dayData = location.weather[i];
    let elemLocationDay = document.createElement('li');
    let elemLocationDayHeader = document.createElement('span');
    elemLocationDayHeader.textContent = WEEKDAYS[new Date(dayData[0]).getDay()] + ' ' + MONTHS[parseInt(dayData[0].slice(5, 7)) - 1].slice(0, 3) + ' ' + dayData[0].slice(8, 10);
    elemLocationDayHeader.classList.add('day-header');
    elemLocationDay.appendChild(elemLocationDayHeader);
    let elemLocationDayEntries = document.createElement('div');
    elemLocationDayEntries.classList.add('location-data-entries');
    elemLocationDay.appendChild(elemLocationDayEntries);
    for (let k = 0; k < 4; k++){
      let elemLocationDayEntry = document.createElement('div');
      elemLocationDayEntry.classList.add('location-data-entry');
      elemLocationDayEntries.appendChild(elemLocationDayEntry);
      let periodData = dayData[1][k];
      let elemLocationDayPeriod = document.createElement('img');
      elemLocationDayPeriod.src = './media/icon_' + PERIODS[k] + '.png';
      elemLocationDayEntry.appendChild(elemLocationDayPeriod);
      let elemLocationDayValue = document.createElement('span');
      elemLocationDayValue.classList.add('value');
      colorTemperature(elemLocationDayValue, periodData[0]);
      let degree = periodData[0] + '°';
      if (periodData[0] > 0){degree = '+' + degree}
      elemLocationDayValue.textContent = degree;
      elemLocationDayEntry.appendChild(elemLocationDayValue);
    }
    list.appendChild(elemLocationDay);
  }
}

function colorTemperature(elem, value){
  let tempValues = Object.keys(TMPR_COLORS).sort(function(a, b) { return b - a; });
  for (let temp of tempValues){
    if (value > temp - 100){
      elem.style.background = TMPR_COLORS[temp];
      return;
    }
  }
  elem.style.background = TMPR_COLORS[0];
}

const popups = document.getElementsByClassName('corner-popups')[0];
for (let popup of popups.children){
  popup.addEventListener('click', (event) => {event.target.classList.add('hidden')});
}

setupPage();
