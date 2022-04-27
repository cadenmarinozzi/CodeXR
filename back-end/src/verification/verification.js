/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const web = require('../web');

function verifyUser(user, ip) {
	if (web.userBlacklisted(user) || web.userBlacklisted(ip)) {
		return false;
	}

	if (web.isUserRateLimited(user) || web.isIpRateLimited(ip)) {
		return false;
	}

	return true;
}

module.exports = { verifyUser };
