export function setCountriesList(countries) {
  const countrySelect = document.getElementById('countrySelect');
  countrySelect.innerHTML = ''; 
  countries.forEach(country => {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item');
      listItem.textContent = country.name;
      listItem.setAttribute('data-value', country.iso);
      countrySelect.appendChild(listItem);
  });
}