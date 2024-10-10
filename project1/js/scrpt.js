// script.js

// import { toggleCountrySearch } from '../features/toggleCountrySearch.js';
// import { filterCountryNames } from '../features/filterCountryNames.js';
// import { getCountryByCoordinates } from './getCountryByCoordinates.js';
// import { setCoutryTitle } from './setCoutryTitle.js';
// import { getAirports } from './getAirports.js';



import { getCountrySpecificBorders } from './getCountrySpecificBorders.js';
import { getCountryList } from './getCountryList.js';
import { setCountryInform } from './setCountryInform.js';


import { getWeatherData } from './getWeatherData.js';
import { getCityByBounds } from './getCityByBounds.js';

import { getCurrencyData } from './getCurrencyData.js';

import { getHistoricalPlaces } from './getHistoricalPlaces.js';
import { getIconByTitle } from './getIconByTitle.js';
import { showBootstrapAlert } from './showAlert.js';

import { searchPlaceByName } from './searchPlaceByName.js';
import { setCurrencyData } from './setCurrencyData.js';

import { setCountriesList } from './setCountriesList.js';

import { loadAllCountryBorders } from './loadAllCountryBorders.js';

// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

// var map = L.map('map').fitWorld();
var map, layerControl;
var map, layerControl;
var bordersLayerGroup = L.layerGroup();  // to store borders
var airportClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 25
});  // Cluster group for airports
var weatherMarkers = L.markerClusterGroup({
    maxClusterRadius: 45
});  // Cluster group for weather markers
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

var overlayMaps = {
    "Weather": weatherMarkers,
    "Historical Places": historicalMarkersCluster,
    "Airports": airportClusterGroup,
    "All Borders": bordersLayerGroup,
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



// Weather 
var weatherBtn = L.easyButton('<img src="images/button/weather.png" width="20" height="20">', function () {
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
        // console.log("zoomLevel:", zoomLevel);
        getCityByBounds(north, south, east, west).then(cities => {
            if (cities.length === 0){
                getWeatherData(center.lat, center.lng, 'none', weatherMarkers);
                return;
            }
            cities.forEach(city => {
                getWeatherData(city.lat, city.lng, city.name, weatherMarkers);        
            });
        });
    } else if (zoomLevel <= 10 && zoomLevel > 6) {
        getCityByBounds(north, south, east, west, 'PPL').then(cities => {
            if (cities.length === 0){
                getWeatherData(center.lat, center.lng, 'none', weatherMarkers);
                return;
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
    map.addLayer(weatherMarkers);
});


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
    weatherBtn.addTo(map);
    histotyBtn.addTo(map);
    // airportBtn.addTo(map);

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
        console.log('i am work!')
        handleUserLocation(e.latlng.lat, e.latlng.lng);
    });

    map.on('locationerror', function (e) {
        showBootstrapAlert(e.message, 'success');
    });

    // loading all borders
    loadAllCountryBorders(bordersLayerGroup, countryBorderLayerRef);

    $('#countrySelect').on('change', function() {
        const isoCode = $(this).val();
        getCountrySpecificBorders(isoCode, map, countryBorderLayerRef);
        setCountryInform(isoCode);
        loadAirportsForCountry(isoCode);
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
    
    const airportIcon = L.icon({
        iconUrl: 'images/airport.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30]
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
                    const marker = L.marker([airport.lat, airport.lng], { icon: airportIcon })
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

// ********************* location ******************************* 
// map.locate({
//     setView: true,
//     maxZoom: 6,
//     watch: false, // avoid constantly updating the coordinates
//     enableHighAccuracy: true
// });

// map.on('locationfound', function(e) {
//     const lat = e.latlng.lat;
//     const lon = e.latlng.lng;    
    
//     fetch(`php/getCountryByCoordinates.php?lat=${lat}&lon=${lon}`)
//         .then(response => response.json())
//         .then(data => {
//             data.countryISO = data.countryISO.toUpperCase();
//             // console.log(`Your country: ${data.countryName} (${data.countryISO})`);
//             $('#countrySelect').val(data.countryISO);
//             setCountryInform(data.countryISO);
//             // return data;
//         })
//         .catch(error => {
//             showBootstrapAlert('Sorry for the inconvenience, something went wrong with the server.', 'danger');
//         });    
    
    // if (myLocationMarcker.current) {
    //     map.removeLayer(myLocationMarcker.current);
    //     myLocationMarcker.current = null;
    // }
    // const myLocation = L.icon({
    //     iconUrl: 'images/button/my_location.png',
    //     iconSize: [32, 32],
    //     iconAnchor: [16, 32],
    //     popupAnchor: [0, -30]
    // });
    // // add a marker to the map for location
    // myLocationMarcker.current = L.marker(e.latlng, { icon: myLocation }).addTo(map)
    //     .bindPopup("You are here")
    // // map.flyTo(e.latlng, 14);// Smoothly move the map to the location
    // map.setView(e.latlng, 14);
// });

// map.on('locationerror', function(e) {
//     showBootstrapAlert(e.message, 'success');
// });

// **************************************************** 

// All borders
// L.easyButton('<img src="images/button/border.png" width="20" height="20">', function() {
//     // If the border layer of all countries is not active, add it
//     if (!map.hasLayer(bordersLayerGroup)) {
//         map.setZoom(6);
//         map.addLayer(bordersLayerGroup);
//         // activate the button of all borders
//         document.getElementById('border-btn').style.backgroundColor = 'green';  // add green color to the button
//         // dictate the border button of a certain country
//         document.getElementById('current-border-btn').style.backgroundColor = ''; 

//         if (countryBorderLayerRef.specificCountry) {
//             map.removeLayer(countryBorderLayerRef.specificCountry);
//             countryBorderLayerRef.specificCountry = null;
//         }
//     } else {
//         // If the borders are already active, hide the border layer of all countries
//         map.removeLayer(bordersLayerGroup);
//         document.getElementById('border-btn').style.backgroundColor = '';  // Deactivate the green button
//     }
// }, {
//     id: 'border-btn',  // an ID to the access button
//     position: 'topleft'  // location of the button on the map
// }).addTo(map);

// Current border 
// L.easyButton('<img src="images/button/country.png" width="20" height="20">', function() {
//     const isoCode = $('#countrySelect option:selected').val();
//     if (isoCode) {
//         // If the borders of all countries are active, delete them
//         if (map.hasLayer(bordersLayerGroup)) {
//             map.removeLayer(bordersLayerGroup);
//         }
//         // If the border layer of the current country is not active, add it
//         if (!countryBorderLayerRef.specificCountry) {
//             getCountrySpecificBorders(isoCode, map, countryBorderLayerRef);  // load the borders of the current country
            
//         } else {
//             // if the borders of the current country are already active, delete the layer
//             map.removeLayer(countryBorderLayerRef.specificCountry);
//             countryBorderLayerRef.specificCountry = null;
//             document.getElementById('current-border-btn').style.backgroundColor = '';  // Deactivate the red button
//         }
//     } else {
//         showBootstrapAlert('No country selected.', 'warning');
//     }
// }, {
//     id: 'current-border-btn',  // an ID to the access button
//     position: 'topleft'
// }).addTo(map);


// Airoports
// var airportBtn = L.easyButton('<img src="images/button/airplane.png" width="20" height="20">', function() {
//     const bounds = map.getBounds();
//     const north = bounds.getNorth();
//     const south = bounds.getSouth();
//     const east = bounds.getEast();
//     const west = bounds.getWest();

//     airportClusterGroup.clearLayers();

//     const airportIcon = L.icon({
//         iconUrl: 'images/airport.png',
//         iconSize: [32, 32],
//         iconAnchor: [16, 32],
//         popupAnchor: [0, -30]
//     });

//     getAirports(north, south, east, west)
//         .then(airports => {
//             if (airports.length === 0) {
//                 showBootstrapAlert(
//                     'No airports were found in this area. Please try searching in other locations.', 
//                     'warning');
//                 return;
//             };
//             airports.forEach(airport => {
//                 const wikiName = airport.name.replace(/[\s\W]+/g, '_');
//                 const marker = L.marker([airport.lat, airport.lng], { icon: airportIcon })
//                     .bindPopup(`
//                         <b>${airport.name}</b><br>
//                         Country: ${airport.countryName}<br>
//                         Region: ${airport.adminName1}<br>
//                         <a href="https://en.wikipedia.org/wiki/${wikiName}" target="_blank">Wikipedia...</a>
//                     `); 
//                 airportClusterGroup.addLayer(marker);
//             });
//             map.addLayer(airportClusterGroup);
//         })
//         .catch(error => {
//             // console.error('Error fetching historical places:', error);
//             showBootstrapAlert('Sorry for the inconvenience, something went wrong with the Airport server. Please try again later or change the location.', 'danger');
//         });
// }, 'airport-btn');