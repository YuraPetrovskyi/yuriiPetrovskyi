// getCountryByCoordinates.js
// відображаємо країну в навігації за допомогою координат

export function getCountryByCoordinates(lat, lon) {
    return fetch(`php/getCountryByCoordinates.php?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            console.log('Country data from getCountryByCoordinates.php:', data);
            const countryName = data.address.country;
            const countryISO = data.address.country_code.toUpperCase();
            console.log(`Ваша країна: ${countryName} (${countryISO})`);
            let countryDate = {};
            countryDate.countryname = countryName;
            countryDate.countryiso = countryISO;
            return  countryDate;
        })
        .catch(error => {
            console.error('Error fetching country by coordinates:', error);
            return null;
        });
}