/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const express = require('express');
const app = express();
const query = require('./OpenAI/query');
const web = require('./web');
const { validate: uuidIsValid, version: uuidVersion } = require('uuid');
const debounce = require('./debounce');

app.use(express.json());

/**
 * Gets the IP address of the request
 * @param {object} req - the request object
 * @returns {string} the IP address of the request
 */
function getRequestIP(req) {
	return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

/**
 * Checks whether the device is blacklisted
 *
 * @param {string} ip - IP address of device
 * @param {string} user - User of device
 * @returns {boolean} - Whether the device is blacklisted
 */
async function deviceBlacklisted(ip, user) {
	return await web.userBlacklisted(user);
}

/**
 * Get the current date
 * @returns {string} - The current date in the format of yyyy-dd-mm
 */
function getDate() {
	// Get the current date
	const date = new Date();

	// Get the day, month and year
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');

	// Return the date in the format YYYY-DD-MM
	const year = date.getFullYear();

	return `${year}-${day}-${month}`;
}

/**
 * Checks if the user is valid.
 * @param {string} user The user to check.
 * @returns {boolean} Whether the user is valid.
 */
function isValidUser(user) {
	return uuidIsValid(user) && uuidVersion(user) === 4;
}

const requestsPerMinute = 30;

/**
 * @async
 * @function requestReset
 * Resets the number of requests for all users to 0.
 */
async function requestReset() {
	// This obviously does not scale but it's fine for now
	for (const user of Object.keys(await web.getUsers())) {
		web.updateUserData(user, { requests: 0 });
	}

	setTimeout(requestReset, 60 * 1000);
}

requestReset();

app.get('/', async (req, res) => {
	res.status(200).end('https://github.com/nekumelon/CodeXR');
});

const acceptedEngines = ['code-cushman-001', 'code-davinci-002'];

app.post('/query', async (req, res) => {
	try {
		const body = req.body;

		if (
			!body ||
			body.prompt === undefined ||
			body.prompt === null ||
			body.context === undefined ||
			body.context === null ||
			body.language === undefined ||
			body.language === null ||
			body.user === undefined ||
			body.user === null ||
			!isValidUser(body.user) ||
			!body.maxTokens ||
			body.comment === undefined ||
			body.comment === null ||
			body.stop === [] ||
			!acceptedEngines.includes(body.engineId)
		) {
			res.status(400).end('Bad request');

			return;
		}

		const ip = getRequestIP(req);

		if (
			(await web.readUserData(body.user, 'requests')) >= requestsPerMinute
		) {
			res.status(429).end('Too many requests');

			return;
		}

		web.incrementUserData(body.user, { requests: 1 });

		if (!(await web.isUser(body.user))) {
			await web.beginUser(body.user, ip);
		}

		if (await deviceBlacklisted(ip, body.user)) {
			res.status(403).end('User blacklisted');

			return;
		}

		try {
			let [response, prompt] = await debounce(
				async () => await query(body),
				500
			)();

			if (!response.data) {
				// Didn't pass the filter
				console.log('No response data!');
				res.status(500).end('Internal server error. No response data!');

				return;
			}

			res.status(200).json({
				choices: response.data.choices,
				prompt: prompt
			});
		} catch (err) {
			console.error(err);
			const date = getDate();

			web.incrementStatusData(date);
			res.status(500).end(`Internal server error`);
		}
	} catch (err) {
		const date = getDate();

		web.incrementStatusData(date);
		console.error(err);
		res.status(500).end(`Internal server error`);
	}
});

let port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`Back-end running on port ${port}`);
});
