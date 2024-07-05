let myChart;

document.getElementById('converter-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const amount = document.getElementById('amount').value;
    const currency = document.getElementById('currency').value;

    try {
        const response = await fetch('https://mindicador.cl/api');
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        const data = await response.json();
        
        let rate;
        switch (currency) {
            case 'dolar':
                rate = data.dolar?.valor;
                break;
            case 'euro':
                rate = data.euro?.valor;
                break;
            case 'uf':
                rate = data.uf?.valor;
                break;
            case 'bitcoin':
                rate = data.bitcoin?.valor;
                break;
            // case 'yen':
            //     rate = data.yen?.valor;
            //     break;
            default:
                rate = null;
        }

        if (rate === null) {
            document.getElementById('result').textContent = 'No se pudo obtener la tasa de cambio para la moneda seleccionada.';
            return;
        }

        const convertedAmount = (amount / rate).toFixed(2);
        document.getElementById('result').textContent = `El monto en ${currency.toUpperCase()} es: ${convertedAmount}`;

        // Obtener historial de los últimos 10 días
        const historialResponse = await fetch(`https://mindicador.cl/api/${currency}`);
        if (!historialResponse.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        const historialData = await historialResponse.json();

        const ultimos10dias = historialData.serie.slice(0, 10).reverse();
        const labels = ultimos10dias.map(d => d.fecha.split('T')[0]);
        const valores = ultimos10dias.map(d => d.valor);

        const ctx = document.getElementById('currencyChart').getContext('2d');

        // Destruir el gráfico anterior si existe
        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Valor de ${currency.toUpperCase()} los últimos 10 días`,
                    data: valores,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        document.getElementById('result').textContent = 'Hubo un error al obtener los datos. Inténtalo de nuevo más tarde.';
    }
});
