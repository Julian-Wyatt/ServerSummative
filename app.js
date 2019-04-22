let express = require("express");
let app  = express();
let fs = require("fs");
// let readline = require("readline");
const {google} = require("googleapis");
let bcrypt = require("bcrypt");
// let moment = require("moment");
// const {OAuth2Client} = require("google-auth-library");
let jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// --------------------------------IMPORTANT------------------------------------------------------------------------------------------------
// used to force https connection when accessing my server ->
// needs to be annotated out when mocking or running locally!!!!!
// const enforce = require("express-sslify");
// app.use(enforce.HTTPS({ trustProtoHeader: true }));


dotenv.config();
// When looking for googlef50573ce84d3ee44.html returns the html file for it
// used for google search validation
app.use(express.urlencoded({ extended: true }));
app.use(express.static("client"));

/**
 * makes request to youtube in order to look up channel IDs when creating the channels.JSON file -> <br>
 * therefore used in development and testing so eslint is disabled
 * @param  {String} title the title for the channel to look up
 * @returns {Array} Request should return 3 channels based on the title provided -> this is used to add to channels.json to provide future channel based look-ups
 */
function getChannelID (title) { // eslint-disable-line no-unused-vars


	searchListByKeyword({"params": {
		"maxResults": "3",
		"part": "snippet",
		"q": title,
		"type": "channel",
		"order": "date"
		// "videoDuration": "short",
		// "relevanceLanguage": "en"
		// "videoLicense": "creativeCommon"
	}});

}

app.get("/search",getSearch);
app.get("/channeldata",getChannelData);
app.get("/recent", getRecent);
app.get("/prefs", getPrefs);
app.post ("/prefs", postPrefs);
app.post("/register",postRegister);
app.get("/checkAccount",getCheckAccount);
app.post("/login", postLogin);
app.post("/delete", postDeleteAccount);


/**
 * Gets the trailers for the given search query (req.query.q) <br>
 * if no query provided then the response is ended with a 422 error code -> Unprocessable Entity <br>
 * if a query is provided it runs the callTrailers function
 * @param  {Object} req request JSON
 * @param {String} req.query.q The search query
 * @param  {Object} res response JSON
 * @returns {Array} JSON response which includes array of trailers relating to the search query -> should have response code of 200
 */
function getSearch (req,res) {

	if (req.query.q != undefined) {

		res.statusCode = 200;
		callTrailers(res,req.query.q);

	}
	else{

		res.statusCode = 422;
		res.end();

	}

}


/**
 * Gets the channel data for the given channel <br>
 * This looks up whether the JSON exists in the local JSON files, if not it will run callChannelData to request it from Youtube<br>
 * If the file exists it will send the file's data as a JSON back as a response <br>
 * If no channel is provided the 422 error code is provided
 * @param  {Object} req request JSON
 * @param  {String} req.query.channel The channel the user wishes to get trailers for
 * @param  {Object} res response JSON
 * @returns {Array} channel trailers for the channel specified
 */
function getChannelData (req,res) {

	if (req.query.channel != undefined) {


		fs.readFile("Database/" + req.query.channel + ".json",function (err,data) {

			if (err) {

				callChannelData(req.query.channel,res);

			}
			else {

				res.statusCode = 200;
				data = JSON.parse(data);
				res.json(data);
				res.end();

			}

		});

	}
	else{

		res.statusCode = 422;
		res.end();

	}

}

/**
 * Function used to get recent trailers. <br>
 * The page query is required and will send back trailers relating to which page <br>
 * ie page 1 is first 20 and page 2 is the rest of the file
 * @param  {Object} req request JSON
 * @param  {Number/String} req.query.page The page number to request
 * @param  {Object} res response JSON
 * @returns  {Array} An Array containing recent trailer data from Youtube, saved in a local file called recents.json
 */
function getRecent (req,res) {

	if (req.query.page == undefined) {

		res.statusCode = 422;
		res.end();
		return;

	}


	res.statusCode = 200;

	fs.readFile("Database/recents.json",function (err,data) {

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


}


/**
 * Used to get the preferences of a specific user<br>
 * User is defined by either the req.query.token or req.query.email<br>
 * I use JSONWebToken to verify the token here -> which hashes the users id into the token<br>
 * In this instance it unhashes the id out of the token
 * @param  {Object} req request JSON
 * @param  {String} req.headers["x-access-token"] The token through which the getPrefs method can be made
 * @param  {Object} res response JSON
 * @returns {Object} JSON back as a response which contains: the users prefs and their name
 */
function getPrefs (req,res) {

	if (req.headers["x-access-token"] == undefined && req.query.email == undefined) {

		res.statusCode = 422;
		res.end();
		return;

	}

	fs.readFile("Database/accounts.json",function (er,accounts) {

		if (er) {

			throw new Error(er);

		}
		accounts = JSON.parse(accounts);

		if (req.headers["x-access-token"]) {

			jwt.verify(req.headers["x-access-token"], process.env.secret, function (err, decoded) {

				if (err) {

					return res.status(500).send({ auth: false, message: "Failed to authenticate token." });

				}

				res.json({"prefs":accounts["users"][decoded["id"] - 1]["prefs"], "name": accounts["users"][decoded["id"] - 1]["fName"]});
				res.end();

			});

		}
		else {

			for (let i = 0; i < accounts["users"].length; i++) {

				if (accounts["users"][i]["eMail"].toLowerCase() == req.query.email.toLowerCase()) {

					let token = jwt.sign({ id: accounts["users"][i]["id"] }, process.env.secret || "superSecret", {
						expiresIn: 86400 // expires in 24 hours
					});
					res.json({"prefs":accounts["users"][i]["prefs"], "name": accounts["users"][i]["fName"], "token":token});
					res.end();
					return;

				}

			}
			// account doesn't exist
			res.statusCode = 404;
			res.end();

		}


	});

}

// -> old prefs post
// updates prefs for user if their email and password are correct
// app.post ("/prefs", function (req,res) {

// 	if (req.body.email == undefined || req.body.pword == undefined || req.body.prefs == undefined) {

// 		res.statusCode = 422;
// 		res.end();
// 		return;

// 	}

// 	fs.readFile("Database/accounts.json",function (er,accounts) {

// 		if (er) {

// 			res.statusCode == 500;
// 			res.end();
// 			throw new Error(er);

// 		}
// 		accounts = JSON.parse(accounts);
// 		for (let i = 0; i < accounts["users"].length; i++) {

// 			if (accounts["users"][i]["eMail"].toLowerCase() == req.body.email.toLowerCase()) {

// 				bcrypt.compare(req.body.pword,accounts["users"][i]["password"],function (er,equal) {

// 					if (er) {

// 						res.statusCode == 500;
// 						res.end();
// 						throw new Error(er);

// 					}
// 					if (equal) {


// 						accounts["users"][i]["prefs"] = req.body.prefs;
// 						fs.writeFile("Database/accounts.json",JSON.stringify(accounts),function (er) {

// 							if (er) {

// 								res.statusCode == 500;
// 								res.end();
// 								throw new Error(er);

// 							}
// 							res.json({"success":true,});
// 							res.end();

// 						});

// 					}
// 					else{

// 						res.statusCode = 401;
// 						res.json({"success":false,"correctPassword":false});
// 						res.end();

// 					}


// 				});

// 				return;

// 			}


// 		}

// 		res.statusCode = 400;
// 		res.json({"success":false,"correctPassword":false,"exists":false});
// 		res.end();

// 	});

// });


/**
 * Checks whether the token is embedded in the header, and whether there is some new prefs array which needs updating<br>
 * It verifies the token with the secret defined in the environment variables file<br>
 * Then writes to the users prefs attribute with their new prefs
 * @param  {Object} req request JSON
 * @param  {String} req.body.prefs The new preferences the user wants to update
 * @param  {String} req.headers["x-access-token"] The token through which the getPrefs method can be made
 * @param  {Object} res response JSON
 * @returns {Object} JSON back as a response which contains: the users prefs and their name
 */
function postPrefs (req,res) {


	if (req.headers["x-access-token"] == undefined || req.body.prefs == undefined) {

		res.statusCode = 422;
		res.end();
		return;

	}

	fs.readFile("Database/accounts.json",function (er,accounts) {

		if (er) {

			res.statusCode == 500;
			res.end();
			throw new Error(er);

		}

		jwt.verify(req.headers["x-access-token"] , process.env.secret, function (err, decoded) {

			if (err) {


				return res.status(500).send({ auth: false, message: "Failed to authenticate token." });

			}

			accounts = JSON.parse(accounts);

			accounts["users"][decoded["id"] - 1]["prefs"] = req.body.prefs;
			fs.writeFile("Database/accounts.json",JSON.stringify(accounts),function (er) {

				if (er) {

					res.statusCode == 500;
					res.end();
					throw new Error(er);

				}
				res.json({"success":true,});
				res.end();

			});


		});


	});

}


/**
 * Adds the account to account.json<br>
 * The account details are sent in req.body -> with required attributes of email and password<br>
 * I then encrypt the password with industry standard bcrypt hashing
 * @param  {Object} req request JSON
 * @param  {String} req.body.email Email for the new account
 * @param  {String} req.body.password Password for the new account
 * @param  {String} req.body.fName fName for the new account
 * @param  {String} req.body.lName lName for the new account
 * @param  {Array} req.body.prefs prefs for the new account
 * @param  {Object} res response JSON
 * @returns {Object} JSON back as a response which contains: the token the new user must use
 */
function postRegister (req,res) {


	if (req.body.email == undefined || req.body.password == undefined) {

		res.statusCode = 422;
		res.end();
		return;

	}

	fs.readFile("Database/accounts.json",function (er,accounts) {

		if (er) {

			res.statusCode == 500;
			res.end();
			throw new Error(er);

		}

		let user = {"fName": req.body.fName || " ", "lName": req.body.lName || " ", "eMail": req.body.email,};

		bcrypt.genSalt(11, function (er,salt) {

			if (er) {

				res.statusCode == 500;
				res.end();
				throw new Error(er);

			}
			// user["salt"] = salt;
			bcrypt.hash(req.body.password, salt, function (er,hash) {

				if (er) {

					res.statusCode == 500;
					res.end();
					throw new Error(er);

				}

				user["password"] = hash;
				user["prefs"] = req.body.prefs || [];
				try {

					accounts = JSON.parse(accounts);
					user["id"] = accounts["users"].length + 1;
					accounts["users"].push(user);

				}
				catch (e) {

					user["id"] = 1;
					accounts = {"users":[user]};

				}

				fs.writeFile("Database/accounts.json",JSON.stringify(accounts),function (er) {


					if (er) {

						res.statusCode == 500;
						res.end();
						throw new Error(er);

					}
					let token = jwt.sign({ id: user["id"] }, process.env.secret || "superSecret", {
						expiresIn: 86400 // expires in 24 hours
					});
					res.statusCode = 200;
					res.json({"auth":true, "token": token});
					res.end();

				});

			});

		});


	});

}


/**
 * Checks whether the required email query is there<br>
 * Then checks whether the account exists by searching through accounts.JSON
 * @param  {Object} req request JSON
 * @param  {String} req.query.email the requested email query
 * @param  {Object} res response JSON
 * @returns {Object} JSON with exists with a boolean value of true or false for whether the account is there or not
 */
function getCheckAccount (req,res) {

	if (req.query.email == undefined) {

		res.statusCode = 422;
		res.end();
		return;

	}
	fs.readFile("Database/accounts.json",function (er,accounts) {

		if (er) {

			res.statusCode == 500;
			res.end();
			throw new Error(er);

		}
		accounts = JSON.parse(accounts);
		for (let i = 0; i < accounts["users"].length; i++) {

			if (accounts["users"][i]["eMail"].toLowerCase() == req.query.email.toLowerCase()) {

				// did have 409 response code but resulted in errors clientside
				res.statusCode = 200;
				res.json({"exists":true});
				res.end();
				return;

			}

		}
		res.statusCode = 200;
		res.json({"exists":false});
		res.end();

	});

}


/**
 * Logs in depending on whether the username and password is correct<br>
 * The email and password body attributes are required<br>
 * It then searches for the user with the same email account then runs the bcrypt compare function to check whether the sent password and the stored passwords match
 * @param  {Object} req request JSON
 * @param  {String} req.body.email Email for the login request
 * @param  {String} req.body.pword password for the login request
 * @param  {Object} res response JSON
 * @returns {Object} JSON back as a response which contains: name and prefs of user, a new token, whether the password is correct and whether the account exists
 */
function postLogin (req,res) {


	let email = req.body.email;
	let pword = req.body.pword;

	if (email == undefined || pword == undefined) {

		res.statusCode = 422;
		res.end();
		return;

	}

	fs.readFile("Database/accounts.json",function (er,accounts) {

		if (er) {

			res.statusCode == 500;
			res.end();
			throw new Error(er);

		}
		accounts = JSON.parse(accounts);
		for (let i = 0; i < accounts["users"].length; i++) {

			if (accounts["users"][i]["eMail"].toLowerCase() == email.toLowerCase()) {

				bcrypt.compare(pword,accounts["users"][i]["password"], function (er, equal) {

					if (er) {

						res.statusCode == 500;
						res.end();
						throw new Error(er);

					}


					if (equal) {

						// sign in
						let token = jwt.sign({ id: accounts["users"][i]["id"] }, process.env.secret || "superSecret", {
							expiresIn: 86400 // expires in 24 hours
						});
						let response = {"fName":accounts["users"][i]["fName"], "prefs": accounts["users"][i]["prefs"], "exists":true, "correctPassword":true, "token": token};
						res.json(response);

					}
					else {

						// can't sign in
						res.statusCode = 401;
						res.json({"exists":true,"correctPassword":false});

					}

					res.end();


				});


				return;

			}

		}

		res.statusCode = 400;
		res.json({"exists":false, "correctPassword":false});
		res.end();

	});

}

/**
 * When posting to this URL, no body is required but the token is required in the header.<br>
 * The function will then remove the account linked to the id in the token from the server.
 * @param  {Object} req request JSON
 * @param  {String} req.headers["x-access-token"] The token through which the getPrefs method can be made
 * @param  {Object} res response JSON
 * @returns {Object} basic success JSON to see whether the process is successful
 */
function postDeleteAccount (req,res) {

	if (req.headers["x-access-token"] == undefined) {

		res.statusCode = 422;
		res.end();
		return;

	}
	fs.readFile("Database/accounts.json",function (er,accounts) {

		if (er) {

			res.statusCode == 500;
			res.end();
			throw new Error(er);

		}

		jwt.verify(req.headers["x-access-token"] , process.env.secret, function (err, decoded) {

			if (err) {


				return res.status(500).send({ auth: false, message: "Failed to authenticate token." });

			}

			accounts = JSON.parse(accounts);

			accounts["users"].splice(decoded["id"] - 1,1);
			fs.writeFile("Database/accounts.json",JSON.stringify(accounts),function (er) {

				if (er) {

					res.statusCode == 500;
					res.end();
					throw new Error(er);

				}
				res.json({"success":true,});
				res.end();

			});


		});


	});

}


// ////////////////////////////////////////////////////
// External API Code

// this code now in server.js

// setInterval(intervalSavingRecents, 1000 * 60 * 45);
// TEST THE CODE WITH THIS: setInterval(intervalSavingRecents, 1000 * 60);
// setInterval(intervalSavingChannels, 1000 * 60 * 60 * 6);

/**
 * Runs with the interval function at the bottom of this file locally<br>
 * If it is in the morning it requests "Trailers" from Youtube<br>
 * If it is in the afternoon it requests "Official Trailers" from Youtube<br>
 * The two requests give slightly different responses<br>
 * The responses are saved in recent.JSON -> Seen below
 * @returns {Array} The JSON responses from YT are saved in recent.JSON in a later function
 */
function intervalSavingRecents () {

	// let d = moment().subtract(12,"months").format("YYYY-MM-DDTHH:mm:ssZ");
	let d = new Date();
	if (d.getHours() < 12) {

		searchListByKeyword({"params": {
			"maxResults": "50",
			"part": "snippet",
			"q": "Trailer",
			"type": "video",
			// "publishedAfter":d,
			// "videoDuration": "short",
			// "regionCode": "GB"
		}});

	} else {

		searchListByKeyword({"params": {
			"maxResults": "50",
			"part": "snippet",
			"q": "Official Trailer",
			"type": "video",
			// "publishedAfter":d,
			// "videoDuration": "short",
			// "regionCode": "GB"
		}});

	}
	intervalRecents();


}

/**
 * Runs with the interval function at the bottom of this file locally<br>
 * Runs for all popular channels as these will have the most requests<br>
 * This helps limit the number of requests to YT and therefore the total quota for the day<br>
 * @returns {Array} The JSON responses from YT are stored in files named after the channel they relate to
 */
let intervalSavingChannels = function intervalSavingChannels () {

	callChannelData("Disney");
	callChannelData("Marvel");
	callChannelData("DC");
	callChannelData("Netflix");
	callChannelData("FOX");
	callChannelData("WarnerBros");
	callChannelData("Sony");

	intervalChannels();

};

// https://issuetracker.google.com/128835104 - won't sort output -> ***FIXED***

/**
 * Checks whether there is a file for the requested channel,<br>
 * If there is it sends the data for it<br>
 * If there is not then it requests Youtube for the information, which is sent back through the res object
 * @param  {String} channel requested channel
 * @param  {Object} res response JSON
 * @returns {Arrray} The JSON responses from YT are stored in files named after the channel they relate to
 */
function callChannelData (channel,res) {


	fs.readFile("Database/channels.json", function processChannelData (err, data) {

		if (err) {

			if (res != undefined) {

				res.statusCode == 500;
				res.end();

			}
			throw new Error(err);

		}
		data = JSON.parse(data);
		if (data["channels"][channel] == undefined) {

			res.statusCode = 400;
			res.end();
			return;

		}
		searchListByKeyword({"params": {
			"maxResults": "24",
			"part": "snippet",
			"q": "Trailer",
			"type": "video",
			"channelId": data["channels"][channel]["channelID"],
			"order": "date"
			// "videoDuration": "short",
			// "relevanceLanguage": "en"
			// "videoLicense": "creativeCommon"
		}}, res,channel);

	});


}
/**
 * If there is a search query -> then search YT for it <br>
 * If not return
 * @param  {Object} res response JSON
 * @param  {String} q search query
 * @returns {Array} Sends the requested data back to the client through res
 */
function callTrailers (res, q) {

	if (q === undefined) {

		return;

	}else {

		searchListByKeyword({"params": {
			"maxResults": "6",
			"part": "snippet",
			"q": q + " Trailer",
			"type": "video",
			// "videoDuration": "short",
			// "regionCode": "GB"
		}}, res);

	}

	// old server side code which used client secret for auth
	// fs.readFile("client_secret.json", function processClientSecrets (err, content) {

	// 	if (err) {

	// 		if (res != undefined) {

	// 			res.statusCode == 500;
	// 			res.end();

	// 		}
	// 		throw new Error(err);

	// 	}
	// 	// Authorize a client with the loaded credentials, then call the YouTube API.
	// 	// See full code sample for authorize() function code.
	// 	if (q === undefined) {

	// 		// let d = moment().subtract(12,"months").format("YYYY-MM-DDTHH:mm:ssZ");
	// 		// change max results sizes once ive sorted repeats and reaction videos
	// 		authorize(JSON.parse(content), {"params": {
	// 			"maxResults": "50",
	// 			"part": "snippet",
	// 			"q": "Trailer",
	// 			"type": "video",
	// 			// "publishedAfter":d,
	// 			// "videoDuration": "short",
	// 			// "regionCode": "GB"
	// 		}}, searchListByKeyword,res);

	// 	}else {

	// 		authorize(JSON.parse(content), {"params": {
	// 			"maxResults": "6",
	// 			"part": "snippet",
	// 			"q": q + " Trailer",
	// 			"type": "video",
	// 			// "videoDuration": "short",
	// 			// "regionCode": "GB"
	// 		}}, searchListByKeyword, res);

	// 	}

	// });

}


// function authorize (credentials, requestData, callback, res = undefined ,channel = undefined) {

// let clientSecret = credentials.installed.client_secret;
// let clientId = credentials.installed.client_id;
// let redirectUrl = credentials.installed.redirect_uris[0];

// let oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);

// callback(requestData, res, channel);

// Check if we have previously stored a token.
// fs.readFile(TOKEN_PATH, function (err, token) {

// 	if (err) {

// 		getNewToken(oauth2Client, requestData, callback);

// 	} else {

// 		oauth2Client.credentials = JSON.parse(token);
// 		console.log(oauth2Client);
// 		callback(oauth2Client, requestData, res, channel);

// 	}

// });

// }


// function getNewToken (oauth2Client, requestData, callback) {

// 	let authUrl = oauth2Client.generateAuthUrl({
// 		access_type: "offline",
// 		prompt: "consent",
// 		scope: SCOPES
// 	});
// 	console.log("Authorize this app by visiting this url: ", authUrl);
// 	let rl = readline.createInterface({
// 		input: process.stdin,
// 		output: process.stdout
// 	});
// 	rl.question("Enter the code from that page here: ", function (code) {

// 		rl.close();
// 		oauth2Client.getToken(code, function (err, token) {

// 			if (err) {

// 				throw new Error(err);

// 			}
// 			oauth2Client.credentials = token;
// 			storeToken(token);
// 			callback(oauth2Client, requestData);

// 		});

// 	});

// }

// function storeToken (token) {

// 	try {

// 		fs.mkdirSync(TOKEN_DIR);

// 	} catch (err) {

// 		if (err.code != "EEXIST") {

// 			throw err;

// 		}

// 	}
// 	fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
// 	console.log("Token stored to " + TOKEN_PATH);

// }

/**
 * Youtube's function to remove parameters that arent in use so we dont get<br>
 * ?snippet=<br>
 * for the snippet section, instead the snippet query wouldnt exist
 * @param  {Object} params the current params to send to youtube
 * @returns {Object} The new params with empty values removed
 */
function removeEmptyParameters (params) {

	for (let p in params) {

		if (!params[p] || params[p] == "undefined") {

			delete params[p];

		}

	}
	return params;

}

/**
 * Function which makes request to youtube api<br>
 * Handles response appropriately<br>
 * Either sends the response back to client -> if res exists<br>
 * Or saves in a predefined JSON file
 * @param  {Object} requestData - the params and filters that I am searching by
 * @param  {Object} res response JSON
 * @param  {String} channel - channel name if necessary
 * @returns {Object} Using the response received from Google, either Saves the data or sends the data back to the client
 */
function searchListByKeyword (requestData, res, channel) {

	let service = google.youtube("v3");
	// var parameters = requestData["params"];
	let parameters = removeEmptyParameters(requestData["params"]);
	parameters["key"] = process.env.GOOGLE_API_KEY;
	service.search.list(parameters, function (err, response) {

		try {

			if (err) {

				if (res != undefined) {

					res.statusCode == 500;
					res.send(err);
					res.end();

				}
				throw new Error(err,response);

			}
			console.log("pinged Youtube");

			for (let i = 0; i < response["data"]["items"].length;i++) {

				let x = 0;
				// videoData[i - 1]["snippet"]["title"]

				let title = response["data"]["items"][i]["snippet"]["title"].toLowerCase();

				if (title.includes("reaction") || title.includes("ayogya") || title.includes("marudhar express") || title.includes("bharat") || title.includes("baarish") || title.includes("total dhamaal") || title.includes("dil diyan gallan") || title.includes("vingadores:  ultimato") || title.includes("madhura raja") || title.includes("kesari") || title.includes("pm narendra modi") || title.includes("movieclips") || title.includes("honest") || title.includes("everything you missed in") || title.includes("breakdown") || title.includes("kalank") || title.includes("de de pyaar de") || title.includes("tashkent files")) {

					if (title.includes("movieclips")) {

						x++;

					}
					if (x % 2 == 0) {

						// console.log("removed: " + title);
						response["data"]["items"].splice(i,1);

					}

				}

			}
			if (res != undefined) {

				res.statusCode = 200;
				res.json(response["data"]["items"]);
				res.end();

			}

			if (res === undefined && channel === undefined) {

				fs.writeFile("Database/recents.json",JSON.stringify(response["data"]["items"]),function (err) {

					if (err) {

						if (res != undefined) {

							res.statusCode == 500;
							res.end();

						}
						throw new Error(err);

					}
					console.log("written recents file");

				});

			} else if (res === undefined && channel != undefined) {

				fs.writeFile("Database/" + channel + ".json",JSON.stringify(response["data"]["items"]),function (err) {

					if (err) {

						if (res != undefined) {

							res.statusCode == 500;
							res.send(err);
							res.end();

						}
						throw new Error(err);

					}
					console.log("written " + channel + " file");

				});

			}


		}
		catch (er) {

			if (res != undefined) {

				res.statusCode == 500;
				res.send(err);
				res.end();

			}
			throw new Error(er);

		}


	});

}

/**
 * Calls the intervalSavingRecentsFunction every 45 mins<br>
 * This calls the Youtube API and stores the result JSON in recents.json<br>
 * @returns {undefined} no return value as function repeats -> however requested data is saved in recent.json
 */
function intervalRecents () {

	setTimeout(intervalSavingRecents, 1000 * 60 * 45);

}
/**
 * interval recents function<br>
 * saves new channels every 6 hrs<br>
 * @returns {undefined} no return value as function repeats -> however the requested data is saved in JSONs
 */
function intervalChannels () {

	// setInterval(intervalSavingRecents, 1000 * 4);
	// setInterval(intervalSavingChannels, 1000 * 4);

	setTimeout(intervalSavingChannels, 1000 * 60 * 60 * 6);

}

module.exports = {app, intervalRecents , intervalChannels};


