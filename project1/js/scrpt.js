// script.js

// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map, layerControl;
var map, layerControl;

var bordersLayerGroup = L.layerGroup();
var airportClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 50,
    polygonOptions: {
        fillColor: "#FFFF00",
        color: "#000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
    }
});
var cityMarkersCluster = L.markerClusterGroup({
    maxClusterRadius: 50,
    polygonOptions: {
        fillColor: "#FF0000",
        color: "#000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
    }
});
var adminCityClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 25
}); 
var placeMarker = null; // marker to indicate the places we were looking for

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

var overlayMaps = {
    "Airports": airportClusterGroup,
    "Administrative Cities": adminCityClusterGroup,
    "Cities": cityMarkersCluster,
};

var countryBorderLayerRef = { specificCountry: null}; 
var activeCoordinates = { lat: null, lon: null };

// buttons

// user location
var locationBtn = L.easyButton('<img src="images/button/home.png" width="20" height="20">', function(btn, map) {
    map.locate({setView: false}); // find the location and do not move the map to it
});

// info modal  
var infoBtn = L.easyButton('<img src="images/button/info.png" width="20" height="20">', function() {
    const countryModal = new bootstrap.Modal($('#countryModal')[0]);
    countryModal.show();
});

// curency modal
var currencyBtn = L.easyButton('<img src="images/button/exchange.png" width="20" height="20">', function() {
    const currencyCode = $('#curenCurrencyCodeConverter').text();  
    if (!currencyCode) {
        showAlert('Currency data is not available. Please try again later.', 'warning');
        return;
    }
    getCurrencyData(currencyCode);        

    const currencyModal = new bootstrap.Modal($('#currencyModal')[0]);
    currencyModal.show();
});

// weather modal
var weatherModalBtn = L.easyButton('<img src="images/button/weather.png" width="20" height="20">', function() {
    // We update the modal window with weather based on the active coordinates
    if (activeCoordinates.lat && activeCoordinates.lon) {
        getWeatherData(activeCoordinates.lat, activeCoordinates.lon, '');
    } else {
        showAlert('Sorry, the location is not defined.', 'danger');
    }
    const weatherModal = new bootstrap.Modal($('#weatherModal')[0]);
    weatherModal.show();
});

// news modal
var newsBtn = L.easyButton('<img src="images/button/news.png" width="20" height="20">', function () {
    fetchNews();
    const newsModal = new bootstrap.Modal($('#newsModal')[0]);
    newsModal.show();
});

// news modal
var wikiBtn = L.easyButton('<img src="images/button/wikipedia.png" width="20" height="20">', function() {
    showWikiModal();
});

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialise and add controls once DOM is ready

$(document).ready(function () {
    $('#preloader').show();

    // download the list of countries
    loadCountryList();

    // Initialize the map
    map = L.map("map", {
        layers: [streets],  // default view with streets
        maxZoom: 18,
    }).fitWorld();

    // Add layer control section
    layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

    // Add buttons to the map
    locationBtn.addTo(map);
    infoBtn.addTo(map);
    currencyBtn.addTo(map);
    weatherModalBtn.addTo(map);
    newsBtn.addTo(map);
    wikiBtn.addTo(map);    
    
    map.locate({
        setView: true,
        maxZoom: 6,
        watch: false, // avoid constantly updating the coordinates
        enableHighAccuracy: true
    });

    // Load country borders and airports on location found
    map.on('locationfound', function (e) {
        handleUserLocation(e.latlng.lat, e.latlng.lng);
        activeCoordinates.lat = e.latlng.lat;
        activeCoordinates.lon = e.latlng.lng;
    });

    map.on('locationerror', function (e) {
        showAlert(e.message, 'warning');
        $('#preloader').hide();
    });

    $('#countrySelect').on('change', function() {
        const isoCode = $(this).val();
        getCountrySpecificBorders(isoCode)
            .then(() => {
                loadAirportsForCountry(isoCode);
                loadCitiesForCountry(isoCode);
            })
            .catch((error) => {
                // console.error('Error after fetching borders:', error);
                showAlert('Error after fetching borders:', 'danger');
            });
        setCountryInform(isoCode);
    });

    $('#newsCategory').on('change', function() {
        fetchNews(this.value); // get news of the selected category
    });
    
});

// ---------------------------------------------------------
// Functions
// ---------------------------------------------------------

// after finding the user, set all the necessary information by coordinates
function handleUserLocation(lat, lon) {
    $.ajax({
        url: 'php/getCountryByCoordinates.php',
        method: 'GET',
        data: { lat: lat, lon: lon },
        dataType: 'json',
        success: function(data) {
            const isoCode = data.countryISO;
            $('#countrySelect').val(isoCode).change();
        },
        error: function() {
            showAlert('Error fetching location', 'danger');
            $('#preloader').hide();
        }
    });
}

// function to download the list of countries
function loadCountryList() {
    $.ajax({
        url: 'php/getCountries.php',
        method: 'GET',
        dataType: 'json',
        success: function(countries) {
            const $countrySelect = $('#countrySelect');
            $countrySelect.empty();
            // console.log('countries', countries);            
            countries.forEach(country => {
                const option = $('<option></option>')
                    .val(country.iso)
                    .text(country.name);
                $countrySelect.append(option);
    });
        },
        error: function(xhr, status, error) {
            // console.error('Error fetching countries:', error);
            showAlert(
                'Sorry for the inconvenience, something went wrong with the server. Failed to load country list.',
                'warning'
            );
        }
    });
}

// add the borders of the selected country to the map
function getCountrySpecificBorders(isoCode) {
    return new Promise((resolve, reject) => {
        $.ajax({
                url: 'php/getCountryBorder.php',
                method: 'GET',
                data: { isoCode: isoCode },
                dataType: 'json',
                success: function(data) {
                    const specificCountryLayer = L.geoJSON(data, {
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
    
                    countryBorderLayerRef.specificCountry = specificCountryLayer.addTo(map);
                    map.fitBounds(specificCountryLayer.getBounds());
    
                    resolve();
                },
                error: function(error) {
                    // console.error('Error fetching country borders:', error);
                    reject(error);
                }
            });
        }        
    );
}

// function for filling information modal with data
function setCountryInform(isoCode) {
    $.ajax({
        url: 'php/getCountryDetails.php',
        method: 'GET',
        data: { isoCode: isoCode },
        dataType: 'json',
        success: function(data) {
            // console.log(data);            
            // Updating data in the modal window
            $('#countryName').text(data.name);
            $('#officialName').text(data.officialName);
            $('#capital').text(data.capital);
            $('#population').text(`${data.population.toLocaleString()}`);
            $('#currency').text(`${data.currency.name}, ${data.currency.symbol}`);
            $('#flag').html(`<img src="${data.flag}" width="100" alt="${data.flagAlt}">`);
            $('#region').text(data.region);
            $('#languages').text(data.languages);
            $('#area').text(`${data.area.toLocaleString()} km²`);
            $('#timezones').text(data.timezones);
            $('#flagDescription').text(data.flagAlt);
            $('#coatOfArms').html(`<img src="${data.coatOfArms}" width="100" alt="Coat of Arms">`);

            // Updating the modal window for currency
            $('#currencyModalLabel').text(`${data.currency.name} (${data.currency.currencyCode}) -- ${data.currency.symbol} -- ${data.name}`);
            $('#currentCurrencyName').text(`${data.currency.name} - ${data.currency.currencyCode}`);
            $('#curenCurrencySymbol').text(data.currency.symbol);
            $('#curenCurrencyCodeConverter').text(data.currency.currencyCode);
            
            // Update the selected country in the list
            $('#countrySelect').val(isoCode);
        },
        error: function(error) {
            // console.error(error);
            showAlert('Error fetching country information', 'danger');
        }
    });
}

// Load airports for the country within its borders and add to the map
function loadAirportsForCountry(isoCode) {
    const countryBounds = countryBorderLayerRef.specificCountry.getBounds();  // Get the current country borders from map
    
    airportClusterGroup.clearLayers();
    
    const airportMarker = L.ExtraMarkers.icon({
        icon: 'fa-plane',
        markerColor: 'yellow',
        shape: 'square',
        prefix: 'fa'
    });

    $.ajax({
        url: 'php/getAirports.php',
        method: 'GET',
        data: {
            north: countryBounds.getNorth(),
            south: countryBounds.getSouth(),
            east: countryBounds.getEast(),
            west: countryBounds.getWest(),
            isoCode: isoCode
        },
        dataType: 'json',
        success: function(airports) {
            if (airports.length === 0) {
                showAlert('No airports found in this country.', 'warning');
                return;
            };

            airports.forEach(airport => {
                const wikiName = airport.name.replace(/[\s\W]+/g, '_');
                const marker = L.marker([airport.lat, airport.lng], { icon: airportMarker  })
                    .bindPopup(`
                        <div class="fw-bold fs-5">${airport.name}</div>
                        <div class="fw-bold">Country: ${airport.countryName}</div>
                        <div class="fw-bold">Region: ${airport.adminName1}</div>                        
                        <a href="https://en.wikipedia.org/wiki/${wikiName}" target="_blank" class="text-decoration-none fw-bold">search in wikipedia...</a>

                    `);
                airportClusterGroup.addLayer(marker);
            });
        },
        error: function() {
            showAlert('Error fetching airports', 'danger');
        }
    });
}

// Load cities for the selected country
function loadCitiesForCountry(isoCode) {
    cityMarkersCluster.clearLayers(); 
    adminCityClusterGroup.clearLayers();

    $.ajax({
        url: 'php/getCities.php',
        method: 'GET',
        data: { isoCode: isoCode },
        dataType: 'json',
        success: function(cityData) {
            // console.log('cities: ', cityData);
            if (cityData.pplc.length === 0 && cityData.ppla.length === 0 && cityData.ppla2.length === 0) {
                showAlert('No cities found in this country.', 'warning');
                return;
            }

            // Metropolitan cities (PPLC)
            cityData.pplc.forEach(function(city) {
                const capitalIcon = L.ExtraMarkers.icon({
                    icon: 'fa-star',
                    markerColor: 'red',
                    shape: 'circle',
                    prefix: 'fa'
                });

                const marker = L.marker([city.lat, city.lng], { icon: capitalIcon })
                    .bindPopup(`
                        <div class="fw-bold fs-5">${city.name}</div>
                        <div class="fw-bold"><i class="fas fa-users"></i> ${(city.population).toLocaleString()}</div>
                    `);

                marker.on('click', function() {
                    activeCoordinates.lat = city.lat;
                    activeCoordinates.lon = city.lng;
                });

                adminCityClusterGroup.addLayer(marker);
            });

            // Administrative cities (PPLA)
            cityData.ppla.forEach(function(city) {
                const adminCityIcon = L.ExtraMarkers.icon({
                    icon: 'fa-city',
                    markerColor: 'blue',
                    shape: 'circle',
                    prefix: 'fa'
                });

                const marker = L.marker([city.lat, city.lng], { icon: adminCityIcon })
                    .bindPopup(`
                        <div class="fw-bold fs-5">${city.name}</div>
                        <div class="fw-bold"><i class="fas fa-users"></i> ${(city.population).toLocaleString()}</div>
                    `);

                marker.on('click', function() {
                    activeCoordinates.lat = city.lat;
                    activeCoordinates.lon = city.lng;
                });

                adminCityClusterGroup.addLayer(marker);
            });

            // Other cities (PPLA2)
            cityData.ppla2.forEach(function(city) {
                const simpleCityIcon = L.ExtraMarkers.icon({
                    icon: 'fa-building',
                    markerColor: 'green',
                    shape: 'circle',
                    prefix: 'fa'
                });

                const marker = L.marker([city.lat, city.lng], { icon: simpleCityIcon })
                    .bindPopup(`
                        <div class="fw-bold fs-5">${city.name}</div>
                        <div class="fw-bold"><i class="fas fa-users"></i> ${(city.population).toLocaleString()}</div>
                    `);

                marker.on('click', function() {
                    activeCoordinates.lat = city.lat;
                    activeCoordinates.lon = city.lng;
                    // console.log('City selected:', activeCoordinates);
                });

                cityMarkersCluster.addLayer(marker);
            });

            map.addLayer(adminCityClusterGroup); // Add admin city markers to the map
        },
        error: function(error) {
            showAlert('Error fetching cities', 'danger');
        }
    });
}

// functions for processing currency modal
function getCurrencyData(currencyCode) {
    const baseCurrency = 'USD';
    $('#currentCurencyAmount').val('');
    $('#baseCurrencyAmount').val('1');
    
    $.ajax({
        url: 'php/getCurrencyRates.php',
        method: 'GET',
        data: {
            currencyCode: currencyCode,
            baseCurrency: baseCurrency
        },
        dataType: 'json',
        success: function(data) {
            if (data.error) {
                // console.error('Error fetching currency:', data.error);
                showAlert('Error fetching currency data', 'danger');
                return;
            }
            handleCurrencyData(data, currencyCode);
        },
        error: function(xhr, status, error) {
            // console.error('Error fetching currency:', error);
            showAlert('Error fetching currency data', 'danger');
        }
    });
}

function handleCurrencyData(data, currencyCode) {
    $('#curenCurrencyCode').text(data[currencyCode].toFixed(2));
    $('#USD').text(data['USD'].toFixed(2));
    $('#EUR').text(data['EUR'].toFixed(2));
    $('#GBP').text(data['GBP'].toFixed(2));
    $('#CNY').text(data['CNY'].toFixed(2));
    $('#JPY').text(data['JPY'].toFixed(2));
    $('#INR').text(data['INR'].toFixed(2));
    $('#CAD').text(data['CAD'].toFixed(2));

    $('#baseCurrencyAmount').on('input', function() { //Event handler for entering base currency
        $('#currentCurencyAmount').val('');
        const amount = $(this).val();
        $('#curenCurrencyCode').text((data[currencyCode] * amount).toFixed(2));
        $('#USD').text((data['USD'] * amount).toFixed(2));
        $('#EUR').text((data['EUR'] * amount).toFixed(2));
        $('#GBP').text((data['GBP'] * amount).toFixed(2));
        $('#CNY').text((data['CNY'] * amount).toFixed(2));
        $('#JPY').text((data['JPY'] * amount).toFixed(2));
        $('#INR').text((data['INR'] * amount).toFixed(2));
        $('#CAD').text((data['CAD'] * amount).toFixed(2));
    });
    
    const k = 1 / data[currencyCode];
    $('#currentCurencyAmount').on('input', function() { // Event handler for entering the selected currency field
        $('#baseCurrencyAmount').val('');
        const amount = $(this).val();
        $('#curenCurrencyCode').text(amount);
        $('#USD').text((data['USD'] * amount * k).toFixed(2));
        $('#EUR').text((data['EUR'] * amount * k).toFixed(2));
        $('#GBP').text((data['GBP'] * amount * k).toFixed(2));
        $('#CNY').text((data['CNY'] * amount * k).toFixed(2));
        $('#JPY').text((data['JPY'] * amount * k).toFixed(2));
        $('#INR').text((data['INR'] * amount * k).toFixed(2));
        $('#CAD').text((data['CAD'] * amount * k).toFixed(2));
    });
}

// Get the weather data
function getWeatherData(lat, lon, locationName) {
    activeCoordinates.lat = lat;
    activeCoordinates.lon = lon;

    $.ajax({
        url: `php/getWeather.php`,
        method: 'GET',
        data: { lat: lat, lon: lon },
        dataType: 'json',
        success: function(data) {
            // console.log('getWeather data:', data);
            updateWeatherModal(data, locationName);
            getWeatherForecast(lat, lon);
        },
        error: function() {
            // console.error('Error fetching weather');
            showAlert('Sorry, something went wrong with the weather service.', 'danger');
        }
    });
}

function getWeatherForecast(lat, lon) {
    $.ajax({
        url: `php/getWeatherForecast.php`,
        method: 'GET',
        data: { lat: lat, lon: lon },
        dataType: 'json',
        success: function(data) {
            updateWeatherForecast(data);
        },
        error: function() {
            // console.error('Error fetching forecast');
            showAlert('Sorry, something went wrong with the forecast service.', 'danger');
        }
    });
}

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
    const forecastScrollRow = $('#forecast-scroll-row');
    forecastScrollRow.empty();

    const dailyForecastContainer = $('#daily-forecast-scroll-row');
    dailyForecastContainer.empty();

    const hourlyForecast = [];
    const dailyForecast = {};

    const currentTime = new Date();
    const forecastLimit = new Date(currentTime.getTime() + 15 * 60 * 60 * 1000); // 15 hours ahead

    // Parsing of 3-hour and daily forecast
    data.list.forEach(item => {
        const dateTime = new Date(item.dt_txt);
        const date = dateTime.toLocaleDateString();
        let hours = dateTime.getHours();
        let time = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // 3-hour forecast for 15 hours ahead
        if (dateTime <= forecastLimit) {
            hourlyForecast.push({
                time: time,
                temp: item.main.temp,
                icon: item.weather.icon
            });
        }

        // Daily forecast (every 6 hours starting at 00:00 or 06:00 the next day)
        const isNextDay = dateTime.getDate() !== currentTime.getDate();
        if (isNextDay && (hours === 0 || hours === 6 || hours === 12 || hours === 18)) {
            if (!dailyForecast[date]) {
                dailyForecast[date] = {
                    tempMin: item.main.temp_min,
                    tempMax: item.main.temp_max,
                    details: []
                };
            }
            dailyForecast[date].tempMin = Math.min(dailyForecast[date].tempMin, item.main.temp_min);
            dailyForecast[date].tempMax = Math.max(dailyForecast[date].tempMax, item.main.temp_max);

            dailyForecast[date].details.push({
                time: time,
                temp: item.main.temp,
                icon: item.weather.icon
            });
        }
    });

    // 3-hour forecast (15 hours ahead)
    hourlyForecast.forEach(hour => {
        const forecastCard = `
            <div class="text-center bg-success bg-opacity-25 p-2 m-2 rounded shadow-sm">
                <img src="http://openweathermap.org/img/wn/${hour.icon}@2x.png" alt="Weather icon" class="img-fluid">
                <div>${hour.time}</div>
                <div>${hour.temp.toFixed()}°C</div>
            </div>
        `;
        forecastScrollRow.append(forecastCard);
    });

    // daily forecast
    Object.keys(dailyForecast).slice(0, 5).forEach(date => {
        const forecast = dailyForecast[date];
        const details = forecast.details.map(detail => `
            <p class="mb-0">
                ${detail.time} - 
                <img src="http://openweathermap.org/img/wn/${detail.icon}@2x.png" alt="Small weather icon" class="img-fluid" width="30"> 
                ${detail.temp.toFixed()}°C
            </p>
        `).join('');

        const dayCard = `
            <div class="flex-shrink-0 text-center bg-success bg-opacity-25 p-1 m-1 rounded shadow-sm" style="min-width: 240px;">
                <div class="row align-items-center m-0">
                    <div class="col-5 text-center">
                        <h6 class="fw-bold m-0">${date}</h6>
                        <img src="http://openweathermap.org/img/wn/${forecast.details[0].icon}@2x.png" alt="Daily weather icon" class="daily-forecast-icon img-fluid mb-2">
                        <div class="fw-bold">${forecast.tempMax.toFixed()}° /  ${forecast.tempMin.toFixed()}°</div>
                    </div>
                    <div class="col-7 text-start p-2">
                        <div>
                            ${details}
                        </div>
                    </div>
                </div>
            </div>
        `;
        dailyForecastContainer.append(dayCard);
    });
}

// function for receiving news
function fetchNews(category = '') {
    $.ajax({
        url: `php/getNews.php?category=${category}`,
        method: 'GET',
        dataType: 'json',
        success: function (articles) {
            // console.log('articles', articles);
            const newsList = $('#news-list');
            newsList.empty(); 
            if (articles.error) {
                newsList.append(`
                    <div class="card-header p-2 text-center bg-warning bg-opacity-25">
                        <h5>Sorry, something went wrong with the News service.</h5>
                    </div>`);
                return;
            }
            if (articles.length === 0) {
                newsList.append(`
                    <div class="card-header p-2 text-center bg-warning bg-opacity-25">
                        <h5>Sorry, there are currently no articles for this category</h5>
                    </div>`);
            } else {
                articles.forEach(article => {
                    const articleItem = `
                        <a href="${article.url}" target="_blank" class="text-decoration-none text-dark">
                            <div class="card mb-3 shadow-sm">
                                <div class="card-header p-2 text-center bg-warning bg-opacity-25">
                                    <h5 class="card-title">${article.title}</h5>
                                </div>
                                <div class="card-body p-1">
                                    <div class="row g-0">
                                        ${article.urlToImage 
                                                ? 
                                            `<div class="d-flex align-items-center col-md-5 p-1">
                                                <img src="${article.urlToImage}" class="img-fluid rounded" alt="News image">
                                            </div>
                                            <div class="col-md-7 p-2">
                                                <p class="card-text">${article.description}</p>
                                            </div>` 
                                                : 
                                            `<div class="col-md-12 p-2">
                                                <p class="card-text">${article.description}</p>
                                            </div>`} 
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
            }            
        },
        error: function (error) {
            // console.error('Error fetching news:', error);
            showAlert('Sorry, something went wrong with the News service.', 'danger');
        }
    });
}

// Function to display a modal window with information from Wikipedia
function showWikiModal() {
    let countryName = $('#countrySelect option:selected').text();
    countryName = countryName.replace(/\s+/g, '_');
    // console.log(countryName);

    $.ajax({
        url: 'php/getWikiData.php',
        method: 'GET',
        data: { countryName: countryName },
        dataType: 'json',
        success: function(data) {
            // console.log(data);
            $('#wiki-country-name').text(data.title);
            $('#wiki-intro').text(data.extract);
            $('#wiki-link').attr('href', data.content_urls);

            if (data.originalimage) {
                $('#wiki-image').attr('src', data.originalimage);
            } else {
                $('#wiki-image').hide();
            }
            const newsModal = new bootstrap.Modal($('#wikiModal')[0]);
            newsModal.show();

        },
        error: function(error) {
            // console.error('Error fetching Wikipedia data:', error);
            showAlert('Error fetching Wikipedia data. Sorry for the inconvenience, data is available for this country.', 'danger');
        }
    });
}

// function to notify the user
function showAlert(message, alertType = 'success', autoClose = true, closeDelay = 5000) {
    const $alertPlaceholder = $('#alertPlaceholder');
    const $alertHtml = $(`
        <div class="alert alert-${alertType} alert-dismissible fade show text-center" role="alert" style="z-index: 2000;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);
    $alertPlaceholder.html($alertHtml);
    
    if (autoClose) {
        setTimeout(() => {
            const $alertNode = $alertPlaceholder.find('.alert');
            if ($alertNode.length) {
                $alertNode.removeClass('show'); // hide messages
                $alertNode.on('transitionend', () => $alertNode.remove());
            }
        }, closeDelay);
    }
}