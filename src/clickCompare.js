/**
 * File: clickCompare.js
 * This file contains the functions used to create the click 
 * and compare page
 * 
 * Authors: Komal & Jayden
 */

/* ------------------------------------ Line Graph -------------------------------- */

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
let displayLineChart = function (ticker1, ticker2, data) {
    // Clear any existing images
    d3.select("#line-chart-canvas").html("");

    // Initiate frequently used variables in this function 
    let width = 1000;
    let height = 400;
    let padding = 60;

    // Set colors
    let ticker1Color = "#42f495";
    let ticker1ColorLight = "#38b774";
    let ticker2Color = "#ff56d7";
    let ticker2ColorLight = "#b53d98"
    
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
    let svg = d3.select("#line-chart-canvas");
    
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
}

let highlightRow = function(element) {
    element.style("color", "yellow");
}

let insertMarketCap = function (ticker1Data, ticker2Data) {
    let marketCap1 = ticker1Data.fundamental["MktCap (dollarsMil)"]
    let ticker1 = d3.select("#ticker1-mark-cap").html("$" + marketCap1.toFixed(0));

    let marketCap2 = ticker2Data.fundamental["MktCap (dollarsMil)"]
    let ticker2 = d3.select("#ticker2-mark-cap").html("$" + marketCap2);

    let highlighted = ticker1;
    if (marketCap2 > marketCap1) {
        highlighted = ticker2;
    }

    highlightRow(highlighted);
}

let insertDivYield = function(ticker1Data, ticker2Data) {
    let divYield1 = ticker1Data.dividend["Current Dividend"]
    let ticker1 = d3.select("#ticker1-div-yield").html("$" + divYield1);

    let divYield2 = ticker2Data.dividend["Current Dividend"]
    let ticker2 = d3.select("#ticker2-div-yield").html("$" + divYield2);

    let highlighted = ticker1;
    if (divYield2 > divYield1) {
        highlighted = ticker2;
    }

    highlightRow(highlighted);
}

let insertEps = function(ticker1Data, ticker2Data) {
    let eps1 = ticker1Data.fundamental["EPS% Payout"]
    let ticker1 = d3.select("#ticker1-eps").html(eps1.toFixed(2) +"%");

    let eps2 = ticker2Data.fundamental["EPS% Payout"]
    let ticker2 = d3.select("#ticker2-eps").html(eps2.toFixed(2) + "%");

    let highlighted = ticker1;
    if (eps2 > eps1) {
        highlighted = ticker2;
    }

    highlightRow(highlighted);
}

let insertPe = function(ticker1Data, ticker2Data) {
    let pe1 = ticker1Data.fundamental["TTM"]["P/E"]
    let ticker1 = d3.select("#ticker1-pe").html(pe1.toFixed(2) +"%");

    let pe2 = ticker2Data.fundamental["TTM"]["P/E"]
    let ticker2 = d3.select("#ticker2-pe").html(pe2.toFixed(2) + "%");

    let highlighted = ticker1;
    if (pe2 < pe1) {
        highlighted = ticker2;
    }

    highlightRow(highlighted);
}

let insertPeg = function(ticker1Data, ticker2Data) {
    let peg1 = ticker1Data.fundamental["PEG"]
    let ticker1 = d3.select("#ticker1-peg").html(peg1);

    let peg2 = ticker2Data.fundamental["PEG"]
    let ticker2 = d3.select("#ticker2-peg").html(peg2);

    let highlighted = ticker1;
    if (peg2 < peg1) {
        highlighted = ticker2;
    }

    highlightRow(highlighted);
}

let insertStreak = function(ticker1Data, ticker2Data) {
    let today = new Date();
    let currentYear = today.getFullYear();

    let streak1 = currentYear - ticker1Data.other["Streak Began"]
    let ticker1 = d3.select("#ticker1-streak").html(streak1 + " years");

    let streak2 = currentYear -  ticker2Data.other["Streak Began"]
    let ticker2 = d3.select("#ticker2-streak").html(streak2 + " years");

    let highlighted = ticker1;
    if (streak2 > streak1) {
        highlighted = ticker2;
    }

    highlightRow(highlighted);
}

let insertRor = function(ticker1Data, ticker2Data) {
    let ror1 = ticker1Data.other["TTM ROA"]
    let ticker1 = d3.select("#ticker1-ror").html(ror1.toFixed(2) + "%");

    let ror2 = ticker2Data.other["TTM ROA"]
    let ticker2 = d3.select("#ticker2-ror").html(ror2.toFixed(2) + "%");

    let highlighted = ticker1;
    if (ror2 > ror1) {
        highlighted = ticker2;
    }

    highlightRow(highlighted);
}

let displayTable = function(ticker1, ticker2) {

    d3.selectAll("td").style("color", "rgb(231, 231, 231)");

    let ticker1Data;
    let ticker2Data;

    // Retrieve the applicable data
    let dataRetrieved = 0;
    for (let i = 0; dataRetrieved != 2 && i < dataset.length; i ++) {
        let itemTicker = dataset[i].general["Ticker Symbol"];
        if (itemTicker == ticker1) {
            dataRetrieved++;
            ticker1Data = dataset[i];
        } else if (itemTicker == ticker2) {
            dataRetrieved++;
            ticker2Data = dataset[i];
        }
    }

    insertMarketCap(ticker1Data, ticker2Data);
    insertDivYield(ticker1Data, ticker2Data);
    insertEps(ticker1Data, ticker2Data);
    insertPe(ticker1Data, ticker2Data);
    insertPeg(ticker1Data, ticker2Data);
    insertStreak(ticker1Data, ticker2Data);
    insertRor(ticker1Data, ticker2Data);


   
}

/*-------------------------------- Generic ClickCompare Material -------------------------------- */

// Referenced traffic collision example provided by Indratmo
let parseYear;
let timeFormat;

// On start, get the two ticker symbols selected and create the chart
let showClickCompare  = function () {
    tickers = selectedTickers.getTickers()

    parseYear = d3.timeParse("%Y");
    timeFormat = d3.timeFormat("%Y");
    
    // Include data in the table
    d3.select("#column-ticker1").html(tickers[0]);
    d3.select("#column-ticker2").html(tickers[1]);

    d3.csv("src/historicalData.csv", rowConverter, function(data) {
        // Check if the data has the tickers in it. If not, print that no historical data is available. 
        let row = data[0];
        if (row.hasOwnProperty(tickers[0]) && row.hasOwnProperty(tickers[1])) {
            displayLineChart(tickers[0], tickers[1], data); 
        } else {
            let svg = d3.select("#line-chart-canvas");
            svg.html("");
            // Create the X axis title
            svg.append("text")
            .attr("transform", "translate(300,200)")
            .text("No Historical Data to Display.")
            .style("stroke", "white")
            .style("fill", "white");

        }
    });
    
    displayTable(tickers[0], tickers[1]);
}

// Currently not working
let historicalData;
let prepareClickCompareData = function () {
    console.log("preparing data...")
    d3.csv("src/historicalData.csv", rowConverter, function(data) {
        console.log("data:", data);
        historicalData = data;
        console.log("historical data", historicalData);
    });
}

