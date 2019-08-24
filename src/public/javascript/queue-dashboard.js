import { error, formatAMPM } from './utility';
import * as api from './api';
import GizmoManager from './gizmo';

// timeout to pause event loop when needed
let timeout = null;

// Object to manage the gizmos (queue widgets)
let gizmo = null;

// Current user
let user = null;

async function startItUp() {
    gizmo = new GizmoManager();
    await gizmo.load(true);

    user = await loadUserTheme();

    // listen for sign-in button press
    $('.play-pause').click(async (event) => {
        // prevent redirection
        event.preventDefault();

        // Currently running?
        // stop any current event loops running
        if (timeout != null) {
            clearTimeout(timeout);
            timeout = null;
            $('.play-pause').html('&#9658;'); // show play button
            // Remind user that they're paused
            $('.message').text(`Dashboard paused since ${moment().toDate()}.`);
        }
        // Not running? Start it up
        else {
            $('.play-pause').html('&#10074;&#10074;'); // show pause button
            // begin updating data & page every few seconds
            try {
                runQueueDashboard();
            } catch (err) {
                error(err, 'Error occurred while queue dashboard was running.');
            }
        }
    });

    // Update displayed queue list when user clicks button
    $('.show-skills-list').click(function (event) {
        const id = $(this).closest('.gizmo').attr('id');
        const thisgizmo = gizmo.gizmos[id];
        thisgizmo.showQueueList = !thisgizmo.showQueueList;
        const table = $(this).next('table.queue-list');
        createQueueList(thisgizmo, table);
    });

    // Trigger "play" button to start updating when page is loaded.
    $('.play-pause').trigger('click');

    // UI: Text size and Theme toggles
    $('.big-display').click(function(event) {
        if (document.getElementById('big-display').href.slice(-4) != '.css') {
            document.getElementById('big-display').href = `styles/big-display.css`;
        } else {
            document.getElementById('big-display').href = '';
        }
    });
    $('.toggle-theme').click(async function(event) {
        await toggleTheme(user);
        user = await loadUserTheme();
    });
};
window.addEventListener('load', startItUp);


async function runQueueDashboard() {
    let lastSlUpdate = null;
    let slData = [];

    async function eventLoop(interval) {
        // Get the current queue data
        try {
            // Retrieve current queue stats
            let data = await api.queueStats();

            // Get SL stats
            // Only update SL every 3 minutes
            let currentTime = new Date();
            if ((currentTime - lastSlUpdate) > 180000) {
                try {
                    let time = {
                        start: moment().format('YYYY-MM-DD') + 'T00:00:00',
                        end:   moment().format('YYYY-MM-DD') + 'T23:59:59'
                    };
                    slData = await api.getReportResults(time, 'service-level');
                    lastSlUpdate = currentTime;
                } catch (err) {
                    error(err, `An error occurred when getting service level data: ${err}`);
                    slData = [];
                }
            }
            // Update the view / DOM
            refreshView(data, slData);

        } catch (err) {
            error(err);
        }

        // restart loop
        timeout = setTimeout(() => {
            eventLoop(interval);
        }, interval);
    }

    // Refresh every 20 seconds.
    eventLoop(20000);
}



// Takes nicely formatted data. Updates dashboard view.
// ${data} : ACD stats (current queue info)
// ${serviceLevel} : service level report
function refreshView(data, serviceLevelData) {
    if (data.length == 0) {
        console.log(`[${moment()}] No queue data received. Aborting refresh.`);
        return;
    }

    // update each gizmo on the screen
    $('.gizmo').each((i, gizmoElement) => {
        const thisGizmo = gizmo.gizmos[gizmoElement.id];
        let skills = thisGizmo.skillFilter;

        // Clear old queue list from gizmo
        thisGizmo.queueList = [];

        // Determine calls and agent stats for this gizmo's skills
        let callsInQueue = 0,
            maxWait = 0,
            agentsLoggedIn = 0,
            agentsNotReady = 0,
            agentsOnCall = 0,
            agentsReady = 0,
            serviceLevel = 0,
            callsOffered = 0,
            abandons = 0;

        for (let i=0; i < data.length; i++) {
            let queue = data[i];
            // Include skills in gizmo filter, or all skills if none are in filter
            if (skills.includes(queue['SkillName']) || skills.length == 0) {
                // Real-time queue metrics
                callsInQueue += queue['CallsInQueue'];
                maxWait = Math.max(maxWait, queue['CurrentLongestQueueTime']);
                agentsLoggedIn = Math.max(agentsLoggedIn, queue['AgentsLoggedIn']);
                agentsNotReady = Math.max(agentsNotReady, queue['AgentsNotReadyForCalls']);
                agentsOnCall = Math.max(agentsOnCall, queue['AgentsOnCall']);
                agentsReady = Math.max(agentsReady, queue['AgentsReadyForCalls']);

                // Calculate SL and abandon rate
                let metrics = serviceLevelData.reduce((totals, current) => {
                    if (current.skill == queue['SkillName']) {
                        totals.serviceLevel += current.serviceLevel;
                        totals.calls += current.calls;
                        totals.abandons += current.abandons;
                    }
                    return totals;
                }, { serviceLevel: 0, calls: 0, abandons: 0 });
                serviceLevel += metrics.serviceLevel;
                callsOffered += metrics.calls;
                abandons += metrics.abandons;

                // Add to list of skills in queue
                if (queue['CallsInQueue'] > 0) {
                    thisGizmo.queueList.push({
                        skillName: queue['SkillName'],
                        callsInQueue: queue['CallsInQueue'],
                        maxWait: formatWaitTime(queue['CurrentLongestQueueTime'])
                    });
                }
            }
        }

        // Format wait time from seconds to MM:SS or HH:MM:SS
        let waitString = formatWaitTime(maxWait);

        // Update metrics
        let SLpercent = callsOffered == 0
            ? 'N/A'
            : Math.round(100 * serviceLevel / callsOffered) + '%';
        let abandonRate = callsOffered == 0
            ? 'N/A'
            : Math.round(100 * abandons / callsOffered) + '%';
        $(gizmoElement).find('.metric.service-level').text(SLpercent);
        $(gizmoElement).find('.metric.abandon-rate').text(abandonRate);
        $(gizmoElement).find('.calls-in-sl').text(serviceLevel);
        $(gizmoElement).find('.calls-out-of-sl').text(callsOffered - serviceLevel);

        $(gizmoElement).find('.metric.calls-in-queue').text(callsInQueue);
        $(gizmoElement).find('.metric.max-wait').text(waitString);
        $(gizmoElement).find('.agents-logged-in').text(agentsLoggedIn);
        $(gizmoElement).find('.agents-not-ready-for-calls').text(agentsNotReady);
        $(gizmoElement).find('.agents-on-call').text(agentsOnCall);
        $(gizmoElement).find('.agents-ready-for-calls').text(agentsReady);

        // Update queue list, if showing
        if (thisGizmo.showQueueList) {
            const table = $(gizmoElement).find('.queue-list');
            createQueueList(thisGizmo, table);
        }
    }); // gizmo.forEach

    // Clear old messages
    $('#message').text(' ');

    // Update clock
    $('.clock').text(formatAMPM(new Date()));
}


// Update queue list in DOM
// ${gizmo} object to build list on. ${table} element storing list.
function createQueueList(thisGizmo, table) {
    table.empty(); // clear old list

    // anything to list?
    if (thisGizmo.queueList.length == 0) return;

    // Sort by max wait time
    thisGizmo.queueList.sort((a, b) => a.maxWait > b.maxWait ? -1 : 1);

    // Add headers
    const thead = document.createElement('thead');
    const th1 = document.createElement('th');
    th1.appendChild(document.createTextNode('Skill Name'));
    th1.className += ' type-text';
    const th2 = document.createElement('th');
    th2.appendChild(document.createTextNode('Calls'));
    th2.className += ' type-number';
    const th3 = document.createElement('th');
    th3.appendChild(document.createTextNode('Max Wait'));
    th3.className += ' type-number';
    thead.appendChild(th1); thead.appendChild(th2); thead.appendChild(th3);
    table.append(thead);

    // Update DOM from queueList
    thisGizmo.queueList.forEach((queue) => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.appendChild(document.createTextNode(queue.skillName));
        td1.className += ' type-text';
        const td2 = document.createElement('td');
        td2.appendChild(document.createTextNode(queue.callsInQueue));
        td2.className += ' type-number';
        const td3 = document.createElement('td');
        td3.appendChild(document.createTextNode(queue.maxWait));
        td3.className += ' type-number';
        tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
        table.append(tr);
    });
}

// Turns seconds into nicely formatted MM:SS or HH:MM:SS
function formatWaitTime(seconds) {
    const wait = new Date(null);
    wait.setSeconds(seconds);
    if (seconds < 3600) { // MM:SS
        return wait.toISOString().substr(14, 5);
    }
    return wait.toISOString().substr(11, 8); // HH:MM:SS
}

// Return formatted column / key assignments
// Takes JSON generated from original Five9 SOAP API response
function jsonToViewData(json,
        includeFields=['Skill Name', 'Calls In Queue',
                        'Current Longest Queue Time', 'Agents Logged In',
                        'Agents Not Ready For Calls', 'Agents On Call',
                        'Agents Ready For Calls']) {
    let columns = json['columns'][0]['values'][0]['data'];
    let rows = json['rows'];
    let data = [];

    for (let i=0; i < rows.length; i++) {
        let row = rows[i]['values'][0]['data'];
        let newRow = {};
        for (let j=0; j < includeFields.length; j++) {
            let field = includeFields[j];
            newRow[field] = row[columns.indexOf(field)];
            // trim extra 0's to fix time formatting (to seconds)
            if (field == 'Current Longest Queue Time')
                newRow[field] = newRow[field].slice(0, -3);
        }
        data.push(newRow);
    }
    return data;
}

async function loadUserTheme() {
    let user = await api.getUserInformation();
    if (user.theme.colorQueues === 'dark') {
        document.getElementById('theme_css').removeAttribute('disabled');
    }
    else {
        document.getElementById('theme_css').setAttribute('disabled', null);
    }
    return user;
}

async function toggleTheme(user) {
    if (!user || !user.theme) {
        console.error('User object not valid:', user);
        return;
    }
    let newColorQueues = null;
    if (user.theme.colorQueues === 'light') {
        newColorQueues = 'dark';
    } else {
        newColorQueues = 'light';
    }

    user.theme.colorQueues = newColorQueues;
    const msg = await api.updateUserTheme(user.username, user.theme);
    console.log(msg);
}

