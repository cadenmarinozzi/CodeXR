const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, update } = require('firebase/database');
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

async function getUserData(user) {
	const userRef = ref(usersRef, user);
	const userData = await get(userRef);

	return userData.exists() && userData.val();
}

async function updateLastRequestTime(user) {
	const userRef = ref(usersRef, user);
	const currTime = new Date();

	await update(userRef, { lastRequestTime: currTime });
}

async function getIpData(ip) {
	const ipRef = ref(ipsRef, ip);
	const ipData = await get(ipRef);

	return ipData.exists() && ipData.val();
}

async function userBlacklisted(user) {
	const blacklisted = await get(blacklistedRef, user);
	const userData = await getUserData(user);

	return (blacklisted.exists() && blacklisted.val()) || userData.blacklisted;
}

async function ipBlacklisted(user) {
	const blacklisted = await get(blacklistedRef, user);
	const ipData = await getIpData(user);

	return (blacklisted.exists() && blacklisted.val()) || ipData.blacklisted;
}

async function isUserRateLimited(user) {
	const userData = await getUserData(user);
	const currTime = new Date();

	return currTime - userData.lastRequestTime < REQUEST_TIME * 1000;
}

async function isIpRateLimited(ip) {
	const ipData = await getIpData(ip);
	const currTime = new Date();

	return currTime - ipData.lastRequestTime < REQUEST_TIME * 1000;
}

async function incrementUserRequests(user) {
	const userRef = ref(usersRef, user);
	const userData = await getUserData(user);

	await update(userRef, {
		requests: userData.requests + 1
	});
}

async function incrementUserTokens(user, tokens) {
	const userRef = ref(usersRef, user);
	const userData = await getUserData(user);

	await update(userRef, {
		tokens: userData.tokens + tokens
	});
}

async function beginUser(user, ip) {
	update(usersRef, {
		[user]: {
			ip: ip,
			requests: 0,
			tokens: 0,
			lastRequestTime: new Date(),
			blacklisted: false,
			flaggedCompletions: 0
		}
	});
}

async function getStatusData(date) {
	const dateRef = ref(statusDataRef, date);
	const dateData = await get(dateRef);

	return dateData.val();
}

async function beginStatusData(date) {
	update(statusDataRef, {
		[date]: 0
	});
}

async function incrementStatusData() {
	const date = getDate();
	let currentData = await getStatusData(date);

	if (!currentData) {
		await beginStatusData(date);
		currentData = await getStatusData(date);
	}

	update(statusDataRef, {
		[date]: currentData + 1
	});
}

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
	isUser
};
