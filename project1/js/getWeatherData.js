// getWatherData.js

// A function to query the OpenWeather API via getWeather.php
export function getWeatherData(lat, lon, locationName, weatherMarkers) {
    fetch(`php/getWeather.php?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            // console.log('weather data: ', data);
            const temp = data.temp;
            const clouds = data.clouds;
            const humidity = data.humidity;
            const pressure = data.pressure;
            const windSpeed = data.windSpeed;
            const windDirection = data.windDirection;
            const country = data.country;
            const iconCode = data.icon;
            const weatherDescription = data.weatherDescription;

            if (locationName === 'none') {
                locationName = data.name;
            }

            
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

            // HTML table for popup
            const weatherPopupContent = `
                <div class="weather-popup">
                    <img src="${iconUrl}" alt="Weather icon" class="img-fluid w-50 h-50" />
                    <h4>${locationName}, ${country}</h4>
                    <table class="table table-sm">
                    <tbody>
                        <tr><td class="city-param-name">Temp</td><td class="city-param">${temp}ºC</td></tr>
                        <tr><td class="city-param-name">Clouds</td><td class="city-param">${clouds}%</td></tr>
                        <tr><td class="city-param-name">Humidity</td><td class="city-param">${humidity}%</td></tr>
                        <tr><td class="city-param-name">Pressure</td><td class="city-param">${pressure} hPa</td></tr>
                        <tr><td class="city-param-name">Wind Speed</td><td class="city-param">${windSpeed} m/s</td></tr>
                        <tr><td class="city-param-name">Wind Direction</td><td class="city-param">${windDirection}°</td></tr>
                        <tr><td class="city-param-name">Wather</td><td class="city-param">${weatherDescription}</td></tr>
                    </tbody>
                    </table>
                </div>
            `;

            const weatherIcon = L.divIcon({
                className: '',
                html: `
                    <div class="d-flex align-items-center p-1 rounded shadow-sm" style="position: relative;">
                        <img src="${iconUrl}" class="img-fluid" alt="Weather icon" style="width: 70px; height: 70px;" />
                        <div class="text-primary fw-bold fs-5" style="margin-left: -8px; position: absolute; left: 70px;">${temp.toFixed()}°C</div>
                    </div>
                `,
                iconSize: [50, 50], 
                iconAnchor: [30, 30]
            });

            // Add a marker with a custom icon
            const marker = L.marker([lat, lon], { icon: weatherIcon });
            marker.bindPopup(weatherPopupContent);
            // Add a marker to the cluster group
            weatherMarkers.addLayer(marker);
        })
        .catch(error => {
            // console.error('Error fetching weather data:', error);
            showAlert('Sorry for the inconvenience, something went wrong with the Weather server. Please try again later or change the location.', 'danger');
        });
}

function showAlert(message, alertType = 'success', autoClose = true, closeDelay = 10000) {
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
                alertNode.classList.remove('show'); // hide messages
                alertNode.addEventListener('transitionend', () => alertNode.remove());
            }
        }, closeDelay);
    }
}