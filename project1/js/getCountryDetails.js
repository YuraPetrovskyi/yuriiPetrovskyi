// getCountryDetails.js

// Функція для отримання інформації про країну
export function getCountryDetails(isoCode) {
  fetch('php/getCountryDetails.php?countryName=' + isoCode)
    .then(response => response.json())
    .then(data => {
        console.log('getCountryDetails: ', data);
        console.log('currency -> ',Object.values(data[0].currencies));

        const country = data[0];  // Отримуємо першу країну з результату
        const currencies = data[0].currencies;  // Отримуємо об'єкт currencies
        const currencyCode = Object.keys(currencies)[0]; 
        // Доступ до назви валюти і символу
        const currencyName = currencies[currencyCode].name ?? '';
        const currencySymbol = currencies[currencyCode].symbol ?? '';
        console.log('currencies', currencies);

        console.log('currencyCode', currencyCode);
        console.log('currencyName', currencyName);
        console.log('currencySymbol', currencySymbol);


        document.getElementById('countryName').textContent = country.name.common;
        document.getElementById('officialName').textContent = country.name.official;
        document.getElementById('capital').textContent = country.capital[0];
        document.getElementById('population').textContent = country.population.toLocaleString();
        document.getElementById('currency').textContent = `${currencyName}, ${currencySymbol}`;
        document.getElementById('flag').innerHTML = `<img src="${country.flags.svg}" width="50">`;
        document.getElementById('region').textContent = country.region;
        document.getElementById('languages').textContent = Object.values(country.languages);
        document.getElementById('area').textContent = country.area;
        document.getElementById('timezones').textContent = country.timezones;

        document.getElementById('currentCountry').setAttribute('data-curency-code', currencyCode); // Зберігаємо curency-code    
        document.getElementById('currencyModalLabel').textContent = `${currencyName}(${currencyCode}), ${currencySymbol}, ${country.name.common}`;
        document.getElementById('currentCurrencyName').textContent = `${currencyName} ${currencyCode}`;
        // document.getElementById('curenCurrencyCode').textContent = `Currency: ${currencyName}(${currencyCode}), ${currencySymbol}, ${country.name.common}`;

    })
    .catch(error => console.error('Error fetching country details:', error));
}
