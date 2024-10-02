// setCoutryTitle.js
// відображаємо країну в навігації за допомогою координат

export function setCoutryTitle(countryName, countryISO) {
  // Відображаємо країну користувача в новому контейнері навігаційної панелі
  console.log(`Встановлено країну: ${countryName} (${countryISO})`);
  document.getElementById('currentCountry').textContent = `${countryName}`;
  document.getElementById('currentCountry').setAttribute('data-country-iso', countryISO); // Зберігаємо ISO-код
}