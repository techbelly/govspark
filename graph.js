var daysOfWeek=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

var floorArea= new Array();
floorArea["Department for Business Information & Skill"] ={net:28133,gross:46314};
floorArea["Cabinet Office"] ={net:5153,gross:14480};
floorArea["Department for Culture, Media and Sport"] ={net:8049,gross:12641};
floorArea["Department of Energy and Climate Change"] ={net:8769,gross:10960};
floorArea["Department for Environment, Food and Rural Affairs"] ={net:13513,gross:16891};
floorArea["Department for Education"] ={net:19691,gross:26128};
floorArea["Department for International Development"] ={net:16405,gross:24240};
floorArea["Department for Transport"] ={net:21765,gross:27449};
floorArea["Department for Work and Pensions"] ={net:19616,gross:24520};
floorArea["Foreign and Commonwealth Office"] ={net:39103,gross:67274};
floorArea["HM Revenue and Customs"] ={net:34000,gross:48965};
floorArea["HM Treasury"] ={net:19322,gross:41106};
floorArea["Home Office"] ={net:42844,gross:69095};
floorArea["Ministry of Defence"]={net:61812,gross:92900};
floorArea["Ministry of Justice"]={net:32144,gross:41012};


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
}

times[47] = "00:00";

//convert string to date
function toDate(theDay) {
	//year/month/day (4 figure year)

	var day;
	var month;
	var year;

	day = parseInt(theDay.substring(0, 2), 10);
	month = parseInt(theDay.substring(3, 5), 10);
	year = parseInt(theDay.substring(6, 10), 10);

	//javascript months are zero indexed
	month -= 1;

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
	for (var departmentIndex = 0; departmentIndex < 15; departmentIndex++) {
		var name = this.document.forms[0].Department[departmentIndex].value;
		if (cachedDepartmentData[name] == undefined || cachedDepartmentData[name].length != 7 ) {
			continue;
		}
		//if the department checkbox is selected
		if (this.document.forms[0].Department[departmentIndex].checked ) {
			for (var i = 0; i < 7; i++) {
				var day = toDate(cachedDepartmentData[name][i].date).getDay();
				//and if a day is selected and we have not
				//already added that line, add the line			
				if (this.document.forms[0].Day[day].checked && dynamicChart.get(
								cachedDepartmentData[name][0].name.split(' ').join('')+daysOfWeek[day]) == null) {
					var readings = cachedDepartmentData[name][i].readings;
					//net
					if (this.document.forms[0].FloorSpace[1].checked == true) {
						var net = new Array(readings.length);	
						for (var a=0;a<readings.length;a++) {
							net[a] = readings[a] / floorArea[name].net;
						}
						readings = net;
					//gross
					} else if (this.document.forms[0].FloorSpace[2].checked == true) {
						var gross = new Array(readings.length);	
						for (var a=0;a<readings.length;a++) {
							gross[a] = readings[a] / floorArea[name].gross;
						}
						readings = gross;
					}
					
					dynamicChart.addSeries(
						{
							id: cachedDepartmentData[name][0].name.split(' ').join('')+daysOfWeek[day],
							name: cachedDepartmentData[name][i].name+" "+daysOfWeek[day],
							data: readings
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

function removeLines() {
	for (var departmentIndex = 0; departmentIndex < 15; departmentIndex++) {
		var name = this.document.forms[0].Department[departmentIndex].value;
		if (cachedDepartmentData[name] == undefined) {
			continue;
		} 

		for (var i = 0; i < 7; i++) {
			if (dynamicChart.get(cachedDepartmentData[name][0].name.split(' ').join('')+daysOfWeek[i]) != null) {
				dynamicChart.get(cachedDepartmentData[name][0].name.split(' ').join('')+daysOfWeek[i]).remove();
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
//					marginRight: 130,
					marginBottom: 160
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
//				legend: {
//					layout: 'vertical',
//					align: 'right',
//					verticalAlign: 'top',
//					x: 10,
//					y: 80,
//					borderWidth: 0
//				},
				series: {}
			});
	}

	updatePlot(dynamicChart);
}

