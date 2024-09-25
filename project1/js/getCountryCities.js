// Функція для запиту до GeoNames API для отримання найбільших міст країни
export function getCountryCities(isoCode) {
    fetch(`php/getCountryCities.php?iso=${isoCode}`)
        .then(response => response.json())
        .then(data => {
            console.log("Cities: ", data);
            data.forEach(city => {
                // Отримуємо погоду для кожного міста
                getWeatherData(city.lat, city.lng, city.name);
            });
        })
        .catch(error => {
            console.error('Error fetching cities:', error);
        });
}

