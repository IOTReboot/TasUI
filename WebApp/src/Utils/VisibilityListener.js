/*

  Copyright (C) 2019  Shantur Rathore
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
    hidden = "hidden";
    visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
}

var onWindowVisibilityChangedCallbacks = [];

function addVisibilityChangeCallback(onWindowVisibilityChanged) {
    var index = onWindowVisibilityChangedCallbacks.indexOf(onWindowVisibilityChanged);
    if (index === -1) {
        onWindowVisibilityChangedCallbacks.push(onWindowVisibilityChanged);
    }
}

function removeVisibilityChangeCallback(onWindowVisibilityChanged) {
    var index = onWindowVisibilityChangedCallbacks.indexOf(onWindowVisibilityChanged);
    if (index !== -1) {
        onWindowVisibilityChangedCallbacks.splice(index, 1);
    }
}

function handleVisibilityChange() {
    for (let callback of onWindowVisibilityChangedCallbacks) {
        callback(!document[hidden]);
    }
}

// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" || hidden === undefined) {
    console.log("This requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
} else {
    // Handle page visibility change   
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
}

export default { addVisibilityChangeCallback, removeVisibilityChangeCallback };