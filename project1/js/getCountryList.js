// loadCountries.js :

export function getCountryList() {
    return fetch('php/getCountries.php')
        .then(response => response.json())
        .then(countries => countries)
        .catch(error => { throw error; });
}

