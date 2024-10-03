export function getAirports(north, south, east, west) {
  return fetch(`php/getAirports.php?north=${north}&south=${south}&east=${east}&west=${west}`)
      .then(response => response.json())
      .then(data => {
        console.log("airport data: ", data);
        return data.geonames;
      })
      .catch(error => {
          console.error('Error fetching airports:', error);
          return [];
      });
}
