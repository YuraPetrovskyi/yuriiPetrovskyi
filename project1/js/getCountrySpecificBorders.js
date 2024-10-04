// countryBordersTwo.js

export function getCountrySpecificBorders(isoCode, map, countryBorderLayerRef) {
    if (countryBorderLayerRef.allCountries) {
        const specificCountryLayer = L.geoJSON(countryBorderLayerRef.allCountries.toGeoJSON(), {
            filter: function (feature) {
                return feature.properties.ISO_A2 === isoCode;  // Фільтруємо за ISO кодом
            },
            style: function () {
                return {
                    color: '#0000FF',  // Колір кордонів
                    weight: 3,         // Товщина лінії
                    dashArray: '5, 5', // Пунктирна лінія
                    fillOpacity: 0     // Без заливки
                };
            }
        });
        document.getElementById('border-btn').style.backgroundColor = '';
        document.getElementById('current-border-btn').style.backgroundColor = 'red';
        
        // Додаємо новий шар кордонів конкретної країни
        countryBorderLayerRef.specificCountry = specificCountryLayer.addTo(map);
        map.fitBounds(specificCountryLayer.getBounds());

        if (map.hasLayer(countryBorderLayerRef.allCountries)) {
            map.removeLayer(countryBorderLayerRef.allCountries);
        }
    } else {
        alert('All country borders are not loaded yet.');
    }
}

