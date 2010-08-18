Array.prototype.sum = function() {
    var s = 0.0;
    for (var i = 0; i < this.length; i++) {
      s += (typeof this[i] == 'number') ? this[i] : parseFloat(this[i]);
    }
    return s;
};

Array.prototype.mean = function() {
    return (this.sum() / this.length)
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice(to + 1);
  return this.slice(0,from).concat(rest);
};

function request_data(name,callback) {        
    var url = "http://govspark-api-test-v2.appspot.com/json/"+name;       
    url += "?callback=?"
    jQuery.getJSON(url,callback);
}

function data_for(jsonDoc) {
    var howManyDays = jsonDoc.length;
	var name = "";

    var dailyUsage = [];
    var dailyUsageWh = [];
    var dailyUsageNwh = [];
    
    for (var i = 0; i < howManyDays; i++) {

        var date = jsonDoc[i]["Date"];
        name = jsonDoc[i]["name"];
        
        var readings =  jsonDoc[i]['readings'];
        var workingHours = readings.slice(18,38);
        var nonWorkingHours = readings.remove(18,37); 
        
		dailyUsage.push(readings.sum());
        dailyUsageWh.push(workingHours.sum());
        dailyUsageNwh.push(nonWorkingHours.sum());        
    }

	var all_dayMean = dailyUsage.mean() / 24;
	var all_workMean = dailyUsageWh.mean() / 10;
	var all_otherMean = dailyUsageNwh.mean() / 14;
	var all_reduction = 100 * ( 1.0 - all_otherMean/all_workMean);
	
	return {
	  "date": date,
	  "name": name,
	  "dailyUsage": dailyUsage,
	  "dailyUsage-working": dailyUsageWh,
	  "dailyUsage-non-working": dailyUsageNwh,
	  "averageUsage": all_dayMean,
	  "averageUsage-working": all_workMean,
	  "averageUsage-non-working": all_otherMean,
	  "pctLessOvernight": all_reduction
	};
}