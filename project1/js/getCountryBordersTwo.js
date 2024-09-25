// countryBordersTwo.js

export function getCountryBordersTwo(isoCode, map, countryBorderLayerRef) {
    fetch('php/getCountryBordersTwo.php?iso=' + isoCode)
        .then(response => response.json())
        .then(data => {
            console.log("Country borders: ", data);
            // Видаляємо попередній шар кордонів, якщо він існує
            if (countryBorderLayerRef.current) {
                map.removeLayer(countryBorderLayerRef.current);
            }
            // Додаємо новий шар кордонів зі стилями
            countryBorderLayerRef.current = L.geoJSON(data, {
                style: function () {
                    return {
                        color: '#ff0000',  // Колір кордонів
                        weight: 2,         // Товщина лінії
                        dashArray: '5, 5', // Пунктирна лінія
                        fillOpacity: 0     // Без заливки
                    };
                }
            }).addTo(map);
            map.fitBounds(countryBorderLayerRef.current.getBounds());
        })
        .catch(error => {
            console.error('Error fetching country borders:', error);
            alert('An error occurred while fetching country borders.');
        });
}

// commit test