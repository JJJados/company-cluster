/**
 * File: selectedTickers.js
 * This file contains the outline for the SelectedTickers class.
 * 
 * Authors: Komal & Jayden
 */

/**
 * This class is used to manage the list of selected tickers
 */
class SelectedTickers {
    constructor () {
     this.tickers = [];
    }
 
    // Retrieve all the selected tickers
    getTickers() {
     return this.tickers;
    }
 
    // Add a selected ticker to the array 
    addTicker(ticker) {
     if (this.isFull()) {
         return;
     }
     this.tickers.push(ticker);
    }
 
    // Remove the given ticker from the selections array
    removeTicker(ticker) {
        if (this.tickers.length == 0) {
            return;
        }
        if (this.tickers[0] === ticker) {
             this.tickers.shift();
        } else if (this.tickers[1] === ticker) {
             this.tickers.pop();
        }
    }
 
    // Determines if we've reached a max of 2 tickers
    isFull() {
     return this.tickers.length == 2;
    }
 
    // Checks if the provided ticker is in the array
    contains(selectedTicker) {
        for (let ticker of this.tickers) {
            if (ticker === selectedTicker) {
                 return true;
            }
        }
        return false;
    }
 
    // Remove all selected tickers
    destroy() {
        this.tickers = [];
    }

 }