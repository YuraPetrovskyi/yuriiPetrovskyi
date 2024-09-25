// loadCountries.js :

export function getCountryList() {
    // Тут йде запит до серверу для завантаження країн (наприклад, через fetch)
    console.log(" starting ... loadCountryList()");
    fetch('php/getCountries.php')
        .then(response => response.json())
        .then(countries => {
            console.log("loaded countries data: ", countries);
            const countrySelect = document.getElementById('countrySelect');
            // countrySelect.innerHTML = '';  // Очищаємо наявний список
            countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.iso;
            option.textContent = country.name;
            countrySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading countries:', error));
}

