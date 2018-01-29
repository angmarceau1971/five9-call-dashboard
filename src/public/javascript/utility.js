
// Send out an error alert in console and on the page.
<<<<<<< HEAD
export function error(err, message='Uh oh.') {
    // Log to console
=======
export function error(err, message='') {
    // timestamp
>>>>>>> origin/master
    let newDate = new Date();
    newDate.setTime(Date.now());
    let dateString = newDate.toTimeString();
    console.log(dateString);
<<<<<<< HEAD
    console.log('Error log:');
    console.error(err);

    // update message
    $('#message').text(`Whoops! An error occurred. ${err.message}. ${message}`);
=======

    // Post to page
    $('#message').text(`Whoops! An error occurred. ${err.message} ${message}`);
    console.log('Error log:');
    console.error(err);
>>>>>>> origin/master
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
