// getHistoricalPlaces.js

export function getHistoricalPlaces(lat, lng) {
    return fetch(`php/getHistoricalPlaces.php?lat=${lat}&lng=${lng}`)
        .then(response => response.json())
        .then(data => {
            console.log('getHistoricalPlaces data: ', data);
            return data.geonames;
        })
        .catch(error => {
            console.error('Error fetching historical places:', error);
            return [];
        });
    }