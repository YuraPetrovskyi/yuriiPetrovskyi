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
            // Оновлюємо інформацію про валюту
            
            // document.getElementById('currencyName').textContent = currencyCode;
            // document.getElementById('currencySymbol').textContent = data.symbol;

            // document.getElementById('currentName').textContent = `${currencyCode}`;

            // document.getElementById('currentCurrencyName').textContent = `${data.rates[currencyCode]}`;
            document.getElementById('curenCurrencyCode').textContent = `${data.rates[currencyCode]}`;
            document.getElementById('EUR').textContent = `${data.rates['EUR']}`;
            document.getElementById('GBP').textContent = `${data.rates['GBP']}`;
            document.getElementById('CNY').textContent = `${data.rates['CNY']}`;

            
            // // Оновлюємо таблицю курсів
            // const ratesTable = document.getElementById('currencyRatesTable');
            // // ratesTable.innerHTML = '';  // Очищуємо таблицю перед оновленням

            // const currencies = ['USD', 'EUR', 'GBP', 'CNY', currencyCode];
            // currencies.forEach(currency => {
            //     const rate = data.rates[currency] || 'N/A';  // Отримуємо курс для кожної валюти
            //     const row = document.createElement('tr');
            //     row.innerHTML = `<td>${currency}</td><td>${rate}</td>`;
            //     ratesTable.appendChild(row);
            // });

            // Показуємо модальне вікно
            const currencyModal = new bootstrap.Modal(document.getElementById('currencyModal'));
            currencyModal.show();
        })
        .catch(error => {
            console.error('Error fetching currency data:', error);
        });
}

