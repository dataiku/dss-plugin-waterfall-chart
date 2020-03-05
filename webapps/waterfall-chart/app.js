let allRows;
let webAppConfig = dataiku.getWebAppConfig()['webAppConfig'];
let webAppDesc = dataiku.getWebAppDesc()['chart']


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
    
    let options = {
      legend: 'none',
      bar: { groupWidth: '90%' }, // Remove space between bars.
      candlestick: {
        fallingColor: { strokeWidth: 0, fill: '#a52714' }, // red
        risingColor: { strokeWidth: 0, fill: '#0f9d58' }   // green
      }
    };
    let chart = new google.visualization.CandlestickChart(document.getElementById('waterfall-chart'));
    
    chart.draw(data, options);
}

try {
    checkWebAppParameters(webAppConfig, webAppDesc);

    let dataset_name = webAppConfig['dataset'];
    let category_column = webAppConfig['categories'];
    let value_column = webAppConfig['values'];
    let max_displayed_values = webAppConfig['max_displayed_values'];
    let group_others = webAppConfig['group_others'];

    if (category_column == value_column) {
        throw Error("Columns must be different")
    }
    if (max_displayed_values > 100) {
        throw Error("Max displayed values too high (maximum 100)")
    }

    if (!window.google) {
        dataiku.webappMessages.displayFatalError('Failed to load Google Charts library. Check your connection.');
    } else {
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(function() {
            dataiku.webappBackend.get('reformat_data', {'dataset_name': dataset_name, 'category_column': category_column, 'value_column': value_column, 'max_displayed_values': max_displayed_values, 'group_others': group_others})
                .then(
                    function(data){
                            allRows = data['result'];
                            draw();
                        }
            ).catch(error => {
                dataiku.webappMessages.displayFatalError(error);
            });
        });
    };

} catch (e) {
    dataiku.webappMessages.displayFatalError(e.message);
}


window.addEventListener('message', function(event) {
    if (event.data) {

        webAppConfig = JSON.parse(event.data)['webAppConfig'];

        try {
            checkWebAppParameters(webAppConfig, webAppDesc);
        } catch (e) {
            dataiku.webappMessages.displayFatalError(e.message);
            return;
        }

        let dataset_name = webAppConfig['dataset'];
        let category_column = webAppConfig['categories'];
        let value_column = webAppConfig['values'];
        let max_displayed_values = webAppConfig['max_displayed_values'];
        let group_others = webAppConfig['group_others'];

        try {
            if (category_column == value_column) {
                throw Error("Columns must be different")
            }
            if (max_displayed_values > 100) {
                throw Error("Max displayed values too high (maximum 100)")
            }
        } catch (e) {
            dataiku.webappMessages.displayFatalError(e.message);
            return;
        }
        
        if (!window.google) {
            dataiku.webappMessages.displayFatalError('Failed to load Google Charts library. Check your connection.');
        } else {

            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(function() {
                dataiku.webappBackend.get('reformat_data', {'dataset_name': dataset_name, 'category_column': category_column, 'value_column': value_column, 'max_displayed_values': max_displayed_values, 'group_others': group_others})
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






// .then(
                //         function(data){
                //             try {
                //                 allRows = data['result'];
                //                 draw();
                //             } catch {
                //                 if ('error' in data) {
                //                     console.warn("error catched: ", data['error']);
                //                     throw Error(data['error'])
                //                 } else {
                //                     throw Error("Computations gone wrong")
                //                 }  
                //             }
                //         }
                // )



