var margin = {
        top: 40,
        right: 125,
        bottom: 30,
        left: 55
    },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    tooltip = { width: 100, height: 100, x: 10, y: -30 };

var parseDate = d3.time.format("%a %d %b %Y").parse,
    formatDate = d3.time.format("%Y-%b-%d"),
    bisectDate = d3.bisector(function(d) {
        return d.date;
    }).left;

var colors = {
    total: '#1E3F66',
    immuno: '#73A5C6',
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
        return yTotal(d.AdditionalDoseCum);
    });

var lineImmuno = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.ImmunoDoseCum);
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

var svgTotalVax = d3.select("#booster_total").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

svgTotalVax.append("rect")
.attr("width", width)
.attr("height", height)
.attr("fill", "#F5FCFF");

var svgDayAvg = d3.select("#booster_daily_avg").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svgDayAvg.append("rect")
.attr("width", width)
.attr("height", height)
.attr("fill", "#F5FCFF");

d3.json("datahub-scrap/COVID19_HSE_vaccine_booster_dose_daily.json", function(error, all_data) {
    if (error) throw error;

    daily_data = all_data["features"]
    data = []
    
    // read data
    daily_data.forEach(function(d) {
        d["attributes"].VaccineText = parseDate(d["attributes"].VaccineText);
        d["attributes"].AdditionalDoseCum = +d["attributes"].AdditionalDoseCum;
        d["attributes"].AdditionalDose = +d["attributes"].AdditionalDose;
        d["attributes"].ImmunoDose = +d["attributes"].ImmunoDose;
        d["attributes"].ImmunoDoseCum = +d["attributes"].ImmunoDoseCum;
        data.push(d["attributes"])
    });

    // sort data by date
    data.sort(function(a, b) {
        return a.VaccineText - b.VaccineText;
    });

    rolling_day_avg = 0
    // compute 7-day average
    data.forEach((d, i) => {
        if (i-7 < 0) {
            rolling_day_avg += d.AdditionalDose
        } else {
            rolling_day_avg = rolling_day_avg + d.AdditionalDose - data[i-7].AdditionalDose
        }
        d["rolling_day_avg"] = Math.round(rolling_day_avg / 7)
        d["date"] = d.VaccineText // screw this, I'm taking the easy way out!
    })

    // date of first vaccine
    firstVax = data[0].date
    dateOfLastUpdate = data[data.length - 1].date

    // x domain (date) is the same for both graph
    x.domain([firstVax, dateOfLastUpdate]);
    yTotal.domain(
        d3.extent(data, function(d) {
            return d.AdditionalDoseCum;
        }));
    yDayAvg.domain(
        d3.extent(data, function(d) {
            return d.rolling_day_avg;
        }));

    // add x axis
    svgAppendx(svgTotalVax, xAxis)
    svgAppendx(svgDayAvg, xAxis)

    // add y axis
    svgAppendy(svgTotalVax, yTotalAxis, "Total number of boosters")
    svgAppendy(svgDayAvg, yDayAvgAxis, "Daily boosters, 7 day average")

    // add line to graph
    svgAppendPath(svgTotalVax, data, "line-immuno", lineImmuno, "ImmunocompromisedDose")
    svgAppendPath(svgTotalVax, data, "line-total", lineTotal, "AdditionalDoseCumulative")
    svgAppendPath(svgDayAvg, data, "line", lineDayAvg, "")
    svgAppendPath(svgDayAvg, data, "area", areaDayAvg, "")

    svgAppendText(yTotal, data, ['AdditionalDoseCum', 'ImmunoDoseCum'])

    // do mouseover thingy
    var focusTotal = svgAppengg(svgTotalVax, colors.total)
    var focusImmuno = svgAppengg(svgTotalVax, colors.immuno)
    var focusDayAvg = svgAppengg(svgDayAvg, "#2E5984")

    var allTotalFocus = [focusTotal, focusImmuno]
    var allTotalValues = ["AdditionalDoseCum", "ImmunoDoseCum"]

    svgAppendRect(svgTotalVax, data, width, height, allTotalFocus, x, yTotal, allTotalValues, formatDate)
    svgAppendRect(svgDayAvg, data, width, height, [focusDayAvg], x, yDayAvg, ["rolling_day_avg"], formatDate)

    // Create tool tip
    appendTooltip(focusTotal, '#91BAD6')
    appendTooltip(focusImmuno, colors.immuno)
    appendTooltip(focusDayAvg, colors.day, 'Average')


    // add labels
    legend = svgTotalVax.append("g")
        .attr("class","legend")
        .attr("transform","translate(50,30)")
        .style("font-size","12px")
        .call(d3.legend)

    // table
    tabulateBooster(data, ["VaccineText", "AdditionalDose", "AdditionalDoseCum", "ImmunoDose", "ImmunoDoseCum", "PerBoosterDose"]);
});