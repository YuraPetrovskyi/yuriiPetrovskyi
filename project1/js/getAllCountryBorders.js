// loadAllCountryBorders.js

let countryBordersLayer = null;

export function getdAllCountryBorders(map) {
    if (countryBordersLayer) {
        // Якщо шар уже є на карті, видаляємо його (приховуємо кордони)
        map.removeLayer(countryBordersLayer);
        countryBordersLayer = null;
    } else {
        // Використовуємо PHP-файл для отримання GeoJSON даних кордонів
        fetch('php/getAllCountryBorders.php')
            .then(response => response.json())
            .then(data => {
                console.log("Borders data: ", data);
                // Додаємо країни як шар на карту
                countryBordersLayer = L.geoJSON(data, {
                    style: {
                        color: '#ff0000',  // Колір кордонів
                        weight: 2,         // Товщина лінії
                        dashArray: '5, 5',  // Пунктирна лінія
                        fillOpacity: 0     // Без заливки
                    },
                    onEachFeature: function (feature, layer) {
                        // Додаємо попап з назвою країни при натисканні
                        layer.bindPopup(`<b>${feature.properties.ADMIN}</b>`);
                        // Додаємо обробник події на клік для оновлення назви країни в <span>
                        layer.on('click', function () {
                            const countryName = feature.properties.ADMIN;
                            const isoCode = feature.properties.ISO_A2;  // ISO код країни

                            // Оновлюємо елемент <span> з поточною країною
                            const currentCountryElement = document.getElementById('currentCountry');
                            currentCountryElement.textContent = countryName;
                            currentCountryElement.setAttribute('data-country-iso', isoCode);
                        });
                    }
                }).addTo(map);

                // Автоматично маштабуємо карту на кордони
                // map.fitBounds(countryBordersLayer.getBounds());
                map.setZoom(6);
            })
            .catch(error => {
                console.error('Error loading country borders:', error);
            });
    }
}
