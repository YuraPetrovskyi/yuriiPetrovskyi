// Функція для запиту до OpenWeather API через getWeather.php
export function getWeatherData(lat, lon, locationName, map, weatherMarkers) {
    fetch(`php/getWeather.php?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            console.log('weather data: ', data);
            const temp = data.main.temp;
            const clouds = data.clouds.all;
            const humidity = data.main.humidity;
            const pressure = data.main.pressure;
            const windSpeed = data.wind.speed;
            const windDirection = data.wind.deg;
            const country = data.sys.country;
            const iconCode = data.weather[0].icon;
            const weatherDescription = data.weather[0].description;

            // URL для іконки погоди
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

            // Створюємо HTML для попапу з таблицею
            const weatherPopupContent = `
                <div class="weather-popup">
                    <img src="${iconUrl}" alt="Weather icon" style="width: 50px; height: 50px;" />
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

            // Створюємо кастомну іконку з використанням класів Bootstrap
            const weatherIcon = L.divIcon({
                className: '',  // Не потрібно окремого класу
                html: `
                    <div class="text-center p-1  rounded shadow-sm">
                        <img src="${iconUrl}" class="img-fluid" alt="Weather icon" style="width: 50px; height: 50px;" />
                        <div class="fw-bold text-primary">${temp}°C</div>
                    </div>
                `,
                iconSize: [60, 60], // Загальний розмір іконки
                iconAnchor: [30, 30] // Точка, де іконка "кріпиться" на карті
            });

            // Додаємо маркер з кастомною іконкою
            const marker = L.marker([lat, lon], { icon: weatherIcon });

            marker.bindPopup(weatherPopupContent);
            
            // Додаємо маркер до кластерної групи
            weatherMarkers.addLayer(marker);
            // Додаємо маркер до масиву для подальшого очищення
            console.log('weatherMarkers', weatherMarkers);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}