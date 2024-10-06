// script.js

import { toggleCountrySearch } from '../features/toggleCountrySearch.js';
import { filterCountryNames } from '../features/filterCountryNames.js';

import { getCountrySpecificBorders } from './getCountrySpecificBorders.js';
import { getCountryList } from './getCountryList.js';
import { setCountryInform } from './setCountryInform.js';

import { getCountryByCoordinates } from './getCountryByCoordinates.js';

import { getWeatherData } from './getWeatherData.js';
import { getCityByBounds } from './getCityByBounds.js';

import { getCurrencyData } from './getCurrencyData.js';
import { setCoutryTitle } from './setCoutryTitle.js';

import { getHistoricalPlaces } from './getHistoricalPlaces.js';
import { getIconByTitle } from './getIconByTitle.js';
import { showBootstrapAlert } from './showAlert.js';

import { searchPlaceByName } from './searchPlaceByName.js';
import { setCurrencyData } from './setCurrencyData.js';

import { setCountriesList } from './setCountriesList.js';
import { getAirports } from './getAirports.js';

import { loadAllCountryBorders } from './loadAllCountryBorders.js';

const map = L.map('map').fitWorld();

// map layers
const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map); 

const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    }
);

const baseMaps = {
    "Streets": streets,
    "Satellite": satellite,
};
// layer controls to the map
L.control.layers(baseMaps).addTo(map);

const bordersLayerGroup = L.layerGroup();  // use layerGroup to store borders
const myLocationMarcker = { current: null };
const countryBorderLayerRef = { allCountries: null,  specificCountry: null}; 

// Cluster group for weather markers
const weatherMarkers = L.markerClusterGroup({
    maxClusterRadius: 45
});
map.addLayer(weatherMarkers);

const airportClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 25
}); 

const historicalMarkersCluster = L.markerClusterGroup({
    maxClusterRadius: 20
});

// **************************************************** 
// DOM 
function addCountrySelectEventListener() {
    const listItems = document.querySelectorAll('#countrySelect li'); // get all <li> elements
    listItems.forEach(listItem => {
        listItem.addEventListener('click', function() {
            const countryName = this.textContent;
            const isoCode = this.getAttribute('data-value');

            // update the display of the selected country
            document.getElementById('currentCountry').textContent = countryName;
            document.getElementById('currentCountry').setAttribute('data-country-iso', isoCode);

            // download information and borders for the selected country
            getCountrySpecificBorders(isoCode, map, countryBorderLayerRef);
            setCountryInform(isoCode);

            // close the list after selection
            toggleCountrySearch();
        });
    });
}

document.addEventListener("DOMContentLoaded", function() {
    // download the list of countries
    getCountryList()
        .then(countries => {
            setCountriesList(countries); // fill the list with countries
            addCountrySelectEventListener(); // adding an event for choosing a country
        })
        .catch(error => {
            showBootstrapAlert(
                'Sorry for the inconvenience, something went wrong with the server. Failed to load country list.', 
                'warning'
            );
        });

    // loading all borders
    loadAllCountryBorders(bordersLayerGroup, countryBorderLayerRef);

    // add handlers for opening/closing the list of countries
    document.getElementById('selectCountryButton').addEventListener('click', toggleCountrySearch);
    document.getElementById('closeCountrySelect').addEventListener('click', toggleCountrySearch);

    // filtering countries by the entered text
    document.getElementById('countrySearchInput').addEventListener('input', function() {
        const name = this.value.toLowerCase();
        const listItems = document.querySelectorAll('#countrySelect li'); // get all <li> for filtering
        filterCountryNames(name, listItems);
    });
});

// **************************************************** 
// User location

L.easyButton('<img src="images/button/my_location.png" width="20" height="20">', function(btn, map) {
    map.locate({setView: true}); // find the location and move the map to it
}, 'locate-btn').addTo(map);


map.locate({
    setView: true,
    maxZoom: 6,
    watch: false, // avoid constantly updating the coordinates
    enableHighAccuracy: true
});

map.on('locationfound', function(e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    getCountryByCoordinates(lat, lon)
        .then(data => {
            // console.log('getCountryByCoordinates data ', data);
            setCoutryTitle(data.countryName, data.countryISO)
            setCountryInform(data.countryISO);
        })
        .catch(error => {
            // console.error('Error fetching country by coordinates:', error);
            showBootstrapAlert('Sorry for the inconvenience, something went wrong with the server.', 'danger');
        })
    
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
    myLocationMarcker.current = L.marker(e.latlng, { icon: myLocation }).addTo(map)
        .bindPopup("You are here")
    // map.flyTo(e.latlng, 14);// Smoothly move the map to the location
    map.setView(e.latlng, 14);
});

map.on('locationerror', function(e) {
    showBootstrapAlert(e.message, 'success');
});

// **************************************************** 
// Place serch

L.easyButton('<img src="images/button/search.png" width="20" height="20">', function() {
    // modal window for city search
    const placeModal = new bootstrap.Modal(document.getElementById('placeSearchModal'));
    placeModal.show();
}, 'search-place-btn').addTo(map);

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
                setCoutryTitle(place.countryName, place.countryCode)
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

// **************************************************** 
// Info modal  
L.easyButton('<img src="images/button/info.png" width="20" height="20">', function() {
    // call the Bootstrap function to open a modal window
    const countryModal = new bootstrap.Modal(document.getElementById('countryModal'));
    countryModal.show();
}, 'info-btn').addTo(map);

// **************************************************** 
// Curency modal

L.easyButton('<img src="images/button/exchange.png" width="20" height="20">', function() {
    // const countryName = document.getElementById('currentCountry').textContent;
    const currencyCode = document.getElementById('currentCountry').getAttribute('data-curency-code');
    
    document.getElementById('currentCurencyAmount').value = '';
    document.getElementById('baseCurrencyAmount').value = '1';
    
    getCurrencyData(currencyCode)
        .then(data => {
            // console.log('data', data)
            setCurrencyData(data, currencyCode);
        })
        .catch(error => {
            console.error('Error fetching cities:', error)
        })

    const currencyModal = new bootstrap.Modal(document.getElementById('currencyModal'));
    currencyModal.show();// open model window
}, 'currency-btn').addTo(map);

// ****************************************************  
// All borders
L.easyButton('<img src="images/button/border.png" width="20" height="20">', function() {
    // If the border layer of all countries is not active, add it
    if (!map.hasLayer(bordersLayerGroup)) {
        map.setZoom(6);
        map.addLayer(bordersLayerGroup);
        // activate the button of all borders
        document.getElementById('border-btn').style.backgroundColor = 'green';  // add green color to the button
        // dictate the border button of a certain country
        document.getElementById('current-border-btn').style.backgroundColor = ''; 

        if (countryBorderLayerRef.specificCountry) {
            map.removeLayer(countryBorderLayerRef.specificCountry);
            countryBorderLayerRef.specificCountry = null;
        }
    } else {
        // If the borders are already active, hide the border layer of all countries
        map.removeLayer(bordersLayerGroup);
        document.getElementById('border-btn').style.backgroundColor = '';  // Deactivate the green button
    }
}, {
    id: 'border-btn',  // an ID to the access button
    position: 'topleft'  // location of the button on the map
}).addTo(map);

// ****************************************************  
// Current border 
L.easyButton('<img src="images/button/country.png" width="20" height="20">', function() {
    const isoCode = document.getElementById('currentCountry').getAttribute('data-country-iso');
    if (isoCode) {
        // If the borders of all countries are active, delete them
        if (map.hasLayer(bordersLayerGroup)) {
            map.removeLayer(bordersLayerGroup);
        }
        // If the border layer of the current country is not active, add it
        if (!countryBorderLayerRef.specificCountry) {
            getCountrySpecificBorders(isoCode, map, countryBorderLayerRef);  // load the borders of the current country
            
        } else {
            // if the borders of the current country are already active, delete the layer
            map.removeLayer(countryBorderLayerRef.specificCountry);
            countryBorderLayerRef.specificCountry = null;
            document.getElementById('current-border-btn').style.backgroundColor = '';  // Deactivate the red button
        }
    } else {
        showBootstrapAlert('No country selected.', 'warning');
    }
}, {
    id: 'current-border-btn',  // an ID to the access button
    position: 'topleft'
}).addTo(map);

// **************************************************** 
// Weather 
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
}).addTo(map);


// **************************************************** 
// Historycal places
L.easyButton('<img src="images/button/history.png" width="20" height="20">', function() {
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
}, 'tourist-btn').addTo(map);

// **************************************************** 
// Airoports
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

    getAirports(north, south, east, west)
        .then(airports => {
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
        })
        .catch(error => {
            // console.error('Error fetching historical places:', error);
            showBootstrapAlert('Sorry for the inconvenience, something went wrong with the Airport server. Please try again later or change the location.', 'danger');
        });
}, 'airport-btn').addTo(map);