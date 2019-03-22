/**
 * Click & Compare Line Chart
 * 
 * Author: Komal Aheer
 * Data Source: DRiP Investing Resources
 * D3 Version 4 (accessed via http://d3js.org/d3.v4.min.js)
 */

/**
 * rowConverter converts a row of the historicalData
 * to the appropriate data types. 
 * @param Historical Data row
 */
let rowConverter = function (data) {
    // Parse year into time
    let newRow = {
        year: parseYear(data.year)
    }
    
    // Parse dividends into floats
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
 * @param d 
 * @param ticker 
 */
let showTooltip = function (d, ticker) {
    let tooltip = d3.select("#line-chart-tooltip");

    // Get the mouse position
    let xPosition = d3.event.pageX;
    let yPosition = d3.event.pageY;

    // Position tooltip and include data values
    tooltip
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#value")
        .text(d[ticker])
    tooltip
        .select("#year")
        .text(timeFormat(d.year));
    
    // Reveal tooltip
    tooltip.classed("hidden", false);
}

/**
 * hideTooltip makes the tooltip invisible
 * @param d 
 */
let hideTooltip = function (d) {
    d3.select("#line-chart-tooltip").classed("hidden", true);
}

/**
 * changeStyle alters the style of the element attained using the 
 * provided select string to include the provided attribute and value
 * @param selectString 
 * @param attribute 
 * @param value 
 */
let changeStyle = function (selectString, attribute, value) {
    d3.selectAll(selectString).style(attribute, value);
}

/**
 * colorTicker1Line makes the ticker1 line and points the color provided 
 * @param {*} color 
 */
let colorTicker1Line = function (color) {
    changeStyle(".ticker1circles", "fill", color); 
    changeStyle("#ticker1line", "stroke", color);
}

/**
 * colorTicker2Line makes the ticker2 line and points the color provided 
 * @param {*} color 
 */
let colorTicker2Line = function (color) {
    changeStyle(".ticker2circles", "fill", color); 
    changeStyle("#ticker2line", "stroke", color);
}

/**
 * displayLineChart parses the historical data and displays data 
 * for two companies with the provided tickers
 * @param ticker1 
 * @param ticker2 
 */
let displayLineChart = function (ticker1, ticker2) {
    // Parse the historical data 
    d3.csv("src/historicalData.csv", rowConverter, function(data) {
       
        // Initiate frequently used variables in this function 
        let width = 1000;
        let height = 400;
        let padding = 60;
        
        let homeDiv = "#line-chart"; // where the chart will be displayed

        // Set colors
        let ticker1Color = "red";
        let ticker1ColorLight = "lightcoral";
        let ticker2Color = "blue";
        let ticker2ColorLight = "lightblue"
       
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
                    .domain([0, max])
                    .range([height - padding, padding]);

        // Create a scale function for the x axis (year)
        let xScale = d3.scaleTime()
            .domain([minYear, maxYear])
            .range([padding, width - padding]);

        // Create function for generating x axis
        let xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(20)
            .tickFormat(timeFormat); // Referenced Indratmo's code

        // Create function for generating y axis
        // Referenced the following to include $ on y axis
        // https://stackoverflow.com/questions/38111716/d3-js-nvd3-issue-display-the-dollar-sign-and-the-currency-format-in-the-toolti?rq=1
        let yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(10)
            .tickFormat(function (d) {
                return "$" + d;
            }); 
        
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
            .attr("transform", "translate(" + (padding) + ",0)")
            .call(yAxis);

        // Create the X axis title
        svg.append("text")
            .attr("class", "axisTitle")
            .attr("transform", "translate(" + (width/2) + "," + (height-10) + ")")
            .text("Years");

        // Create the Y axis title
        svg.append("text")
            .attr("class", "axisTitle")
            .attr("transform", "translate(25," + ((height/2)+50)  + ") rotate(-90)") //15
            .text("Dividend Yield");

        // Create the line generator function for ticker 1
        let line1 = d3.line()
                        .x(function (d) { return xScale(d.year); })
                        .y(function (d) { return yScale(d[ticker1]); });
        
        // Render the line by adding it to the existing svg
        svg.append("path")
                .datum(data)
                .attr("id", "ticker1line")
                .attr("class", "line")
                .attr("d", line1)
                .style("stroke", ticker1Color)
                // Include hover interaction
                .on("mouseover", function () {colorTicker2Line(ticker2ColorLight)})
                .on("mouseout", function () {colorTicker2Line(ticker2Color)});
        
        // Create the line generator for ticker2
        let line2 = d3.line()
                        .x(function (d) { return xScale(d.year); })
                        .y(function (d) { return yScale(d[ticker2]); });

        // Render the line by adding it to the existing svg
        svg.append("path")
                .datum(data)
                .attr("id", "ticker2line")
                .attr("class", "line")
                .attr("d", line2)
                .style("stroke", ticker2Color)
                // Include hover interaction
                .on("mouseover", function () {colorTicker1Line(ticker1ColorLight)})
                .on("mouseout", function () {colorTicker1Line(ticker1Color)});

        // Create circles for each year for ticker1
        svg.selectAll("ticker1circles")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "ticker1circles")
            .attr("cx", function (d) {
                return xScale(d.year);
            })
            .attr("cy", function (d) {
                return yScale(d[ticker1]);
            })
            .attr("r", "5")
            .style("fill", ticker1Color)
            // Create hover interactions
            .on("mouseover", function (d){ 
                showTooltip (d, ticker1); 
                colorTicker2Line(ticker2ColorLight);
            })
            .on("mouseout", function() {
                hideTooltip();
                colorTicker2Line(ticker2Color);
            });
        
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
            .attr("class", "ticker2circles")
            // Create hover interactions
            .on("mouseover", function (d){ 
                showTooltip (d, ticker2); 
                colorTicker1Line(ticker1ColorLight);
            })
            .on("mouseout", function() {
                hideTooltip();
                colorTicker1Line(ticker1Color);
            });

        // Create a label for the ticker 1 line 
        svg.append("text")
            .attr("x", xScale(data[0].year) + 10)
            .attr("y", yScale(data[0][ticker1]) + 5)
            .attr("class", "label")
            .text(function () {
                return ticker1;
            })
            .style("fill", ticker1Color);
        
        // Create a label for the ticker 2 line 
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

// On start, create the chart for coke vs. pepsi
window.onload = function () {
    let ticker1 = "KO";
    let ticker2 = "PEP";

    parseYear = d3.timeParse("%Y");
    timeFormat = d3.timeFormat("%Y");

    displayLineChart(ticker1, ticker2);
}