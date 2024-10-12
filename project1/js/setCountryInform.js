// setCountryInform.js

// Function for obtaining and setting information about the country
// export function setCountryInform(isoCode) {
//   fetch('php/getCountryDetails.php?countryName=' + isoCode)
//     .then(response => response.json())
//     .then(data => {       
//         const country = data[0];  // get the first country from the result
//         const currencies = data[0].currencies;
//         const currencyCode = Object.keys(currencies)[0]; 

//         const currencyName = currencies[currencyCode].name ?? '';
//         const currencySymbol = currencies[currencyCode].symbol ?? '';
        
//         document.getElementById('countryName').textContent = country.name.common;
//         document.getElementById('officialName').textContent = country.name.official;
//         document.getElementById('capital').textContent = country.capital[0];
//         document.getElementById('population').textContent = `${(country.population / 1000000).toLocaleString()} million people`;
//         document.getElementById('currency').textContent = `${currencyName}, ${currencySymbol}`;
//         document.getElementById('flag').innerHTML = `<img src="${country.flags.svg}" width="50">`;
//         document.getElementById('region').textContent = country.region;
//         document.getElementById('languages').textContent = Object.values(country.languages).join(', ');
//         document.getElementById('area').textContent = `${country.area.toLocaleString()} km²`;
//         document.getElementById('timezones').textContent = country.timezones.join(', ');
        
//         document.getElementById('currencyModalLabel').textContent = `${currencyName}(${currencyCode}), ${currencySymbol}, ${country.name.common}`;
//         document.getElementById('currentCurrencyName').textContent = `${currencyName} - ${currencyCode}`;
//         document.getElementById('curenCurrencySymbol').textContent = `${currencySymbol}`;
//         $('#curenCurrencyCodeConverter').text(currencyCode);

//         console.log('#curenCurrencyCodeConverter', currencyCode);

//     })
//     .catch(error => { throw error; });
// }

export function setCountryInform(isoCode) {
    fetch('php/getCountryDetails.php?countryName=' + isoCode)
        .then(response => response.json())
        .then(data => {       
            const country = data[0];  // беремо першу країну з результату
            const currencies = country.currencies;
            const currencyCode = Object.keys(currencies)[0];  // беремо перший код валюти

            const currencyName = currencies[currencyCode]?.name ?? '';
            const currencySymbol = currencies[currencyCode]?.symbol ?? '';

            // Заповнюємо інформацію за допомогою jQuery
            $('#countryName').text(country.name.common);
            $('#officialName').text(country.name.official);
            $('#capital').text(country.capital[0]);
            $('#population').text(`${(country.population / 1000000).toLocaleString()} million people`);
            $('#currency').text(`${currencyName}, ${currencySymbol}`);
            $('#flag').html(`<img src="${country.flags.svg}" width="50">`);
            $('#region').text(country.region);
            $('#languages').text(Object.values(country.languages).join(', '));
            $('#area').text(`${country.area.toLocaleString()} km²`);
            $('#timezones').text(country.timezones.join(', '));

            // Оновлюємо модальне вікно для валюти
            $('#currencyModalLabel').text(`${currencyName}(${currencyCode}), ${currencySymbol}, ${country.name.common}`);
            $('#currentCurrencyName').text(`${currencyName} - ${currencyCode}`);
            $('#curenCurrencySymbol').text(currencySymbol);
            $('#curenCurrencyCodeConverter').text(currencyCode);
            
            console.log('#curenCurrencyCodeConverter', currencyCode);
            $('#countrySelect').val(isoCode);

        })
        .catch(error => { 
            console.error(error);
            showBootstrapAlert('Error fetching country information', 'danger');
        });
}

