let express = require("express");
let app  = express();
let fs = require("fs");
let readline = require("readline");
const {google} = require("googleapis");
let bcrypt = require("bcrypt");
let moment = require("moment");
// const {OAuth2Client} = require("google-auth-library");


app.use(express.urlencoded({ extended: true }));
app.use(express.static("client"));

// used only really in testing to find the ID of channels for prefs section in accounts.json and saved in channels.json
// eslint-disable-next-line no-unused-vars
function getChannelID (title) {

	fs.readFile("client_secret.json", function processClientSecrets (err, content) {

		if (err) {

			throw new Error(err);

		}
		// Authorize a client with the loaded credentials, then call the YouTube API.
		// See full code sample for authorize() function code.


		authorize(JSON.parse(content), {"params": {
			"maxResults": "3",
			"part": "snippet",
			"q": title,
			"type": "channel",
			"order": "date"
			// "videoDuration": "short",
			// "relevanceLanguage": "en"
			// "videoLicense": "creativeCommon"
		}}, searchListByKeyword);


		// change max results sizes once ive sorted repeats and reaction videos


	});

}

// gets the icon for the webpage
/**
 * @param  {} req
 * @param  {} res
 */
app.get("/favicon.ico", function (req, res) {

	res.sendFile(__dirname + "/favicon.ico");

});


/** gets the main html page, css, and the js
 * @param  {} req
 * @param  {} resp
 */
app.get("/",function (req,resp) {

	resp.sendFile("client/index.html",{root: __dirname });
	resp.sendFile(__dirname + "/client/style.css");
	resp.sendFile(__dirname + "/client/index.js");

});

// used to get the placeholder image for videos
app.get("/placeholder.png", function (req, res) {

	res.sendFile(__dirname + "/client/placeholder.png");

});

// used to search for specific trailers, the query is provided in the URL
app.get("/search",function (req,res) {

	if (req.query.q != "") {

		res.statusCode = 200;
		callTrailers(res,req.query.q);
		// res.send("got " + req.query.q + " as a response");
		// res.send(fs.readFileSync("search.json"));
		// res.end();

	}
	else{

		res.statusCode = 400;
		res.end();

	}

});

// gets the channel data, ie all trailers from specfic channel
app.get("/channeldata",function (req,res) {

	if (req.query.channel != "") {

		res.statusCode = 200;
		fs.readFile(req.query.channel + ".json",function (err,data) {

			if (err) {

				callChannelData(req.query.channel,res);

			}
			else {

				data = JSON.parse(data);
				res.json(data);
				res.end();

			}

		});

	}
	else{

		res.statusCode = 400;
		res.end();

	}

});

// gets recents - typically newest videos from saved in recents.json
app.get("/recent",function (req,res) {


	res.statusCode = 200;

	fs.readFile(__dirname + "/recents.json",function (err,data) {

		if (err) {

			throw new Error(err);


		}
		data = JSON.parse(data);

		if (req.query.page == 1) {


			data = data.slice(0,20);

			res.json(data);

		}
		else if (req.query.page == 2) {

			res.json(data.slice(20));


		}
		res.end();

	});


});

// gets prerferences for specific user
app.get("/prefs",function (req,res) {

	fs.readFile("accounts.json",function (er,accounts) {

		if (er) {

			throw new Error(er);

		}
		accounts = JSON.parse(accounts);
		for (let i = 0; i < accounts["users"].length; i++) {

			if (accounts["users"][i]["eMail"].toLowerCase() == req.query.email.toLowerCase()) {

				res.json(accounts["users"][i]["prefs"]);
				res.end();
				return;

			}

		}

		res.end();

	});

});

// updates prefs for user if their email and password are correct
app.post ("/prefs", function (req,res) {

	fs.readFile("accounts.json",function (er,accounts) {

		if (er) {

			throw new Error(er);

		}
		accounts = JSON.parse(accounts);
		for (let i = 0; i < accounts["users"].length; i++) {

			if (accounts["users"][i]["eMail"].toLowerCase() == req.body.email.toLowerCase()) {

				bcrypt.compare(req.body.pword,accounts["users"][i]["password"],function (er,equal) {

					if (er) {

						throw new Error(er);

					}
					if (equal) {


						accounts["users"][i]["prefs"] = req.body.prefs;
						fs.writeFile("accounts.json",JSON.stringify(accounts),function (er) {

							if (er) {


								throw new Error(er);

							}
							res.json({"success":true,});
							res.end();

						});

					}
					else{

						res.json({"success":false,"correctPassword":false});

					}


				});

				return;

			}


		}

		res.json({"success":false,"correctPassword":false,"exists":false});


	});

});


// adds the account to accounts.json
app.post("/register",function (req,res) {

	fs.readFile("accounts.json",function (er,accounts) {

		if (er) {

			throw new Error(er);

		}
		let user = {"fName": req.body.fName, "lName": req.body.lName, "eMail": req.body.email,};

		bcrypt.genSalt(11, function (er,salt) {

			if (er) {

				res.end("unsuccessful");
				throw new Error(er);

			}
			// user["salt"] = salt;
			bcrypt.hash(req.body.password, salt, function (er,hash) {

				if (er) {

					res.end("unsuccessful");
					throw new Error(er);

				}
				user["password"] = hash;
				user["prefs"] = req.body.prefs;
				accounts = JSON.parse(accounts);
				accounts["users"].push(user);
				fs.writeFile("accounts.json",JSON.stringify(accounts),function (er) {

					res.end();
					if (er) {

						throw new Error(er);

					}

				});

			});

		});


	});

});

// checks if the account exists
app.get("/checkAccount",function (req,res) {

	checkEmail(req.query.email,res);

});

function checkEmail (input,res) {

	fs.readFile("accounts.json",function (er,accounts) {

		if (er) {

			throw new Error(er);

		}
		accounts = JSON.parse(accounts);
		for (let i = 0; i < accounts["users"].length; i++) {

			if (accounts["users"][i]["eMail"].toLowerCase() == input.toLowerCase()) {

				res.json({"exists":true});
				res.end();
				return;

			}

		}
		res.json({"exists":false});
		res.end();

	});

}

// logs in depending on whether the username and password is correct
app.post("/login", function (req,res) {

	let email = req.body.email;
	let pword = req.body.pword;

	fs.readFile("accounts.json",function (er,accounts) {

		if (er) {

			throw new Error(er);

		}
		accounts = JSON.parse(accounts);
		for (let i = 0; i < accounts["users"].length; i++) {

			if (accounts["users"][i]["eMail"].toLowerCase() == email.toLowerCase()) {

				bcrypt.compare(pword,accounts["users"][i]["password"], function (er, equal) {

					if (er) {

						throw new Error(er);

					}
					if (equal) {

						// sign in
						let response = {"fName":accounts["users"][i]["fName"], "prefs": accounts["users"][i]["prefs"], "exists":true, "correctPassword":true};
						res.json(response);

					}
					else {

						// can't sign in
						res.json({"exists":true,"correctPassword":false});

					}

					res.end();


				});


				return;

			}

		}

		res.json({"exists":false, "correctPassword":false});
		res.end();

	});

});


// ////////////////////////////////////////////////////
// External API Code


setInterval(intervalSavingRecents, 1000 * 60 * 45);
// TEST THE CODE WITH THIS: setInterval(intervalSavingRecents, 1000 * 60);
setInterval(intervalSavingChannels, 1000 * 60 * 60 * 6);


function intervalSavingRecents () {


	fs.readFile("client_secret.json", function processClientSecrets (err, content) {

		if (err) {

			throw new Error(err);

		}
		// Authorize a client with the loaded credentials, then call the YouTube API.
		// See full code sample for authorize() function code.
		let d = moment().subtract(12,"months").format("YYYY-MM-DDTHH:mm:ssZ");
		authorize(JSON.parse(content), {"params": {
			"maxResults": "50",
			"part": "snippet",
			"q": "Trailer",
			"type": "video",
			"publishedAfter":d
			// "videoDuration": "short",
			// "relevanceLanguage": "en"
			// "videoLicense": "creativeCommon"
		}}, searchListByKeyword);


	});

}

function intervalSavingChannels () {

	callChannelData("Disney");
	callChannelData("Marvel");
	callChannelData("DC");
	callChannelData("Netflix");
	callChannelData("FOX");
	callChannelData("WarnerBros");
	callChannelData("Sony");

}

let SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl","https://www.googleapis.com/auth/youtube"];
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + "/.credentials/";
let TOKEN_PATH = TOKEN_DIR + "google-apis-nodejs-quickstart.json";


// https://issuetracker.google.com/128835104 - won't sort output

function callChannelData (channel,res) {

	fs.readFile("client_secret.json", function processClientSecrets (err, content) {

		if (err) {

			throw new Error(err);

		}
		// Authorize a client with the loaded credentials, then call the YouTube API.
		// See full code sample for authorize() function code.

		fs.readFile("channels.json", function processChannelData (err, data) {

			if (err) {

				throw new Error(err);

			}
			data = JSON.parse(data);
			authorize(JSON.parse(content), {"params": {
				"maxResults": "24",
				"part": "snippet",
				"q": "Trailer",
				"type": "video",
				"channelId": data["channels"][channel]["channelID"],
				"order": "date"
				// "videoDuration": "short",
				// "relevanceLanguage": "en"
				// "videoLicense": "creativeCommon"
			}}, searchListByKeyword,res,channel);

		});

		// change max results sizes once ive sorted repeats and reaction videos


	});

}

function callTrailers (res, q) {

	fs.readFile("client_secret.json", function processClientSecrets (err, content) {

		if (err) {

			throw new Error(err);

		}
		// Authorize a client with the loaded credentials, then call the YouTube API.
		// See full code sample for authorize() function code.
		if (q === undefined) {

			let d = moment().subtract(12,"months").format("YYYY-MM-DDTHH:mm:ssZ");
			// change max results sizes once ive sorted repeats and reaction videos
			authorize(JSON.parse(content), {"params": {
				"maxResults": "50",
				"part": "snippet",
				"q": "Trailer",
				"type": "video",
				"publishedAfter":d
				// "videoDuration": "short",
				// "relevanceLanguage": "en"
				// "videoLicense": "creativeCommon"
			}}, searchListByKeyword,res);

		}else {

			authorize(JSON.parse(content), {"params": {
				"maxResults": "4",
				"part": "snippet",
				"q": q + " Trailer",
				"type": "video",
				// "videoDuration": "short",
				// "relevanceLanguage": "en"
				// "videoLicense": "creativeCommon"
			}}, searchListByKeyword, res);

		}

	});

}


function authorize (credentials, requestData, callback, res = undefined ,channel = undefined) {

	let clientSecret = credentials.installed.client_secret;
	let clientId = credentials.installed.client_id;
	let redirectUrl = credentials.installed.redirect_uris[0];

	let oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, function (err, token) {

		if (err) {

			getNewToken(oauth2Client, requestData, callback);

		} else {

			oauth2Client.credentials = JSON.parse(token);
			callback(oauth2Client, requestData, res, channel);

		}

	});

}


function getNewToken (oauth2Client, requestData, callback) {

	let authUrl = oauth2Client.generateAuthUrl({
		access_type: "offline",
		prompt: "consent",
		scope: SCOPES
	});
	console.log("Authorize this app by visiting this url: ", authUrl);
	let rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question("Enter the code from that page here: ", function (code) {

		rl.close();
		oauth2Client.getToken(code, function (err, token) {

			if (err) {

				throw new Error(err);

			}
			oauth2Client.credentials = token;
			storeToken(token);
			callback(oauth2Client, requestData);

		});

	});

}

function storeToken (token) {

	try {

		fs.mkdirSync(TOKEN_DIR);

	} catch (err) {

		if (err.code != "EEXIST") {

			throw err;

		}

	}
	fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
	console.log("Token stored to " + TOKEN_PATH);

}


function removeEmptyParameters (params) {

	for (let p in params) {

		if (!params[p] || params[p] == "undefined") {

			delete params[p];

		}

	}
	return params;

}


function searchListByKeyword (auth, requestData, res, channel) {

	let service = google.youtube("v3");
	// var parameters = requestData["params"];
	let parameters = removeEmptyParameters(requestData["params"]);
	parameters["auth"] = auth;
	service.search.list(parameters, function (err, response) {

		try {

			if (err) {

				throw new Error(err);

			}
			console.log("pinged Youtube");

			for (let i = 0; i < response["data"]["items"].length;i++) {

				// videoData[i - 1]["snippet"]["title"]
				let title = response["data"]["items"][i]["snippet"]["title"].toLowerCase();
				if (title.includes("reaction") || title.includes("movieclips") || title.includes("honest") || title.includes("everything you missed in")) {

					response["data"]["items"].splice(i,1);

				}

			}
			if (res != undefined) {

				res.json(response);
				res.end();

			}

			if (res === undefined && channel === undefined) {

				fs.writeFile("recents.json",JSON.stringify(response["data"]["items"]),function (err) {

					if (err) {

						throw new Error(err);

					}

				});

			} else if (res === undefined && channel != undefined) {

				fs.writeFile(channel + ".json",JSON.stringify(response["data"]["items"]),function (err) {

					if (err) {

						throw new Error(err);

					}

				});

			}


		}
		catch (er) {

			throw new Error(er);

		}


	});

}


app.listen(process.env.PORT || 8080);

