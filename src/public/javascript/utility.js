
// Send out an error alert in console and on the page.
export function error(err, message='Uh oh.') {
    $('#message').text(`Whoops! An error occurred. ${err.message}. ${message}`);
    console.log('Error log:');
    console.error(err);

    // timestamp
    let newDate = new Date();
    newDate.setTime(Date.now());
    let dateString = newDate.toTimeString();
    console.log(dateString);
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


// Combines username and password, then encodes in Base 64. Yum!
export function getAuthString(username, password) {
   let auth = username + ':' + password;
   return btoa(auth);
}
