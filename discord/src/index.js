/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { Client, Intents } = require('discord.js');
const QuickChart = require('quickchart-js');
const web = require('./web');
const axios = require('axios');

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

/**
 * @async
 * @function getStatusChart
 * @summary Gets the status chart
 * @returns {Promise<string>} - Returns the short URL of the chart
 */
async function getStatusChart() {
	const statusChart = new QuickChart();
	const statusData = await web.getStatusData();
	// Get the last 7 days of data
	const dates = Object.keys(statusData).slice(
		statusData.length - 7,
		statusData.length
	);
	const data = Object.values(statusData).slice(
		statusData.length - 7,
		statusData.length
	);

	// Set the background color to transparent
	statusChart.backgroundColor = 'transparent';
	// Set the chart configuration
	statusChart.setConfig({
		type: 'bar',
		data: {
			labels: dates,
			datasets: [
				{
					type: 'line',
					label: 'Reports',
					borderColor: QuickChart.getGradientFillHelper('vertical', [
						'#FF1F40',
						'#428CFF',
						'#4A45FF'
					]),
					borderWidth: 2,
					fill: false,
					data: data
				}
			]
		},
		options: {
			legend: {
				labels: {
					fontColor: '#FFF'
				}
			},
			scales: {
				xAxes: [
					{
						gridLines: {
							display: false
						},
						ticks: {
							fontColor: '#FFF'
						}
					}
				],
				yAxes: [
					{
						gridLines: {
							display: false
						},
						ticks: {
							fontColor: '#FFF'
						}
					}
				]
			}
		}

		// Return the short URL of the chart
	});

	return await statusChart.getShortUrl();
}

/**
 * getStatusChartEmbed()
 * @async
 * @returns {Object.<string, embeds>}
 * @description Returns an object containing an embed with a title, image and color.
 */
async function getStatusChartEmbed() {
	return {
		embeds: [
			{
				title: 'CodeXR Status Chart',
				image: {
					url: await getStatusChart()
				},
				color: '#FD0061'
			}
		]
	};
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
 * @async
 * @function statusLoop
 * @param {number} [retries=0]
 * @returns {Promise<void>}
 */
async function statusLoop(retries = 0) {
	const date = getDate();
	if (!(await web.getStatusData(date))) web.beginStatusData(date);
    
	try {
		// Get the channel to send the chart to
		const statusChannel = client.channels.cache.get('960920342258384976');
		// Send the chart
		statusChannel.send(await getStatusChartEmbed());
	} catch (err) {
		if (retries > 5) {
			console.error(`Failed to update status chart ${err}`);
		} else {
			console.warn(
				`Unable to send the chart. Attempts: ${retries} Retrying...`
			);
			statusLoop(retries + 1);
		}
	}

	setTimeout(statusLoop, 1 * 60 * 60 * 1000);
}

client.once('ready', () => {
	client.user.setPresence({
		activities: [{ name: 'github.com/nekumelon/CodeXR' }],
		status: 'online'
	});

	console.log('CodeXR Discord Bot started.');
	statusLoop();
});

let prefix = '/';

client.on('messageCreate', async message => {
	if (message.author.bot || !message.content.startsWith(prefix)) {
		return;
	}

	message.content = message.content.substring(prefix.length);

	try {
		switch (message.content) {
			case 'statusChart':
				message.reply(await getStatusChartEmbed());

				break;

			case 'status':
				message.reply('Give me a second to fetch the latest data...');

				try {
					await axios({
						url: 'https://codexr.herokuapp.com',
						method: 'get',
						timeout: 8000
					});

					message.reply('CodeXR is up and running!');
				} catch (err) {
					await web.incrementStatusData(getDate());
					message.reply(`CodeXR is down. Status code: ${err}`);
				}

				break;
		}
	} catch (err) {
		console.error(`An error occured in the message handler  ${err}`);
	}
});

client.login(process.env.DISCORD_TOKEN);
