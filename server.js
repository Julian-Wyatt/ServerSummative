let express = require("express");
let app  = express();
let fs = require("fs");
let readline = require("readline");
const {google} = require("googleapis");
// const {OAuth2Client} = require("google-auth-library");


app.use(express.static("client"));

app.get("/",function (req,resp) {

	resp.sendFile("client/index.html",{root: __dirname });

});

app.get("/style.css", function (req, res) {

	res.sendFile(__dirname + "/client/" + "style.css");

});

app.get("/index.js", function (req, res) {

	res.sendFile(__dirname + "/client/" + "index.js");

});

app.get("/placeholder.png", function (req, res) {

	res.sendFile(__dirname + "/client/" + "placeholder.png");

});


app.get("/recent", function (req,res) {

	res.statusCode = 200;
	// callRecents(res);
	res.send(fs.readFileSync("recents.json"));
	console.log("once");
	res.end();

});


let SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl","https://www.googleapis.com/auth/youtube"];
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + "/.credentials/";
let TOKEN_PATH = TOKEN_DIR + "google-apis-nodejs-quickstart.json";

function callRecents (res) {

	fs.readFile("client_secret.json", function processClientSecrets (err, content) {

		if (err) {

			console.log("Error loading client secret file: " + err);
			return;

		}
		// Authorize a client with the loaded credentials, then call the YouTube API.
		// See full code sample for authorize() function code.
		authorize(JSON.parse(content), {"params": {
			"maxResults": "50",
			"part": "snippet",
			"q": "Trailer",
			"type": "video",
			// "videoDuration": "short",
			// "relevanceLanguage": "en"
			// "videoLicense": "creativeCommon"
		}}, searchListByKeyword, res);

	});

}


function authorize (credentials, requestData, callback, res) {

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
			callback(oauth2Client, requestData, res);

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

function searchListByKeyword (auth, requestData, res) {

	let service = google.youtube("v3");
	// var parameters = requestData["params"];
	let parameters = removeEmptyParameters(requestData["params"]);
	parameters["auth"] = auth;
	service.search.list(parameters, function (err, response) {

		if (err) {

			console.log("The API returned an error: " + err);
			return;

		}
		console.log("pinged Youtube");

		res.json(response);
		res.end();

	});

}


//app.listen(8080);

