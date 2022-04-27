/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const statusCodes = {
	BAD_REQUEST: 400,
	TIMEOUT: 408,
	INTERNAL_SERVER_ERROR: 500,
	NOT_FOUND: 404,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	OK: 200
};

const statusMessages = {
	400: 'Bad request',
	408: 'Request timeout',
	500: 'Internal server error',
	404: 'Not found',
	401: 'Unauthorized',
	403: 'Forbidden',
	200: 'OK'
};

module.exports = { statusCodes, statusMessages };
