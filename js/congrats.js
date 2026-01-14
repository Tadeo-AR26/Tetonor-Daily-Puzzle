document.addEventListener('DOMContentLoaded', () => {
    const rawStats = JSON.parse(localStorage.getItem('tetonor-stats')) || {};

    let statsArray = Object.entries(rawStats);

    // convertir DD/MM/YYYY a objeto Date ordenable
    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/').map(Number);
        // Mes en JS es 0-11, por eso restamos 1
        return new Date(year, month - 1, day);
    };

    // ordenar por fecha
    statsArray.sort((a, b) => parseDate(a[0]) - parseDate(b[0]));

    // 10 días
    const last10Stats = statsArray.slice(-10);

    const labels = last10Stats.map(item => item[0]); // Ej: ["12/01/2026", "13/01/2026"]
    const dataPoints = last10Stats.map(item => item[1]); // Ej: [150, 120]


    // Configuración y Renderizado
    const ctx = document.getElementById('statsChart').getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(247, 37, 133, 0.8)'); // Neon Pink arriba
    gradient.addColorStop(1, 'rgba(58, 12, 163, 0.2)'); // Purple abajo

    new Chart(ctx, {
        type: 'bar', // Gráfico de barras
        data: {
            labels: labels, // Las fechas en el eje X
            datasets: [{
                label: 'Time (Seconds)',
                data: dataPoints, // Los tiempos en el eje Y
                backgroundColor: gradient,
                borderColor: '#F72585',
                borderWidth: 1,
                borderRadius: 5, // Barras redondeadas
                barPercentage: 0.6, // Ancho de las barras
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Seconds',
                        color: '#4CC9F0'
                    },
                    grid: {
                        color: 'rgba(67, 97, 238, 0.2)'
                    },
                    ticks: { color: '#e0e0e0' }
                },
                x: {
                    grid: { display: false }, 
                    ticks: { color: '#e0e0e0' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(5, 5, 5, 0.9)',
                    titleColor: '#4CC9F0',
                    bodyColor: '#fff',
                    borderColor: '#F72585',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        // Formatear el tooltip para que diga "N seconds"
                        label: function(context) {
                            return `${context.raw} seconds`;
                        }
                    }
                }
            }
        }
    });
});