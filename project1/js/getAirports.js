// getAirports.js

export function getAirports(north, south, east, west) {
    return fetch(`php/getAirports.php?north=${north}&south=${south}&east=${east}&west=${west}`)
        .then(response => response.json())
        .then(data => {
            console.log("airport data: ", data);
            return data;
        })
        .catch(error => {
            console.error('Error fetching airports:', error);
            showAlert('Sorry for the inconvenience, something went wrong with the Airport server. Please try again later or change the location.', 'danger');
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