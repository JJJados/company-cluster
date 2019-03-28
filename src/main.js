/** 
 * This file incorporates all the main functions called that don't apply to a specific 
*/

/*---------------------------------------- Helper Functions ---------------------------------- */
let hideOverview = function () {
    let overviewPage = document.querySelector("#overview");
    overviewPage.className = "hidden";

    let clickComparePage = document.querySelector("#click-compare");
    clickComparePage.className = "visible";
}

let hideClickCompare = function() {
    let clickComparePage = document.querySelector("#click-compare");
    clickComparePage.className = "hidden";

    let overviewPage = document.querySelector("#overview");
    overviewPage.className = "visible";
    update();
}

let showCompareButton = function () {
    d3.select("#compare-button")
    .attr("class", "visible");
}

let hideCompareButton = function () {
    d3.select("#compare-button")
    .attr("class", "hidden");
}

let addEventListeners= function () {
    // Add event listener for click and compare
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

    //prepareClickCompareData();
    

    // Put in on drag? listeners and call update for the callback 
});