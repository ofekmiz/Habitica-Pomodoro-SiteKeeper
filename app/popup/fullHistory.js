var YearViewData = {}; // data must be string, dataExample = `{"2020-08-01": {"items": ["banana", "apple"]}, "2020-09-01": {"items": ["orange"]}}`;
var chartData = { dates: [], pomodoros: [], hours: [], weekdays: [] };
var weekdayPomoCount = { "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0, "Saturday": 0 };
var weekdayHourCount = { "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0, "Saturday": 0 };
const BROWSER = getBrowser();

document.addEventListener("DOMContentLoaded", async function () {

    await getBackgroundData();

    $("#DownloadHistogram").click(function (e) {
        var dataStr = getJsonDownloadHref(Vars.Histogram);
        this.setAttribute("href", dataStr);
        this.setAttribute("download", "Histogram.json");
    });

    $("#ImportHistogram").click(async function () {
        //ImportObjectAsJson
        var files = document.getElementById('selectHistogramFile').files;
        var json = await readJsonFileAsync(files);
        Vars.Histogram = json;
        await updateBackgroundData();
        location.reload();
    });

    $("#ClearHistogram").click(function () {
        runBackgroundFunction("clearHistogram", []).then(location.reload());
    });

    //collect Histogrm data
    for (var key in Vars.Histogram) {
        if (Vars.Histogram.hasOwnProperty(key)) {
            var data = Vars.Histogram[key];
            chartData.dates.push(key);
            chartData.weekdays.push(data.weekday)
            chartData.pomodoros.push(data.pomodoros);
            var hrs = data.minutes <= 0 ? 0 : (data.minutes / 60).toFixed(1);
            chartData.hours.push(hrs);
            YearViewData[key] = { "items": [`${data.pomodoros} Pomodoros`] }
            weekdayPomoCount[data.weekday] += data.pomodoros;
            weekdayHourCount[data.weekday] = (Number(weekdayHourCount[data.weekday]) + Number(hrs)).toFixed(1);
        }
    }

    //History Chart
    const Canvas = document.getElementById('Chart1').getContext('2d');
    const progress = document.getElementById('animationProgress');
    var HistoryChart = new Chart(Canvas, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: "",
                data: [],
                backgroundColor: "#87819091"
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            animation: {
                onProgress: function (animation) {
                    progress.value = animation.animationObject.currentStep / animation.animationObject.numSteps;
                }
            }
        }
    });

    HistoryChart.data.labels = chartData.dates;
    HistoryChart.data.datasets[0].data = chartData.pomodoros;
    HistoryChart.data.datasets[0].label = "Pomodoros";
    HistoryChart.options.tooltips.callbacks.title = function (tooltipItem, data) {
        return tooltipItem[0].label + " " + chartData.weekdays[chartData.dates.indexOf(tooltipItem[0].label)];
    }
    HistoryChart.options.tooltips.callbacks.afterTitle = function (tooltipItem, data) {
        return chartData.hours[chartData.dates.indexOf(tooltipItem[0].label)] + " Hours";
    }
    HistoryChart.update();

    //weekDay Chart
    const Canvas2 = document.getElementById('WeekdayChart').getContext('2d');
    var WeekdayChart = new Chart(Canvas2, {
        type: 'pie',
        data: {
            labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            datasets: [{
                label: "Pomodoros",
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(205, 92, 92, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(205, 92, 92, 1)'
                ],
                borderWidth: 1
            }]
        },
    });
    var WeekDays = Object.keys(weekdayPomoCount);
    var WeekDaysPomoData = Object.values(weekdayPomoCount);
    var WeekDaysHoursData = Object.values(weekdayHourCount);
    udateWeekdayTable(WeekdayChart, WeekDaysPomoData, WeekDays, "Pomodoros");

    // Year View heatmap graph
    console.log(YearViewData)
    $('#calendarView').calendar_yearview_blocks({
        data: JSON.stringify(YearViewData),
        start_monday: true,
        always_show_tooltip: true,
        colors: YearViewColors()
    });
});

function YearViewColors() {
    var colors = { 'default': '#e6e6e6' }
    for (i = 1; i < 100; i++) {
        colors[`${i} Pomodoros`] = `rgb(255 0 0 / ${10 * i}%)`;
    }
    return colors;
}

function udateWeekdayTable(Chart, dataArray, labels, label) {
    Chart.data.labels = labels;
    Chart.data.datasets[0].data = dataArray;
    $("#WeekdayChartTitle label").html(label);
    Chart.update();
}



