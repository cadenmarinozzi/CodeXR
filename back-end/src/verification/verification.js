/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const web = require('../web');

/**
 * @param {Object} user - the user to verify
 * @param {string} ip - the ip address to verify
 * @returns {boolean} - whether the user and ip are verified
 */
function verifyUser(user, ip) {
	return web.userBlacklisted(user) || web.isUserRateLimited(user);
}

module.exports = { verifyUser };
