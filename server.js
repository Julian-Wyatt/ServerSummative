const server = require("./app.js");

/**
 * Calls the intervalSavingRecentsFunction every 45 mins<br>
 * This calls the Youtube API and stores the result JSON in recents.json<br>
 * @returns {undefined} No return value as function repeats -> however requested data is saved in recent.json
 */
function intervalRecents () {

	setInterval(server.intervalSavingRecents, 1000 * 60 * 45);
	// setInterval(intervalSavingRecents, 1000 * 3);

}
/**
 * Interval Channels function<br>
 * Saves new channels every 6 hrs<br>
 * @returns {undefined} No return value as function repeats -> however the requested data is saved in JSONs
 */
function intervalChannels () {

	setInterval(server.intervalSavingChannels, 1000 * 60 * 60 * 8);

	// setInterval(intervalSavingChannels, 1000 * 4);

}

intervalChannels();
intervalRecents();

server.app.listen(process.env.PORT || 8080);
