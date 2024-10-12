// script.js

// import { toggleCountrySearch } from '../features/toggleCountrySearch.js';
// import { filterCountryNames } from '../features/filterCountryNames.js';
// import { getCountryByCoordinates } from './getCountryByCoordinates.js';
// import { setCoutryTitle } from './setCoutryTitle.js';
// import { getAirports } from './getAirports.js';



// import { getCountrySpecificBorders } from './getCountrySpecificBorders.js';
import { getCountryList } from './getCountryList.js';
import { setCountryInform } from './setCountryInform.js';


// import { getWeatherData } from './getWeatherData.js';
import { getCityByBounds } from './getCityByBounds.js';

import { getCurrencyData } from './getCurrencyData.js';

import { getHistoricalPlaces } from './getHistoricalPlaces.js';
import { getIconByTitle } from './getIconByTitle.js';
import { showBootstrapAlert } from './showAlert.js';

import { searchPlaceByName } from './searchPlaceByName.js';
import { setCurrencyData } from './setCurrencyData.js';

import { setCountriesList } from './setCountriesList.js';

// import { loadAllCountryBorders } from './loadAllCountryBorders.js';

// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

// var map = L.map('map').fitWorld();
var map, layerControl;
var map, layerControl;
var bordersLayerGroup = L.layerGroup();  // to store borders
var airportClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 25
});
var cityMarkersCluster = L.markerClusterGroup({
    maxClusterRadius: 50
});
var adminCityClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 25
}); 
// var weatherMarkers = L.markerClusterGroup({
//     maxClusterRadius: 45
// });  // Cluster group for weather markers
var historicalMarkersCluster = L.markerClusterGroup({
    maxClusterRadius: 20
});  // Cluster group for historical places

// tile layers
var streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}); 

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    }
);

var baseMaps = {
    "Streets": streets,
    "Satellite": satellite,
};

var myLocationMarcker = { current: null };
var countryBorderLayerRef = { allCountries: null,  specificCountry: null}; 
var activeCoordinates = { lat: null, lon: null };

var overlayMaps = {    
    "All Borders": bordersLayerGroup,
    "Airports": airportClusterGroup,
    "Administrative Cities": adminCityClusterGroup,
    "Cities": cityMarkersCluster,
    "Historical Places": historicalMarkersCluster,
};

// buttons

// User location
var locationBtn = L.easyButton('<img src="images/button/my_location.png" width="20" height="20">', function(btn, map) {
    map.locate({setView: true}); // find the location and move the map to it
}, 'locate-btn');

// Place serch
var searchBtn = L.easyButton('<img src="images/button/search.png" width="20" height="20">', function() {
    // modal window for city search
    const placeModal = new bootstrap.Modal(document.getElementById('placeSearchModal'));
    placeModal.show();
}, 'search-place-btn');

// Info modal  
var infoBtn = L.easyButton('<img src="images/button/info.png" width="20" height="20">', function() {
    // call the Bootstrap function to open a modal window
    const countryModal = new bootstrap.Modal(document.getElementById('countryModal'));
    countryModal.show();
}, 'info-btn');

// Curency modal
var currencyBtn = L.easyButton('<img src="images/button/exchange.png" width="20" height="20">', function() {
    const currencyCode = $('#curenCurrencyCodeConverter').text();
    console.log('currencyCode', currencyCode);
    document.getElementById('currentCurencyAmount').value = '';
    document.getElementById('baseCurrencyAmount').value = '1';
    
    getCurrencyData(currencyCode)
        .then(data => {
            // console.log('data', data)
            setCurrencyData(data, currencyCode);
        })
        .catch(error => {
            console.error('Error fetching currency:', error)
        })

    const currencyModal = new bootstrap.Modal(document.getElementById('currencyModal'));
    currencyModal.show();// open model window
}, 'currency-btn');

var weatherModalBtn = L.easyButton('<img src="images/button/weather.png" width="20" height="20">', function() {
    // Оновлюємо модальне вікно погодою на основі активних координат
    if (activeCoordinates.lat && activeCoordinates.lon) {
        getWeatherData(activeCoordinates.lat, activeCoordinates.lon, '');
    } else {
        showBootstrapAlert('Sorry, the location is not defined.', 'danger');
    }
    const weatherModal = new bootstrap.Modal(document.getElementById('weatherModal'));
    weatherModal.show();
}, 'weather-modal-btn');

// Historycal places
var histotyBtn = L.easyButton('<img src="images/button/history.png" width="20" height="20">', function() {
    const zoomLevel = map.getZoom(); 

    historicalMarkersCluster.clearLayers(); // Clear previous markers

    const bounds = map.getBounds(); 
    const center = bounds.getCenter();

    getHistoricalPlaces(center.lat, center.lng)
        .then(places => {
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
        })
        .catch(error => {
            // console.error('Error fetching historical places:', error);
            showBootstrapAlert('Sorry for the inconvenience, something went wrong with the Historical server. Please try again later or change the location.', 'danger');
        });
}, 'tourist-btn');

var newsBtn = L.easyButton('<img src="images/theater.png" width="20" height="20">', function () {
    fetchNews();  // Отримуємо новини, коли відкривається модальне вікно
    const newsModal = new bootstrap.Modal(document.getElementById('newsModal'));
    newsModal.show();
}, 'news-btn');

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialise and add controls once DOM is ready

$(document).ready(function () {

    // Initialize the map
    map = L.map("map", {
        layers: [streets],  // default view with streets
        maxZoom: 18,
    }).fitWorld();

    // Add layer control section
    layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

    locationBtn.addTo(map);
    searchBtn.addTo(map);
    infoBtn.addTo(map);
    currencyBtn.addTo(map);
    weatherModalBtn.addTo(map);
    histotyBtn.addTo(map);
    newsBtn.addTo(map);

    // download the list of countries
    getCountryList()
        .then(countries => {
            setCountriesList(countries); // fill the list with countries
        })
        .catch(error => {
            showBootstrapAlert(
                'Sorry for the inconvenience, something went wrong with the server. Failed to load country list.', 
                'warning'
            );
        });
        
    map.locate({
        setView: true,
        maxZoom: 6,
        watch: false, // avoid constantly updating the coordinates
        enableHighAccuracy: true
    });
    // Load country borders and airports on location found
    map.on('locationfound', function (e) {
        console.log('i am work - locationfound!')
        handleUserLocation(e.latlng.lat, e.latlng.lng);
        activeCoordinates.lat = e.latlng.lat;
        activeCoordinates.lon = e.latlng.lng;
        console.log('activeCoordinates', activeCoordinates);
    });

    map.on('locationerror', function (e) {
        showBootstrapAlert(e.message, 'success');
    });

    // loading all borders
    loadAllCountryBorders(bordersLayerGroup, countryBorderLayerRef);

    $('#countrySelect').on('change', function() {
        const isoCode = $(this).val();
        console.log('isoCode', isoCode);
        getCountrySpecificBorders(isoCode, map, countryBorderLayerRef);
        setCountryInform(isoCode);
        loadAirportsForCountry(isoCode);
        loadCitiesForCountry(isoCode);
    });

    $('#newsCategory').on('change', function() {
        fetchNews(this.value);
    });

    $('#searchPlaceButton').on('click', function() {
        const placeName = $('#placeSearchInput').val().trim();
        if (placeName === '') return; // checking whether the field is empty
    
        searchPlaceByName(placeName).then(data => {
            const $placeResultsList = $('#placeResultsList');
            $placeResultsList.empty(); // clean the previous results
    
            if (data.length === 0) {
                $placeResultsList.append('<li class="list-group-item">No results found.</li>');
                return;
            }
    
            data.forEach(place => {
                const $placeItem = $('<li>')
                    .addClass('list-group-item list-group-item-action')
                    .text(`${place.name}, ${place.countryName}`);
    
                $placeItem.on('click', function() {
                    getCountrySpecificBorders(place.countryCode, map, countryBorderLayerRef);
                    setCountryInform(place.countryCode);
                    loadAirportsForCountry(place.countryCode);

                    const marker = L.marker([place.lat, place.lng]).addTo(map)
                        .bindPopup(`<b>${place.name}</b><br>Country: ${place.countryName}`);
    
                    const placeModal = bootstrap.Modal.getInstance($('#placeSearchModal')[0]);
    
                    map.setView([place.lat, place.lng], 10); // move the map to the selected city
                    placeModal.hide(); // close the modal window after selection
                });
    
                $placeResultsList.append($placeItem);
            });
        })
        .catch(error => {
            showBootstrapAlert('Sorry for the inconvenience, something went wrong with the server. Please try again later.', 'danger');
        });
    });
    
});

// Load cities for the selected country
function loadCitiesForCountry(isoCode) {
    cityMarkersCluster.clearLayers(); 
    adminCityClusterGroup.clearLayers();

    fetch(`php/getCities.php?isoCode=${isoCode}`)
        .then(response => response.json())
        .then(cityData => {
            console.log('cities: ', cityData);
            if (cityData.pplc.length === 0 && cityData.ppla.length === 0 && cityData.ppla2.length === 0) {
                showBootstrapAlert('No cities found in this country.', 'warning');
                return;
            }
            function formatPopulation(population) {
                if (population >= 1000000) {
                    // Format for population greater than 1 million
                    return 'population: ' + (population / 1000000).toFixed(2) + 'M';
                } else if (population >= 100000) {
                    // Format for population between 100k and 999k
                    return 'population: ' + (population / 1000000).toFixed(2) + 'M';
                } else {
                    // Format for population less than 100k
                    return 'population: ' + Math.round(population / 1000) + ' 000';
                }
            }
            // Metropolitan cities (PPLC)
            cityData.pplc.forEach(city => {
                const capitalIcon = L.ExtraMarkers.icon({
                    icon: 'fa-star',
                    markerColor: 'red',
                    shape: 'circle',
                    prefix: 'fa'
                });

                const marker = L.marker([city.lat, city.lng], { icon: capitalIcon })
                    .bindPopup(`
                        <div style="font-weight: bold; font-size: 16px;">${city.name}</div>
                        <div>${formatPopulation(city.population)}</div>
                    `);

                marker.on('click', function () {
                    activeCoordinates.lat = city.lat;
                    activeCoordinates.lon = city.lng;
                    console.log('Capital city selected:', activeCoordinates);
                });

                adminCityClusterGroup.addLayer(marker); // Add marker to the admin city cluster group
            });

            // Administrative cities (PPLA)
            cityData.ppla.forEach(city => {
                const adminCityIcon = L.ExtraMarkers.icon({
                    icon: 'fa-city',
                    markerColor: 'blue',
                    shape: 'circle',
                    prefix: 'fa'
                });

                const marker = L.marker([city.lat, city.lng], { icon: adminCityIcon })
                    .bindPopup(`
                        <div style="font-weight: bold; font-size: 16px;">${city.name}</div>
                        <div>${formatPopulation(city.population)}</div>
                    `);

                marker.on('click', function () {
                    activeCoordinates.lat = city.lat;
                    activeCoordinates.lon = city.lng;
                    console.log('Admin city selected:', activeCoordinates);
                });

                adminCityClusterGroup.addLayer(marker); // Add marker to the admin city cluster group
            });

            //  Other sities (PPLA2)
            cityData.ppla2.forEach(city => {
                const simpleCityIcon = L.ExtraMarkers.icon({
                    icon: 'fa-building',
                    markerColor: 'green',
                    shape: 'circle',
                    prefix: 'fa'
                });

                const marker = L.marker([city.lat, city.lng], { icon: simpleCityIcon })
                    .bindPopup(`
                        <div style="font-weight: bold; font-size: 16px;">${city.name}</div>
                        <div>${formatPopulation(city.population)}</div>
                    `);

                marker.on('click', function () {
                    activeCoordinates.lat = city.lat;
                    activeCoordinates.lon = city.lng;
                    console.log('City selected:', activeCoordinates);
                });

                cityMarkersCluster.addLayer(marker); // Add marker to the city cluster group
            });

            // map.addLayer(cityMarkersCluster); // Add city markers to the map
            map.addLayer(adminCityClusterGroup); // Add admin city markers to the map
        })
        .catch(error => {
            showBootstrapAlert('Error fetching cities', 'danger');
        });
}


// ****************************************************
// Load airports for the selected country based on its borders 
function handleUserLocation(lat, lon) {
    fetch(`php/getCountryByCoordinates.php?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            const isoCode = data.countryISO.toUpperCase();
            $('#countrySelect').val(isoCode);  // Set selected country in the dropdown
            getCountrySpecificBorders(isoCode, map, countryBorderLayerRef);
            setCountryInform(isoCode);
            console.log('countryBorderLayerRef', countryBorderLayerRef)
            // Load airports for the current country and add them to the airport layer
            loadCitiesForCountry(isoCode);
            loadAirportsForCountry(isoCode);

        })
        .catch(error => {
            showBootstrapAlert('Error fetching location', 'danger');
        });
        if (myLocationMarcker.current) {
            map.removeLayer(myLocationMarcker.current);
            myLocationMarcker.current = null;
        }
        const myLocation = L.icon({
            iconUrl: 'images/button/my_location.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -30]
        });
        // add a marker to the map for location
        myLocationMarcker.current = L.marker({lat, lon}, { icon: myLocation }).addTo(map)
            .bindPopup("You are here")
        // map.flyTo(e.latlng, 14);// Smoothly move the map to the location
        // map.setView(e.latlng, 14);
}
// Load airports for the country within its borders
function loadAirportsForCountry(isoCode) {
    const countryBounds = countryBorderLayerRef.specificCountry.getBounds();  // Get the current country borders from map
    
    airportClusterGroup.clearLayers();
    
    const airportMarker = L.ExtraMarkers.icon({
        icon: 'fa-plane',
        markerColor: 'yellow',
        shape: 'square',
        prefix: 'fa'
    });

    fetch(`php/getAirports.php?north=${countryBounds.getNorth()}&south=${countryBounds.getSouth()}&east=${countryBounds.getEast()}&west=${countryBounds.getWest()}&isoCode=${isoCode}`)
        .then(response => response.json())    
        .then(airports => {
            if (airports.length === 0) {
                showBootstrapAlert('No airports found in this country.', 'warning');
                return;
            };

            airports.forEach(airport => {
                const wikiName = airport.name.replace(/[\s\W]+/g, '_');
                    const marker = L.marker([airport.lat, airport.lng], { icon: airportMarker  })
                        .bindPopup(`
                            <b>${airport.name}</b><br>
                            Country: ${airport.countryName}<br>
                            Region: ${airport.adminName1}<br>
                            <a href="https://en.wikipedia.org/wiki/${wikiName}" target="_blank">Wikipedia...</a>
                        `);
                airportClusterGroup.addLayer(marker);
            });
        })
        .catch(error => {
            showBootstrapAlert('Error fetching airports', 'danger');
        });
}

// Handle historical markers loading
function handleHistoricalMarkers() {
    const bounds = map.getBounds();
    getHistoricalPlaces(bounds.getCenter().lat, bounds.getCenter().lng)
        .then(places => {
            places.forEach(place => {
                const marker = L.marker([place.lat, place.lng], { icon: getIconByTitle(place.feature, place.title) })
                    .bindPopup(`<b>${place.title}</b><br>${place.summary}<br><a href="https://${place.wikipediaUrl}" target="_blank">Wikipedia</a>`);
                historicalMarkersCluster.addLayer(marker);
            });
        });
}

function getWeatherData(lat, lon, locationName) {
    activeCoordinates.lat = lat;
    activeCoordinates.lon = lon;

    fetch(`php/getWeather.php?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            console.log('getWeather data:', data);
            updateWeatherModal(data, locationName);
            getWeatherForecast(lat, lon);
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            showBootstrapAlert('Sorry, something went wrong with the weather service.', 'danger');
        });
}

function getWeatherForecast(lat, lon) {
    fetch(`php/getWeatherForecast.php?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            console.log('forecast data', data);
            updateWeatherForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
            showBootstrapAlert('Sorry, something went wrong with the forecast service.', 'danger');
        });
}

// ****************************************************
// Update Modal Functions
// ****************************************************

function updateWeatherModal(weatherData, locationName) {
    $('#weather-point-name').text( locationName.toUpperCase() || weatherData.name.toUpperCase());
    $('#current-date-time').text(new Date().toLocaleString());
    $('#weather-icon').attr('src', `http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`);
    $('#weather-description').text(weatherData.weatherDescription);
    $('#weather-temp').text(`${weatherData.temp.toFixed()} °C`);
    $('#humidity').text(`${weatherData.humidity} %`);
    $('#wind-speed').text(`${weatherData.windSpeed} m/s`);
    $('#pressure').text(`${weatherData.pressure } hPa`);
    $('#visibility').text(`${weatherData.visibility / 1000} km`);
    $('#sunrise').text(new Date(weatherData.sunrise * 1000).toLocaleTimeString());
    $('#sunset').text(new Date(weatherData.sunset * 1000).toLocaleTimeString());
}

function updateWeatherForecast(data) {
    const forecastScrollRow = $('.forecast-scroll-row');
    forecastScrollRow.empty();

    const dailyForecastContainer = $('.daily-forecast-scroll-row');
    dailyForecastContainer.empty();

    const hourlyForecast = [];
    const dailyForecast = {};

    const currentTime = new Date();
    const forecastLimit = new Date(currentTime.getTime() + 15 * 60 * 60 * 1000); // на 15 годин вперед

    // Парсинг 3-годинного та денного прогнозу
    data.list.forEach(item => {
        const dateTime = new Date(item.dt_txt);
        const date = dateTime.toLocaleDateString();
        let hours = dateTime.getHours();
        let time = hours === 0 ? "00:00" : dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // 3-годинний прогноз на 15 годин вперед
        if (dateTime <= forecastLimit) {
            hourlyForecast.push({
                time: time,
                temp: item.main.temp,
                icon: item.weather[0].icon
            });
        }

        // Денний прогноз (кожні 6 годин починаючи з 00:00 або 06:00 наступного дня)
        const isNextDay = dateTime.getDate() !== currentTime.getDate();
        if (isNextDay && (hours === 0 || hours === 6 || hours === 12 || hours === 18 || hours === 24)) {
            if (!dailyForecast[date]) {
                dailyForecast[date] = {
                    tempMin: item.main.temp_min,
                    tempMax: item.main.temp_max,
                    details: []
                };
            }
            dailyForecast[date].tempMin = Math.min(dailyForecast[date].tempMin, item.main.temp_min);
            dailyForecast[date].tempMax = Math.max(dailyForecast[date].tempMax, item.main.temp_max);

            if (hours === 24) {
                time = "24:00";  // Чітко відображаємо 24:00
            } else if (hours === 0) {
                time = "00:00";  // Чітко відображаємо 00:00 як початок нової доби
            }

            dailyForecast[date].details.push({
                time: time,
                temp: item.main.temp,
                icon: item.weather[0].icon
            });
        }
    });

    // Виведення 3-годинного прогнозу (на 15 годин вперед)
    hourlyForecast.forEach(hour => {
        const forecastCard = `
            <div class="forecast-card text-center bg-success bg-opacity-25 p-2 m-2 rounded shadow-sm">
                <img src="http://openweathermap.org/img/wn/${hour.icon}@2x.png" alt="Weather icon" class="forecast-icon img-fluid">
                <div class="forecast-time">${hour.time}</div>
                <div class="forecast-temp">${hour.temp.toFixed()}°C</div>
            </div>
        `;
        forecastScrollRow.append(forecastCard);
    });

    // Виведення денного прогнозу
    Object.keys(dailyForecast).slice(0, 5).forEach(date => {
        const forecast = dailyForecast[date];
        const details = forecast.details.map(detail => `
            <p class="mb-0">${detail.time} - <img src="http://openweathermap.org/img/wn/${detail.icon}@2x.png" alt="Small icon" class="img-fluid" style="width: 30px;"> ${detail.temp.toFixed()}°C</p>
        `).join('');

        const dayCard = `
            <div class="daily-forecast-card flex-shrink-0 text-center bg-success bg-opacity-25 p-1 m-1 rounded shadow-sm" style="min-width: 240px; max-width: 350px;">
                <div class="row align-items-center m-0">
                    <div class="col-5 text-center">
                        <h6 class="fw-bold m-0">${date}</h6>
                        <img src="http://openweathermap.org/img/wn/${forecast.details[0].icon}@2x.png" alt="Temp icon" class="daily-forecast-icon img-fluid mb-2">
                        <div class="daily-temp-max fw-bold">${forecast.tempMax.toFixed()}° /  ${forecast.tempMin.toFixed()}°</div>
                    </div>
                    <div class="col-7 text-start p-2">
                        <div class="daily-time-info">
                            ${details}
                        </div>
                    </div>
                </div>
            </div>
        `;
        dailyForecastContainer.append(dayCard);
    });
}

function fetchNews(category = '') {
    $.ajax({
        url: `php/getNews.php?category=${category}`,
        method: 'GET',
        dataType: 'json',
        success: function (articles) {
            console.log('articles', articles);
            const newsList = $('#news-list');
            newsList.empty(); 

            if (articles.error) {
                newsList.append(`<p>${articles.error}</p>`);
                return;
            }

            articles.forEach(article => {
                const articleItem = `
                    <a href="${article.url}" target="_blank" class="text-decoration-none text-dark">
                        <div class="card mb-3 shadow-sm">
                            <div class="card-header p-2 text-center bg-warning bg-opacity-25">
                                <h5 class="card-title">${article.title}</h5>
                            </div>
                            <div class="card-body p-1">
                                <div class="row g-0">
                                    <div class="d-flex align-items-center col-md-5 p-1">
                                        <img src="${article.urlToImage}" class="img-fluid rounded" alt="News image">
                                    </div>
                                    <div class="col-md-7 p-2">
                                        <p class="card-text">${article.description}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer d-flex justify-content-between">
                                <small class="text-muted">${new Date(article.publishedAt).toLocaleString()}</small>
                                <small class="text-muted fw-bold tw text-uppercase">${article.source.name}</small>
                            </div>
                        </div>
                    </a>`;
                newsList.append(articleItem);
            });
        },
        error: function (error) {
            // console.error('Error fetching news:', error);
            showBootstrapAlert('Sorry, something went wrong with the News service.', 'danger');
        }
    });
}

document.getElementById('searchPlaceButton').addEventListener('click', function() {
    const placeName = document.getElementById('placeSearchInput').value;
    if (placeName.trim() === '') return; // checking whether the field is empty

    searchPlaceByName(placeName).then(data => {
        const placeResultsList = document.getElementById('placeResultsList');
        placeResultsList.innerHTML = ''; // clean the previous results

        if (data.length === 0) {
            placeResultsList.innerHTML = '<li class="list-group-item">No results found.</li>';
            return;
        }

        data.forEach(place => {
            const placeItem = document.createElement('li');
            placeItem.classList.add('list-group-item', 'list-group-item-action');
            placeItem.textContent = `${place.name}, ${place.countryName}`;
            placeItem.addEventListener('click', function() {
                // setCoutryTitle(place.countryName, place.countryCode)
                setCountryInform(place.countryCode);
                
                const marker = L.marker([place.lat, place.lng]).addTo(map)
                    .bindPopup(`<b>${place.name}</b><br>Country: ${place.countryName}`);
                
                const placeModal = bootstrap.Modal.getInstance(document.getElementById('placeSearchModal'));
                
                map.setView([place.lat, place.lng], 10); // move the map to the selected city
                placeModal.hide(); // close the modal window after selection
            });
            placeResultsList.appendChild(placeItem);
        });
    })
    .catch(error => {
        // console.error('Error fetching cities:', error)
        showBootstrapAlert('Sorry for the inconvenience, something went wrong with the server. Please try again later.', 'danger');
    });
});

function loadAllCountryBorders(bordersLayerGroup, countryBorderLayerRef) {
    // getting GeoJSON boundary data
    $.ajax({
        url: 'php/getAllCountryBorders.php',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log("Borders data: ", data);

            // create a layer for the borders of the countries
            countryBorderLayerRef.allCountries = L.geoJSON(data, {
                style: {
                    color: '#ff0000',
                    weight: 2,
                    dashArray: '5, 5',  // Dotted line
                    fillOpacity: 0     // Without filling
                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(`<b>${feature.properties.ADMIN}</b>`);
                    // Add a click event handler to update the country name in <span>
                    layer.on('click', function () {
                        const isoCode = feature.properties.ISO_A2;
                        getCountrySpecificBorders(isoCode, map, countryBorderLayerRef);
                        setCountryInform(isoCode);
                        loadAirportsForCountry(isoCode);
                        loadCitiesForCountry(isoCode);
                    });
                }
            });

            // Add borders to bordersLayerGroup
            bordersLayerGroup.addLayer(countryBorderLayerRef.allCountries);
        },
        error: function(error) {
            // console.error('Error loading country borders:', error);
            showBootstrapAlert('Sorry for the inconvenience, all country borders are not loaded yet. An Error occurred while trying to get all borders, please try again later.', 'danger');
        }
    });
}

function getCountrySpecificBorders(isoCode, map, countryBorderLayerRef) {
    if (countryBorderLayerRef.allCountries) {
        const specificCountryLayer = L.geoJSON(countryBorderLayerRef.allCountries.toGeoJSON(), {
            filter: function (feature) {
                return feature.properties.ISO_A2 === isoCode;
            },
            style: function () {
                return {
                    color: '#0000FF',
                    weight: 3,
                    dashArray: '5, 5',
                    fillOpacity: 0
                };
            }
        });

        if (countryBorderLayerRef.specificCountry) {
            map.removeLayer(countryBorderLayerRef.specificCountry);
            countryBorderLayerRef.specificCountry = null;
        }

        // We add a new layer of borders of a specific country
        countryBorderLayerRef.specificCountry = specificCountryLayer.addTo(map);
        map.fitBounds(specificCountryLayer.getBounds());

    } else {
        showBootstrapAlert('Sorry for the inconvenience, country borders are not loaded yet. Please try again later.', 'danger');
    }
}
