// script.js

import { fetchCountryData } from '../additionaly/countryData.js';
import { getCountryBorders } from '../additionaly/getCountryBorders.js';

import { toggleCountrySearch } from '../features/toggleCountrySearch.js';
import { filterCountryNames } from '../features/filterCountryNames.js';

import { getCountrySpecificBorders } from './getCountrySpecificBorders.js';
import { getCountryList } from './getCountryList.js';
import { getCountryDetails } from './getCountryDetails.js';
import { getdAllCountryBorders } from './getAllCountryBorders.js'; // Імпорт нової функції
import { getCountryCities } from './getCountryCities.js';
import { setCountryByCoordinates } from './setCountryByCoordinates.js';

import { getWeatherData } from './getWeatherData.js';
import { getCityByBounds } from './getCityByBounds.js';

import { showCurrencyModal } from './showCurrencyModal .js';
// Ініціалізація Leaflet карти
// var map = L.map('map').setView([50, 30], 6);  // Центр на світі, масштаб 2
var map = L.map('map').fitWorld();  // Автоматично масштабувати карту на весь світ

// Приклад: додавання маркеру для вибраної країни
var markerRef = { current: null };
var countryBorderLayerRef = { current: null }; // Для відстеження шару кордонів 
var myLocationMarcker = { current: null }; // Для відстеження користувача
// Кластерна група для маркерів погоди
var weatherMarkers = L.markerClusterGroup();

// var currencyCode = '';

// **************************************************** слої карт **************************************

// Визначення базових шарів
var streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);  // Додаємо за замовчуванням

var satellite = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a>.'
});

// Інший варіант Satellite з Esri
// var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
//     maxZoom: 19,
//     attribution: 'Tiles &copy; Esri'
// });
var satelliteTwo = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    }
);

// Групування базових шарів
var baseMaps = {
    "Streets": streets,
    "Satellite": satellite,
    "SatelliteTwo": satelliteTwo
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

});

// Доступ до ISO-коду в подальшому
const countryISO = document.getElementById('currentCountry').getAttribute('data-country-iso');
console.log('ISO код вибраної країни:', countryISO);

// **************************************************** геолокація користувача **************************************
var myLon;
var myLat;
L.easyButton('fa-location-arrow fa-lg', function(btn, map) {
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
    var lat = e.latlng.lat;
    var lon = e.latlng.lng;
    myLat = e.latlng.lat;
    myLon = e.latlng.lng;
    // Використаємо Reverse Geocoding для отримання країни користувача
    // `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}
    setCountryByCoordinates(lat, lon);
    getCountryDetails(isoCode);
    console.log('myLocationMarcker', myLocationMarcker);
    
    if (myLocationMarcker.current) {
        myLocationMarcker.current = null;
        console.log('myLocationMarcker after cleaning:) - ', myLocationMarcker);
    }
    // Додаємо маркер на мапу для місцезнаходження
    myLocationMarcker.current = L.marker(e.latlng).addTo(map)
        .bindPopup("You are here")
        .openPopup();
    // Плавно переміщуємо мапу до місця
    map.flyTo(e.latlng, 14);
});

map.on('locationerror', function(e) {
    // alert(e.message);
});


// **************************************************** кнопка для модалки Info  **************************************

// // Функція для оновлення інформації про країну, коли змінюється `currentCountry`
// document.getElementById('currentCountry').addEventListener('change', function () {
//     const isoCode = this.getAttribute('data-country-iso');
//     if (isoCode) {
//         getCountryDetails(isoCode);
//     }
// });

// Додаємо кнопку на карту для виклику модального вікна
L.easyButton('fa-info fa-xl', function() {
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
    // getCountryDetails(countryName);
    getCountryDetails(isoCode);


});

// **************************************************** кнопка Кордони всіх країн **************************************

L.easyButton('fa-globe', function() {
    map.setZoom(6);
    getdAllCountryBorders(map, countryBorderLayerRef);  // Викликаємо функцію для завантаження/приховування кордонів
}, 'border-btn').addTo(map);


// **************************************************** кнопка Погода **************************************
L.easyButton('fa-cloud', function () {
    weatherMarkers.clearLayers();

    const bounds = map.getBounds(); // Отримуємо межі карти (bounding box)
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

    const zoomLevel = map.getZoom(); // Отримуємо поточний рівень масштабу
    console.log("zoomLevel:", zoomLevel);
    if (zoomLevel > 14) {
        const center = bounds.getCenter(); // Центр карти
        console.log(center)
        getWeatherData(center.lat, center.lng, 'none', map, weatherMarkers);
    }
    if (zoomLevel <= 14 && zoomLevel > 10) {
        console.log("zoomLevel:", zoomLevel);
        getCityByBounds(north, south, east, west).then(cities => {
            console.log("cities ", cities)
            cities.geonames.forEach(city => {
                getWeatherData(city.lat, city.lng, city.name, map, weatherMarkers);        
            });
        })
    }
    if (zoomLevel <= 10 && zoomLevel > 6) {
        getCityByBounds(north, south, east, west).then(cities => {
            console.log("cities ", cities)            
            cities.geonames.forEach(city => {
                // if (city.population > 10000) {
                //     getWeatherData(city.lat, city.lng, city.name, map, weatherMarkers);        
                // }
                if (city.fcode !== "PPL") {
                    getWeatherData(city.lat, city.lng, city.name, map, weatherMarkers);        
                }
            });
        })
    }
    if (zoomLevel <= 7) {
        map.setZoom(8);
        alert('the map is to big for wather, try aganwith bigger zoom!')
    }

}).addTo(map);
map.addLayer(weatherMarkers);

// **************************************************** кнопка Валюти **************************************

L.easyButton('fa-money-bill', function() {
    // Приклад: завантажуємо інформацію для вибраної країни та її валюти
    const countryName = document.getElementById('currentCountry').textContent;
    const currencyCode = document.getElementById('currentCountry').getAttribute('data-curency-code');

    // const currencyCode = 'GBP'; // Приклад коду валюти
    console.log('countryName', countryName)
    console.log('currencyCode', currencyCode)
    
    // document.getElementById('currencyModalLabel').textContent = `${countryName}`;

    showCurrencyModal(currencyCode);
}, 'currency-btn').addTo(map);


// **************************************************** Функції **************************************

// Функція для скидання карти до початкового стану
// function resetMap() {
//     // Видаляємо маркер і кордони, якщо є
//     if (markerRef.current) {
//         map.removeLayer(markerRef.current);
//         markerRef.current = null;
//     }
//     if (countryBorderLayerRef.current) {
//         map.removeLayer(countryBorderLayerRef.current);
//         countryBorderLayerRef.current = null;
//     }
//     map.setView([20, 0], 2);
// }

// function createGrid(bounds, step) {
//     const sw = bounds.getSouthWest();
//     const ne = bounds.getNorthEast();
//     const grid = [];
    
//     // Створюємо сітку в межах видимої області карти
//     for (let lat = sw.lat; lat < ne.lat; lat += step) {
//         for (let lon = sw.lng; lon < ne.lng; lon += step) {
//             grid.push({ lat, lon });
//         }
//     }
    
//     return grid;
// }
// function createGrid(bounds) {
//     const center = bounds.getCenter(); // Центр карти
//     const radiusLat = (bounds.getNorthEast().lat - bounds.getSouthWest().lat) / 2; // Половина висоти карти
//     const radiusLng = (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 2; // Половина ширини карти
    
//     // Формуємо набір точок: центр та 4 точки по піврадіусу навколо центру
//     const points = [
//         { lat: center.lat, lng: center.lng }, // Центр карти
//         { lat: center.lat, lng: center.lng - radiusLng }, // Зліва від центру
//         { lat: center.lat, lng: center.lng + radiusLng }, // Справа від центру
//         { lat: center.lat + radiusLat, lng: center.lng }, // Зверху від центру
//         { lat: center.lat - radiusLat, lng: center.lng }, // Знизу від центру
//     ];
    
//     return points;
// }




// // Додаємо кнопку для показу погоди на карту
// L.easyButton('fa-cloud', function () {
//     // const isoCode = document.getElementById('countrySelect').value; // Отримуємо ISO-код країни
//     const isoCode = document.getElementById('currentCountry').getAttribute('data-country-iso');
//     console.log('isoCode: ', isoCode);

//     // Очищуємо кластерну групу погоди перед додаванням нових маркерів
//     weatherMarkers.clearLayers();
    
//     getCountryCities(isoCode).then(cities => {
//         cities.forEach(city => {            
//             getWeatherData(city.lat, city.lng, city.name, map, weatherMarkers);
//         })
//     }) // Отримуємо найбільші міста та показуємо погоду
    
// }).addTo(map);
// // Додаємо кластерну групу до карти


// Формуємо bbox (межі області)
    // const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat},10`;  // bbox формат: ліво, низ, право, верх
    // console.log("Current bbox:", bbox);

    // Робимо запит на отримання погоди для міст у цій області через PHP
    // fetch(`php/getWeatherByBbox.php?bbox=${bbox}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log("Weather data in bbox: ", data);
    //         // Для кожного міста додаємо погоду на мапу
    //         data.list.forEach(city => {
    //             const lat = city.coord.Lat;
    //             const lon = city.coord.Lon;
    //             const name = city.name;
    //             console.log('lat', lat);
    //             console.log('lon', lon);
    //             console.log('name', name);
    //             // Отримуємо погоду для кожного міста і додаємо маркер на мапу
    //             getWeatherData(lat, lon, name, map, weatherMarkers);
    //         });
    //     })
    //     .catch(error => {
    //         console.error('Error fetching weather data in bbox:', error);
    //     });