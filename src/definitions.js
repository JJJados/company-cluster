
// Source: Investopedia
let definitions = {};

definitions["Market Cap"] = 
`Market capitalization refers to the total dollar market value of a company's outstanding shares.`;

definitions["EPS"] = 
`Earnings Per Share (EPS) refers to the portion of a company's profit allocated to each share of common stock. 
The earnings per share value is calculated as the net income (AKA profits or earnings) divided by the available shares`;

definitions["Dividend Yield"] = 
`Dividend Yield is calculated by taking the amount dividends earned annually and dividing it by its share price.`;

definitions["PE"] = 
`Price-To-Earnings Ratio (P/E Ratio) is the ratio for valuing a company that measures its current share price 
relative to its per-share earnings (EPS). It's calculated by dividing the Market Value per Share by the EPS.`;

definitions["PEG"] = 
`Price-Earnings-to-Growth Ratio (PEG) is a stock's PE ratio divided byt he growth rate of its earnings`;

definitions["Streak"] = 
`Streak refers to the number of years that a company has been experiencing an annual increase in dividend yields`;

definitions["Rate of Return"] = 
`A rate of return (RoR) is the net gain or loss on an investment over a specified time period, expressed as 
a percentage of the investment’s initial cost. `;

/**
 * showDefinitionTooltip displays a definitiontooltip.
 * @param d 
 * @param ticker 
 */
let showDefinitionTooltip = function (term) {
    let tooltip = d3.select("#definition-tooltip");

    // Get the mouse position
    let xPosition = d3.event.pageX;
    let yPosition = d3.event.pageY;

    // Position tooltip and include data values
    tooltip
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#definition")
        .text(definitions[term])
    
    // Reveal tooltip
    tooltip.classed("hidden", false);
}

/**
 * hideTooltip makes the definition tooltip invisible
 * @param d 
 */
let hideDefinitionTooltip = function () {
    d3.select("#definition-tooltip").classed("hidden", true);
}

let createDefinitionTooltips = function () {

    /* Add event handlers for definitions */

    let definitionElements = new Map();

    definitionElements.set("#column-mark-cap", "Market Cap");
    definitionElements.set("#column-div-yield", "Dividend Yield");
    definitionElements.set("#column-eps", "EPS");
    definitionElements.set("#column-pe", "PE");
    definitionElements.set("#column-peg", "PEG");
    definitionElements.set("#column-streak", "Streak");
    definitionElements.set("#column-ror", "Rate of Return");

    for (let key of definitionElements.keys()) {
        d3.select(key)
            .on("mouseover", function () {
                showDefinitionTooltip(definitionElements.get(key));
            })
            .on("mouseout", hideDefinitionTooltip)
    }

}

