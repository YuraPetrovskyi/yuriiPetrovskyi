export function searchPlaceByName(placeName) {
  return fetch(`php/searchPlaceByName.php?cityName=${encodeURIComponent(placeName)}`)
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error('Error fetching search places:', error));
}

