let allRows;
let webAppConfig = dataiku.getWebAppConfig()['webAppConfig'];
let webAppDesc = dataiku.getWebAppDesc()['chart']
let chartElement = document.getElementById('waterfall-chart');


function draw() {
    // let data = new google.visualization.arrayToDataTable(allRows, opt_firstRowIsData=true);
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'label');
    data.addColumn('number', 'min_threshold');
    data.addColumn('number', 'min_value');
    data.addColumn('number', 'max_value');
    data.addColumn('number', 'max_threshold');
    data.addColumn({type: 'string', role: 'style'});

    for (var i = 0; i < allRows.length; i++) {
        arr = allRows[i];
        data.addRow([String(arr[0]), Number(arr[1]), Number(arr[1]), Number(arr[2]), Number(arr[2]), '']);
    }

    data.addRow(["Total", 0, 0, Number(arr[2]), Number(arr[2]), 'color: grey;']);
    
    var chartHeight = chartElement.parentElement.parentElement.parentElement.getBoundingClientRect().height;
    var chartWidth = chartElement.getBoundingClientRect().width;

    let options = {
      legend: 'none',
      height: chartHeight,
      width: chartWidth,
      bar: { groupWidth: '90%' }, // Remove space between bars.
      candlestick: {
        fallingColor: { strokeWidth: 0, fill: '#a52714' }, // red
        risingColor: { strokeWidth: 0, fill: '#0f9d58' }   // green
      }
    };

    let chart = new google.visualization.CandlestickChart(chartElement);
    
    chart.draw(data, options);
}

window.parent.postMessage("sendConfig", "*");

window.addEventListener('message', function(event) {
    if (event.data) {

        event_data = JSON.parse(event.data);

        webAppConfig = event_data['webAppConfig']
        filters = event_data['filters']

        // TODO catch when filter all alphanum column type values
        try {
            checkWebAppParameters(webAppConfig, webAppDesc);
        } catch (e) {
            dataiku.webappMessages.displayFatalError(e.message);
            return;
        }

        try {
            checkWebAppConfig(webAppConfig)
        } catch (e) {
            dataiku.webappMessages.displayFatalError(e.message);
            return;
        }
        
        if (!window.google) {
            dataiku.webappMessages.displayFatalError('Failed to load Google Charts library. Check your connection.');
        } else {
            var config = {
                dataset_name: webAppConfig['dataset'],
                category_column: webAppConfig['categories'],
                value_column: webAppConfig['values'],
                max_displayed_values: webAppConfig['max_displayed_values'],
                group_others: webAppConfig['group_others']
            }

            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(function() {
                dataiku.webappBackend.get('reformat_data', {"config": JSON.stringify(config), "filters": JSON.stringify(filters)})
                    .then(
                        function(data){
                            allRows = data['result'];
                            $('#waterfall-chart').html('');
                            draw();
                        }
                ).catch(error => {
                    dataiku.webappMessages.displayFatalError(error);
                });
            });
        };
    }
});
