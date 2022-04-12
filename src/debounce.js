/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

let timer;

/**
 * Returns a debounced version of the passed function that will only be called once per `ms` milliseconds.
 * @param {function} inner - The function to debounce.
 * @param {number} ms - The number of milliseconds to debounce for.
 * @returns {function} - The debounced function.
 */
function debounce(inner, ms) {
	let resolves = [];

	return (...args) => {
		clearTimeout(timer);

		timer = setTimeout(() => {
			const result = inner(...args);
			resolves.forEach(resolve => resolve(result));
			resolves = [];
		}, ms);

		return new Promise(resolve => resolves.push(resolve));
	};
}

module.exports = debounce;
