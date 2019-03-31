/**
 * File: main.js
 * This file contains the functions initialize the
 * Company Cluster visualization.
 * 
 * Authors: Jayden & Komal
 */

/**
 * hideOverview is used to hide the contents of the overview section
 * tag and show the click and compare page. 
 */
let hideOverview = function () {
    let overviewPage = document.querySelector("#overview");
    overviewPage.className = "hidden";

    let clickComparePage = document.querySelector("#click-compare");
    clickComparePage.className = "visible";
}

/**
 * hideClickCompare is used to hide the contents of the click and 
 * compare section tag and show the overview  page.
 */
let hideClickCompare = function() {
    let clickComparePage = document.querySelector("#click-compare");
    clickComparePage.className = "hidden";

    let overviewPage = document.querySelector("#overview");
    overviewPage.className = "visible";
    update();
}

/**
 * showCompareButton shows the comparison button
 * when two companies are clicked 
 */
let showCompareButton = function () {
    d3.select("#compare-button")
    .attr("class", "visible");
}

/**
 * hideCompareButton hides the compare button when
 * a company is de-selected
 */
let hideCompareButton = function () {
    d3.select("#compare-button")
    .attr("class", "hidden");
}

/**
 * addEventListeners attaches event listeners on  
 * buttons used throughout the visualization
 */
let addEventListeners= function () {
    d3.select("#compare-button")
        .on("click", function () {
            hideOverview();
            showClickCompare();
        });

    d3.select("#back-button")
        .on("click", function () {
            hideClickCompare();
            selectedTickers.destroy();
            hideCompareButton();
        });

    /* Add event listeners to each of the sector buttons to filter the overview accordingly  */
    sectorButtons = document.querySelectorAll(".overviewButtons button");
    for (let button of sectorButtons) {
        button.addEventListener("click", sectorButtonClick);
    }

}

// This variable will hold the ticker symbols of the selected circles. 
let selectedTickers;

window.addEventListener('DOMContentLoaded', function (event) {
    // See selectedTickers.js for details
    selectedTickers = new SelectedTickers();

    addEventListeners();

    // Adjust svg element for the overview
    d3.select("#overview-canvas")
            .attr("width", width)
            .attr("height", height)
            .attr("align", "center");

    // Adjust the svg element for the line chart
    d3.select("#line-chart-canvas")
            .attr("width", 1000)
            .attr("height", 400);

    // See definitions.js for details 
    createDefinitionTooltips();
});