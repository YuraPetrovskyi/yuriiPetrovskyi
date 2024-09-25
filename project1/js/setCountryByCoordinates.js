// setCountryByCoordinates.js
// відображаємо країну в навігації за допомогою координат

export function setCountryByCoordinates(lat, lon) {
    fetch(`php/getCountryByCoordinates.php?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            console.log('Country data from getCountryByCoordinates.php:', data);
            const userCountry = data.address.country;
            const userCountryISO = data.address.country_code.toUpperCase();
            console.log(`Ваша країна: ${userCountry} (${userCountryISO})`);

            // Відображаємо країну користувача в новому контейнері навігаційної панелі
            document.getElementById('currentCountry').textContent = `${userCountry}`;
            document.getElementById('currentCountry').setAttribute('data-country-iso', userCountryISO); // Зберігаємо ISO-код
        })
        .catch(error => {
            console.error('Error fetching country by coordinates:', error);
        });
}