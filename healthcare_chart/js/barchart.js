var margin = {top: 20, right: 20, bottom: 100, left: 40},
        width = 960 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([5, (width - 170)], .1);

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#b30000", "#3973ac"]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var svg = d3.select("div#barchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("mass_health_care_2014.csv", function(error, data) {
      if (error) throw error;

      color.domain(d3.keys(data[0]).filter(function(key) { return key !== "County"; }));

      data.forEach(function(d) {
        var y0 = 0;
        d.health = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
        d.total = d.health[d.health.length - 1].y1;
      });

      data.sort(function(a, b) { return b.total - a.total; });

      x.domain(data.map(function(d) { return d.County; }));
      y.domain([0, d3.max(data, function(d) { return d.total; })]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
         .selectAll("text")
          .attr("transform", "rotate(90)")
          .attr("y", -3)
          .attr("x", 10)
          .style("text-anchor", "start");

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -40)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("% of Population");

      var county = svg.selectAll(".county")
          .data(data)
        .enter().append("g")
          .attr("class", "countybar")
          .attr("transform", function(d) { return "translate(" + x(d.County) + ",0)"; })
          .attr("data-x", function(d) { return x(d.County); });


      county.selectAll(".countybar")
          .data(function(d) { return d.health; })
        .enter().append("rect")
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.y1); })
          .attr("height", function(d) { return y(d.y0) - y(d.y1); })
          .style("fill", function(d) { return color(d.name); })
          .on("mouseover", function() { tooltip.style("display", null); })
          .on("mouseout", function() { tooltip.style("display", "none"); })
          .on("mousemove", function(d) {
            var barAdjust = +d3.select(this.parentNode).attr("data-x");
            var xPosition = d3.mouse(this)[0] + barAdjust - 25;
            var yPosition = d3.mouse(this)[1] - 35;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            var pct = d.y1-d.y0;
            tooltip.select("text").text(pct.toFixed(2) + "%");
          });

      var legend = svg.selectAll(".legend")
          .data(color.domain().slice().reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d; });

        // Prep the tooltip bits, initial display is hidden
        var tooltip = svg.append("g")
          .attr("class", "tooltip")
          .style("display", "none");

        tooltip.append("rect")
          .attr("width", 50)
          .attr("height", 25)
          .attr("fill", "white")
          .style("opacity", 0.5);

        tooltip.append("text")
          .attr("x", 25)
          .attr("dy", "1.4em")
          .style("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold");    
    });