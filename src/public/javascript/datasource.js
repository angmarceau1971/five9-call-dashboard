/**
 *  - DataManager Class -
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

    // `joinSources` is optional. If included, data from the "joined" datasources
    // will be tied in to the base data.
    "joinSources": [
        {
            // All of the fields above will be defined here, except `refreshRate`
            // which will be inherited from the top level datasource
            ...datasourceObject,
            "joinOn": [
                {
                    "parentField": "dateDay",
                    "thisField": "dateDayEtc"
                },
                ...
            ],
            "joinFields": [
                { "originalName": "name1", "newName": "name2" },
                ...
            ]
        }
    ]

}
 */
'use strict';

import * as api from './api';
import * as filters from './filters';

const clone = require('ramda/src/clone');
const moment = require('moment');


export class DataManager {
    constructor() {
        this.subscribers = [];
    }

    // Subscribe a datasource object to begin being refreshed periodically.
    subscribe(datasource) {
        this.subscribers.push({
            datasource: datasource,
            lastRefresh: 0
        });
    }

    // Clear all subscribed datasources.
    clearSubscribers() {
        this.subscribers = [];
    }

    getDatasource(datasourceName) {
        let matches = this.subscribers
            .filter((sub) => {
                return sub.datasource.name == datasourceName;
            });
        if (matches.length == 0)
            throw new Error (`No datasource matching ${datasourceName}`);
        return matches[0].datasource;
    }

    // Returns true if the subscribed datasource needs an update.
    needsUpdate(subscriber) {
        return (new Date() - subscriber.lastRefresh)/1000
            >  (subscriber.datasource.refreshRate - 5);
    }

    // Each time this is called, it will update any datasources that are ready
    // to be refreshed and return the updated datasets.
    async tick() {
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

        if (parametersList.length == 0) return [];

        // Load data from server
        try {
            let response = await loadData(parametersList);
            // record updates to subscribers
            for (let sub of subsToRefresh) sub.lastRefresh = new Date();
            // Return data
            return response;
        } catch (err) {
            console.log(`Error while loading data: ${err}`);
            return [];
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

/**
 * For a given datasource object, returns the parameters that can be sent to the
 * server in the request for actual data.
 * @param  {Object} datasource
 * @return {Object}
 */
function getParams(datasource) {
    const params = {
        filter: filters.clean(datasource.filter),
        fields: datasource.fields,
        groupBy: datasource.groupBy,
        source: datasource.source
    };
    if (datasource.joinSources) {
        params.joinSources = datasource.joinSources.map(getParams);
    }
    if (datasource.joinOn) {
        params.joinOn = datasource.joinOn;
    }
    if (datasource.joinFields) {
        params.joinFields = datasource.joinFields;
    }
    return params;
}
