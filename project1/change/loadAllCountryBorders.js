//loadAllCountryBorders.js

import { setCountryInform } from "./setCountryInform.js";

// A function to download the borders of all countries and store them in a layer
export function loadAllCountryBorders(bordersLayerGroup, countryBorderLayerRef) {
    // getting GeoJSON boundary data
    fetch('php/getAllCountryBorders.php')
        .then(response => response.json())
        .then(data => {
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
            // console.log('Borders loaded and stored in bordersLayerGroup.');
        })
        .catch(error => {
            // console.error('Error loading country borders:', error);
            showAlert('Sorry for the inconvenience, all country borders are not loaded yet. An Error occurred while trying to get all borders, please try again later.', 'danger');
        });
}

function showAlert(message, alertType = 'success', autoClose = true, closeDelay = 5000) {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    const alertHtml = `
        <div class="alert alert-${alertType} alert-dismissible fade show text-center" role="alert" style="z-index: 2000;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    alertPlaceholder.innerHTML = alertHtml;
    if (autoClose) {
        setTimeout(() => {
            const alertNode = alertPlaceholder.querySelector('.alert');
            if (alertNode) {
                alertNode.classList.remove('show');
                alertNode.addEventListener('transitionend', () => alertNode.remove());
            }
        }, closeDelay);
    };
};
