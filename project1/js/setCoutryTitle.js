// setCoutryTitle.js
// display the country in the navigation using coordinates

export function setCoutryTitle(countryName, countryISO) {
  // console.log(`country is: ${countryName} (${countryISO})`);
  document.getElementById('currentCountry').textContent = `${countryName}`;
  document.getElementById('currentCountry').setAttribute('data-country-iso', countryISO);
}