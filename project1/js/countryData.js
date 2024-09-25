// countryData.js

export function fetchCountryData(countryName, isoCode, map, markerRef) {
    fetch('php/getCountryData.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryName: countryName, isoCode: isoCode })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Country data: ", data);
        if (data && data.geometry) {
            const lat = data.geometry.lat;
            const lng = data.geometry.lng;

            // Центруємо карту на координатах країни
            // map.setView([lat, lng], 6);

            // Додаємо маркер
            if (markerRef.current) {
                map.removeLayer(markerRef.current);
            }
            // Додавання маркеру
            markerRef.current = L.marker([lat, lng]).addTo(map);
            // Додавання попапа з назвою країни
            markerRef.current.bindPopup(`<b>${data.formatted}</b>`).openPopup();
        } else {
            alert('No data found for the selected country.');
        }
    })
    .catch(error => {
        console.error('Error fetching country data:', error);
        alert('An error occurred while fetching country data.');
    });
}


