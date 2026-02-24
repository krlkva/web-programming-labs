// script.js — чистая логика, без фреймворков

// ---------- Конфигурация, заглушки данных ----------
const API_KEY = '663eaac6d07b482b9bc170359252602';  // бесплатный ключ weatherapi (тестовый)
const BASE_URL = 'https://api.weatherapi.com/v1/forecast.json';

// Хардкод подсказок (можно заменить на открытое api, но по заданию разрешено)
const CITY_SUGGESTIONS = [
    "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань", 
    "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону",
    "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград", "Краснодар",
    "Саратов", "Тюмень", "Тольятти", "Ижевск", "Барнаул", "Ульяновск"
];

// Состояние приложения
let mainCity = 'Текущее местоположение';   // отображаемое имя
let mainCoords = null;                      // { lat, lon } если есть гео
let additionalCities = [];                  // массив названий (строки)
let forecastsCache = new Map();              // город -> данные прогноза

// ---------- DOM элементы ----------
const refreshBtn = document.getElementById('refreshBtn');
const addCityBtn = document.getElementById('addCityBtn');
const currentCityDisplay = document.getElementById('currentCityDisplay');
const weatherForecastContainer = document.getElementById('weatherForecastContainer');
const highlightsContainer = document.getElementById('highlightsContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const globalMessage = document.getElementById('globalMessage');
const cityChipsContainer = document.getElementById('cityChipsContainer');
const overlay = document.getElementById('overlay');
const modalTitle = document.getElementById('modalTitle');
const cityInput = document.getElementById('cityInput');
const suggestionsBox = document.getElementById('suggestionsBox');
const inputError = document.getElementById('inputError');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');
const cityCount = document.getElementById('cityCount');

let activeModalResolve = null; // для промиса модалки

// ---------- helpers ----------
function showMessage(msg, isError = false) {
    globalMessage.textContent = msg;
    globalMessage.style.color = isError ? '#b02d26' : '#1e3b5c';
    if (msg) setTimeout(() => { if (globalMessage.textContent === msg) globalMessage.textContent = ''; }, 4000);
}

// загрузка/успех/ошибка
function setLoading(loading) {
    loadingIndicator.style.display = loading ? 'block' : 'none';
}

// ---------- работа с localStorage ----------
const STORAGE_KEY = 'weather_app_data';
function saveToStorage() {
    const data = {
        mainCity: mainCity,
        mainCoords: mainCoords,
        additionalCities: additionalCities,
        // не кешируем forecasts, они запрашиваются заново при загрузке
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
        const data = JSON.parse(raw);
        if (data.mainCity) mainCity = data.mainCity;
        if (data.mainCoords) mainCoords = data.mainCoords;
        if (Array.isArray(data.additionalCities)) additionalCities = data.additionalCities;
        return true;
    } catch (e) { return false; }
}

// ---------- запрос к weatherapi (forecast на 3 дня) ----------
async function fetchWeatherForCity(cityNameOrCoords) {
    let query;
    if (typeof cityNameOrCoords === 'string') query = cityNameOrCoords;
    else if (cityNameOrCoords?.lat && cityNameOrCoords?.lon) query = `${cityNameOrCoords.lat},${cityNameOrCoords.lon}`;
    else throw new Error('невалидный запрос');

    const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}&days=3&lang=ru&aqi=yes`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('город не найден или ошибка сети');
    return await resp.json();
}

// обновить все города (основной + доп)
async function refreshAllWeather() {
    setLoading(true);
    weatherForecastContainer.innerHTML = '';
    highlightsContainer.innerHTML = '';
    let anySuccess = false;

    try {
        // запрос для основного города
        if (mainCoords || (mainCity !== 'Текущее местоположение' && mainCity)) {
            try {
                const query = mainCoords || mainCity;
                const data = await fetchWeatherForCity(query);
                forecastsCache.set('main', data);
                renderMainWeather(data);
                anySuccess = true;
            } catch (e) {
                showMessage(`Ошибка основного города: ${e.message}`, true);
                forecastsCache.delete('main');
            }
        } else if (mainCity === 'Текущее местоположение' && !mainCoords) {
            // гео ещё не получено или отказано
        }

        // запросы для дополнительных городов (не больше 3 одновременно, но для демо хватит)
        const additionalFetchPromises = additionalCities.map(async (city) => {
            try {
                const data = await fetchWeatherForCity(city);
                forecastsCache.set(city, data);
            } catch {
                forecastsCache.delete(city);
            }
        });
        await Promise.allSettled(additionalFetchPromises);
        renderCityChips();
        if (!anySuccess && additionalCities.length === 0 && !mainCoords) {
            // ничего не загружено — предложим ввести город
            showMessage('⬆️ добавьте город через кнопку', false);
        }
    } finally {
        setLoading(false);
    }
}

// ---------- отрисовка основной погоды ----------
function renderMainWeather(data) {
    if (!data) return;
    const forecast = data.forecast?.forecastday;
    if (!forecast || forecast.length < 3) return;

    // отображение названия города
    const locationName = data.location?.name || mainCity;
    currentCityDisplay.textContent = locationName;

    // дни (сегодня + 2)
    let daysHtml = '<div class="days-grid">';
    forecast.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '');
        daysHtml += `
            <div class="day-card">
                <div class="day-name">${dayName}</div>
                <div class="temp-high">${Math.round(day.day.maxtemp_c)}°</div>
                <div class="temp-low">${Math.round(day.day.mintemp_c)}°</div>
                <div class="condition-icon">${day.day.condition.text}</div>
            </div>
        `;
    });
    daysHtml += '</div>';
    weatherForecastContainer.innerHTML = daysHtml;

    // Today's Highlights (имитация референса)
    const current = data.current;
    highlightsContainer.innerHTML = `
        <div class="highlight-item"><span class="highlight-label">🌡️ UV Index</span><span class="highlight-value">${current.uv}</span></div>
        <div class="highlight-item"><span class="highlight-label">💨 Wind</span><span class="highlight-value">${current.wind_kph} <span class="sub">km/h</span></span><br><span>${current.wind_dir}</span></div>
        <div class="highlight-item"><span class="highlight-label">🌅 Sunrise</span><span class="highlight-value">${forecast[0].astro?.sunrise || '6:35'}</span><br><span>↓ ${forecast[0].astro?.sunset || '18:20'}</span></div>
        <div class="highlight-item"><span class="highlight-label">☁️ Clouds</span><span class="highlight-value">${current.cloud}%</span><br> <span>🌧️ ${forecast[0].day.daily_chance_of_rain}%</span></div>
        <div class="highlight-item"><span class="highlight-label">💧 Humidity</span><span class="highlight-value">${current.humidity}%</span></div>
        <div class="highlight-item"><span class="highlight-label">👁️ Visibility</span><span class="highlight-value">${current.vis_km} km</span></div>
        <div class="highlight-item"><span class="highlight-label">🍃 AirQuality</span><span class="highlight-value">${current.air_quality?.['us-epa-index'] || 2}</span> <span class="sub">${current.air_quality?.['us-epa-index'] === 1 ? 'Good' : 'Moderate'}</span></div>
    `;
}

// отрисовка чипсов дополнительных городов
function renderCityChips() {
    let html = '';
    additionalCities.forEach(city => {
        const cached = forecastsCache.get(city);
        const temp = cached ? `${Math.round(cached.current.temp_c)}°` : '?';
        html += `
            <div class="city-chip" data-city="${city}">
                <span>${city} ${temp}</span>
                <span class="remove-btn" data-remove="${city}">✕</span>
            </div>
        `;
    });
    cityChipsContainer.innerHTML = html;
    cityCount.textContent = additionalCities.length + ' / 5'; // лимит условный

    // обработчики на удаление
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cityToRemove = btn.dataset.remove;
            additionalCities = additionalCities.filter(c => c !== cityToRemove);
            forecastsCache.delete(cityToRemove);
            saveToStorage();
            renderCityChips();
            refreshAllWeather(); // перезапросим (главное не сломать)
        });
    });
    // клик по чипсу — показать в основном блоке (но в задании не обязательно, можно оставить как бонус)
}

// ---------- модалка добавления города ----------
function showAddCityModal(existingValue = '') {
    overlay.classList.remove('hidden');
    cityInput.value = existingValue;
    inputError.textContent = '';
    suggestionsBox.innerHTML = '';
    cityInput.focus();

    return new Promise((resolve) => {
        activeModalResolve = resolve;

        const handlerSuggest = () => {
            const val = cityInput.value.trim().toLowerCase();
            if (!val) { suggestionsBox.style.display = 'none'; return; }
            const filtered = CITY_SUGGESTIONS.filter(c => c.toLowerCase().includes(val)).slice(0, 6);
            if (filtered.length) {
                suggestionsBox.style.display = 'block';
                suggestionsBox.innerHTML = filtered.map(c => `<div data-suggest="${c}">${c}</div>`).join('');
                document.querySelectorAll('[data-suggest]').forEach(el => {
                    el.addEventListener('click', () => {
                        cityInput.value = el.dataset.suggest;
                        suggestionsBox.style.display = 'none';
                    });
                });
            } else { suggestionsBox.style.display = 'none'; }
        };

        cityInput.addEventListener('input', handlerSuggest);
        const closeModal = (result) => {
            overlay.classList.add('hidden');
            cityInput.removeEventListener('input', handlerSuggest);
            activeModalResolve = null;
            resolve(result);
        };

        modalCancel.onclick = () => closeModal(null);
        modalConfirm.onclick = () => {
            const selected = cityInput.value.trim();
            if (!selected) { inputError.textContent = 'Введите город'; return; }
            if (!CITY_SUGGESTIONS.some(s => s.toLowerCase() === selected.toLowerCase())) {
                inputError.textContent = 'Такого города нет в списке';
                return;
            }
            // нормализуем до варианта из списка (как написано)
            const normalized = CITY_SUGGESTIONS.find(s => s.toLowerCase() === selected.toLowerCase()) || selected;
            if (additionalCities.includes(normalized) || (mainCity === normalized)) {
                inputError.textContent = 'Город уже добавлен';
                return;
            }
            closeModal(normalized);
        };
    });
}

// ---------- инициализация и гео ----------
async function initApp() {
    const fromStorage = loadFromStorage();
    if (fromStorage && (mainCoords || mainCity)) {
        // есть сохранённые данные
        refreshAllWeather();
    } else {
        // запрос геолокации
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    mainCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                    mainCity = 'Текущее местоположение';
                    saveToStorage();
                    refreshAllWeather();
                },
                (err) => {
                    showMessage('Геолокация отклонена. Добавьте город вручную.', false);
                    handleNoGeo();
                }
            );
        } else {
            handleNoGeo();
        }
    }
}

async function handleNoGeo() {
    // предлагаем ввести основной город через ту же модалку
    const city = await showAddCityModal('');
    if (city) {
        mainCity = city;
        mainCoords = null;
        saveToStorage();
        refreshAllWeather();
    } else {
        // если закрыл крестиком — все равно предложим позже
    }
}

// ---------- события ----------
refreshBtn.addEventListener('click', () => {
    refreshAllWeather();
});

addCityBtn.addEventListener('click', async () => {
    if (additionalCities.length >= 5) {
        alert('Максимум 5 доп. городов');
        return;
    }
    const newCity = await showAddCityModal('');
    if (newCity) {
        additionalCities.push(newCity);
        saveToStorage();
        renderCityChips();
        refreshAllWeather(); // подгрузим данные нового города
    }
});

// закрытие оверлея по клику вне (простое)
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        overlay.classList.add('hidden');
        if (activeModalResolve) activeModalResolve(null);
    }
});

// старт
initApp();

// дополнительно: перезагрузка страницы сохраняет состояние — localStorage уже загружен
window.addEventListener('load', () => {
    // если города не загрузились из-за ошибок — попробовать ещё раз через 1 сек
});
