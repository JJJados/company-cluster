/**
 * Click & Compare Line Chart
 * 
 * Author: Komal Aheer
 * Data Source: DRiP Investing Resources
 */

/**
 * rowConverter converts a row of the historicalData
 * to the appropriate data types. 
 * @param Historical Data row
 */
let rowConverter = function (data) {
    let newRow = {
        year: parseYear(data.year)
    }
    Object.keys(data).forEach(function (key) {
        if (key !== "year") {
            newRow[key] = parseFloat(data[key]);
        }
    });
    return newRow;
}

/**
 * showTooltip displays a tooltip according to the position of a 
 * data point and ticker type.
 * @param {*} d 
 * @param {*} ticker 
 */
let showTooltip = function (d, ticker) {
    let tooltip = d3.select("#line-chart-tooltip");

    let xPosition = d3.event.pageX;
    let yPosition = d3.event.pageY;

    tooltip
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#value")
        .text(d[ticker])

    tooltip
        .select("#year")
        .text(timeFormat(d.year));
    
    tooltip.classed("hidden", false);
}

/**
 * hideTooltip makes the tooltip invisible
 * @param {} d 
 */
let hideTooltip = function (d) {
    d3.select("#line-chart-tooltip").classed("hidden", true);
}

/**
 * displayLineChart parses the historical data and displays data 
 * for two companies with the provided tickers
 * @param {*} ticker1 
 * @param {*} ticker2 
 */
let displayLineChart = function (ticker1, ticker2) {
    
    d3.csv("historicalData.csv", rowConverter, function(data) {
       
        // Now that we have the data we're interested in, we can create the graph!
        let width = 1000;
        let height = 300;
        let padding = 30;
        
        let homeDiv = "#line-chart";
        let ticker1Color = "red";
        let ticker2Color = "blue"; //rgb(10, 238, 150)
       
        // Find maximum dividend yield of the companies of interest.
        let ticker1Max = d3.max(data, function (d) { return d[ticker1] } );
        let ticker2Max = d3.max(data, function (d) { return d[ticker2] } );
        let max = ticker1Max;
        if (ticker2Max > ticker1Max) {
            max = ticker2Max;
        } 

        // Find the minimum and maxiumum year
        let minYear = d3.min(data, function (d) { return d.year; });
        let maxYear = d3.max(data, function (d) { return d.year; });

        // Create a scale function for the y axis (div yield)
        let yScale = d3.scaleLinear()
                    .domain([0, max]) // *
                    .range([height - padding, padding]); // padding, width - padding * 2

        // Create a scale function for the x axis (year)
        let xScale = d3.scaleTime()
            .domain([minYear, maxYear])
            .range([padding, width - padding * 2]);

        // Create function for generating x axis
        let xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(20)
            .tickFormat(timeFormat); // Referenced Indratmo's code

        // Create function for generating y axis
        let yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(10);
        
        // create the SVG to hold the graph 
        let svg = d3.select(homeDiv)
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        
        //Create X axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (height - padding) + ")")
            .call(xAxis);

        //Create Y axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);

        // Create the line generator function for ticker 1
        let line1 = d3.line()
                        .x(function (d) { return xScale(d.year); })
                        .y(function (d) { return yScale(d[ticker1]); });
        
        // Render the line by adding it to the existing svg
        svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line1)
                .style("stroke", ticker1Color);
        
        // Create the line generator for ticker2
        let line2 = d3.line()
                        .x(function (d) { return xScale(d.year); })
                        .y(function (d) { return yScale(d[ticker2]); });

        // Render the line by adding it to the existing svg
        svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line2)
                .style("stroke", ticker2Color);


        // Create circles for each year for ticker1
        svg.selectAll("ticker1circles")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return xScale(d.year);
            })
            .attr("cy", function (d) {
                return yScale(d[ticker1]);
            })
            .attr("r", function () {
                return 5;
            })
            .style("fill", ticker1Color)
            .attr("class", "data-point")
            .on("mouseover", function (d){ showTooltip (d, ticker1); } )
            .on("mouseout", hideTooltip );
        
        // Create circles for each year for ticker2
        svg.selectAll("ticker2circles")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return xScale(d.year);
            })
            .attr("cy", function (d) {
                return yScale(d[ticker2]);
            })
            .attr("r", function () {
                return 5;
            })
            .style("fill", ticker2Color)
            .attr("class", "data-point")
            .on("mouseover", function (d){ showTooltip (d, ticker2); } )
            .on("mouseout", hideTooltip );

        // Create a label for the ticker 1 line 
        svg.append("text")
            .attr("x", xScale(data[0].year) + 10)
            .attr("y", yScale(data[0][ticker1]) + 5)
            .attr("class", "label")
            .text(function () {
                return ticker1;
            })
            .style("fill", ticker1Color);
        
        svg.append("text")
        .attr("x", xScale(data[0].year) + 10)
        .attr("y", yScale(data[0][ticker2]) + 5)
        .attr("class", "label")
        .text(function () {
            return ticker2;
        })
        .style("fill", ticker2Color);
    });
};

// Referenced traffic collision example provided by Indratmo
let parseYear;
let timeFormat;

window.onload = function () {
    let ticker1 = "KO";
    let ticker2 = "PEP";
    parseYear = d3.timeParse("%Y");
    timeFormat = d3.timeFormat("%Y");
    displayLineChart(ticker1, ticker2);
}