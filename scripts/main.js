var margin = {
        top: 40,
        right: 120,
        bottom: 30,
        left: 50
    },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    tooltip = { width: 100, height: 100, x: 10, y: -30 };

var parseDate = d3.time.format("%Y-%b-%d").parse,
    formatDate = d3.time.format("%Y-%b-%d"),
    bisectDate = d3.bisector(function(d) {
        return d.date;
    }).left;

var colors = {
    total: '#1E3F66',
    first_dose: '#73A5C6',
    second_dose: '#BCD2E8',
    pfizer_biontech: '#A9DDB1',
    moderna: '#FEDD9E',
    astrazeneca: '#D9C4EC',
    day: '#BCD2E8'
}

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
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.total);
    });

var lineFirstDose = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.first_dose);
    });

var lineSecondDose = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.second_dose);
    });

var linePfizerBiontech = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.pfizer_biontech);
    });

var lineModerna = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.moderna);
    });

var lineAstraZeneca = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.astrazeneca);
    });

var lineDayAvg = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yDayAvg(d.rolling_day_avg);
    });

var areaDayAvg = d3.svg.area()
    .x(function(d) {
        return x(d.date);
    })
    .y0(yDayAvg(0))
    .y1(function(d) {
        return yDayAvg(d.rolling_day_avg);
    });

var today = new Date();

var svgTotalVax = d3.select("#graph_total").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

svgTotalVax.append("rect")
.attr("width", width)
.attr("height", height)
.attr("fill", "#F5FCFF");

var svgDayAvg = d3.select("#graph_daily_avg").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svgDayAvg.append("rect")
.attr("width", width)
.attr("height", height)
.attr("fill", "#F5FCFF");

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
    dateOfLastUpdate = dateOfLastUpdate(data)
    dataVaccines = dataWithVax(data, dateOfLastUpdate)

    // x domain (date) is the same for both graph
    x.domain([firstVax, dateOfLastUpdate]);
    yTotal.domain(
        d3.extent(dataVaccines, function(d) {
            return d.total;
        }));
    yDayAvg.domain(
        d3.extent(dataVaccines, function(d) {
            return d.rolling_day_avg;
        }));

    // add x axis
    svgAppendx(svgTotalVax, xAxis)
    svgAppendx(svgDayAvg, xAxis)

    // add y axis
    svgAppendy(svgTotalVax, yTotalAxis, "Total number of vaccines")
    svgAppendy(svgDayAvg, yDayAvgAxis, "Daily vaccines, 7 day average")

    // add line to graph
    svgAppendPath(svgTotalVax, dataVaccines, "line-first-dose", lineFirstDose, "First dose")
    svgAppendPath(svgTotalVax, dataVaccines, "line-second-dose", lineSecondDose, "Second dose")
    svgAppendPath(svgTotalVax, dataVaccines, "line-pfizer-biontech", linePfizerBiontech, "Pfizer BioNTech")
    svgAppendPath(svgTotalVax, dataVaccines, "line-moderna", lineModerna, "Moderna")
    svgAppendPath(svgTotalVax, dataVaccines, "line-astrazeneca", lineAstraZeneca, "Astra Zeneca")
    svgAppendPath(svgTotalVax, dataVaccines, "line-total", lineTotal, "Total")
    svgAppendPath(svgDayAvg, dataVaccines, "line", lineDayAvg, "")
    svgAppendPath(svgDayAvg, dataVaccines, "area", areaDayAvg, "")

    svgAppendText(yTotal, dataVaccines, ['total', 'first_dose', 'second_dose', 'pfizer_biontech', 'moderna', 'astrazeneca'])

    // do mouseover thingy
    var focusTotal = svgAppengg(svgTotalVax, colors.total)
    var focusFirstDose = svgAppengg(svgTotalVax, colors.first_dose)
    var focusSecondDose = svgAppengg(svgTotalVax, colors.second_dose)
    var focusPfizerBiontech = svgAppengg(svgTotalVax, colors.pfizer_biontech)
    var focusModerna = svgAppengg(svgTotalVax, colors.moderna)
    var focusAstrazeneca = svgAppengg(svgTotalVax, colors.astrazeneca)
    var focusDayAvg = svgAppengg(svgDayAvg, "#2E5984")

    var allTotalFocus = [focusTotal, focusFirstDose, focusSecondDose, focusPfizerBiontech, focusModerna, focusAstrazeneca]
    var allTotalValues = ["total", "first_dose", "second_dose", "pfizer_biontech", "moderna", "astrazeneca"]

    svgAppendRect(svgTotalVax, data, width, height, allTotalFocus, x, yTotal, allTotalValues, formatDate)
    svgAppendRect(svgDayAvg, data, width, height, [focusDayAvg], x, yDayAvg, ["rolling_day_avg"], formatDate)

    // Create tool tip
    appendTooltip(focusTotal, '#91BAD6')
    appendTooltip(focusFirstDose, colors.first_dose)
    appendTooltip(focusSecondDose, colors.second_dose)
    appendTooltip(focusPfizerBiontech, colors.pfizer_biontech)
    appendTooltip(focusModerna, colors.moderna)
    appendTooltip(focusAstrazeneca, colors.astrazeneca)
    appendTooltip(focusDayAvg, colors.day, 'Average')


    // add labels
    legend = svgTotalVax.append("g")
        .attr("class","legend")
        .attr("transform","translate(50,30)")
        .style("font-size","12px")
        .call(d3.legend)

    // table
    tabulate(data, ["date", "total", "daily", "rolling_day_avg", "first_dose", "second_dose", "pfizer_biontech", "moderna", "astrazeneca", "comment"]);
});