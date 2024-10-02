// showCurrencyModal .js

export function showCurrencyModal(currencyCode) {
    const baseCurrency = 'USD'; // Базова валюта за замовчуванням - долар
    fetch(`php/getCurrencyRates.php?currencyCode=${currencyCode}&baseCurrency=${baseCurrency}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error fetching currency data:', data.error);
                return;
            }
            console.log(data);
            
            document.getElementById('curenCurrencyCode').textContent = `${data.rates[currencyCode].toFixed(2)}`;
            document.getElementById('curenCurrencyCodeConverter').textContent = `${currencyCode}`;

            document.getElementById('USD').textContent = `${data.rates['USD'].toFixed(2)}`;
            document.getElementById('EUR').textContent = `${data.rates['EUR'].toFixed(2)}`;
            document.getElementById('GBP').textContent = `${data.rates['GBP'].toFixed(2)}`;
            document.getElementById('CNY').textContent = `${data.rates['CNY'].toFixed(2)}`;
            document.getElementById('JPY').textContent = `${data.rates['JPY'].toFixed(2)}`;
            document.getElementById('INR').textContent = `${data.rates['INR'].toFixed(2)}`;
            document.getElementById('CAD').textContent = `${data.rates['CAD'].toFixed(2)}`;

            document.getElementById('baseCurrencyAmount').addEventListener('input', function() {
                document.getElementById('currentCurencyAmount').value = '';
                const amount = this.value;
                document.getElementById('curenCurrencyCode').textContent = (data.rates[currencyCode] * amount).toFixed(2);
                document.getElementById('USD').textContent = (data.rates['USD'] * amount).toFixed(2);
                document.getElementById('EUR').textContent = (data.rates['EUR'] * amount).toFixed(2);
                document.getElementById('GBP').textContent = (data.rates['GBP'] * amount).toFixed(2);
                document.getElementById('CNY').textContent = (data.rates['CNY'] * amount).toFixed(2);
                document.getElementById('JPY').textContent = (data.rates['JPY'] * amount).toFixed(2);
                document.getElementById('INR').textContent = (data.rates['INR'] * amount).toFixed(2);
                document.getElementById('CAD').textContent = (data.rates['CAD'] * amount).toFixed(2);
            });
            const k = 1 / data.rates[currencyCode];

            document.getElementById('currentCurencyAmount').addEventListener('input', function() {
                document.getElementById('baseCurrencyAmount').value = '';
                const amount = this.value;
                document.getElementById('curenCurrencyCode').textContent = amount;
                document.getElementById('USD').textContent = (data.rates['USD'] * amount * k).toFixed(2);
                document.getElementById('EUR').textContent = (data.rates['EUR'] * amount * k).toFixed(2);
                document.getElementById('GBP').textContent = (data.rates['GBP'] * amount * k).toFixed(2);
                document.getElementById('CNY').textContent = (data.rates['CNY'] * amount * k).toFixed(2);
                document.getElementById('JPY').textContent = (data.rates['JPY'] * amount * k).toFixed(2);
                document.getElementById('INR').textContent = (data.rates['INR'] * amount * k).toFixed(2);
                document.getElementById('CAD').textContent = (data.rates['CAD'] * amount * k).toFixed(2);
            });

            // Показуємо модальне вікно
            const currencyModal = new bootstrap.Modal(document.getElementById('currencyModal'));
            currencyModal.show();
        })
        .catch(error => {
            console.error('Error fetching currency data:', error);
        });
}

