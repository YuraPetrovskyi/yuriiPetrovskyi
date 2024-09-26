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
// Ініціалізація Leaflet карти
// var map = L.map('map').setView([50, 30], 6);  // Центр на світі, масштаб 2
var map = L.map('map').fitWorld();  // Автоматично масштабувати карту на весь світ

// Приклад: додавання маркеру для вибраної країни
var markerRef = { current: null };
var countryBorderLayerRef = { current: null }; // Для відстеження шару кордонів 
var myLocationMarcker = { current: null }; // Для відстеження користувача
// Кластерна група для маркерів погоди
var weatherMarkers = L.markerClusterGroup();

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
    // Використаємо Reverse Geocoding для отримання країни користувача
    // `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}
    setCountryByCoordinates(lat, lon)
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
    map.flyTo(e.latlng, 16);
});

map.on('locationerror', function(e) {
    // alert(e.message);
});


// **************************************************** кнопка для модалки Info  **************************************

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
    getdAllCountryBorders(map, countryBorderLayerRef);  // Викликаємо функцію для завантаження/приховування кордонів
}, 'border-btn').addTo(map);


// **************************************************** кнопка Погода **************************************

// Додаємо кнопку для показу погоди на карту
L.easyButton('fa-cloud', function () {
    // const isoCode = document.getElementById('countrySelect').value; // Отримуємо ISO-код країни
    const isoCode = document.getElementById('currentCountry').getAttribute('data-country-iso');
    console.log('isoCode: ', isoCode);

    // Очищуємо кластерну групу погоди перед додаванням нових маркерів
    weatherMarkers.clearLayers();
    
    getCountryCities(isoCode).then(cities => {
        cities.forEach(city => {            
            getWeatherData(city.lat, city.lng, city.name, map, weatherMarkers);
        })
    }) // Отримуємо найбільші міста та показуємо погоду
    
}).addTo(map);
// Додаємо кластерну групу до карти
map.addLayer(weatherMarkers);

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

