google.load("visualization", "1", {packages:["imagesparkline","gauge"]});
google.setOnLoadCallback(createTable);

Number.prototype.commaSeparated = function() {
    value = Math.round(this).toString();
    var regexp = new RegExp('(-?[0-9]+)([0-9]{3})');
    while(regexp.test(value)) {
        value = value.replace(regexp, '$1,$2');
    }
    return value;
}

function tableRow(parent) {
    var row = document.createElement('tr');
    parent.appendChild(row);
    return {
        rowElement: row,
        
        createTableRowContent : function (data, cellType,id,cssClass) {
            var rowContent = document.createElement(cellType);
            var cell;
            
            if (cssClass)
                rowContent.className = cssClass;
                
            if (id) {
                cell = document.createElement("div");
                cell.id = id;
            } else {
                cell = document.createTextNode(data);
            }
            rowContent.appendChild(cell);
            this.rowElement.appendChild(rowContent);
        },
        
        cell: function(data,id,cssClass) {
            this.createTableRowContent(data, 'td',id,cssClass);
        },
        
        header: function(data,id) {
            this.createTableRowContent(data, 'th',id);
        },
        
        headers: function(headers) {
            for (var i=0; i < headers.length; i++) {
                this.header(headers[i]);
            };
        },
        
        cells: function(cellValues,classes) {
            for (var i=0; i < cellValues.length; i++) {
                if (typeof cellValues[i] == 'object')
                    this.cell(cellValues[i][0],cellValues[i][1],classes[i]);
                else
                    this.cell(cellValues[i],null,classes[i]);
            }
        }
    };
}

//cache for data once its loaded
//cache for data once its loaded
var cachedDepartmentData = new Array();

function createTable() {
    
    var table = document.createElement('table');
    var thead = document.createElement('thead');
    var tbody = document.createElement('tbody');
    
    document.getElementById('mytable').appendChild(table);
    table.appendChild(thead);
    table.appendChild(tbody);
    
    var row = tableRow(thead);
    row.headers(['Department','Weekly Usage','Site Name','']);
        
    var depts = ["hmt","co","dcms","decc","defra","fco","hmrc"];
    for(var j = 0; j < depts.length; j++) {
        request_data(depts[j], function(jsonDoc) {
            populateRow(tableRow(tbody),data_for(jsonDoc));
            cachedDepartmentData[jsonDoc[0].name] = jsonDoc;
            updateChart();
        });
    }
}

function populateRow(row,usage) {

    var text = 'This department\'s HQ uses an average of  '+
                usage['averageUsage'].commaSeparated() +
               ' kWh daily, and, typically, ' + 
                usage['pctLessOvernight'].commaSeparated() + 
               '% less energy overnight than it does during the day.';
    
    var name = usage['name'];
    var chart_id = 'chart-'+name.replace(' ','');

    row.cells([name,[chart_id,chart_id],name,text],['dept','','address']);
    sparkline(usage['dailyUsage'],chart_id)
}

function sparkline(usage,dest_id) {
    var dest = document.getElementById(dest_id);
    var data = new google.visualization.DataTable();
    
    data.addColumn("number", "kWh");
    data.addRows(usage.length);
    for(var j = 0; j < usage.length; j++) {
        data.setValue(j,0,usage[j]);
    }
    
    var chart = new google.visualization.ImageSparkLine(dest);
    chart.draw(data, {width: 120, height: 40, showAxisLines: false,  showValueLabels: false, labelPosition: 'none'});
}


