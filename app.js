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
const enforce = require("express-sslify");
dotenv.config();

app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("client"));

// used only really in testing to find the ID of channels for prefs section in accounts.json and saved in channels.json
// eslint-disable-next-line no-unused-vars
function getChannelID (title) {


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


	// change max results sizes once ive sorted repeats and reaction videos


}
app.get("/googlef50573ce84d3ee44.html",function (req,resp) {

	resp.sendFile("client/googlef50573ce84d3ee44.html",{root: __dirname });
	resp.end();

});


/** gets the main html page, css, and the js
 * @param  {} req
 * @param  {} resp
 */
app.get("/",function (req,resp) {

	console.log("arrived on the page");

	resp.sendFile(__dirname + "client/index.html");
	resp.sendFile(__dirname + "/client/favicon.ico");
	resp.end();

});


// used to get the placeholder image for videos
app.get("/placeholder.png", function (req, res) {

	res.sendFile(__dirname + "/client/placeholder.png");
	res.end();

});

app.get("/index.js", function (req, res) {

	res.sendFile(__dirname + "/client/index.js");
	res.end();

});

app.get("/style.css", function (req, res) {

	res.sendFile(__dirname + "/client/style.css");
	res.end();

});

// used to search for specific trailers, the query is provided in the URL
app.get("/search",function (req,res) {

	if (req.query.q != undefined) {

		res.statusCode = 200;
		callTrailers(res,req.query.q);

	}
	else{

		res.statusCode = 422;
		res.end();

	}

});

// gets the channel data, ie all trailers from specfic channel
app.get("/channeldata",function (req,res) {

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

});

// gets recents - typically newest videos from saved in recents.json
app.get("/recent",function (req,res) {

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
		else {

			res.statusCode = 422;

		}
		res.end();

	});


});

// gets prerferences and name for specific user
app.get("/prefs",function (req,res) {

	if (req.query.token == undefined && req.query.email == undefined) {

		res.statusCode = 422;
		res.end();
		return;

	}

	fs.readFile("Database/accounts.json",function (er,accounts) {

		if (er) {

			throw new Error(er);

		}
		accounts = JSON.parse(accounts);

		if (req.query.token) {

			jwt.verify(req.query.token, process.env.secret, function (err, decoded) {

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

});

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

// new post prefs with token business
app.post ("/prefs", function (req,res) {


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

});

app.get("/newToken", function (req,res) {


	fs.readFile("Database/accounts.json",function (er,accounts) {

		if (er) {

			res.statusCode == 500;
			res.end();
			throw new Error(er);

		}

		accounts = JSON.parse(accounts);


		let token = jwt.sign({ id: accounts["users"].length }, process.env.secret || "superSecret", {
			expiresIn: 86400 // expires in 24 hours
		});
		res.statusCode = 200;
		res.json({"auth":true, "token": token});
		res.end();


	});


});


// adds the account to accounts.json
app.post("/register",function (req,res) {


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

					res.statusCode == 200;
					res.end();

				});

			});

		});


	});

});

// checks if the account exists
app.get("/checkAccount",function (req,res) {

	if (req.query.email == undefined) {

		res.statusCode = 422;
		res.end();
		return;

	}
	checkEmail(req.query.email,res);

});

function checkEmail (input,res) {

	fs.readFile("Database/accounts.json",function (er,accounts) {

		if (er) {

			res.statusCode == 500;
			res.end();
			throw new Error(er);

		}
		accounts = JSON.parse(accounts);
		for (let i = 0; i < accounts["users"].length; i++) {

			if (accounts["users"][i]["eMail"].toLowerCase() == input.toLowerCase()) {

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

// logs in depending on whether the username and password is correct
app.post("/login", function (req,res) {


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

});


// ////////////////////////////////////////////////////
// External API Code

// this code now in server.js

// setInterval(intervalSavingRecents, 1000 * 60 * 45);
// TEST THE CODE WITH THIS: setInterval(intervalSavingRecents, 1000 * 60);
// setInterval(intervalSavingChannels, 1000 * 60 * 60 * 6);


function intervalSavingRecents () {


	// Authorize a client with the loaded credentials, then call the YouTube API.
	// See full code sample for authorize() function code.
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


}


let intervalSavingChannels = function intervalSavingChannels () {

	callChannelData("Disney");
	callChannelData("Marvel");
	callChannelData("DC");
	callChannelData("Netflix");
	callChannelData("FOX");
	callChannelData("WarnerBros");
	callChannelData("Sony");

};
// console.log(process.env.TOKEN_PATH);
// let SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl","https://www.googleapis.com/auth/youtube"];
// let TOKEN_DIR = (process.env.TOKEN_PATH) + "/.credentials/";
// let TOKEN_PATH = TOKEN_DIR + "google-apis-nodejs-quickstart.json";


// https://issuetracker.google.com/128835104 - won't sort output

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

function callTrailers (res, q) {

	if (q === undefined) {

		// let d = moment().subtract(12,"months").format("YYYY-MM-DDTHH:mm:ssZ");
		// change max results sizes once ive sorted repeats and reaction videos
		searchListByKeyword({"params": {
			"maxResults": "50",
			"part": "snippet",
			"q": "Trailer",
			"type": "video",
			// "publishedAfter":d,
			// "videoDuration": "short",
			// "regionCode": "GB"
		}}, res);

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


function removeEmptyParameters (params) {

	for (let p in params) {

		if (!params[p] || params[p] == "undefined") {

			delete params[p];

		}

	}
	return params;

}

// https://www.googleapis.com/youtube/v3/search?part=snippet&q=avengers&type=video&key=[-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDtBTJBDMNdSk2P\n3zRMmS9TRY3vg76wG1WyGc7BXXzySOi/IvHl9sM39VPnJJxxBv8NZcC9i/AGs0Rz\nMhfbJUJNzGUd5DG/O3eL2oXVo18VlzvvJG9Pfp5cNe470i/HjO4QDf7olEkHViaI\nxTk0CLm6AtDNaBvz0PPufdJ0bLblkE0x3DbC4j03CR5qylrvFO3L14lhJsycpfns\ny5Lsno99rAoOE3SvSdWdJcCt96JekIhwsbpd519BZH1N4DP9HPc98eXhStFpF4pO\nCGhduvvUB1TuXEPVWTNRFMv+FuQgRl4dmw6sr1xmfpSqaRdGxgPB9b4IgELQTFMQ\niFzsGD0NAgMBAAECggEADZobvTHvUD5AXz5O8QpldeDq+VDVM6QN8e+bNuuXjQv0\nF2v499qGb4Krsvsd4zqkjm9FdVs/hhLpnbbFObVUrcRKFUIQPMo73RHIVm9OuJ16\nOgocPTKmAeKybkpspYYH73HuLAi+fCZMhdLTqpHJnswkkXUlDYPzS796wWWvxVK7\nY1OnAuIwvy5eDa3Xoyib5PttEH5ErlSraqZJQEL66oxSSw3C1xOVKY2VgT7F7feb\nZDjoEyijcmGCUlCzXs+yIuEswh3WJkaN5GR6ZsSuURWj2tAUgyAv++sXNt9hlr1Q\nrzAqdGxuD5/Fi/JSuNMfq7zr67l5WjhlWJ88o3qYgQKBgQD8i2x3qxaXE26wcATR\nQEoVNHmmYV3ms6rDwMNNRKVZVUh0eik5V3lykk6x1ES7K65FKWQ5DHDJwEWQjhN2\n8O7XcVsjTRHFjTggwf1SxtW6lqZyPPn9VrSu7S0ggbGLiP81actB5UwQUBeph5il\niIxSflEPBkiVMnX13MEYZgLkYQKBgQDwQ2VyAS774NJdXjmAoTry5JnZv17n6Uw6\nga5LViQmVIxeAnO8AC7Y/kPTPD2uCkeFp80tujzj2SJqnfgM7GNsm486sopM2vCf\nL/3TRoC2zrRW/RQuLkalMPxaa63OVrBcmm7UKHWTAnhDkv9dcvQpjExsiAKmFPjE\ndWxhZ00YLQKBgQDbjCHZzuSupfgebuPhPfCpipsPJ6pIe31C/HtM2xacGOYKTIE2\nFnPARK0hL5Yo2YqBGcDFT6ll2z8eskT9q+sXZLaEc+W1RlW7NKoTokQAGCPPQG9b\n7Frbj9khX16IHaswNi67tKlxrQ9FFFqB3bmPpby2QRIskle2TBmaKmTtQQKBgQDO\nXtVwCxw0NXP7xsdVeSeNIlYT9pCqWnWje2geRatfURgQV8LZJL8Ym63ebsv8BdBR\nOUS/lkxe2U76jR1W3GS6ERQBswGf6h7sXOiE5PYCD6JPZapD0HPVyDG56OutZECw\nCeZQTUBQObrbMBQwTGD0nxG1102PIkxbUxD4ySYrMQKBgHkYPa2D0sGioc4gD3V8\nPFP0LkLR8uMsbw6iPBjHa/gzxWqg6tIq1eF0Swv4c+TfbdmY1Yj+4U0+krq92u3v\n30t+oz8vGIcj7au/bbrQYzosVffGwipQNjWenjV7a9yMDnYA+cgAWeOXVDEITAK3\nmvUPz78+OVhqKHchP8ybfcID\n-----END PRIVATE KEY-----\n]

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
					res.end();

				}
				throw new Error(err,response);

			}
			console.log("pinged Youtube");

			for (let i = 0; i < response["data"]["items"].length;i++) {

				let x = 0;
				// videoData[i - 1]["snippet"]["title"]

				let title = response["data"]["items"][i]["snippet"]["title"].toLowerCase();

				if (title.includes("reaction") || title.includes("total dhamaal") || title.includes("dil diyan gallan") || title.includes("vingadores:  ultimato") || title.includes("madhura raja") || title.includes("kesari") || title.includes("pm narendra modi") || title.includes("movieclips") || title.includes("honest") || title.includes("everything you missed in") || title.includes("breakdown") || title.includes("kalank") || title.includes("de de pyaar de") || title.includes("tashkent files")) {

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
				res.end();

			}
			throw new Error(er);

		}


	});

}

module.exports = {app, intervalSavingRecents , intervalSavingChannels};


