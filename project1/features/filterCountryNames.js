export function filterCountryNames(name, options) {
    options.forEach(option => {
        if (option.textContent.toLowerCase().includes(name.toLowerCase())) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    });
}