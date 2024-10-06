// countryBordersTwo.js

export function getCountrySpecificBorders(isoCode, map, countryBorderLayerRef) {
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
        document.getElementById('border-btn').style.backgroundColor = '';
        document.getElementById('current-border-btn').style.backgroundColor = 'red';
        
        // We add a new layer of borders of a specific country
        countryBorderLayerRef.specificCountry = specificCountryLayer.addTo(map);
        map.fitBounds(specificCountryLayer.getBounds());

        if (map.hasLayer(countryBorderLayerRef.allCountries)) {
            map.removeLayer(countryBorderLayerRef.allCountries);
        }
    } else {
        showAlert('Sorry for the inconvenience, country borders are not loaded yet. Please try again later.', 'danger');
    }
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