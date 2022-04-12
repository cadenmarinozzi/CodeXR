/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, update, child, get } = require('firebase/database');

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
const usersRef = ref(database, 'users');

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
	statusUpdates[date] = currentData[date] + 1;

	update(statusDataRef, statusUpdates);
}

/**
 * @async
 * @function beginStatusData
 * @param {string} date - a string in the format "yyyy-mm-dd"
 * @description Updates the statusUpdates object with the given date and a value of 0.
 */
async function beginStatusData(date) {
	let statusUpdates = {};

	statusUpdates[date] = 0;
	await update(statusDataRef, statusUpdates);
}

/**
 * Reads the data of a user with the given key
 *
 * @param {string} user The user's id
 * @param {string} key The key to look for in the user's data
 * @returns {any} The data of the user with the given key
 */
async function readUserData(user, key) {
	const userData = await get(child(usersRef, user + '/' + key));

	return userData.val();
}

/**
 * Update the data for a specific user
 * @param {string} user - The id of the user to update
 * @param {object} data - The data to update for the user
 */
function updateUserData(user, data) {
	let updates = {};
	// Loop through the data object and create a new object with the keys
	// formatted as `users/${user}/${key}`

	for (const key of Object.keys(data)) {
		updates[user + '/' + key] = data[key];
	}

	update(usersRef, updates);
}

/**
 * Increments the user data by the given data
 * @param {Object} user - The user to increment the data for
 * @param {Object} data - The data to increment the user data by
 */
async function incrementUserData(user, data) {
	// Decrement is just negative usage
	for (const key of Object.keys(data)) {
		const currentValue = await readUserData(user, key);
		data[key] = currentValue + data[key];
	}

	updateUserData(user, data);
}

/**
 * @async
 * @function userBlacklisted
 * @param {Object} user - the user object to check
 * @returns {boolean} - true if the user is blacklisted
 */
async function userBlacklisted(user) {
	const isBlacklisted = await get(child(usersRef, `${user}/blacklisted`));

	return isBlacklisted.exists() && isBlacklisted.val();
}

/**
 * Check if a user exists in the database
 * @param {string} user - The user to check for
 * @returns {Promise<boolean>} Whether or not the user exists
 */
async function isUser(user) {
	const userData = await get(child(usersRef, user));

	return userData.exists() && userData.val();
}

async function beginUser(user) {
	let updates = {};
	updates[user] = {
		blacklisted: false,
		tokens: 0,
		usage: 0
	};

	update(usersRef, updates);
}

module.exports = {
	incrementUserData,
	updateUserData,
	isUser,
	userBlacklisted,
	getStatusData,
	incrementStatusData,
	beginUser,
	beginStatusData
};
