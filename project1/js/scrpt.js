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
// Ініціалізація Leaflet карти
// var map = L.map('map').setView([50, 30], 6);  // Центр на світі, масштаб 2
var map = L.map('map').fitWorld();  // Автоматично масштабувати карту на весь світ

// Приклад: додавання маркеру для вибраної країни
var markerRef = { current: null };
var countryBorderLayerRef = { current: null }; // Для відстеження шару кордонів 


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
// Функція для роботи з геолокацією користувача
map.locate({
    setView: true,
    maxZoom: 16,
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

    // Додаємо маркер на мапу для місцезнаходження
    L.marker(e.latlng).addTo(map)
        .bindPopup("You are here")
        .openPopup();
});

map.on('locationerror', function(e) {
    // alert(e.message);
});


// **************************************************** дадавання модалки Info  **************************************

// Додаємо кнопку на карту для виклику модального вікна
L.easyButton('fa-info fa-xl', function() {
    // Викликаємо функцію Bootstrap для відкриття модального вікна
    const countryModal = new bootstrap.Modal(document.getElementById('countryModal'));
    countryModal.show();
}).addTo(map);

// **************************************************** відображення кордонів країн **************************************

L.easyButton('fa-globe', function() {
    getdAllCountryBorders(map);  // Викликаємо функцію для завантаження/приховування кордонів
}).addTo(map);


// **************************************************** Робота з DOM **************************************

document.addEventListener("DOMContentLoaded", function() {
    // Викликаємо функцію для заповнення випадаючого списку країн
    console.log("before loadCountryList()");
    getCountryList();
    
});

// Викликаємо функцію при натисканні на кнопку  Info
document.querySelector('.easy-button-button').addEventListener('click', function() {
    // const countryName = document.getElementById('currentCountry').options[document.getElementById('countrySelect').selectedIndex].text;
    const countryName = document.getElementById('currentCountry').textContent;
    console.log('you choose country: ', countryName);    
    getCountryDetails(countryName);
});


// // **************************************************** погода **************************************

// // Кластерна група для маркерів погоди
// var weatherMarkers = L.markerClusterGroup();
// // Масив для збереження маркерів погоди
// // let weatherMarkers = [];
// // Додаємо кнопку для показу погоди на карту
// L.easyButton('fa-cloud', function () {
//     const isoCode = document.getElementById('countrySelect').value; // Отримуємо ISO-код країни
//     console.log('isoCode: ', isoCode);

//     // Очищуємо старі маркери погоди
//     // clearWeatherMarkers();

//     // Очищуємо кластерну групу перед додаванням нових маркерів
//     weatherMarkers.clearLayers();
    
//     getCountryCities(isoCode); // Отримуємо найбільші міста та показуємо погоду
// }).addTo(map);

// // Функція для очищення старих маркерів погоди з карти
// // function clearWeatherMarkers() {
// //     weatherMarkers.forEach(marker => map.removeLayer(marker));  // Видаляємо всі старі маркери
// //     weatherMarkers = [];  // Очищуємо масив після видалення маркерів
// // }

// // Функція для запиту до GeoNames API для отримання найбільших міст країни
// function getCountryCities(isoCode) {
//     fetch(`php/getCountryCities.php?iso=${isoCode}`)
//         .then(response => response.json())
//         .then(data => {
//             console.log("Cities: ", data);
//             data.forEach(city => {
//                 // Отримуємо погоду для кожного міста
//                 getWeatherData(city.lat, city.lng, city.name);
//             });
//         })
//         .catch(error => {
//             console.error('Error fetching cities:', error);
//         });
// }

// // Функція для запиту до OpenWeather API через getWeather.php
// function getWeatherData(lat, lon, locationName) {
//     fetch(`php/getWeather.php?lat=${lat}&lon=${lon}`)
//         .then(response => response.json())
//         .then(data => {
//             console.log('weather data: ', data);
//             const temp = data.main.temp;
//             const weatherDescription = data.weather[0].description;
//             const iconCode = data.weather[0].icon;

//             // URL для іконки погоди
//             const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

//             // Створюємо кастомну іконку з використанням класів Bootstrap
//             const weatherIcon = L.divIcon({
//                 className: '',  // Не потрібно окремого класу
//                 html: `
//                     <div class="text-center p-1  rounded shadow-sm">
//                         <img src="${iconUrl}" class="img-fluid" alt="Weather icon" style="width: 50px; height: 50px;" />
//                         <div class="fw-bold text-primary">${temp}°C</div>
//                     </div>
//                 `,
//                 iconSize: [60, 60], // Загальний розмір іконки
//                 iconAnchor: [30, 30] // Точка, де іконка "кріпиться" на карті
//             });

//             // Додаємо маркер з кастомною іконкою
//             const marker = L.marker([lat, lon], { icon: weatherIcon }).addTo(map);

//             marker.bindPopup(`<b>${locationName}</b><br>Temperature: ${temp}°C<br>Weather: ${weatherDescription}`);
            
//             // Додаємо маркер до масиву для подальшого очищення
//             weatherMarkers.addLayer(marker);
//         })
//         .catch(error => {
//             console.error('Error fetching weather data:', error);
//         });
// }

// // Додаємо кластерну групу до карти
// map.addLayer(weatherMarkers);




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
