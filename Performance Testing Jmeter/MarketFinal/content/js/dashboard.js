/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 85.41666666666667, "KoPercent": 14.583333333333334};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3541666666666667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.125, 500, 1500, "Delete Seller Product"], "isController": false}, {"data": [0.5, 500, 1500, "Buyer Product id"], "isController": false}, {"data": [0.125, 500, 1500, "Post Buyer Order"], "isController": false}, {"data": [0.5, 500, 1500, "Get Buyer Order"], "isController": false}, {"data": [0.0, 500, 1500, "Post Seller Product"], "isController": false}, {"data": [0.0, 500, 1500, "Register"], "isController": false}, {"data": [0.5, 500, 1500, "Buyer Order id"], "isController": false}, {"data": [0.5, 500, 1500, "Put Buyer Order id"], "isController": false}, {"data": [0.5, 500, 1500, "Log in"], "isController": false}, {"data": [0.5, 500, 1500, "Get Seller Product id"], "isController": false}, {"data": [0.5, 500, 1500, "Buyer Product"], "isController": false}, {"data": [0.5, 500, 1500, "Get Seller Product"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 48, 7, 14.583333333333334, 1016.2500000000006, 615, 3563, 721.0, 1818.6000000000022, 3418.0499999999993, 3563.0, 2.7286680688988687, 4.037043090216588, 40.59260150787334], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Delete Seller Product", 4, 3, 75.0, 704.25, 689, 714, 707.0, 714.0, 714.0, 714.0, 0.6980802792321117, 0.22973931064572425, 0.2863219895287958], "isController": false}, {"data": ["Buyer Product id", 4, 0, 0.0, 682.5, 615, 786, 664.5, 786.0, 786.0, 786.0, 0.6968641114982579, 0.6294915069686411, 0.2511160714285714], "isController": false}, {"data": ["Post Buyer Order", 4, 3, 75.0, 672.75, 637, 713, 670.5, 713.0, 713.0, 713.0, 0.6881128505074832, 0.29231356442456563, 0.3091131945639085], "isController": false}, {"data": ["Get Buyer Order", 4, 0, 0.0, 787.5, 728, 815, 803.5, 815.0, 815.0, 815.0, 0.6697923643670461, 2.7661639735432013, 0.2544426071667783], "isController": false}, {"data": ["Post Seller Product", 4, 1, 25.0, 1559.0, 1359, 1670, 1603.5, 1670.0, 1670.0, 1670.0, 0.5819874872690237, 0.35265941001018475, 100.6758784373636], "isController": false}, {"data": ["Register", 4, 0, 0.0, 3384.0, 3156, 3563, 3408.5, 3563.0, 3563.0, 3563.0, 0.44306601683650865, 0.25203706524147096, 0.6656807293974302], "isController": false}, {"data": ["Buyer Order id", 4, 0, 0.0, 669.25, 616, 806, 627.5, 806.0, 806.0, 806.0, 0.6931207762952695, 0.8582784612718767, 0.26736592444983537], "isController": false}, {"data": ["Put Buyer Order id", 4, 0, 0.0, 656.75, 625, 706, 648.0, 706.0, 706.0, 706.0, 0.691085003455425, 0.4737711644782308, 0.29762547512093984], "isController": false}, {"data": ["Log in", 4, 0, 0.0, 706.75, 680, 781, 683.0, 781.0, 781.0, 781.0, 0.6447453255963894, 0.3242615651192779, 0.28081681173436496], "isController": false}, {"data": ["Get Seller Product id", 4, 0, 0.0, 686.0, 619, 793, 666.0, 793.0, 793.0, 793.0, 0.6950477845351868, 0.5219645960034752, 0.2701455256298871], "isController": false}, {"data": ["Buyer Product", 4, 0, 0.0, 858.0, 756, 924, 876.0, 924.0, 924.0, 924.0, 0.6734006734006734, 3.488991477272727, 0.27159617003367004], "isController": false}, {"data": ["Get Seller Product", 4, 0, 0.0, 828.25, 738, 918, 828.5, 918.0, 918.0, 918.0, 0.6606110652353427, 1.6073363955408755, 0.25353530140379854], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 4, 57.142857142857146, 8.333333333333334], "isController": false}, {"data": ["404/Not Found", 3, 42.857142857142854, 6.25], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 48, 7, "400/Bad Request", 4, "404/Not Found", 3, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Delete Seller Product", 4, 3, "404/Not Found", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Buyer Order", 4, 3, "400/Bad Request", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Seller Product", 4, 1, "400/Bad Request", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
