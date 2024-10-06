// getCountryByCoordinates.js
// display the country in the navigation using coordinates

export function getCountryByCoordinates(lat, lon) {
    return fetch(`php/getCountryByCoordinates.php?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            data.countryISO = data.countryISO.toUpperCase();
            // console.log(`Your country: ${data.countryName} (${data.countryISO})`);
            return data;
        })
        .catch(error => {
            console.error('Error fetching country by coordinates:', error);
            showAlert('Sorry for the inconvenience, something went wrong with the Country Data server. Please try again later or change the location.', 'danger');
                return [];
            });
    };

function showAlert(message, alertType = 'success', autoClose = true, closeDelay = 5000) {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    const alertHtml = `
        <div class="alert alert-${alertType} alert-dismissible fade show text-center" role="alert" style="z-index: 2000;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    alertPlaceholder.innerHTML = alertHtml;
    if (autoClose) {
        setTimeout(() => {
            const alertNode = alertPlaceholder.querySelector('.alert');
            if (alertNode) {
                alertNode.classList.remove('show'); // hide messages
                alertNode.addEventListener('transitionend', () => alertNode.remove());
            }
        }, closeDelay);
    };
};