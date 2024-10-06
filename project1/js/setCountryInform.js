// setCountryInform.js

// Function for obtaining and setting information about the country
export function setCountryInform(isoCode) {
  fetch('php/getCountryDetails.php?countryName=' + isoCode)
    .then(response => response.json())
    .then(data => {       
        const country = data[0];  // get the first country from the result
        const currencies = data[0].currencies;
        const currencyCode = Object.keys(currencies)[0]; 

        const currencyName = currencies[currencyCode].name ?? '';
        const currencySymbol = currencies[currencyCode].symbol ?? '';
        
        document.getElementById('countryName').textContent = country.name.common;
        document.getElementById('officialName').textContent = country.name.official;
        document.getElementById('capital').textContent = country.capital[0];
        document.getElementById('population').textContent = `${(country.population / 1000000).toLocaleString()} million people`;
        document.getElementById('currency').textContent = `${currencyName}, ${currencySymbol}`;
        document.getElementById('flag').innerHTML = `<img src="${country.flags.svg}" width="50">`;
        document.getElementById('region').textContent = country.region;
        document.getElementById('languages').textContent = Object.values(country.languages).join(', ');
        document.getElementById('area').textContent = `${country.area.toLocaleString()} km²`;
        document.getElementById('timezones').textContent = country.timezones.join(', ');

        document.getElementById('currentCountry').setAttribute('data-curency-code', currencyCode); // Set curency-code    
        document.getElementById('currencyModalLabel').textContent = `${currencyName}(${currencyCode}), ${currencySymbol}, ${country.name.common}`;
        document.getElementById('currentCurrencyName').textContent = `${currencyName} - ${currencyCode}`;
        document.getElementById('curenCurrencySymbol').textContent = `${currencySymbol}`;

        // document.getElementById('curenCurrencyCode').textContent = `Currency: ${currencyName}(${currencyCode}), ${currencySymbol}, ${country.name.common}`;

    })
    .catch(error => { throw error; });
}
