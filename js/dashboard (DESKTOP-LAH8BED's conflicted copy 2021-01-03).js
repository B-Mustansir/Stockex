(function ($) {
    var options = {
        series: [44, 55, 13, 33],
        chart: {
            height: 220,
            type: 'donut',
        },
        dataLabels: {
            enabled: false
        },
        labels: ['Bitcoin', 'Tether', 'Tezos', 'Monero'],
        fill: {
            colors: ['#F7931A', '#2CA07A', '#A6DF00', '#FF6600']
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    show: false
                }
            }
        }],
        legend: {
            show: false,
            position: 'right',
            offsetY: 0,
            height: 150,
        }
    };

    var chart = new ApexCharts(document.querySelector("#balance-chart"), options);
    chart.render();

})(jQuery);





// ////

(function ($) {
    $('#report-select').on('change', function () {
        drawChart();
    });

    function getSeries() {
        var selected_series = $('#report-select').val();
        if (selected_series == "1") {
            return series1();
        }
        if (selected_series == "2") {
            return series2();
        }
    }

    function series1() {
        var asd = [
            {
                name: "Buy",
                data: [110, 30, 150, 70, 190, 60, 130, 50, 170]
            },
            {
                name: "Sell",
                data: [20, 140, 60, 180, 100, 120, 50, 170, 90]
            },
        ]
        return asd
    }

    function series2() {
        var qwe = [
            {
                name: "Buy",
                data: [20, 140, 60, 180, 100, 120, 50, 170, 90]
            },
            {
                name: "Sell",
                data: [110, 30, 150, 70, 190, 60, 130, 50, 170]
            },
        ]
        return qwe
    }

    var options = {
        series: getSeries(),
        chart: {
            height: 300,
            type: "area",
            animations: {
                enabled: false
            },
            toolbar: {
                show: false
            },
        },
        colors: ["#2083FE", "#f00"],
        dataLabels: {
            enabled: false
        },
        grid: {
            show: false,
            borderColor: '#F1F1F1',
        },
        xaxis: {
            categories: ['Jan 01', 'Jan 02', 'Jan 03', 'Jan 04', 'Jan 05', 'Jan 06', 'Jan 07', 'Jan 08', 'Jan 09'],
            axisBorder: {
                show: false
            },
        },

    };
    var chart = new ApexCharts(document.querySelector("#chartx"), options);

    chart.render();

    function drawChart() {
        chart.updateSeries(getSeries())
    }

})(jQuery);