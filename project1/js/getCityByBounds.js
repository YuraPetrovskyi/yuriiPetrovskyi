// getCityByBounds.js

// Функція для запиту до GeoNames API для отримання міст межах певної зони
export function getCityByBounds(north, south, east, west) {
  return fetch(`php/getCityByBounds.php?north=${north}&south=${south}&east=${east}&west=${west}`)
  // return fetch(`php/getCityByBounds.php`)

      .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(cities => {
        console.log("Cities within map bounds: ", cities);
        return cities;           
      })
      .catch(error => {
          console.error('Error fetching cities:', error);
          return null; // Повертаємо null у випадку помилки
      });
}

