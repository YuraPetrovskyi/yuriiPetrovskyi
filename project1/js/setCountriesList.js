// export function setCountriesList(countries) {
//   const countrySelect = document.getElementById('countrySelect');
//   countrySelect.innerHTML = ''; 
//   countries.forEach(country => {
//       const listItem = document.createElement('li');
//       listItem.classList.add('list-group-item');
//       listItem.textContent = country.name;
//       listItem.setAttribute('data-value', country.iso);
//       countrySelect.appendChild(listItem);
//   });
// }

export function setCountriesList(countries) {
  const $countrySelect = $('#countrySelect');
  $countrySelect.empty();
  console.log('countries', countries)
  
  countries.forEach(country => {
      const option = $('<option></option>')
        .val(country.iso)
        .text(country.name);
      $countrySelect.append(option);
  });
}