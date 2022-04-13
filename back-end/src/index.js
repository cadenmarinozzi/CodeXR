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

const requestsPerMinute = 30;

let requests = 0;

function requestReset() {
	requests = 0;
	setTimeout(requestReset, 60 * 1000);
}

requestReset();

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

app.get('/', async (req, res) => {
	res.status(200).end('https://github.com/nekumelon/CodeXR');
});

app.post('/query', async (req, res) => {
	try {
		if (requests >= requestsPerMinute) {
			res.status(429).end('Too many requests');

			return;
		}

		requests++;

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
			!body.stop ||
			body.comment === undefined ||
			body.comment === null
		) {
			res.status(400).end('Bad request');

			return;
		}

		if (!(await web.isUser(body.user))) {
			await web.beginUser(body.user);
		}

		if (await web.userBlacklisted(body.user)) {
			res.status(403).end('User blacklisted');

			return;
		}

		try {
			let response = await debounce(async () => await query(body), 500)();

			if (!response.data) {
				// Didn't pass the filter
				console.log('No response data!');
				res.status(500).end('Internal server error. No response data!');

				return;
			}

			res.status(200).json(response.data.choices);
		} catch (err) {
			console.error(err);
			const date = getDate();

			if (!(await web.getStatusData(date)))
				await web.beginStatusData(date);

			web.incrementStatusData(date);
			res.status(500).end(`Internal server error`);
		}
	} catch (err) {
		console.error(err);
		const date = getDate();

		if (!(await web.getStatusData(date))) await web.beginStatusData(date);

		web.incrementStatusData(date);
		res.status(500).end(`Internal server error`);
	}
});

let port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`Back-end running on port ${port}`);
});
