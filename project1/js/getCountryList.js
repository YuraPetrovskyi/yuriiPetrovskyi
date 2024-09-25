// loadCountries.js :

// Функція для завантаження списку країн
// export function loadCountryList() {
//     console.log(" starting ... loadCountryList()");
    
//     fetch('php/getCountries.php')
//         .then(response => response.json()) // Перетворюємо відповідь у формат JSON
//         .then(data => {
//             console.log("load countries data: ", data);
//             const countrySelect = document.getElementById('countrySelect');
//             countrySelect.innerHTML = '';  // Очищаємо наявний список

//           // Додаємо країни у випадаючий список
//             data.forEach(country => {
//                 const option = document.createElement('option');
//                 option.value = country.iso;
//                 option.textContent = country.name;
//                 countrySelect.appendChild(option);
//             });
//         })
//         .catch(error => {
//             console.error('Error fetching countries:', error);
//         });
// }

export function getCountryList() {
    // Тут йде запит до серверу для завантаження країн (наприклад, через fetch)
    console.log(" starting ... loadCountryList()");
    fetch('php/getCountries.php')
        .then(response => response.json())
        .then(countries => {
            console.log("loaded countries data: ", countries);
            const select = document.getElementById('countrySelect');
            countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.iso;
            option.textContent = country.name;
            select.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading countries:', error));
}

