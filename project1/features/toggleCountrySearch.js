export function toggleCountrySearch() {
  const button = document.getElementById('selectCountryButton');
  const countrySelectContainer = document.getElementById('countrySelectContainer');
  
  if (button.classList.contains('d-none')) {
    // Return the "Choose a country" button and hide the list of countries
      button.classList.remove('d-none');
      countrySelectContainer.classList.add('d-none');
  } else {
    // We hide the button and show the list of countries
      button.classList.add('d-none');
      countrySelectContainer.classList.remove('d-none');
  }
}