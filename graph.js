var daysOfWeek=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

//An array containing strings "00:00", "00:30", "01:00", ... , "23:00", "23:30"
var times = new Array();
for (i = 1; i < 48; i++) {
	times[i-1] = Math.floor(i/2)+":";
	if (Math.floor(i/2) < 10) {
		times[i-1]= "0"+times[i-1];
	}

	if (i%2 == 0) {
		times[i-1] +="00";
	} else {
		times[i-1] +="30";
	}
	//alert(times[i-1])
}

times[47] = "00:00";

function toDate(theDay) {
	//possible formats
	//day/month/year (2 figure year)
	//day/month/year (4 figure year)
	//year/month/day (4 figure year)

	var day;
	var month;
	var year;

//	if (dataForDay["Date"] instanceof Date || typeof dataForDay["Date"].getDay === 'function') {
//		//if the json actualy sent a date object return it
//		return dataForDay["Date"];
//	} else if (dataForDay["Date"].substring(4, 5) == "-") {
//		//year first date
//		year = parseInt(dataForDay["Date"].substring(0, 4), 10);
//		month = parseInt(dataForDay["Date"].substring(5, 7), 10);
//		day = parseInt(dataForDay["Date"].substring(8, 10), 10);
//	} else {
		day = parseInt(theDay.substring(0, 2), 10);
		month = parseInt(theDay.substring(3, 5), 10);
		year = parseInt(theDay.substring(6, 10), 10);
//	}

	//javascript months are zero indexed
	month -= 1;

//	//if we have a 2 figure year convert it to a 4 figure year
//	if (year < 100) {
//		year += 2000;
//	}

	return new Date(year,month,day);
}



//A cached ref to the chart object
var dynamicChart = null;

//check the check boxes and remove and add the correct lines to the chart
function updatePlot(dynamicChart) {
	if (this.document.forms[0] == undefined) {
		return;
	}
	//"HomeOffice"
	for (var departmentIndex = 0; departmentIndex < 13; departmentIndex++) {
		var name = this.document.forms[0].Department[departmentIndex].value;
//		var name = "Department of Energy and Climate Change";
		if (cachedDepartmentData[name] == undefined) {
			continue;
		}
//alert(departmentIndex + " "+this.document.forms[0].Department[departmentIndex].checked );
		//if the department checkbox is selected
		if (this.document.forms[0].Department[departmentIndex].checked ) {
			for (var i = 0; i < 7; i++) {
				var day = toDate(cachedDepartmentData[name][i].date).getDay();
				//and if a day is selected and we have not
				//already added that line, add the line			
				if (this.document.forms[0].Day[day].checked && dynamicChart.get(
								cachedDepartmentData[name][0].name.split(' ').join('')+daysOfWeek[day]) == null) {
					dynamicChart.addSeries(
						{
							id: cachedDepartmentData[name][0].name.split(' ').join('')+daysOfWeek[day],
							name: cachedDepartmentData[name][i].name+" "+daysOfWeek[day],
							data: cachedDepartmentData[name][i].readings
						});
				}
			}
		}

		//if the department checkbox is not selected remove all lines
		// related to that department	
		if (!this.document.forms[0].Department[departmentIndex].checked) {
			for (var i = 0; i < 7; i++) {
				if (dynamicChart.get(cachedDepartmentData[name][0].name.split(' ').join('')+daysOfWeek[i]) != null) {
					dynamicChart.get(cachedDepartmentData[name][0].name.split(' ').join('')+daysOfWeek[i]).remove();
				}
			}
		//if the department checkbox is selected
		//remove all lines that are not selected
		} else {
			for (var i = 0; i < 7; i++) {
				if (!this.document.forms[0].Day[i].checked &&
						dynamicChart.get(cachedDepartmentData[name][0].name.split(' ').join('')+daysOfWeek[i]) != null)
				{		
					dynamicChart.get(cachedDepartmentData[name][0].name.split(' ').join('')+daysOfWeek[i]).remove();
				}
			}
		}
	}

}

function updateChart() {
	//if the chart does not already exist create it
	if (dynamicChart == null) {
			dynamicChart = new Highcharts.Chart({
				chart: {
					renderTo: 'dynamic',
					defaultSeriesType: 'line',
					marginRight: 130,
					marginBottom: 60
				},
				title: {
					text: 'Electricity use',
					x: -20 //center
				},
				subtitle: {
					text: '',
					x: -20
				},
				xAxis: {
					categories: times,
					labels: {
						rotation: -90,
						align: 'right',
						style: {
							 font: 'normal 13px Verdana, sans-serif'
						}
					}
				},
				yAxis: {
					title: {
						text: 'Electricity (kWh)'
					},
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					}]
				},
				tooltip: {
					formatter: function() {
			                return '<b>'+ this.series.name +'</b><br/>'+
							this.x +' '+ this.y +'kWh';
					}
				},
				legend: {
					layout: 'vertical',
					align: 'right',
					verticalAlign: 'top',
					x: 10,
					y: 80,
					borderWidth: 0
				},
				series: {}
			});
	}

	updatePlot(dynamicChart);
}

