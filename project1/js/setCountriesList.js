export function setCountriesList(countries) {
    // console.log("countries data: ", countries);
    const countrySelect = document.getElementById('countrySelect');
    // countrySelect.innerHTML = ''; 
    countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country.iso;
    option.textContent = country.name;
    countrySelect.appendChild(option);
    });
}