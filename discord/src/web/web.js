/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, update, get } = require('firebase/database');

const firebaseConfig = {
    apiKey: 'AIzaSyB2njt8fOxzBi1COEBH4ahVnUb_rd9_dU8',
    authDomain: 'codexr-app.firebaseapp.com',
    databaseURL: 'https://codexr-app-default-rtdb.firebaseio.com',
    projectId: 'codexr-app',
    storageBucket: 'codexr-app.appspot.com',
    messagingSenderId: '479853425309',
    appId: '1:479853425309:web:9162c4c48c669477631a74',
    measurementId: 'G-PFK9BB8CSY'
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const statusDataRef = ref(database, 'statusData');

/**
 * Get data from the statusDataRef and return it.
 * @async
 * @returns {Promise<any>}
 */
async function getStatusData() {
    const statusData = await get(statusDataRef);

    return statusData.val();
}

/**
 * @async
 * @function beginStatusData
 * @param {string} date - a string in the format "yyyy-mm-dd"
 * @description Updates the statusUpdates object with the given date and a value of 0.
 */
async function beginStatusData(date) {
    statusUpdates[date] = 0;
    update(statusDataRef, statusUpdates);
}

/**
 * incrementStatusData increments the status data for a date.
 * @param {string} date - A date in the format of "MMDDYYYY".
 * @return {Promise} A promise that resolves when the data has been updated.
 */
async function incrementStatusData(date) { 
    let statusUpdates = {};
    // Get the current data
    // Increment the value for the given date
    const currentData = await getStatusData();
    // Update the data
    statusUpdates[date] = (currentData[date] ?? 0) + 1;
    update(statusDataRef, statusUpdates);
}

module.exports = { getStatusData, incrementStatusData, beginStatusData };