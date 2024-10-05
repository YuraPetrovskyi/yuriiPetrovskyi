// getHistoricalPlaces.js
export function getHistoricalPlaces(lat, lng) {
    return fetch(`php/getHistoricalPlaces.php?lat=${lat}&lng=${lng}`)
        .then(response => response.json())
        .then(data => {
            console.log('getHistoricalPlaces data: ', data);
            return data.geonames;
        })
        .catch(error => {
            // console.error('Error fetching historical places:', error);
            showAlert('Sorry for the inconvenience, something went wrong with the Historical server. Please try again later or change the location.', 'danger');
            return [];
        });
    }

function showAlert(message, alertType = 'success', autoClose = true, closeDelay = 15000) {
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
    }
}