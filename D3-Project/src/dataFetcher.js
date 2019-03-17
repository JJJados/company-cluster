/*
    dataFetcher retrieves data from Brent's server
*/

let data;

let fetchData = function () {

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://159.89.155.66:8080/api/v1/dividends?date=2019-03");
    
    xhr.onerror = function () {
        console.log("Unable to reach server");
    }
    xhr.onload = function () {
        console.log("success!");
        data = JSON.parse(xhr.responseText);
        console.log(data);
    }
    xhr.send();
}

window.onload = function () {
    fetchData();
}