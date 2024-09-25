export function toggleCountrySearch() {
  const button = document.getElementById('selectCountryButton');
  const countrySelectContainer = document.getElementById('countrySelectContainer');
  
  if (button.classList.contains('d-none')) {
    // Повертаємо кнопку "Select Country" і приховуємо список країн
      button.classList.remove('d-none');
      countrySelectContainer.classList.add('d-none');
  } else {
    // Приховуємо кнопку і показуємо список країн
      button.classList.add('d-none');
      countrySelectContainer.classList.remove('d-none');
  }
}