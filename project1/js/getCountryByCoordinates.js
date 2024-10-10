// getCountryByCoordinates.js

// display the country in the navigation using coordinates
export function getCountryByCoordinates(lat, lon) {
    return fetch(`php/getCountryByCoordinates.php?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            data.countryISO = data.countryISO.toUpperCase();
            // console.log(`Your country: ${data.countryName} (${data.countryISO})`);
            // $('#countrySelect').val(data.countryISO);
            return data;
        })
        .catch(error => { throw error; });
}    
