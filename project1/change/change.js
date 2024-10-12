

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


// Weather 
// var weatherBtn = L.easyButton('<img src="images/button/weather.png" width="20" height="20">', function () {
//     weatherMarkers.clearLayers();

//     const bounds = map.getBounds();
//     const north = bounds.getNorth();
//     const south = bounds.getSouth();
//     const east = bounds.getEast();
//     const west = bounds.getWest();

//     const center = bounds.getCenter();
//     const zoomLevel = map.getZoom();
//     // console.log("zoomLevel:", zoomLevel);

//     if (zoomLevel > 14) {
//         getWeatherData(center.lat, center.lng, 'none', weatherMarkers);
//     } else if (zoomLevel <= 14 && zoomLevel > 10) {
//         // console.log("zoomLevel:", zoomLevel);
//         getCityByBounds(north, south, east, west).then(cities => {
//             if (cities.length === 0){
//                 getWeatherData(center.lat, center.lng, 'none', weatherMarkers);
//                 return;
//             }
//             cities.forEach(city => {
//                 getWeatherData(city.lat, city.lng, city.name, weatherMarkers);        
//             });
//         });
//     } else if (zoomLevel <= 10 && zoomLevel > 6) {
//         getCityByBounds(north, south, east, west, 'PPL').then(cities => {
//             if (cities.length === 0){
//                 getWeatherData(center.lat, center.lng, 'none', weatherMarkers);
//                 return;
//             }           
//             cities.forEach(city => {
//                 if (city.fcode !== "PPL") {
//                     getWeatherData(city.lat, city.lng, city.name, weatherMarkers);        
//                 }
//             });
//         });
//     } else {
//         showBootstrapAlert(
//             "The map zoom level is too large to retrieve weather data. We have adjusted the zoom level to provide a better view and access to weather information.",
//             'info'
//         );
//         map.setZoom(7);
//     }
//     map.addLayer(weatherMarkers);
// });