var margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%d %b %Y").parse,
    formatDate = d3.time.format("%d %b %Y"),
    bisectDate = d3.bisector(function(d) { return d.date; }).left;

var x = d3.time.scale()
    .range([0, width]);

var yTotal = d3.scale.linear()
    .range([height, 0]);

var yDayAvg = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yTotalAxis = d3.svg.axis()
    .scale(yTotal)
    .orient("left");

var yDayAvgAxis = d3.svg.axis()
    .scale(yDayAvg)
    .orient("left");

var lineTotal = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return yTotal(d.total); });

var lineDayAvg = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return yDayAvg(d.rolling_day_avg); });


var today = new Date();

var svgTotalVax = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svgDayAvg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data.csv", function(error, data) {
  if (error) throw error;

  // read data
  data.forEach(function(d) {
    // console.log(d)
    d.date = parseDate(d.date);
    d.total = +d.total;
    d.rolling_day_avg = +d.rolling_day_avg;
  });

  // sort data by date
  data.sort(function(a, b) {
    return a.date - b.date;
  });

  // date of first vaccine
  firstVax = data[0].date
  
  // x domain (date) is the same for both graph
  x.domain([firstVax, today]);
  yTotal.domain(
      d3.extent(data, function(d) { return d.total; }));
  yDayAvg.domain(
      d3.extent(data, function(d) { return d.rolling_day_avg; }));

  // add x axis
  svgAppendx(svgTotalVax, xAxis)
  svgAppendx(svgDayAvg, xAxis)

  // add y axis
  svgAppendy(svgTotalVax, yTotalAxis, "Total number of vaccines")
  svgAppendy(svgDayAvg, yDayAvgAxis, "Daily vaccines, 7 day average")

  // add line to graph
  svgAppendPath(svgTotalVax, data, lineTotal)
  svgAppendPath(svgDayAvg, data, lineDayAvg)

  // do mouseover thingy
  var focusTotal = svgAppengg(svgTotalVax)
  var focusDayAvg = svgAppengg(svgDayAvg)
  svgAppendRect(svgTotalVax, data, width, height, focusTotal, x, yTotal, "total", formatDate)
  svgAppendRect(svgDayAvg, data, width, height, focusDayAvg, x, yDayAvg, "rolling_day_avg", formatDate)

  // table
  tabulate(data, ["date", "total", "rolling_day_avg", "comment"]);
});

function tabulate(data, columns) {
    var table = d3.select("body").append("table").attr("id", "datatable"),
        thead = table.append("thead"),
        tbody = table.append("tbody");
  
    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
            .text(function(column) { return column; });
  
    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");
  
    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
            .html(function(d) {
                // d3.select(this.parentNode).style("background-color", "#FFFF00")
                if (d.column == "comment") {
                    if (d.value != "") {
                        console.log(d.value)
                        d3.select(this.parentNode).style("background-color", "#FFFF00")
                    }
                }
                if (d.column == "date") {
                    return formatDate(d.value)
                }
                return d.value;
            });
    
    return table;
}