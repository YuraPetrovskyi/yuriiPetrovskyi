// getCurrencyData .js

export function getCurrencyData(currencyCode) {
    const baseCurrency = 'USD';
    return fetch(`php/getCurrencyRates.php?currencyCode=${currencyCode}&baseCurrency=${baseCurrency}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            return data;
        })
        .catch(error => {
            // console.error('Error fetching currency data:', error);
            error => { throw error; }
        });
}

