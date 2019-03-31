/**
 * File: overview.js
 * This file contains the functions used to create and
 * maintain the overview visualization
 * 
 * Authors: Jayden & Komal
 */

// radius used to create forced border
let radius = 25;
let width = window.innerWidth;
let height = window.innerHeight;

let data_addr = "http://159.89.155.66:8080/api/v1/dividends?date=2019-03";

let sectors = ["Health Care", "Information Technology", "Financials",
    "Industrials", "Real Estate", "Consumer Discretionary",
    "Consumer Staples", "Communication Services", "Materials",
    "Energy", "Utilities"
];

let currentSector = "Overview";

// create a tooltip
let Tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("id", "overview-tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

let sectorButtonClick = function (evt) {
    currentSector = evt.target.innerText;
    update();
    selectedTickers.destroy();
}

// Retrieve the data from Brent's api and store it in the dataset variable 
d3.json(data_addr, function(error, data) {
    dataset = data.Contenders.data
        .concat(data.Champions.data.concat(data.Challengers.data))
    displayOverview(dataset);
})

let displayOverview = function (data) {
    let svg = d3.select("#overview-canvas")

    svg.html("");

    let color = d3.scaleOrdinal()
        .domain(sectors)
        .range(["#92b9bd", "#a8d4ad", "#e8ec67", "#8e5572", "#91f5ad", "#745296",
            "#ee6c4d", "#4CAF50", "#d4b483", "#ff01fb", "#f28123"
        ]);

    // Size scale for market cap
    let size = d3.scaleLinear()
        .domain([0, 130000])
        .range([10, 22])

    // What happens when a circle is dragged?
    let dragstarted = function (d) {
        if (!d3.event.active) simulation.alphaTarget(.03).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    let dragended = function (d) {
        if (!d3.event.active) simulation.alphaTarget(.03);
        d.fx = null;
        d.fy = null;
    }

    let dragged = function (d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function (d) {
        Tooltip
            .style("opacity", 1);

        if(!selectedTickers.contains(d.general["Ticker Symbol"])) {
            highlightCircle(d3.select(this));
        }
    }

    /**
     * This function is used to adjust the tooltip and unhighlight a
     * circle when the user stops hovering over a circle
     * @param {} d 
     */
    let mouseleave = function (d) {
        Tooltip
            .style("opacity", 0);
            
        if (!selectedTickers.contains(d.general["Ticker Symbol"])) {
            unhighlightCircle(d3.select(this));
        }
    }

    /**
     * This function is used to generate the tooltip when the user hovers over a
     * circle
     * @param {} d 
     */
    let mousemove = function (d) {
        Tooltip
            .html(d.general["Company Name"] + "<br /> Market Cap in Millions: $" +
                d.fundamental["MktCap (dollarsMil)"] + "<br /> Est 5yr. Growth: " +
                d.fundamental["Est-5yr Growth"] + "<br /> Past 5yr. Growth: " +
                d.fundamental["Past 5yr Growth"] + "<br /> PEG: " +
                d.fundamental["PEG"])
            .attr("data-html", "true")
            .style("position", "absolute")
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY) + "px")
    }

    /**
     * This function is used to change the appearance of the selected circle
     * and adjust the selected tickers list when a user clicks a circle. 
     * @param {} d 
     */
    let mouseclick = function (d) {
        let ticker = d.general["Ticker Symbol"];

        // Need to de-select
        if (selectedTickers.contains(ticker)) {
            selectedTickers.removeTicker(ticker);
            unhighlightCircle(d3.select(this));
            hideCompareButton();
            return;
        }

        if (selectedTickers.isFull()){
            // Do nothing
            return;
        }

        // Select the company
        // Add ticker to the tickers list 
        selectedTickers.addTicker(ticker);
        selectCircle(d3.select(this));

        // Show compare button if possible
        if (selectedTickers.isFull()) {
            showCompareButton();
        }
    }

    // Initialize the circle: all located at the center of the svg area
    let node = svg.append("g")
        .selectAll(null)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", function (d) {
            if (isNaN(size(d.fundamental["MktCap (dollarsMil)"]))) {
                return 0
            }
            return size(d.fundamental["MktCap (dollarsMil)"])
        })
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .style("fill", function (d) {
            return color(d.general.Sector)
        })
        .style("fill-opacity", 0.8)
        .attr("stroke", "black")
        .style("stroke-width", 1)
        .on("mouseover", mouseover) // What to do when hovered
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", mouseclick)
        .call(d3.drag() // call specific function when circle is dragged
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))

    // Features of the forces applied to the nodes:
    let simulation = d3.forceSimulation()
        //.force("x", d3.forceX().strength(1).x( function(d){ return x(d.general.Sector) } ))
        //.force("y", d3.forceY().strength(0.001).y( function(d) { return y(d.general.Sector)} ))
        .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
        .force("charge", d3.forceManyBody().strength(-0.5)) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(.1).radius(function (d) {
            return (size(d.fundamental["MktCap (dollarsMil)"]) + 3)
        }).iterations(1)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
        .nodes(data)
        .on("tick", function (d) {
            node
                .attr("cx", function (d) {
                    return d.x = Math.max(radius, Math.min(width - radius, d.x));
                })
                .attr("cy", function (d) {
                    return d.y = Math.max(radius, Math.min(height - radius, d.y));
                })
        })

}

/**
 * update regenerates the visualization based on the 
 * selected sector and the slider values
 */
let update = function() {
    // check sliders --> to do
    let newDataset = dataset.filter(function(d) {
        if (currentSector === "Overview") {
            return true;
        }
        return d.general.Sector === currentSector;
    });

    displayOverview(newDataset);
}

/**
 * highlightCircle takes the circle element and displays it
 * so that it's highlighted
 * @param {*} circleElement 
 */
let highlightCircle = function(circleElement) {
    circleElement.style("stroke-width", 10)
    .style("stroke", "black");
}

/**
 * highlightCircle takes a circle element and remove the 
 * features so that it no longer makes it appear highlighted
 * @param {} circleElement 
 */
let unhighlightCircle = function(circleElement) {
    circleElement.style("stroke-width", 1)
        .style("stroke", "black");
}

/**
 * selectCircle takes a circle and changes its appearance
 * so it appears selected
 * @param {*} circleElement 
 */
let selectCircle = function(circleElement) {
    circleElement.style("stroke", "white");
}