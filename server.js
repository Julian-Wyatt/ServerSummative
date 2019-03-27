let express = require("express");
let app  = express();
let fs = require("fs");
let readline = require("readline");
const {google} = require("googleapis");
let bcrypt = require("bcrypt");
// const {OAuth2Client} = require("google-auth-library");
let testing = true;

app.use(express.urlencoded({ extended: true }));

// eslint-disable-next-line no-unused-vars
function getChannelID (title) {

	fs.readFile("client_secret.json", function processClientSecrets (err, content) {

		if (err) {

			console.log("Error loading client secret file: " + err);
			return;

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

app.use(express.static("client"));

app.get("/favicon.ico", function (req, res) {

	res.sendFile(__dirname + "/favicon.ico");
	console.log("icon");

});

app.get("/",function (req,resp) {

	resp.sendFile("client/index.html",{root: __dirname });

});

app.get("/style.css", function (req, res) {

	res.sendFile(__dirname + "/client/style.css");

});

app.get("/index.js", function (req, res) {

	res.sendFile(__dirname + "/client/index.js");

});

app.get("/placeholder.png", function (req, res) {

	res.sendFile(__dirname + "/client/placeholder.png");

});

app.get("/search",function (req,res) {

	if (req.query.q != "") {

		res.statusCode = 200;
		console.log("here",req.query.q);
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

app.get("/channeldata",function (req,res) {

	if (req.query.channel != "") {

		res.statusCode = 200;
		console.log("here",req.query.channel);
		callChannelData(req.query.channel,res);
		// res.send("got " + req.query.q + " as a response");
		// res.end();

	}
	else{

		res.statusCode = 400;
		res.end();

	}

});


app.get("/recent",function (req,res) {


	if (testing) {

		res.statusCode = 200;

		fs.readFile(__dirname + "/recents.json",function (err,data) {

			if (err) {

				console.log(err);
				return;

			}

			res.json(JSON.parse(data));
			res.end();

		});


	} else{

		res.statusCode = 200;

		callTrailers(res);
		console.log("once");


	}


});

app.post("/register",function (req,res) {

	fs.readFile("accounts.json",function (er,accounts) {

		if (er) {

			console.log("Error loading accounts.json: " + er);
			return;

		}
		let user = {"fName": req.body.fName, "lName": req.body.lName, "eMail": req.body.email,};

		bcrypt.genSalt(11, function (er,salt) {

			if (er) {

				console.log("Error generating salt: " + er);
				res.end("unsuccessful");
				return;

			}
			// user["salt"] = salt;
			bcrypt.hash(req.body.password, salt, function (er,hash) {

				if (er) {

					console.log("Error hashing password: " + er);
					res.end("unsuccessful");
					return;

				}
				user["password"] = hash;
				user["prefs"] = req.body.prefs;
				accounts = JSON.parse(accounts);
				accounts["users"].push(user);
				fs.writeFile("accounts.json",JSON.stringify(accounts),function (er) {

					if (er) {

						console.log("error writing to accounts: " + er);

					}

					res.end();

				});

			});

		});


	});

});

app.get("/checkAccount",function (req,res) {

	console.log(req.query.email);
	checkEmail(req.query.email,res);

});

function checkEmail (input,res) {

	fs.readFile("accounts.json",function (er,accounts) {

		if (er) {

			console.log("error loading accounts.json: " + er);
			return;

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

app.post("/login", function (req,res) {

	let email = req.body.email;
	let pword = req.body.pword;

	fs.readFile("accounts.json",function (er,accounts) {

		if (er) {

			console.log("error loading accounts.json: " + er);
			return;

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
						console.log("sign in");
						let response = {"fName":accounts["users"][i]["fName"], "prefs": accounts["users"][i]["prefs"], "exists":true, "correctPassword":true};
						res.json(response);

					}
					else {

						// can't sign in
						console.log("password wrong");
						res.json({"exists":true,"correctPassword":false});

					}

					res.end();


				});


				return;

			}

		}
		console.log("account doesn't exist");
		res.json({"exists":false, "correctPassword":false});
		res.end();

	});

});

setInterval(intervalSavingRecents, 1000 * 60 * 60 * 6);
// TEST THE CODE WITH THIS: setInterval(intervalSavingRecents, 1000 * 60);
setInterval(internalSavingChannels, 1000 * 60 * 60 * 24);

function intervalSavingRecents () {

	console.log("min passed so save recents");
	fs.readFile("client_secret.json", function processClientSecrets (err, content) {

		if (err) {

			console.log("Error loading client secret file: " + err);
			return;

		}
		// Authorize a client with the loaded credentials, then call the YouTube API.
		// See full code sample for authorize() function code.

		authorize(JSON.parse(content), {"params": {
			"maxResults": "4",
			"part": "snippet",
			"q": "Trailer",
			"type": "video",
			// "videoDuration": "short",
			// "relevanceLanguage": "en"
			// "videoLicense": "creativeCommon"
		}}, searchListByKeyword);


	});

}

function internalSavingChannels () {

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

			console.log("Error loading client secret file: " + err);
			return;

		}
		// Authorize a client with the loaded credentials, then call the YouTube API.
		// See full code sample for authorize() function code.

		fs.readFile("channels.json", function processChannelData (err, data) {

			if (err) {

				console.log("Error loading channels.json: " + err);
				return;

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

			console.log("Error loading client secret file: " + err);
			return;

		}
		// Authorize a client with the loaded credentials, then call the YouTube API.
		// See full code sample for authorize() function code.
		if (q === undefined) {

			// change max results sizes once ive sorted repeats and reaction videos
			authorize(JSON.parse(content), {"params": {
				"maxResults": "24",
				"part": "snippet",
				"q": "Trailer",
				"type": "video",
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

				console.log("Error while trying to retrieve access token", err);
				return;

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

/*
function createResource(properties) {
	var resource = {};
	var normalizedProps = properties;
	for (var p in properties) {
		var value = properties[p];
		if (p && p.substr(-2, 2) == "[]") {
			var adjustedName = p.replace("[]", "");
			if (value) {
				normalizedProps[adjustedName] = value.split(",");
			}
			delete normalizedProps[p];
		}
	}
	for (var p in normalizedProps) {
	// Leave properties that don't have values out of inserted resource.
		if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
			var propArray = p.split(".");
			var ref = resource;
			for (var pa = 0; pa < propArray.length; pa++) {
				var key = propArray[pa];
				if (pa == propArray.length - 1) {
					ref[key] = normalizedProps[p];
				}
				else {
					ref = ref[key] = ref[key] || {};
				}
			}
		}
	}
	return resource;
}
*/

function searchListByKeyword (auth, requestData, res, channel) {

	let service = google.youtube("v3");
	// var parameters = requestData["params"];
	let parameters = removeEmptyParameters(requestData["params"]);
	parameters["auth"] = auth;
	service.search.list(parameters, function (err, response) {

		try {

			if (err) {

				console.log("The API returned an error: " + err);

				return;

			}
			console.log("pinged Youtube");


			if (testing) {

				if (res === undefined && channel === undefined) {

					fs.writeFile("recents.json",JSON.stringify(response["data"]["items"]),function (err) {

						if (err) {

							console.log("error occured when writing");

						}

					});

				} else if (res === undefined && channel != undefined) {

					fs.writeFile(channel + ".json",JSON.stringify(response["data"]["items"]),function (err) {

						if (err) {

							console.log("error occured when writing");

						}

					});

				}

			}
			else{

				res.json(response["data"]["items"]);
				res.end();

			}

		}
		catch (er) {

			console.log(er);

		}


	});

}


app.listen(process.env.PORT || 8080);

