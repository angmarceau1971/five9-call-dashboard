/**
 * Manage datasources and timing of data updates.
 *
 * Datasource objects are saved as JSON in Layouts. Upon page load, the hub.js
 * module and this module will load the JSON layout and begin updating data with
 * the frequency and parameters based on that layout.
 */
/**
 * Sample Datasource object format:
{
    "id": "1",
    "name": "Call Data Feed",
    "fields": {
      "sum": [
        "calls",
        "serviceLevel"
      ]
    },
    "filter": {
      "date": "<month-to-date>"
    },
    "groupBy": [
      "dateDay"
    ],
    "refreshRate": 600,
    "source": "AcdFeed"
}
 */
'use strict';

import * as filters from './filters';

const moment = require('moment');


export class DataManager {
    constructor() {
        this.subscribers = [];
        console.log('new DataManager!')
    }

    subscribe(datasource) {
        this.subscribers.push({
            datasource: datasource,
            lastRefresh: 0
        });
    }

    needsUpdate(subscriber) {
        return (new Date() - subscriber.lastRefresh)/1000
            >  (subscriber.datasource.refreshRate);
    }

    async tick() {
        console.log(`TICK TOCK`);
        let subsToRefresh = this.subscribers.filter(this.needsUpdate);
        let datasources =
            subsToRefresh.map((subscriber) => subscriber.datasource);

        // Create list of parameters and datasource information for requests
        // to server
        let parametersList = Object.entries(datasources).map(
            function createParams([id, datasource]) {
                return Object.assign(
                    { frontendSourceName: datasource.name },
                    clone(datasource),
                    getParams(datasource)
                );
            }
        );

        // Load data from server
        try {
            let response = await loadData(parametersList);
            // record updates to subscribers
            for (let sub of subsToRefresh) sub.lastRefresh = new Date();
            // Return data
            return response;
        } catch (err) {
            console.log(`Error while loading data: ${err}`);
        }
    }
}


/**
 * Get data from server.
 * @param  {Array} params list of requests
 * @return {Array} array of data (including metadata about sources)
 */
export async function loadData(params) {
    let res = await api.getStatistics(params);
    // convert date strings to values
    res = res.map((set) => {
        set.data = set.data.map((d) => {
            if (d['dateDay']) d['dateDay'] = moment(d['dateDay']).toDate();
            if (d['date']) d['date'] = moment(d['date']).toDate();
            return d;
        });
        return set;
    });
    return res;
}


function getParams(datasource) {
    const params = {
        filter: filters.clean(datasource.filter, store.state.currentUser),
        fields: datasource.fields,
        groupBy: datasource.groupBy,
        source: datasource.source
    };
    return params;
}
