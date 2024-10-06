// getCityByBounds.js
export function getCityByBounds(north, south, east, west, fcode = '') {
  const url = fcode 
    ? `php/getCityByBounds.php?north=${north}&south=${south}&east=${east}&west=${west}&fcode=${fcode}` 
    : `php/getCityByBounds.php?north=${north}&south=${south}&east=${east}&west=${west}`;
  return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(cities => {
        if (!Array.isArray(cities)) {
          throw new Error('Unexpected data format');
        }
        // console.log("Cities within map bounds: ", cities);
        return cities;           
      })
      .catch(error => {
          // console.error('Error fetching cities:', error);
          showAlert('Sorry for the inconvenience, something went wrong with the server. Please try again later or change the location.', 'danger');
          return null; 
      });
}

function showAlert(message, alertType = 'success', autoClose = true, closeDelay = 10000) {
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