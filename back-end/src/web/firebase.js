/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, update, child } = require('firebase/database');
const getDate = require('../date');

const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: 'codexr-app.firebaseapp.com',
	databaseURL: 'https://codexr-app-default-rtdb.firebaseio.com',
	projectId: 'codexr-app',
	storageBucket: 'codexr-app.appspot.com',
	messagingSenderId: '479853425309',
	appId: '1:479853425309:web:9162c4c48c669477631a74',
	measurementId: 'G-PFK9BB8CSY'
};

const REQUEST_TIME = 0.2;

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const blacklistedRef = ref(database, 'blacklisted');
const usersRef = ref(database, 'users');
const ipsRef = ref(database, 'ips');
const statusDataRef = ref(database, 'statusData');

/**
 * Get a user's data from the database
 * @param {string} user - The user's unique ID
 */
async function getUserData(user) {
	const userRef = child(usersRef, user);
	// Get the user data from the database
	const userData = await get(userRef);

	// If the user exists, return the user data

	return userData.exists() && userData.val();
}

/**
 * @function updateLastRequestTime
 * @param {object} user - The user object to update
 * @return {Promise}
 * @description Updates the lastRequestTime property of the specified user object
 */
async function updateLastRequestTime(user) {
	// Get a reference to the user's document
	const userRef = child(usersRef, user);

	// Get the current time in milliseconds
	const currTime = new Date()[Symbol.toPrimitive]('number');

	await update(userRef, { lastRequestTime: currTime });
}

/**
 * Get the data for an IP address from the database
 *
 * @param {string} ip - The IP address to get data for
 *
 * @returns {object} - The data for the IP address from the database, or null if it doesn't exist
 */
async function getIpData(ip) {
	const ipRef = child(ipsRef, ip);
	// Get the reference to the IP
	const ipData = await get(ipRef);
	// Get the data from the reference

	// Return the data if it exists
	return ipData.exists() && ipData.val();
}

/**
 * Checks if a user is blacklisted.
 * @param {int} user The id of the user to check.
 * @returns {boolean} True if the user is blacklisted, false otherwise.
 */
async function userBlacklisted(user) {
	const blacklisted = await get(child(blacklistedRef, user));
	// Get the user's data from the database
	const userData = await getUserData(user);

	return (blacklisted.exists() && blacklisted.val()) || userData?.blacklisted;
}

/**
 * @async
 * @function ipBlacklisted
 * @param {Object} user - The user object
 * @returns {boolean} True if the user is blacklisted, false otherwise
 */
async function ipBlacklisted(user) {
	const blacklisted = await get(blacklistedRef, user);
	// Get the blacklisted status of the user
	const ipData = await getIpData(user);
	// Get the IP data of the user

	// Return true if the user is blacklisted or their IP is blacklisted
	return (blacklisted.exists() && blacklisted.val()) || ipData.blacklisted;
}

/**
 * Determine if a user is currently rate limited
 * @param user {string} - The user to check
 * @returns {boolean} - True if they are rate limited
 */
async function isUserRateLimited(user) {
	const userData = await getUserData(user);
	// Get the current time in milliseconds
	const currTime = new Date()[Symbol.toPrimitive]('number');

	// Return whether the user has made a request in the last REQUEST_TIME seconds
	return currTime - userData.lastRequestTime < REQUEST_TIME * 1000;
}

/**
 * @async
 * @function isIpRateLimited
 * @param {string} ip
 * @return {boolean}
 */
async function isIpRateLimited(ip) {
	const ipData = await getIpData(ip);
	// Get the current time in milliseconds
	const currTime = new Date()[Symbol.toPrimitive]('number');

	// Return whether the time since the last request is less than the request time
	return currTime - ipData.lastRequestTime < REQUEST_TIME * 1000;
}

/**
 * Increment the number of requests for a user
 * @param {string} user - The user to increment requests for
 */
async function incrementUserRequests(user) {
	// Get a reference to the user's document
	const userRef = child(usersRef, user);

	// Get the user's data
	const userData = await getUserData(user);

	// Increment the user's requests

	await update(userRef, {
		requests: userData.requests + 1
	});
}

/**
 * Increments a user's token count.
 *
 * @param {string} user The user ID.
 * @param {number} tokens The number of tokens to add.
 */
async function incrementUserTokens(user, tokens) {
	// Get a reference to the user's document
	const userRef = child(usersRef, user);

	// Get the user's data
	const userData = await getUserData(user);

	await update(userRef, {
		tokens: userData.tokens + tokens
	});
}

/**
 * @async
 * @function beginUser
 * @param {string} user - The name of the user.
 * @param {string} ip - The user's IP address.
 * @description Creates a new user object with the specified name and IP address.
 */
async function beginUser(user, ip) {
	// Update the user's data in the database
	update(usersRef, {
		[user]: {
			ip: ip,
			requests: 0,
			tokens: 0,
			lastRequestTime: new Date()[Symbol.toPrimitive]('number'),
			blacklisted: false,
			flaggedCompletions: 0
		}
	});
}

/**
 * Creates a new object of values for a user based on an existing object
 * @async
 * @param {string} user - the user ID
 * @returns {Promise} - a promise representing the completion of the operation
 */
async function createNewUserValues(user) {
	const keyUserData = await getUserData('keyUser');
	const userData = await getUserData(user);

	let newData = {};

	for (const [key, value] of Object.entries(keyUserData)) {
		if (!userData[key]) {
			newData[key] = value;
		}
	}

	const userRef = child(usersRef, user);
	update(userRef, newData);
}

/**
 * Updates the statusData object for a given date with a value of 0.
 * @param {Date} date - The date to update.
 */
async function beginStatusData(date) {
	update(statusDataRef, {
		[date]: 0
	});
}

/**
 * @async
 * @function getStatusData
 * @param {string} date - A date in 'YYYY-MM-DD' format.
 * @returns {object} - The data for the specified date.
 */
async function getStatusData(date) {
	try {
		// Get a reference to the date
		const dateRef = child(statusDataRef, date);

		// Get the data for the date
		const dateData = await get(dateRef);

		// Return the data

		return dateData.val();
	} catch (err) {
		await beginStatusData(date);
		await getStatusData(date);
	}
}

/**
 * Increments the status data for the current day by 1.
 * If there is no data for the current day, initializes the data to 1.
 */
async function incrementStatusData() {
	const date = getDate();
	// Get the current date
	let currentData = await getStatusData(date);

	// Get the current status data for the date

	if (!currentData) {
		// If there is no status data for the date, create it
		await beginStatusData(date);
		currentData = await getStatusData(date);
	}
	// Increment the status data

	update(statusDataRef, {
		[date]: currentData + 1
	});
}

/**
 * Checks if a user exists
 * @async
 * @param {string} user - The user to check
 * @returns {boolean} Whether the user exists
 */
async function isUser(user) {
	const userData = await getUserData(user);

	return userData ? true : false;
}

module.exports = {
	userBlacklisted,
	ipBlacklisted,
	isUserRateLimited,
	isIpRateLimited,
	updateLastRequestTime,
	incrementUserRequests,
	incrementUserTokens,
	beginUser,
	incrementStatusData,
	isUser,
	createNewUserValues
};
