// getAirports.js

export function getAirports(north, south, east, west, isoCode) {
    return fetch(`php/getAirports.php?north=${north}&south=${south}&east=${east}&west=${west}&isoCode=${isoCode}`)
        .then(response => response.json())
        .then(data => {
            // console.log("airport data: ", data);
            return data;
        })
        .catch(error => { throw error; });
};