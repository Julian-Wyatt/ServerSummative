"use strict";

const request = require("supertest");
const app = require("./app.js").app;


// https://github.com/stevenaeola/gitpitch/tree/master/prog/nodejs_testing
// thanks to Nico Tejera at https://stackoverflow.com/questions/1714786/query-string-encoding-of-a-javascript-object
// returns something like "access_token=concertina&username=bobthebuilder"
function serialise (obj) {

	return Object.keys(obj).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join("&");

}


describe("Test the main page service", () => {

	test("GET / succeeds", () => {

		return request(app)
			.get("/")
			.expect(200);

	});

	test("GET / returns html", () => {

		return request(app)
			.get("/")
			.expect("Content-type", /html/);

	});

	test("GET / includes Trailers Central", () => {

		return request(app)
			.get("/")
			.expect(/Trailers Central/);

	});
	test("GET /favicon.ico succeeds and returns image ", () => {

		return request(app)
			.get("/favicon.ico")
			.expect(200)
			.expect("Content-type",/image/);

	});
	test("GET /placeholder.png succeeds and returns png ", () => {

		return request(app)
			.get("/placeholder.png")
			.expect(200)
			.expect("Content-type",/png/);

	});


});

describe("Test the youtube api interaction", () => {

	test("GET /search fails", () => {

		return request(app)
			.get("/search")
			.expect(422);

	});
	test("GET /search succeeds and returns JSON", (done) => {

		return request(app)
			.get("/search?q=end%20game")
			.expect(200)
			.expect("Content-type",/json/)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});
	test("GET /recent fails", () => {

		return request(app)
			.get("/recent")
			.expect(422);

	});
	test("GET /recent succeeds and returns JSON", (done) => {

		return request(app)
			.get("/recent?page=1")
			.expect(200)
			.expect("Content-type",/json/)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});
	test("GET /channeldata fails", () => {

		return request(app)
			.get("/channeldata")
			.expect(422);

	});
	test("GET /channeldata succeeds and returns JSON from file", (done) => {

		return request(app)
			.get("/channeldata?channel=Marvel")
			.expect(200)
			.expect("Content-type",/json/)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});
	test("GET /channeldata succeeds and returns JSON from YT", (done) => {

		return request(app)
			.get("/channeldata?channel=Disney-Pixar")
			.expect(200)
			.expect("Content-type",/json/)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});

	test("GET /channeldata fails from bad request", (done) => {

		return request(app)
			.get("/channeldata?channel=disneypixar")
			.expect(400)
			.end(function (err) {

				if (err) return done(err);
				done();

			});


	});


	// need to add timing tests fo setinterval functions///////

	// ////////////////////////////////////////////////////////
	// ////////////////////////////////////////////////////////

});

describe("Test the get post interaction for preferences", () => {

	test("GET /prefs fails - no query", () => {

		return request(app)
			.get("/prefs")
			.expect(422);

	});
	test("GET /prefs fails - no account", (done) => {

		return request(app)
			.get("/prefs?email=google%40gmail.com")
			.expect(404)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});
	test("GET /prefs succeed - return JSON", (done) => {

		return request(app)
			.get("/prefs?email=Mock%40account.com")
			.expect(200)
			.expect("Content-type",/json/)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});

	// Mock@account.com email
	// Mock01 pword
	test("POST /prefs fails - no query", (done) => {

		return request(app)
			.post("/prefs")
			.expect(422)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});
	test("POST /prefs fails - no account for sent params", (done) => {

		const params = {email: "mock@account.ac.uk",
			pword: "mocK01",
			prefs: ["Pixar","Marvel","DC","Netflix","FOX"],
		};

		return request(app)
			.post("/prefs")
			.send(serialise(params))
			.expect(400)
			.expect({"success":false,"correctPassword":false,"exists":false})
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});
	test("POST /prefs fails - incorrect password", (done) => {

		const params = {email: "mock@account.com",
			pword: "mocK01",
			prefs: ["Pixar","Marvel","DC","Netflix","FOX"],
		};

		return request(app)
			.post("/prefs")
			.send(serialise(params))
			.expect(401)
			.expect({"success":false,"correctPassword":false})
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});
	test("POST /prefs succeeds - correct email and pword", (done) => {

		const params = {email: "mock@account.com",
			pword: "Mock01",
			prefs: ["Pixar","Marvel","DC","Netflix","FOX"],
		};

		return request(app)
			.post("/prefs")
			.send(serialise(params))
			.expect(200)
			.expect({"success":true,})
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});


});


describe("Test the registration post methods and whether the account is free", () => {

	test("GET /checkAccount fails - no query provided", (done) => {

		return request(app)
			.get("/checkAccount")
			.expect(422)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});

	test("GET /checkAccount succeeds - however account exists", (done) => {

		return request(app)
			.get("/checkAccount?email=mock%40account.com")
			.expect(409)
			.expect({"exists":true})
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});

	test("GET /checkAccount succeeds - account is not used", (done) => {


		return request(app)
			.get("/checkAccount?email=mock%40account.ac.uk")
			.expect(200)
			.expect({"exists":false})
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});

	test("POST /register fails - no query", (done) => {

		return request(app)
			.post("/register")
			.expect(422)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});
	test("POST /register succeeds - account succesfully added to accounts.json", (done) => {

		// will allow for duplicates here as the
		// checkAccount get method is ran to prevent duplicates

		const params = {fName: "Mock",
			lName: "Account",
			email: "mock@account.co.uk",
			password: "mocK01",
			prefs: ["Pixar","Marvel","DC","Netflix","FOX"],
		};

		return request(app)
			.post("/register")
			.send(serialise(params))
			.expect(200)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});


});


describe("Test the /login post method", () => {

	test("POST /login fails - no query", (done) => {

		return request(app)
			.post("/login")
			.expect(422)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});
	test("POST /login fails - account does not exist", (done) => {


		const params = {
			email: "mock@account.ac.uk",
			pword: "mocK01",
		};

		return request(app)
			.post("/login")
			.send(serialise(params))
			.expect(400)
			.expect({"exists":false, "correctPassword":false})
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});

	test("POST /login fails - account password is incorrect", (done) => {


		const params = {
			email: "mock@account.com",
			pword: "mocK01",
		};

		return request(app)
			.post("/login")
			.send(serialise(params))
			.expect(401)
			.expect({"exists":true, "correctPassword":false})
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});

	test("POST /login succeeds - account password is correct and account exists", (done) => {


		const params = {
			email: "mock@account.com",
			pword: "Mock01",
		};

		return request(app)
			.post("/login")
			.send(serialise(params))
			.expect(200)
			.expect({"fName":"Mock", "prefs": "Pixar,Marvel,DC,Netflix,FOX", "exists":true, "correctPassword":true})
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});

});


