// ========== VARIABLES ==========
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
};
const NDAYS = 3; // сегодня + 2 дня

let mapLocations = {
  'москва': [55.763263, 37.613748],
  'санкт-петербург': [59.938886, 30.313838],
  'нью-йорк': [40.7128, -74.0060],
  'лондон': [51.5074, -0.1278],
  'париж': [48.8566, 2.3522],
  'токио': [35.6895, 139.6917],
  'берлин': [52.5200, 13.4050],
  'пекин': [39.9042, 116.4074]
};

let locations = []; // массив дополнительных городов
let curr_location = null; // текущее местоположение

// DOM элементы
const weatherDisplay = document.getElementById('weatherDisplay');
const citySelect = document.getElementById('citySelect');
const refreshBtn = document.getElementById('refreshBtn');
const cityInput = document.getElementById('cityInput');
const addCityBtn = document.getElementById('addCityBtn');
const validationMessage = document.getElementById('validationMessage');
const cityChips = document.getElementById('cityChips');
const globalMessage = document.getElementById('globalMessage');

// ========== HELPERS ==========
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function round(number, precision = 1) {
  return Math.round(number * Math.pow(10, precision)) / Math.pow(10, precision);
}

function capitalize(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function getListedPlaces() {
  let places = [];
  if (curr_location) places.push(curr_location.place.toLowerCase());
  for (let loc of locations) {
    places.push(loc.place.toLowerCase());
  }
  return places;
}

// ========== LOCALSTORAGE ==========
function saveToLocalStorage() {
  const data = {
    curr_location: curr_location ? {
      place: curr_location.place,
      latitude: curr_location.latitude,
      longitude: curr_location.longitude,
      isUserLocation: curr_location.isUserLocation || false
    } : null,
    locations: locations.map(l => ({
      place: l.place,
      latitude: l.latitude,
      longitude: l.longitude
    }))
  };
  localStorage.setItem('weatherAppData', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('weatherAppData');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.curr_location) {
        curr_location = {
          ...data.curr_location,
          weather: null
        };
      }
      if (data.locations) {
        locations = data.locations.map(l => ({ ...l, weather: null }));
      }
      return true;
    } catch (e) {
      console.error('Error loading from localStorage', e);
    }
  }
  return false;
}

// ========== GEOLOCATION ==========
function requestGeolocation() {
  if (!navigator.geolocation) {
    showManualLocationForm();
    return;
  }
  
  globalMessage.innerHTML = '<div class="loading"><div class="spinner"></div> Запрашиваем геопозицию...</div>';
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      curr_location = {
        place: 'Текущее местоположение',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        isUserLocation: true,
        weather: null
      };
      
      await refreshWeatherData();
      updateUI();
      saveToLocalStorage();
      globalMessage.innerHTML = '';
    },
    (error) => {
      globalMessage.innerHTML = '<div class="error-message">📍 Доступ к геолокации отклонён. Введите город вручную.</div>';
      showManualLocationForm();
    }
  );
}

function showManualLocationForm() {
  if (!curr_location) {
    curr_location = {
      place: 'Нью-Йорк',
      latitude: 40.7128,
      longitude: -74.0060,
      isUserLocation: false,
      weather: null
    };
  }
  refreshWeatherData().then(() => {
    updateUI();
    saveToLocalStorage();
  });
}

// ========== WEATHER API ==========
async function getWeather(latitude, longitude) {
  const apiURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&timezone=auto`;
  try {
    let response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    let data = await response.json();
    return parseWeatherData(data);
  } catch (error) {
    console.error(error.message);
    return -1;
  }
}

function parseWeatherData(data) {
  let days = [];
  let temperatures = data.hourly.temperature_2m;
  for (let i = 0; i < 7; i++) {
    let periods = [];
    for (let k = 0; k < 4; k++) {
      let avgTemp = 0;
      let minTemp = 1000;
      let maxTemp = -1000;
      for (let j = 24 * i + (6 * k); j < 24 * i + (6 * (k + 1)); j++) {
        if (j >= temperatures.length) break;
        let roundTemp = round(temperatures[j], 1);
        avgTemp += roundTemp;
        if (roundTemp < minTemp) minTemp = roundTemp;
        if (roundTemp > maxTemp) maxTemp = roundTemp;
      }
      avgTemp = round(avgTemp / 6, 1);
      periods.push([avgTemp, minTemp, maxTemp]);
    }
    days.push([data.hourly.time[i * 24], periods]);
  }
  return days;
}

async function refreshWeatherData() {
  globalMessage.innerHTML = '<div class="loading"><div class="spinner"></div> Обновляем данные...</div>';
  
  if (curr_location) {
    let result = await getWeather(curr_location.latitude, curr_location.longitude);
    curr_location.weather = (result === -1) ? null : result;
    await sleep(100);
  }
  
  for (let i = 0; i < locations.length; i++) {
    let result = await getWeather(locations[i].latitude, locations[i].longitude);
    locations[i].weather = (result === -1) ? null : result;
    await sleep(100);
  }
  
  globalMessage.innerHTML = '';
  saveToLocalStorage();
  updateUI();
}

// ========== UI RENDERING ==========
function updateUI() {
  // Обновляем селект
  let options = '';
  if (curr_location) {
    options += `<option value="current">${curr_location.isUserLocation ? '📍 Текущее местоположение' : curr_location.place}</option>`;
  }
  for (let i = 0; i < locations.length; i++) {
    options += `<option value="loc-${i}">${locations[i].place}</option>`;
  }
  citySelect.innerHTML = options;
  
  // Показываем погоду для выбранного города
  renderSelectedWeather();
  
  // Обновляем чипы городов
  updateCityChips();
}

function renderSelectedWeather() {
  const selected = citySelect.value;
  let weatherData = null;
  let locationName = '';
  let isUserLocation = false;
  
  if (selected === 'current' && curr_location) {
    weatherData = curr_location.weather;
    locationName = curr_location.place;
    isUserLocation = curr_location.isUserLocation;
  } else if (selected && selected.startsWith('loc-')) {
    const index = parseInt(selected.split('-')[1]);
    if (locations[index]) {
      weatherData = locations[index].weather;
      locationName = locations[index].place;
    }
  }
  
  if (!weatherData) {
    weatherDisplay.innerHTML = '<div class="error-message">Нет данных о погоде</div>';
    return;
  }
  
  // Берём данные для сегодняшнего дня
  const today = weatherData[0];
  const todayPeriods = today[1];
  const currentHour = new Date().getHours();
  const periodIndex = Math.floor(currentHour / 6);
  const currentTemp = todayPeriods[periodIndex][0];
  
  // Формируем HTML
  let html = `
    <div class="current-weather-card">
      <div class="location-badge">${isUserLocation ? '📍 ТЕКУЩЕЕ МЕСТОПОЛОЖЕНИЕ' : '🌍 ' + locationName}</div>
      <div class="temp-row">
        <div class="big-temp">${currentTemp}°<sup>C</sup></div>
        <div class="weather-condition">
          <div class="condition-text">${currentTemp > 10 ? 'Облачно' : 'Дождь'}</div>
          <div class="rain-chance">🌧️ ${currentTemp > 12 ? 10 : 40}%</div>
        </div>
      </div>
      <div class="highlights-grid">
        <div class="highlight-item"><span class="label">UV индекс</span><div class="value">${Math.floor(Math.random() * 7) + 1}</div></div>
        <div class="highlight-item"><span class="label">Ветер</span><div class="value">${(3 + Math.random() * 8).toFixed(1)} км/ч</div><div>WSW</div></div>
        <div class="highlight-item"><span class="label">Восход/закат</span><div class="sun-times"><span>🌅 6:35 AM</span><span>🌇 5:42 PM</span></div></div>
        <div class="highlight-item"><span class="label">Влажность</span><div class="value">${40 + Math.floor(Math.random() * 35)}%</div></div>
        <div class="highlight-item"><span class="label">Видимость</span><div class="value">${(4 + Math.random() * 8).toFixed(1)} км</div></div>
        <div class="highlight-item"><span class="label">Кач. воздуха</span><div class="value">${50 + Math.floor(Math.random() * 70)}</div><div>Среднее</div></div>
      </div>
    </div>
    <div class="forecast-days">
  `;
  
  // Прогноз на 3 дня
  for (let i = 0; i < Math.min(3, weatherData.length); i++) {
    const day = weatherData[i];
    const date = new Date(day[0]);
    const dayName = i === 0 ? 'Сегодня' : WEEKDAYS[date.getDay()];
    const dayPeriods = day[1];
    const maxTemp = Math.max(...dayPeriods.map(p => p[2]));
    const minTemp = Math.min(...dayPeriods.map(p => p[1]));
    
    html += `
      <div class="day-card">
        <div class="day-name">${dayName}</div>
        <div class="date">${date.getDate()} ${MONTHS[date.getMonth()].slice(0,3)}</div>
        <div class="temp-range">${Math.round(maxTemp)}° / ${Math.round(minTemp)}°</div>
        <div class="weather-icon">${maxTemp > 10 ? '☁️' : '🌧️'}</div>
      </div>
    `;
  }
  
  html += '</div>';
  weatherDisplay.innerHTML = html;
}

function updateCityChips() {
  let chips = '';
  for (let i = 0; i < locations.length; i++) {
    chips += `
      <div class="city-chip">
        <span>${locations[i].place}</span>
        <button class="remove-btn" data-index="${i}">✕</button>
      </div>
    `;
  }
  cityChips.innerHTML = chips;
  
  // Добавляем обработчики удаления
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      removeCity(index);
    });
  });
}

// ========== CITY MANAGEMENT ==========
function addCity() {
  const cityName = cityInput.value.trim();
  if (!cityName) {
    validationMessage.textContent = 'Введите название города';
    return;
  }
  
  const normalized = cityName.toLowerCase();
  
  if (!mapLocations[normalized]) {
    validationMessage.textContent = `Город "${cityName}" не найден. Доступны: Москва, Нью-Йорк, Лондон...`;
    return;
  }
  
  if (getListedPlaces().includes(normalized)) {
    validationMessage.textContent = `Город "${cityName}" уже добавлен`;
    return;
  }
  
  const newCity = {
    place: cityName,
    latitude: mapLocations[normalized][0],
    longitude: mapLocations[normalized][1],
    weather: null
  };
  
  locations.unshift(newCity);
  cityInput.value = '';
  validationMessage.textContent = '';
  
  refreshWeatherData().then(() => {
    updateUI();
    saveToLocalStorage();
  });
}

function removeCity(index) {
  if (index >= 0 && index < locations.length) {
    locations.splice(index, 1);
    updateUI();
    saveToLocalStorage();
  }
}

// ========== EVENT LISTENERS ==========
refreshBtn.addEventListener('click', refreshWeatherData);
addCityBtn.addEventListener('click', addCity);
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addCity();
});
citySelect.addEventListener('change', renderSelectedWeather);

// ========== INITIALIZATION ==========
function init() {
  if (!loadFromLocalStorage()) {
    requestGeolocation();
  } else {
    refreshWeatherData().then(() => {
      updateUI();
    });
  }
}

init();
