- [Five9 Call Dashboard](#five9-call-dashboard)
    + [Install](#install)
    + [Testing](#testing)
    + [Credentials required](#credentials-required)
    + [Code structure](#code-structure)

# Five9 Call Dashboard
Real-time dashboards using Five9 APIs.

##### Queues
* Shows current max wait times, service levels, number of calls waiting, and agents staffed for __groups of skills__.

##### Maps
* Displays calls received by ZIP3 code. Option to show calls as percentage of customer base from Looker.
:earth_americas:

##### Scorecard
* Dashboard displaying agent and team metrics. Allows custom data to be uploaded from flat files (CSV) or Looker.

This uses Express as an intermediate server to get Five9 data and store it in MongoDB, then pass it along to the client. Vue, jQuery and a tasteful amount VanillaJS are used on the client side for updating the view.


### Install
Clone the project, go to the new directory and install dependencies:

```
npm install
```

Create a file `src/public/javascript/local_settings.js` defining our API URL:

```
// Express API URL - development setting
export const API_URL = 'http://localhost:3000/api/';
```

For data retrieval from Five9, create a file `src/secure_settings.js`:

```
// Admin- and supervisor-level credentials to retrieve report and queue data
module.exports.FIVE9_USERNAME = 'admin_username';
module.exports.FIVE9_PASSWORD = 'admin_password';
// MongoDB URI here, including credentials if needed
module.exports.MONGODB_URI = 'mongodb://localhost/five9-report-data-collection';
// Secret key for Passport sessions
module.exports.SESSION_SECRET = 'astringastringmykingdomforastring';

// Only include the following if using Looker for customer base information
// Looker API constants
module.exports.LOOKER_API_PATH = '/api/3.0/';
module.exports.LOOKER_API_HOSTNAME = 'yourdomain.looker.com';
module.exports.LOOKER_CLIENT_ID = 'zzzz';
module.exports.LOOKER_CLIENT_SECRET = 'zzzz';
module.exports.LOOKER_LOOK_ID = '1234';
// Looker Look fields
module.exports.LOOKER_FIELD_ZIP_CODE = 'zip.field.name';
module.exports.LOOKER_FIELD_CUSTOMER_COUNT = 'customer.count.field.name';
```

Use webpack to transpile the ES6 and Vue components:

```
webpack --watch
```

And fire up the server:

```
npm start
```

Travel to `localhost:3000` in your browser. Polyfills haven't been implemented yet, so you'll need a modern browser.

To access some administrative pages and endpoints, you will need to update the `users` collection to set the isAdmin attribute for your user to `true`. You can do this in the command line with this helper script:

```
node src/setup/add-admin-user.script.js your_five9_username
```


### Testing
Mocha and Chai are used for testing. Start the server and run `mocha`.


### Credentials required
As mentioned above, administrator-level Five9 credentials are required to pull reports. Supervisor-level credentials are needed to retrieve real-time queue information. This will effectively "lock up" one instance of each credentials type.


### Code structure
All client-side files (HTML, JS, and CSS) are in the `src/public` directory.

The Express server is defined in `src/app.js`, including routes and spinning up the repeating calls to Five9's API. The data from Five9 is stored in the local MongoDB database.

Client requests to the API hit the Express server, which pulls the appropriate data from MongoDB and passes it on to the client.
