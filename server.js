const server = require("./app.js");

setInterval(server.intervalSavingRecents, 1000 * 60 * 45);

// setInterval(server.intervalSavingRecents, 1000 * 4);

// TEST THE CODE WITH THIS: setInterval(intervalSavingRecents, 1000 * 60);
// delete line after 60 seconds if testing as the daily quota will be used up quickly
setInterval(server.intervalSavingChannels, 1000 * 60 * 60 * 6);

server.app.listen(process.env.PORT || 8080);