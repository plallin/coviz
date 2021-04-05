function dateOfLastUpdate(data) {
    var finalDay;
    data.forEach(function(d) {
        if (parseInt(d.total) == 0) {
            return finalDay;
        }
        finalDay = d.date
    });
    return finalDay
}

function dataWithVax(data, finalDay) {
    oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    diffDays = Math.round(Math.abs((data[0].date - finalDay) / oneDay));
    dataVax = data.slice(0, diffDays + 1)
    return dataVax
}

function svgAppendx(svg, xAxis) {
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
}

function svgAppendy(svg, yAxis, text) {
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(text);
}

function svgAppendPath(svg, data, className, elem, legend) {
    svg.append("path")
        .datum(data)
        .attr("class", className)
        .attr("d", elem)
        .attr("data-legend", legend);
}

function svgAppengg(svg) {
    focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 4.5);

    focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");

    return focus
}

function svgAppendText(y, data, values) {
    values.forEach(function(v) {
        svgTotalVax.append("text")
            .attr("transform", "translate(" + (width + 3) + "," + y(data[data.length - 1][v]) + ")")
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", "black")
            .text(v);
    });
}

function svgAppendRect(svg, data, width, height, focuses, x, y, values, formatDate) {
    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() {
            focuses.forEach(function(focus) {
                focus.style("display", null);
            });
        })
        .on("mouseout", function() {
            focuses.forEach(function(focus) {
                focus.style("display", "none");
            });
        })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        focuses.forEach(function(focus, index) {
            focus.attr("transform", "translate(" + x(d.date) + "," + y(d[values[index]]) + ")");
            focus.select(".tooltip-date").text(formatDate(d.date));
            focus.select(".tooltip-likes").text(parseInt(d[values[index]]).toLocaleString());
        });
    }
}

function appendTooltip(focus, color) {
    focus.append("rect")
            .attr("class", "tooltip")
            .attr("width", 90)
            .attr("height", 30)
            .attr("x", -45)
            .attr("y", -38)
            .attr("rx", 4)
            .attr("ry", 4)
            .style("fill", color);

    focus.append("text")
            .attr("class", "tooltip-date")
            .attr("x", -40)
            .attr("y", -26);

    focus.append("text")
            .attr("x", -40)
            .attr("y", -15)
            .text("Vaccines:");

    focus.append("text")
            .attr("class", "tooltip-likes")
            .attr("x", 4)
            .attr("y", -15);
}

function tabulate(data, columns) {
    var table = d3.select("#data_table").append("table").attr("id", "datatable"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function(column) {
            return column;
        });

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {
                    column: column,
                    value: row[column]
                };
            });
        })
        .enter()
        .append("td")
        .html(function(d) {
            // d3.select(this.parentNode).style("background-color", "#FFFF00")
            if (d.column == "comment") {
                if (d.value != "" && d.value != undefined) {
                    d3.select(this.parentNode).style("background-color", "#FDFD95")
                    return d.value.replace(
                        /((http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?)/g,
                        '<a href="$1" target="_blank">$1</a>'
                    )
                }
            }
            if (d.column == "date") {
                if (formatDate(today) == formatDate(d.value)) {
                    d3.select(this.parentNode).style("background-color", "#BBD3EC")
                }
                return formatDate(d.value)
            }

            return d.value;
        });

    return table;
}