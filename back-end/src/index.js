/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const express = require('express');
const app = express();
const query = require('./OpenAI/query');
const debounce = require('./debounce');
const web = require('./web');

app.use(express.json());

const requestsPerMinute = 20;
let requests = 0;

function requestReset() {
	requests = 0;
	setTimeout(requestReset, 60000);
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

app.get('/', async (req, res) => {
	res.status(200).end('https://github.com/nekumelon/CodeXR');
});

app.post('/query', async (req, res) => {
	try {
		if (requests >= requestsPerMinute) {
			res.status(500).send('Too many requests');

			return;
		}

		const body = req.body;

		if (
			!body ||
			!body.prompt ||
			!body.user ||
			!body.maxTokens ||
			!body.stop
		) {
			res.status(400).send('Bad request');

			return;
		}

		if (!(await web.isUser(body.user))) {
			await web.beginUser(body.user);
		}

		if (await web.userBlacklisted(body.user)) {
			res.status(403).send('User blacklisted');

			return;
		}

		requests++;

		try {
			const response = await debounce(
				async () => await query(body),
				200
			)();

			res.status(200).json(response.data.choices);
		} catch (err) {
			web.incrementStatusData(getDate());
			res.status(500).send('Internal server error');
		}
	} catch (err) {
		res.status(500).send(`Internal server error`);
	}
});

let port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`Back-end running on port ${port}`);
});
