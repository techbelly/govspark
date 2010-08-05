// start here on load
function loadingBody() {
	/////// setup table
	
    var table = document.createElement('table');
    table.border = "1";

    var thead = document.createElement('thead');
    table.appendChild(thead);

    var row = document.createElement('tr');

    createTableHeader(row, 'Department');
    createTableHeader(row, 'Site Name');
    createTableHeader(row, 'Day total (kWh)');
    createTableHeader(row, 'Day avg. (kWh)');
    createTableHeader(row, 'Work day total (kWh)');
    createTableHeader(row, 'Work day avg. (kWh)');
    createTableHeader(row, 'Non-work day total (kWh)');
    createTableHeader(row, 'Non-work day avg. (kWh)');
    createTableHeader(row, 'Reduction (%)');
    createTableHeader(row, '');
    thead.appendChild(row);

    var tbody = document.createElement('tbody');
    table.appendChild(tbody);

	/////// load data

    displayData(load_json("json/home_office.json"), tbody, "Home Office");
    displayData(load_json("json/bis.json"), tbody, "BIS");
    displayData(load_json("json/mod.json"),tbody,"MOD");
    displayData(load_json("json/dwp.json"),tbody,"DWP");
    
	/////// display table

    document.getElementById('mytable').innerHTML = '';
    document.getElementById('mytable').appendChild(table);
}

function load_json(name) {
    var req = new XMLHttpRequest();  
    req.open('GET', name, false);   
    req.send(null);  
    if(req.status == 0)  
      return (eval('(' + req.responseText + ')'));
}

// fill a row with averages of a single dataset
function displayData(jsonDoc, tbody, deptName) {

    var all_dayUsage = 0;
    var all_workUsage = 0;
    var all_otherUsage = 0;

    var howManyDays = jsonDoc.length;
	var siteName = "";

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
    createTableData(row, siteName);
    createTableData(row, Math.round(all_dayUsage));
    createTableData(row, Math.round(all_dayMean));
    createTableData(row, Math.round(all_workUsage));
    createTableData(row, Math.round(all_workMean));
    createTableData(row, Math.round(all_otherUsage));
    createTableData(row, Math.round(all_otherMean));
    createTableData(row, Math.round(all_reduction));
	// tried to create chart as table cell but came up as text not an image :/
	//createTableData(row, '<img src="http://chart.apis.google.com/chart?cht=p&chd=s:Uf9a&chs=200x100&chd=t:' + all_reduction + ',100" alt="' + all_reduction + '% reduction"/>');
    tbody.appendChild(row);

	// ....sample google charts (http://code.google.com/apis/chart/)
	// http://chart.apis.google.com/chart?chs=220x100&cht=bvg&chd=t:2999256,2490981|2921049,2046947&chds=130000,3000000&chco=cccccc,4D89F9,C6D9FD
	// http://chart.apis.google.com/chart?cht=p&chd=s:Uf9a&chs=200x100&chd=t:27,100
	
    //console.log("-----------------");
    //console.log("day: " + all_dayUsage + ", mean: " + all_dayMean);
    //console.log("work: " + all_workUsage + ", mean: " + all_workMean);
    //console.log("other: " + all_otherUsage + ", mean: " + all_otherMean);
}

/////////// helper functions

function createTableRowContent(rowObject, data, cellType) {
    var rowContent = document.createElement(cellType);
    var cell = document.createTextNode(data);
    rowContent.appendChild(cell);
    rowObject.appendChild(rowContent);
}

function createTableData(rowObject, data) {
    createTableRowContent(rowObject, data, 'td');
}

function createTableHeader(rowObject, data) {
    createTableRowContent(rowObject, data, 'th');
}

function include(arr, obj) {
  for(var i=0; i<arr.length; i++) {
    if (arr[i] == obj) return true;
  }
}
