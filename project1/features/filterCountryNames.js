export function filterCountryNames(name, options){
    options.forEach(option => {
        if (option.textContent.toLowerCase().includes(name)) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }});
}
