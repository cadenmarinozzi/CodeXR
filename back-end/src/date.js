/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

/**
 * Returns the current date in the format yyyy-mm-dd
 * @return {string} the current date
 */
function getDate() {
	const date = new Date();

	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();

	return `${year}-${day}-${month}`;
}

module.exports = getDate;
