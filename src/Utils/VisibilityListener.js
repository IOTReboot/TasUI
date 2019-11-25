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