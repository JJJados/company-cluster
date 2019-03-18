// radius used to create forced border
let radius = 25;
let width = window.innerWidth;
let height = window.innerHeight;

let data_addr = "http://159.89.155.66:8080/api/v1/dividends?date=2019-03";

let sectors = ["Health Care", "Information Technology", "Financials", 
                "Industrials", "Real Estate", "Consumer Discretionary",
                "Consumer Staples", "Communication Services", "Materials", 
                "Energy", "Utilities"];

// create a tooltip
let Tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

let svg = d3.select("#market_cap_overview")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("align", "center");

d3.json(data_addr, function(error, data) {
    // Concats Champions, Challengers, Contenders for D3 
    data = data.Contenders.data
        .concat(data.Champions.data.concat(data.Challengers.data))
        .filter(function(d){ return d.fundamental["MktCap (dollarsMil)"] > 0 });

    let color = d3.scaleOrdinal()
        .domain(sectors)
        .range(["#92b9bd", "#a8d4ad", "#e8ec67", "#8e5572", "#91f5ad", "#745296", 
                "#ee6c4d", "#4CAF50", "#d4b483", "#ff01fb", "#f28123"]);

    // Size scale for market cap
    let size = d3.scaleLinear()
        .domain([0, 130000])
        .range([10,22])  // circle will be between 7 and 55 px wide

        // What happens when a circle is dragged?
    let dragstarted = function(d) {
        if (!d3.event.active) simulation.alphaTarget(.03).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    let dragended = function(d) {
        if (!d3.event.active) simulation.alphaTarget(.03);
        d.fx = null;
        d.fy = null;
    }

    let dragged = function(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

        // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function(d) {
        Tooltip
            .style("opacity", 1)
    }

    let mouseleave = function(d) {
        Tooltip
            .style("opacity", 0)
    }

    let mousemove = function(d) {
        Tooltip
            .html(d.general["Company Name"] + "<br /> Market Cap in Millions: $"
                    + d.fundamental["MktCap (dollarsMil)"] + "<br /> Est 5yr. Growth: " 
                    + d.fundamental["Est-5yr Growth"] + "<br /> Past 5yr. Growth: "
                    + d.fundamental["Past 5yr Growth"] + "<br /> PEG: "
                    + d.fundamental["PEG"])
            .attr("data-html", "true")
            .style("position", "absolute")
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY) + "px")
    }

    // Initialize the circle: all located at the center of the svg area
    let node = svg.append("g")
        .selectAll(null)
        .data(data)
        .enter()
        .append("circle")
            .attr("class", "node")
            .attr("r", function(d) { 
                if (isNaN(size(d.fundamental["MktCap (dollarsMil)"]))) {
                    return 0
                }
                return size(d.fundamental["MktCap (dollarsMil)"])
            })
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .style("fill", function(d) { 
                return color(d.general.Sector) 
            })
            .style("fill-opacity", 0.8)
            .attr("stroke", "black")
            .style("stroke-width", 1)
        .on("mouseover", mouseover) // What to do when hovered
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .call(d3.drag() // call specific function when circle is dragged
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))

    // Features of the forces applied to the nodes:
    let simulation = d3.forceSimulation()
        //.force("x", d3.forceX().strength(1).x( function(d){ return x(d.general.Sector) } ))
        //.force("y", d3.forceY().strength(0.001).y( function(d) { return y(d.general.Sector)} ))
        .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
        .force("charge", d3.forceManyBody().strength(-1)) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(.1).radius(function(d) { 
            return (size(d.fundamental["MktCap (dollarsMil)"])+3) 
        }).iterations(1)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
        .nodes(data)
        .on("tick", function(d){
            node
                .attr("cx", function(d) { 
                    return d.x = Math.max(radius, Math.min(width - radius, d.x)); 
                })
                .attr("cy", function(d){ 
                    return d.y = Math.max(radius, Math.min(height - radius, d.y)); 
                })
        })
});