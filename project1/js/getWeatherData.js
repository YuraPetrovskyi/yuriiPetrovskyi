// Функція для запиту до OpenWeather API через getWeather.php
export function getWeatherData(lat, lon, locationName, map, weatherMarkers) {
  fetch(`php/getWeather.php?lat=${lat}&lon=${lon}`)
      .then(response => response.json())
      .then(data => {
          console.log('weather data: ', data);
          const temp = data.main.temp;
          const weatherDescription = data.weather[0].description;
          const iconCode = data.weather[0].icon;

          // URL для іконки погоди
          const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

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
          const marker = L.marker([lat, lon], { icon: weatherIcon }).addTo(map);

          marker.bindPopup(`<b>${locationName}</b><br>Temperature: ${temp}°C<br>Weather: ${weatherDescription}`);
          
          // Додаємо маркер до масиву для подальшого очищення
          weatherMarkers.addLayer(marker);
      })
      .catch(error => {
          console.error('Error fetching weather data:', error);
      });
}