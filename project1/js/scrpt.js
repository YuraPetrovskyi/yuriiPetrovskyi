// script.js

// import { fetchCountryData } from '../additionaly/countryData.js';
// import { getCountryBorders } from '../additionaly/getCountryBorders.js';
// import { getdAllCountryBorders } from '../additionaly/getAllCountryBorders.js'; // Імпорт нової функції
// import { getCountryCities } from './getCountryCities.js';

import { toggleCountrySearch } from '../features/toggleCountrySearch.js';
import { filterCountryNames } from '../features/filterCountryNames.js';

import { getCountrySpecificBorders } from './getCountrySpecificBorders.js';
import { getCountryList } from './getCountryList.js';
import { setCountryInform } from './setCountryInform.js';

import { getCountryByCoordinates } from './getCountryByCoordinates.js';

import { getWeatherData } from './getWeatherData.js';
import { getCityByBounds } from './getCityByBounds.js';

import { showCurrencyModal } from './showCurrencyModal .js';
import { setCoutryTitle } from './setCoutryTitle.js';

import { getHistoricalPlaces } from './getHistoricalPlaces.js';
import { getIconByTitle } from './getIconByTitle.js';
import { showBootstrapAlert } from './showAlert.js';


// Ініціалізація Leaflet карти
// var map = L.map('map').setView([50, 30], 6);  // Центр на світі, масштаб 2
const map = L.map('map').fitWorld();  // Автоматично масштабувати карту на весь світ
const countryBorderLayerRef = { allCountries: null,  specificCountry: null}; // Для відстеження шару кордонів 



// **************************************************** слої карт **************************************
// Визначення базових шарів
const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);  // Додаємо за замовчуванням

const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    }
);

const baseMaps = {
    "Streets": streets,
    "Satellite": satellite,
};
// Додавання контролю шарів на карту
L.control.layers(baseMaps).addTo(map);

// **************************************************** Робота з DOM **************************************

document.addEventListener("DOMContentLoaded", function() {
    // Викликаємо функцію для заповнення випадаючого списку країн
    console.log("before loadCountryList()");
    getCountryList();
    
});

// **************************************************** Функції для навігаційної панелі **************************************

// Додаємо обробники подій для кнопки вибору і кнопки закриття
document.getElementById('selectCountryButton').addEventListener('click', toggleCountrySearch);
document.getElementById('closeCountrySelect').addEventListener('click', toggleCountrySearch);

// Обробник для вибору країни зі списку
document.getElementById('countrySelect').addEventListener('change', function() {
    const countryName = this.options[this.selectedIndex].text;
    document.getElementById('currentCountry').textContent = countryName;
    toggleCountrySearch();
});

// Пошук по введеному значенню у списку країн
document.getElementById('countrySearchInput').addEventListener('input', function() {
    const name = this.value.toLowerCase();
    const options = document.querySelectorAll('#countrySelect option');
    filterCountryNames(name, options);
});

// Оновлюємо відображення країни і зберігаємо ISO-код у атрибуті data-country-iso
document.getElementById('countrySelect').addEventListener('change', function() {
    // Очищуємо кластерну групу погоди
    weatherMarkers.clearLayers();

    const countryName = this.options[this.selectedIndex].text;
    const isoCode = this.value;

    console.log(countryName, '---', isoCode);
    const currentCountryElement = document.getElementById('currentCountry');
    currentCountryElement.textContent = countryName; // Відображаємо назву країни
    currentCountryElement.setAttribute('data-country-iso', isoCode); // Зберігаємо ISO-код  

    getCountrySpecificBorders(isoCode, map, countryBorderLayerRef);
    setCountryInform(isoCode);

});

// **************************************************** геолокація користувача **************************************
const myLocationMarcker = { current: null }; // Для відстеження користувача
L.easyButton('<img src="images/button/my_location.png" width="20" height="20">', function(btn, map) {
    map.locate({setView: true}); // Знаходимо місцезнаходження і переміщуємо на нього карту
}, 'locate-btn').addTo(map);

// Функція для роботи з геолокацією користувача
map.locate({
    setView: true,
    maxZoom: 6,
    watch: false, // Уникаємо оновлення координат постійно
    enableHighAccuracy: true
});

map.on('locationfound', function(e) {
    console.log("Location found: ", e.latlng);
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    getCountryByCoordinates(lat, lon).then(data => {
        console.log('getCountryByCoordinates data ', data);
        setCoutryTitle(data.countryname, data.countryiso)
        setCountryInform(data.countryiso);
    })
    console.log('myLocationMarcker', myLocationMarcker);
    
    if (myLocationMarcker.current) {
        map.removeLayer(myLocationMarcker.current);
        myLocationMarcker.current = null;
    }
    const myLocation = L.icon({
        iconUrl: 'images/button/my_location.png',  // Шлях до вашої картинки
        iconSize: [32, 32],                  // Розмір іконки
        iconAnchor: [16, 32],                // Точка, де іконка прикріплюється до карти
        popupAnchor: [0, -30]                // Точка, де з'являється попап відносно іконки
    });
    // Додаємо маркер на мапу для місцезнаходження
    myLocationMarcker.current = L.marker(e.latlng, { icon: myLocation }).addTo(map)
        .bindPopup("You are here")
    // Плавно переміщуємо мапу до місця
    // map.flyTo(e.latlng, 14);
    map.setView(e.latlng, 14);
});

map.on('locationerror', function(e) {
    showBootstrapAlert(e.message, 'success');
});

// showBootstrapAlert('This is a centered success message!', 'success', true, 10000);
// **************************************************** кнопка для Sity serch  **************************************
import { searchPlaceByName } from './searchPlaceByName.js';
// Додаємо кнопку пошуку міста
L.easyButton('<img src="images/button/search.png" width="20" height="20">', function() {
    const placeModal = new bootstrap.Modal(document.getElementById('placeSearchModal'));
    placeModal.show(); // Відкриваємо модальне вікно для пошуку міста
}, 'search-place-btn').addTo(map);

document.getElementById('searchPlaceButton').addEventListener('click', function() {
    const placeName = document.getElementById('placeSearchInput').value;
    if (placeName.trim() === '') return; // Перевірка, чи не пусте поле


    searchPlaceByName(placeName).then(data => {
        const placeResultsList = document.getElementById('placeResultsList');
        placeResultsList.innerHTML = ''; // Очищаємо попередні результати
        // Якщо немає результатів
        if (data.length === 0) {
            placeResultsList.innerHTML = '<li class="list-group-item">No results found.</li>';
            return;
        }
        // Виводимо список міст з результатами
        data.forEach(place => {
            const placeItem = document.createElement('li');
            placeItem.classList.add('list-group-item', 'list-group-item-action');
            placeItem.textContent = `${place.name}, ${place.countryName}`;
            placeItem.addEventListener('click', function() {
                setCoutryTitle(place.countryName, place.countryCode)
                setCountryInform(place.countryCode);
                const marker = L.marker([place.lat, place.lng]).addTo(map)
                    .bindPopup(`<b>${place.name}</b><br>Country: ${place.countryName}`);
                const placeModal = bootstrap.Modal.getInstance(document.getElementById('placeSearchModal'));
                map.setView([place.lat, place.lng], 10); // Переміщуємо карту до вибраного міста
                placeModal.hide(); // Закриваємо модальне вікно після вибору
            });
            placeResultsList.appendChild(placeItem);
        });
    })
    .catch(error => console.error('Error fetching cities:', error));
});


// **************************************************** кнопка для модалки Info  **************************************

// Додаємо кнопку на карту для виклику модального вікна
L.easyButton('<img src="images/button/info.png" width="20" height="20">', function() {
    // Викликаємо функцію Bootstrap для відкриття модального вікна
    const countryModal = new bootstrap.Modal(document.getElementById('countryModal'));
    countryModal.show();
}, 'info-btn').addTo(map);

// Викликаємо функцію при натисканні на кнопку  Info
document.querySelector('[title="info-btn"]').addEventListener('click', function() {
    const countryName = document.getElementById('currentCountry').textContent;
    const isoCode = document.getElementById('currentCountry').getAttribute('data-country-iso');

    console.log('you choose country: ', countryName);
    console.log('you choose country: ', isoCode);    
});

// **************************************************** кнопка Валюти **************************************
// <a href="https://www.flaticon.com/free-icons/currency" title="currency icons">Currency icons created by Pixel perfect - Flaticon</a>
L.easyButton('<img src="images/button/exchange.png" width="20" height="20">', function() {
    // Приклад: завантажуємо інформацію для вибраної країни та її валюти
    const countryName = document.getElementById('currentCountry').textContent;
    const currencyCode = document.getElementById('currentCountry').getAttribute('data-curency-code');
    // const currencyCode = 'GBP'; // Приклад коду валюти
    console.log('countryName', countryName)
    console.log('currencyCode', currencyCode)
    console.log('currentCurencyAmount', document.getElementById('currentCurencyAmount').value)
    console.log('baseCurrencyAmount', document.getElementById('baseCurrencyAmount').value)

    document.getElementById('currentCurencyAmount').value = '';
    document.getElementById('baseCurrencyAmount').value = '1';
    // document.getElementById('currencyModalLabel').textContent = `${countryName}`;

    showCurrencyModal(currencyCode);
}, 'currency-btn').addTo(map);

// ****************************************************  Кордони всіх країн **************************************
import { loadAllCountryBorders } from './loadAllCountryBorders.js';  // Нова функція для завантаження кордонів

// Змінна для збереження стану кордонів (шару)
const bordersLayerGroup = L.layerGroup();  // Використовуємо layerGroup для зберігання кордонів

// Завантажуємо всі кордони при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    loadAllCountryBorders(bordersLayerGroup, countryBorderLayerRef);  // Завантажуємо кордони
});

L.easyButton('<img src="images/button/border.png" width="20" height="20">', function() {
    // Якщо шар кордонів всіх країн не активний, додаємо його
    if (!map.hasLayer(bordersLayerGroup)) {
        map.setZoom(6);
        map.addLayer(bordersLayerGroup);  // Додаємо шар з кордонами
        document.getElementById('border-btn').style.backgroundColor = 'green';  // Активуємо зелену кнопку
        document.getElementById('current-border-btn').style.backgroundColor = '';  // Деактивуємо кнопку поточної країни

        // Якщо кордони поточної країни активні, видаляємо їх
        if (countryBorderLayerRef.specificCountry) {
            console.log('remuved countryBorderLayerRef.specificCountry from map');
            map.removeLayer(countryBorderLayerRef.specificCountry);
            countryBorderLayerRef.specificCountry = null;
        }
    } else {
        // Якщо кордони вже активні, приховуємо шар кордонів всіх країн
        map.removeLayer(bordersLayerGroup);
        document.getElementById('border-btn').style.backgroundColor = '';  // Деактивуємо зелену кнопку
    }
}, {
    id: 'border-btn',  // Присвоюємо ID кнопці для доступу
    position: 'topleft'  // Розташування кнопки на карті
}).addTo(map);

// ****************************************************  Кордони поточної країни **************************************
L.easyButton('<img src="images/button/country.png" width="20" height="20">', function() {
    const isoCode = document.getElementById('currentCountry').getAttribute('data-country-iso');
    if (isoCode) {
        // Якщо кордони всіх країн активні, видаляємо їх
        console.log('bordersLayerGroup', bordersLayerGroup);
        console.log('countryBorderLayerRef', countryBorderLayerRef);

        if (map.hasLayer(bordersLayerGroup)) {
            map.removeLayer(bordersLayerGroup);
        }
        // Якщо шар кордонів поточної країни не активний, додаємо його
        if (!countryBorderLayerRef.specificCountry) {
            getCountrySpecificBorders(isoCode, map, countryBorderLayerRef);  // Завантажуємо кордони поточної країни
            
        } else {
            // Якщо кордони поточної країни вже активні, видаляємо шар
            map.removeLayer(countryBorderLayerRef.specificCountry);
            countryBorderLayerRef.specificCountry = null;
            document.getElementById('current-border-btn').style.backgroundColor = '';  // Деактивуємо зелену кнопку
        }
    } else {
        alert('No country selected.');
    }
}, {
    id: 'current-border-btn',  // Присвоюємо ID кнопці для доступу
    position: 'topleft'  // Розташування кнопки на карті
}).addTo(map);

// **************************************************** кнопка Погода **************************************
// Cluster group for weather markers
const weatherMarkers = L.markerClusterGroup({
    maxClusterRadius: 45
});
map.addLayer(weatherMarkers);

L.easyButton('<img src="images/button/weather.png" width="20" height="20">', function () {
    weatherMarkers.clearLayers();

    const bounds = map.getBounds();
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

    const center = bounds.getCenter();
    const zoomLevel = map.getZoom();
    // console.log("zoomLevel:", zoomLevel);

    if (zoomLevel > 14) {
        getWeatherData(center.lat, center.lng, 'none', weatherMarkers);
    } else if (zoomLevel <= 14 && zoomLevel > 10) {
        console.log("zoomLevel:", zoomLevel);
        getCityByBounds(north, south, east, west).then(cities => {
            if (cities.length === 0){
                getWeatherData(center.lat, center.lng, 'none', weatherMarkers);
            }
            cities.forEach(city => {
                getWeatherData(city.lat, city.lng, city.name, weatherMarkers);        
            });
        });
    } else if (zoomLevel <= 10 && zoomLevel > 6) {
        getCityByBounds(north, south, east, west, 'PPL').then(cities => {
            if (cities.length === 0){
                getWeatherData(center.lat, center.lng, 'none', weatherMarkers);
            }           
            cities.forEach(city => {
                if (city.fcode !== "PPL") {
                    getWeatherData(city.lat, city.lng, city.name, weatherMarkers);        
                }
            });
        });
    } else {
        showBootstrapAlert(
            "The map zoom level is too large to retrieve weather data. We have adjusted the zoom level to provide a better view and access to weather information.",
            'info'
        );
        map.setZoom(7);
    }
}).addTo(map);


// **************************************************** Historycal pleaces **************************************
const historicalMarkersCluster = L.markerClusterGroup({
    maxClusterRadius: 20
});
L.easyButton('<img src="images/button/history.png" width="20" height="20">', function() {
    const zoomLevel = map.getZoom(); 

    historicalMarkersCluster.clearLayers(); // Clear previous markers

    const bounds = map.getBounds(); 
    const center = bounds.getCenter();

    getHistoricalPlaces(center.lat, center.lng).then(places => {
        if (places.length === 0) {
            showBootstrapAlert(
                'No historical or tourist places were found in this area. Please try searching in other locations.', 
                'warning');
            return;
        };
        if (zoomLevel < 9) {
            map.setZoom(10);
        };
        places.forEach(place => {            
            const icon = getIconByTitle(place.feature, place.title);
            const marker = L.marker([place.lat, place.lng], { icon: icon })
                .bindPopup(`<b>${place.title}</b><br>${place.summary}<br><a href="https://${place.wikipediaUrl}" target="_blank">wikipedia...</a>`);
            historicalMarkersCluster.addLayer(marker); // Add a marker to the cluster group
        });
        map.addLayer(historicalMarkersCluster); // Add clustered markers to the map
    });
}, 'tourist-btn').addTo(map);

// **************************************************** Airoports  **************************************
import { getAirports } from './getAirports.js';
const airportClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 25
});  

L.easyButton('<img src="images/button/airplane.png" width="20" height="20">', function() {
    const bounds = map.getBounds();
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

    airportClusterGroup.clearLayers();

    const airportIcon = L.icon({
        iconUrl: 'images/airport.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30]
    });

    getAirports(north, south, east, west).then(airports => {
        if (airports.length === 0) {
            showBootstrapAlert(
                'No airports were found in this area. Please try searching in other locations.', 
                'warning');
            return;
        };
        airports.forEach(airport => {
            const wikiName = airport.name.replace(/[\s\W]+/g, '_');
            const marker = L.marker([airport.lat, airport.lng], { icon: airportIcon })
                .bindPopup(`
                    <b>${airport.name}</b><br>
                    Country: ${airport.countryName}<br>
                    Region: ${airport.adminName1}<br>
                    <a href="https://en.wikipedia.org/wiki/${wikiName}" target="_blank">Wikipedia...</a>
                `); 
            airportClusterGroup.addLayer(marker);
        });
        map.addLayer(airportClusterGroup);
    });
}, 'airport-btn').addTo(map);