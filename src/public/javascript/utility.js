'use strict';
const json2csv = require('json2csv').parse;


// Send out an error alert in console and on the page.
export function error(err, message='') {
    // timestamp
    let newDate = new Date();
    newDate.setTime(Date.now());
    let dateString = newDate.toTimeString();
    console.log(dateString);

    // Post to page
    $('#message').text(`Whoops! An error occurred. ${err.message} ${message}`);
    console.log('Error log:');
    console.error(err);
}

// Nicely formatted time
export function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    seconds = seconds < 10 ? '0'+seconds : seconds;
    let strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    return strTime;
}


export function downloadJson(json, name) {
    download(JSON.stringify(json, null, 4), name, 'text/plain');
}

export function downloadJsonAsCsv(json, name) {
    download(json2csv(json, {flatten: true, eol: '\r\n'}), name, 'text/csv');
}

function download(text, name, type) {
    let a = document.createElement('a');
    let file = new Blob([text], { type: type });
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}
