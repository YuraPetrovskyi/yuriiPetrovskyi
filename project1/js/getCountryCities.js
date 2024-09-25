// Функція для запиту до GeoNames API для отримання найбільших міст країни
export function getCountryCities(isoCode) {
    return fetch(`php/getCountryCities.php?iso=${isoCode}`)
        .then(response => response.json())
        .then(cities => {
            console.log("Cities: ", cities);
            return cities;            
        })
        .catch(error => {
            console.error('Error fetching cities:', error);
            return null; // Повертаємо null у випадку помилки
        });
}

