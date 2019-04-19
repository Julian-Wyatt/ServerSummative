"use strict";

const request = require("supertest");
const app = require("./app.js").app;

let token = null;

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

describe("Test the registration post methods and whether the account is free", () => {


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
			.set("Content-Type", "application/x-www-form-urlencoded")
			.send(params)
			.expect(200)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});

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
			.get("/checkAccount?email=mock%40account.co.uk")
			.expect(200)
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

	// only fails on server error
	test("GET /newToken succeeds - token received", (done) => {

		return request(app)
			.get("/newToken")
			.expect(200)
			.expect(function (res) {

				if (res.body.auth != true) {

					throw new Error("auth value isn't true");

				}
				if (!res.body.token) {

					throw new Error("haven't received token");

				} else {

					token = res.body.token;

				}

			})
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});


});

describe("Test the post interaction for preferences", () => {

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
			.get("/prefs?email=Mock%40account.co.uk")
			.expect(200)
			.expect("Content-type",/json/)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});


	test("POST /prefs fails - no query", (done) => {

		return request(app)
			.post("/prefs")
			.expect(422)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});

	test("POST /prefs fails - no token", (done) => {

		return request(app)
			.post("/prefs")
			.set("Content-Type", "application/x-www-form-urlencoded")
			.send({"prefs": ["Marvel","DC"]})
			.expect(422)
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});
	test("POST /prefs succeeds - token and query provided", (done) => {

		return request(app)
			.post("/prefs")
			.set("Content-Type", "application/x-www-form-urlencoded")
			.send({"prefs": ["Marvel","DC"]})
			.set("x-access-token", token)
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
			.set("Content-Type", "application/x-www-form-urlencoded")
			.send(params)
			.expect(400)
			.expect({"exists":false, "correctPassword":false})
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});

	test("POST /login fails - account password is incorrect", (done) => {


		const params = {
			email: "mock@account.co.uk",
			pword: "mock01",
		};

		return request(app)
			.post("/login")
			.set("Content-Type", "application/x-www-form-urlencoded")
			.send(params)
			.expect(401)
			.expect({"exists":true, "correctPassword":false})
			.end(function (err) {

				if (err) return done(err);
				done();

			});

	});


	test("POST /login succeeds - account password is correct and account exists", (done) => {

		const params = {
			email: "mock@account.co.uk",
			pword: "mocK01",
		};

		return request(app)
			.post("/login")
			.set("Content-Type", "application/x-www-form-urlencoded")
			.send(params)
			.expect(200)
			.expect(function (res) {

				if (res.body.fName != "Mock") {

					throw new Error("name isn't Mock");

				}
				if (res.body.prefs[0] !=  "Marvel") {

					throw new Error("prefs isnt 'Marvel'");

				}
				if (res.body.prefs[1] != "DC") {

					throw new Error ("prefs 1 isnt DC");

				}
				if (res.body.prefs.length != 2) {

					throw new Error ("prefs length is wrong");

				}
				if (res.body.exists != true) {

					throw new Error("exists isn't true");

				}
				if (!res.body.token) {

					throw new Error("no token recieved");

				}


			})
			.end(function (err) {


				if (err) return done(err);
				done();

			});

	});

});


