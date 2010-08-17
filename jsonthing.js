google.load("visualization", "1", {packages:["imagesparkline","gauge"]});
google.setOnLoadCallback(loadingBody);

// start here on load
function commaSep(value) {
    value = value.toString();
    var regexp = new RegExp('(-?[0-9]+)([0-9]{3})');
    while(regexp.test(value)) {
        value = value.replace(regexp, '$1,$2');
    }
    return value;
}

Array.prototype.sum = function() {
    var s = 0.0;
    for (var i = 0; i < this.length; i++) {
      s += (typeof this[i] == 'number') ? this[i] : parseFloat(this[i]);
    }
    return s;
};

function loadingBody() {
	
    var table = document.createElement('table');
    table.border = "1";

    var thead = document.createElement('thead');
    table.appendChild(thead);

    var row = document.createElement('tr');

    createTableHeader(row, 'Department');
    createTableHeader(row, 'Weekly Usage');
    createTableHeader(row, 'Site Name');
    createTableHeader(row, 'Daily avg. (kWh)');
    createTableHeader(row, 'Average during working hours (kWh)');
    createTableHeader(row, 'Average outside working hours (kWh)');
    createTableHeader(row, 'Day/Night Reduction (%)');
    thead.appendChild(row);

    var tbody = document.createElement('tbody');
    table.appendChild(tbody);
    document.getElementById('mytable').innerHTML = '';
    document.getElementById('mytable').appendChild(table);
    

	displayData(load_json("json/bis.json"),tbody,"Business, Innovaton and Skills");
    displayData(load_json("json/co.json"),tbody,"Cabinet Office");
    displayData(load_json("json/dcms.json"),tbody,"Culture, Media and Sport");
    displayData(load_json("json/decc.json"),tbody,"Energy and Climate Change");
	displayData(load_json("json/defra.json"),tbody,"Environment, Food and Rural Affairs");
	displayData(load_json("json/fco.json"),tbody,"Foreign and Commonwealth Office");
	displayData(load_json("json/hmrc.json"),tbody,"HM Revenue and Customs");
	displayData(load_json("json/treasury.json"),tbody,"HM Treasury");
    displayData(load_json("json/ho.json"),tbody,"Home Office");
    displayData(load_json("json/mod.json"),tbody,"Ministry of Defence");
	displayData(load_json("json/dft.json"),tbody,"Transport");
    displayData(load_json("json/dwp.json"),tbody,"Work and Pensions");	
	

	jQuery('#mytable > table > tbody > tr').each(function (i, e) { $('td:eq(0)', e).addClass('dept') });
	jQuery('#mytable > table > tbody > tr').each(function (i, e) { $('td:eq(3)', e).addClass('address') });
	jQuery('#mytable > table > tbody > tr').each(function (i, e) { $('td:eq(4)', e).addClass('number') });
	jQuery('#mytable > table > tbody > tr').each(function (i, e) { $('td:eq(5)', e).addClass('number') });
	jQuery('#mytable > table > tbody > tr').each(function (i, e) { $('td:eq(6)', e).addClass('number') });
	jQuery('#mytable > table > tbody > tr').each(function (i, e) { $('td:eq(7)', e).addClass('number') });
}

function load_json(name) {
    var req = new XMLHttpRequest();  
    req.open('GET', name, false);   
    req.send(null);  
    if (req.status != 404)
        return (eval('(' + req.responseText + ')'));
}

function displayData(jsonDoc, tbody, deptName) {

    var howManyDays = jsonDoc.length;
	var siteName = "";

    var dailyUsage = [];
    var dailyUsageWh = [];
    var dailyUsageNwh = [];
    
    for (var i = 0; i < howManyDays; i++) {

        var date = jsonDoc[i]["Date"];
        siteName = jsonDoc[i]["Site Name"];
        
        var readings =  jsonDoc[i]['readings'];
        console.log(readings);
        var workingHours = readings.slice(16,28);
        var nonWorkingHours = readings.slice(0,16).concat(readings.slice(28)); 
        
		dailyUsage.push(readings.sum());
        dailyUsageWh.push(workingHours.sum());
        dailyUsageNwh.push(nonWorkingHours.sum());        
    }

	var all_dayMean = dailyUsage.sum() / 24;
	var all_workMean = dailyUsageWh.sum() / 10;
	var all_otherMean = dailyUsageNwh.sum() / 14;
	
	var all_reduction = 100 - ((dailyUsageNwh.sum() / dailyUsageWh.sum()) * 100);

	// add single row to html table for ALL DAYS of this dataset
    var row = document.createElement('tr');
    createTableData(row, deptName);
    var chart_id = 'chart-'+(deptName.replace(' ',''));
	createTableData(row, chart_id,chart_id);
    createTableData(row, siteName);
    createTableData(row, commaSep(Math.round(all_dayMean)));
    createTableData(row, commaSep(Math.round(all_workMean)));
    createTableData(row, commaSep(Math.round(all_otherMean)));
    createTableData(row, Math.round(all_reduction));
    createTableData(row, chart_id,chart_id+'2');	

    tbody.appendChild(row);

    var data = new google.visualization.DataTable();
    data.addColumn("number", "kWh");
    data.addRows(dailyUsage.length);
    for(var j = 0; j < dailyUsage.length; j++) {
        data.setValue(j,0,dailyUsage[j]);
    }
    
    var chart = new google.visualization.ImageSparkLine(document.getElementById(chart_id));
    chart.draw(data, {width: 120, height: 40, showAxisLines: false,  showValueLabels: false, labelPosition: 'none'});
    
   // var data2 = new google.visualization.DataTable();
   // data2.addColumn('string', 'Label');
   // data2.addColumn('number', 'Value');
   // data2.addRows(1);
   // data2.setValue(0, 0, 'Overnight');
   // data2.setValue(0, 1, Math.round((all_otherUsage / all_dayUsage)*100));
   // 
   // var chart2 = new google.visualization.Gauge(document.getElementById(chart_id+'2'));
   // var options2 = {width: 200, height: 100, redFrom: 50, redTo: 100,
   //               yellowFrom:30, yellowTo: 50, minorTicks: 10};
   // chart2.draw(data2, options2);
}


function createTableRowContent(rowObject, data, cellType,id) {
    var rowContent = document.createElement(cellType);
    var cell;
    if (id) {
        cell = document.createElement("div");
        cell.id = id;
    } else {
        cell = document.createTextNode(data);
    }
    rowContent.appendChild(cell);
    rowObject.appendChild(rowContent);
}

function createTableData(rowObject, data,id) {
    createTableRowContent(rowObject, data, 'td',id);
}

function createTableHeader(rowObject, data,id) {
    createTableRowContent(rowObject, data, 'th',id);
}

function include(arr, obj) {
  for(var i=0; i<arr.length; i++) {
    if (arr[i] == obj) return true;
  }
}
