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

function loadingBody() {
	/////// setup table
	
    var table = document.createElement('table');
    table.border = "1";

    var thead = document.createElement('thead');
    table.appendChild(thead);

    var row = document.createElement('tr');

    createTableHeader(row, 'Department');
    createTableHeader(row, '');
    createTableHeader(row, 'Site Name');
    createTableHeader(row, 'Daily avg. (kWh)');
    createTableHeader(row, 'Average during working hours (kWh)');
    createTableHeader(row, 'Outside working hours average (kWh)');
    createTableHeader(row, 'Reduction (%)');
    thead.appendChild(row);

    var tbody = document.createElement('tbody');
    table.appendChild(tbody);
    document.getElementById('mytable').innerHTML = '';
    document.getElementById('mytable').appendChild(table);
    
	/////// load data

    displayData(load_json("json/home_office.json"), tbody, "Home Office");
    displayData(load_json("json/bis.json"), tbody, "BIS");
    displayData(load_json("json/mod.json"),tbody,"MOD");
    displayData(load_json("json/dcms.json"),tbody,"DCMS");
    displayData(load_json("json/dwp.json"),tbody,"DWP");
    
	/////// display table


}

function load_json(name) {
    var req = new XMLHttpRequest();  
    req.open('GET', name, false);   
    req.send(null);  
    if (req.status != 404)
        return (eval('(' + req.responseText + ')'));
}

// fill a row with averages of a single dataset
function displayData(jsonDoc, tbody, deptName) {

    var all_dayUsage = 0;
    var all_workUsage = 0;
    var all_otherUsage = 0;

    var howManyDays = jsonDoc.length;
	var siteName = "";

    var usage_by_day = [];
	// loop through days (normal array)
    for (i = 0; i < howManyDays; i++) {

		// define a couple of things so they can be used outside the inner loop
        var dayUsage = 0;
        var workUsage = 0;
        var otherUsage = 0;
		var date = "";

		// loop through time segments in the day (associative array AKA hash)
        for (var k in jsonDoc[i]) { // k is key in associative array - either "Date" or time slot, eg "14:30"

			// just to make it clearer, some things below depend on the key, others on the value!
			var key = k;
			var value = jsonDoc[i][k];

			// assign date
			if (key == "Date") {
				date = value;

			// we might care about site name, so save
			} else if (key == "Site Name") {

				// this actually keeps setting, could improve to only set once....
				siteName = value;

			// if weird columns we dont care about, ignore!
			} else if (include(["Utility", "kWh"], key)) {

				// I CARE NOT!
				
			// add usage for time slot to pile, for averaging after!
			} else {
				// assign usage number so we dont have to keep typing the following
				var usage = parseInt(value);
								
				// some NaN's happening (not a number), if invalid skip to next in loop here
				if (!usage)
					continue;

				// add the usage to the current day's & all days total usage!
		        dayUsage += usage;
		        all_dayUsage += usage;
				
				// if a working day time segment, add to work usage
				if (include(["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"], key)) {
			        workUsage += usage;
					all_workUsage += usage;
			
				// if not in work time, add to other usage
				} else {
					otherUsage += usage;
					all_otherUsage += usage;
				}
			}
        }

		// get mean by dividing total usage by hours
		var dayMean = dayUsage / 24;
		var workMean = workUsage / 10;
		var otherMean = otherUsage / 14;
		var reduction = 100 - ((otherUsage / workUsage) * 100);
		
		usage_by_day.push(dayUsage);
        //console.log(date);
        //console.log("day: " + dayUsage + ", mean: " + dayMean);
        //console.log("work: " + workUsage + ", mean: " + workMean);
        //console.log("other: " + otherUsage + ", mean: " + otherMean);
        //console.log("...");
    }

	var all_dayMean = all_dayUsage / 24;
	var all_workMean = all_workUsage / 10;
	var all_otherMean = all_otherUsage / 14;
	var all_reduction = 100 - ((all_otherUsage / all_workUsage) * 100);

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
	// tried to create chart as table cell but came up as text not an image :/
	

    tbody.appendChild(row);

    var data = new google.visualization.DataTable();
    data.addColumn("number", "kWh");
    data.addRows(usage_by_day.length);
    for(var j = 0; j < usage_by_day.length; j++) {
        data.setValue(j,0,usage_by_day[j]);
    }
    
    var chart = new google.visualization.ImageSparkLine(document.getElementById(chart_id));
    chart.draw(data, {width: 120, height: 40, showAxisLines: false,  showValueLabels: false, labelPosition: 'none'});
    
	var data2 = new google.visualization.DataTable();
            data2.addColumn('string', 'Label');
            data2.addColumn('number', 'Value');
            data2.addRows(1);
            data2.setValue(0, 0, 'Overnight');
            data2.setValue(0, 1, Math.round((all_otherUsage / all_dayUsage)*100));

            var chart2 = new google.visualization.Gauge(document.getElementById(chart_id+'2'));
            var options2 = {width: 400, height: 120, redFrom: 50, redTo: 100,
                yellowFrom:30, yellowTo: 50, minorTicks: 10};
            chart2.draw(data2, options2);
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
