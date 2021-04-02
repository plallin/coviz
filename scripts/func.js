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

function svgAppendPath(svg, data, className, elem) {
  svg.append("path")
    .datum(data)
    .attr("class", className)
    .attr("d", elem);
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

function svgAppendRect(svg, data, width, height, focus, x, y, val, formatDate) {
  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);
  
  function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d[val]) + ")");
        focus.select("text").text(formatDate(d.date) + " - " + d[val]);
      }
}

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
                        d3.select(this.parentNode).style("background-color", "#FFFF00")
                    }
                }
                if (d.column == "date") {
                    if (formatDate(today) == formatDate(d.value)) {
                      d3.select(this.parentNode).style("background-color", "#FF0000")
                    }
                    return formatDate(d.value)
                }
                
                return d.value;
            });
    
    return table;
}
