// getCountryDetails.js

// Функція для отримання інформації про країну
export function getCountryDetails(countryName) {
  fetch('php/getCountryDetails.php?countryName=' + countryName)
    .then(response => response.json())
    .then(data => {
        console.log('getCountryDetails: ', data);
        const country = data[0];  // Отримуємо першу країну з результату
        document.getElementById('countryName').textContent = country.name.common;
        document.getElementById('officialName').textContent = country.name.official;
        document.getElementById('capital').textContent = country.capital[0];
        document.getElementById('population').textContent = country.population.toLocaleString();
        document.getElementById('currency').textContent = Object.values(country.currencies)[0].name;
        document.getElementById('flag').innerHTML = `<img src="${country.flags.svg}" width="50">`;
        document.getElementById('region').textContent = country.region;
        document.getElementById('languages').textContent = Object.values(country.languages);
        document.getElementById('area').textContent = country.area;
        document.getElementById('timezones').textContent = country.timezones;
    })
    .catch(error => console.error('Error fetching country details:', error));
}
