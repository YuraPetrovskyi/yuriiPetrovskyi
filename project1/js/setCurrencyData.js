// export function setCurrencyData(data, currencyCode) {
//     document.getElementById('curenCurrencyCode').textContent = `${data.rates[currencyCode].toFixed(2)}`;
//     document.getElementById('USD').textContent = `${data.rates['USD'].toFixed(2)}`;
//     document.getElementById('EUR').textContent = `${data.rates['EUR'].toFixed(2)}`;
//     document.getElementById('GBP').textContent = `${data.rates['GBP'].toFixed(2)}`;
//     document.getElementById('CNY').textContent = `${data.rates['CNY'].toFixed(2)}`;
//     document.getElementById('JPY').textContent = `${data.rates['JPY'].toFixed(2)}`;
//     document.getElementById('INR').textContent = `${data.rates['INR'].toFixed(2)}`;
//     document.getElementById('CAD').textContent = `${data.rates['CAD'].toFixed(2)}`;

//     document.getElementById('baseCurrencyAmount').addEventListener('input', function() {
//         document.getElementById('currentCurencyAmount').value = '';
//         const amount = this.value;
//         document.getElementById('curenCurrencyCode').textContent = (data.rates[currencyCode] * amount).toFixed(2);
//         document.getElementById('USD').textContent = (data.rates['USD'] * amount).toFixed(2);
//         document.getElementById('EUR').textContent = (data.rates['EUR'] * amount).toFixed(2);
//         document.getElementById('GBP').textContent = (data.rates['GBP'] * amount).toFixed(2);
//         document.getElementById('CNY').textContent = (data.rates['CNY'] * amount).toFixed(2);
//         document.getElementById('JPY').textContent = (data.rates['JPY'] * amount).toFixed(2);
//         document.getElementById('INR').textContent = (data.rates['INR'] * amount).toFixed(2);
//         document.getElementById('CAD').textContent = (data.rates['CAD'] * amount).toFixed(2);
//     });
    
//     const k = 1 / data.rates[currencyCode];

//     document.getElementById('currentCurencyAmount').addEventListener('input', function() {
//         document.getElementById('baseCurrencyAmount').value = '';
//         const amount = this.value;
//         document.getElementById('curenCurrencyCode').textContent = amount;
//         document.getElementById('USD').textContent = (data.rates['USD'] * amount * k).toFixed(2);
//         document.getElementById('EUR').textContent = (data.rates['EUR'] * amount * k).toFixed(2);
//         document.getElementById('GBP').textContent = (data.rates['GBP'] * amount * k).toFixed(2);
//         document.getElementById('CNY').textContent = (data.rates['CNY'] * amount * k).toFixed(2);
//         document.getElementById('JPY').textContent = (data.rates['JPY'] * amount * k).toFixed(2);
//         document.getElementById('INR').textContent = (data.rates['INR'] * amount * k).toFixed(2);
//         document.getElementById('CAD').textContent = (data.rates['CAD'] * amount * k).toFixed(2);
//     });
// }

export function setCurrencyData(data, currencyCode) {
    // Оновлюємо значення елементів за допомогою jQuery
    $('#curenCurrencyCode').text(data.rates[currencyCode].toFixed(2));
    $('#USD').text(data.rates['USD'].toFixed(2));
    $('#EUR').text(data.rates['EUR'].toFixed(2));
    $('#GBP').text(data.rates['GBP'].toFixed(2));
    $('#CNY').text(data.rates['CNY'].toFixed(2));
    $('#JPY').text(data.rates['JPY'].toFixed(2));
    $('#INR').text(data.rates['INR'].toFixed(2));
    $('#CAD').text(data.rates['CAD'].toFixed(2));

    // Обробник події для введення базової валюти
    $('#baseCurrencyAmount').on('input', function() {
        $('#currentCurencyAmount').val('');  // Очищаємо поле
        const amount = $(this).val();  // Отримуємо введену кількість
        $('#curenCurrencyCode').text((data.rates[currencyCode] * amount).toFixed(2));
        $('#USD').text((data.rates['USD'] * amount).toFixed(2));
        $('#EUR').text((data.rates['EUR'] * amount).toFixed(2));
        $('#GBP').text((data.rates['GBP'] * amount).toFixed(2));
        $('#CNY').text((data.rates['CNY'] * amount).toFixed(2));
        $('#JPY').text((data.rates['JPY'] * amount).toFixed(2));
        $('#INR').text((data.rates['INR'] * amount).toFixed(2));
        $('#CAD').text((data.rates['CAD'] * amount).toFixed(2));
    });
    
    const k = 1 / data.rates[currencyCode];

    // Обробник події для введення в поле обраної валюти
    $('#currentCurencyAmount').on('input', function() {
        $('#baseCurrencyAmount').val('');  // Очищаємо поле
        const amount = $(this).val();
        $('#curenCurrencyCode').text(amount);
        $('#USD').text((data.rates['USD'] * amount * k).toFixed(2));
        $('#EUR').text((data.rates['EUR'] * amount * k).toFixed(2));
        $('#GBP').text((data.rates['GBP'] * amount * k).toFixed(2));
        $('#CNY').text((data.rates['CNY'] * amount * k).toFixed(2));
        $('#JPY').text((data.rates['JPY'] * amount * k).toFixed(2));
        $('#INR').text((data.rates['INR'] * amount * k).toFixed(2));
        $('#CAD').text((data.rates['CAD'] * amount * k).toFixed(2));
    });
}
