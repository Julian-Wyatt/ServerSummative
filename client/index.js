// global list of all channels available
let channels = ["Disney", "Pixar", "Marvel", "DC", "GoT", "Netflix", "Prime", "FOX", "Paramount", "WB", "Sony",
	"Lionsgate", "MGM"];


/**
 * Runs function when user signs into google<br>
 * This runs the typical sign in process of checking whether the account exists<br>
 * Then updates the preferences if necessary, and runs the customise page functions<br>
 * eslint disabled as it is defined in html and in JQuery section below approx line 210
 * @param  {Object} googleUser the instance of google sign in
 * @returns {undefined} Nothing is returned when the function runs -> instead the page updates
 */
function onSignIn (googleUser) { // eslint-disable-line no-unused-vars

	let profile = googleUser.getBasicProfile();
	let accntImage = document.getElementById("accntImage");
	accntImage.src = profile.getImageUrl();
	accntImage.classList.remove("hide");

	checkEmail(profile.getEmail())
		.then(function (exists) {

			if (exists) {

				getPrefs(profile.getEmail())
					.then(function (response) {

						response = JSON.parse(response);

						if (!Array.isArray(response["prefs"])) {

							alert("incorrect respones value");
							return;

						}

						setCookie("Token", response["token"]);
						// document.getElementById("prefEmail").value = profile.getEmail();
						updateOnSignIn();
						customisePage(response["prefs"], response["name"]);

					})
					.catch(e => alert(e));

			} else {

				document.getElementById("logInTitle")
					.innerHTML = "Log in - <br>Please make an account with the same email before using google";
				let accntText = document.getElementById("accntName");
				accntText.textContent = profile.getName();
				accntText.classList.remove("hide");

			}

		});

	// send info to server and handle there

}

/**
 * Signs user in, should a cookie be valid
 * @returns {undefined} No return value -> instead page updates
 */
function regularSignIn () {

	if (getCookie("Token") != undefined && getCookie("Token") != "undefined" && getCookie("Token") != "") {

		getPrefs()
			.then(function (response) {

				response = JSON.parse(response);

				if (!Array.isArray(response["prefs"])) {

					alert("incorrect response value");
					return;

				}
				// document.getElementById("prefEmail").value = profile.getEmail();
				updateOnSignIn();
				customisePage(response["prefs"], response["name"]);

			})
			.catch(e => alert(e));

	}

}

// https://www.w3schools.com/js/js_cookies.asp
/**
 * Saves a value in a cookie - only used in order to save the access token
 * @param  {String} cToken The name of the token cookie key
 * @param  {String} cTokenValue The value of the token cookie
 * @returns {undefined} No return value
 */
function setCookie (cToken, cTokenValue) {

	let d = new Date();
	d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
	let expires = "expires=" + d.toUTCString();
	document.cookie = cToken + "=" + cTokenValue + ";" + expires + ";path=/";

}
/**
 * Looks up cookie with key cToken
 * @param  {String} cToken name of cookie key
 * @returns {String} Either empty string (if it doesnt exist) or the value of the cookie
 */
function getCookie (cToken) {

	let tokenName = cToken + "=";
	let ca = document.cookie.split(";");
	for (let i = 0; i < ca.length; i++) {

		let c = ca[i];
		while (c.charAt(0) == " ") {

			c = c.substring(1);

		}
		if (c.indexOf(tokenName) == 0) {

			return c.substring(tokenName.length, c.length);

		}

	}
	return "";

}

/**
 * Gets the user accounts preferences if they have an account or a valid token
 * @param  {String} email email account for preferences
 * @returns {Object} response from server -> array of preferences
 */
async function getPrefs (email) {

	try {

		let tempToken = getCookie("Token");
		if (tempToken == undefined || tempToken == "undefined" || tempToken == "") {

			// let response = await fetch("http://localhost:8080/prefs?email=" + email);
			let response = await fetch("https://trailerscentral.herokuapp.com/prefs?email=" + email);
			let body = await response.text();

			return body;

		} else {

			// let response = await fetch("http://localhost:8080/prefs?token=" + tempToken);
			let response = await fetch("https://trailerscentral.herokuapp.com/prefs",{method:"GET",headers:{"x-access-token":tempToken}});
			let body = await response.text();

			return body;

		}

	} catch (e) {

		alert(e);

	}

}
/**
 * The regular sign out function which signs the user out of google if possible
 * @returns {undefined} returns the page back to normal viewing
 */
function signOut () {

	let auth2 = gapi.auth2.getAuthInstance();

	auth2.signOut()
		.catch(e => alert(e));

	setCookie("Token", "");

	customisePage(channels, " ");
	document.getElementById("accntImage")
		.classList.add("hide");
	let signInBtn = document.getElementById("signInBtn");
	signInBtn.innerHTML = "Sign in";
	let signOutBtn = document.getElementById("signOutBtn");
	signOutBtn.classList.add("hide");
	$("#signInBtn")
		.attr("data-target", "#accountModal");

}

$(document).ready(onJQueryReady);
/**
 * JQuery which moves the page to the top on load,<br>
 * adds the youtube iframe api script,<br>
 * assigns the topmost function of this script to the data-onsuccess attribute of the html id,<br>
 * finally links the search buttons such that if you click enter, the search is submitted
 * @returns {undefined} No return value
 */
function onJQueryReady () {

	$(document)
		.scrollTop(0);

	let tag = document.createElement("script");
	tag.id = "iframe-demo";
	tag.src = "https://www.youtube.com/iframe_api";
	let firstScriptTag = document.getElementsByTagName("script")[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	$("#googleSignIn")
		.attr("data-onsuccess", "onSignIn");

	$("#search_query_nav")
		.keyup(function (event) {

			if (event.keyCode === 13) {

				$("#searchBtn_nav")
					.click();

			}

		});

	$("#search_query_sideBar")
		.keyup(function (event) {

			if (event.keyCode === 13) {

				$("#searchBtn_nav")
					.click();

			}

		});

}

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
/**
 * Runs this function when the iframe api loads, so I can run a function on state change
 * @returns {undefined} No return value
 */
function onYouTubeIframeAPIReady () {

	for (let i = 0; i <= 20; i++) {

		new YT.Player("video" + i, {
			events: {
				"onStateChange": onPlayerStateChange
			},
			host: "https://www.youtube.com",
			origin: "https://trailerscentral.herokuapp.com"

		});

	}

}
/**
 * When the state of a video changes, this function triggers - changing size of the columns and adding the blur behind the videos on play and reverse on pause
 * @param  {Object} event event information
 * @returns {undefined} No return value -> instead updates page
 */
function onPlayerStateChange (event) {

	// on play
	if (event.data == 1) {

		document.getElementById("col" + event.target["a"]["id"].substring(5))
			.classList.remove("col-lg");
		document.getElementById("col" + event.target["a"]["id"].substring(5))
			.classList.add("col-lg-6");
		document.getElementById("col" + event.target["a"]["id"].substring(5))
			.style.zIndex = 200;
		document.getElementById("blur")
			.classList.toggle("active");
		document.getElementById("blur")
			.style.height = ($("#rows")
				.height() - 138) + "px";

	} else if (event.data == 2 || event.data == 0) {

		// on pause or stop
		document.getElementById("col" + event.target["a"]["id"].substring(5))
			.classList.remove("col-lg-6");
		document.getElementById("col" + event.target["a"]["id"].substring(5))
			.classList.add("col-lg");
		document.getElementById("col" + event.target["a"]["id"].substring(5))
			.style.zIndex = 0;
		document.getElementById("blur")
			.classList.toggle("active");
		document.getElementById("blur")
			.style.height = "0px";

	}

}

document.addEventListener("DOMContentLoaded", function () {

	regularSignIn();
	let collapseBtn = document.getElementById("sidebarCollapse");
	/**
	 * Collapses the sidebar through changing active classes
	 * @returns {undefined} No return value
	 */
	function collapse () {

		let body = document.getElementById("body");
		body.classList.toggle("resetZoom");
		body.classList.toggle("zoom");
		let sidebar = document.getElementById("sidebar");
		sidebar.classList.toggle("active");
		let footer = document.getElementById("footer");
		footer.classList.toggle("active");

	}

	collapseBtn.addEventListener("click", collapse);
	document.getElementById("signOutBtn")
		.addEventListener("click", signOut);
	/**
	 * Fetches the requested channel's trailers
	 * @param  {String} channel Name of channel
	 * @returns {Array} The response from the server -> should be array of video information from the channel provided
	 */
	async function requestChannelData (channel) {

		try {

			// let response = await fetch("http://localhost:8080/channeldata?channel=" + channel);
			let response = await fetch("https://trailerscentral.herokuapp.com/channeldata?channel=" + channel);
			let body = await response.text();

			let recents = JSON.parse(body);
			return recents;

		} catch (e) {

			alert(e);

		}

	}
	/**
	 * Fetches the recent trailers
	 * @param  {Number} page Either 1 or 2 to request which page the user is on from the JSON stored on the server
	 * @returns {Array} The response from the server -> should be array of recent trailer video information
	 */
	async function requestData (page) {

		try {

			// let response = await fetch("http://localhost:8080/recent?page=" + page);
			let response = await fetch("https://trailerscentral.herokuapp.com/recent?page=" + page);
			let body = await response.text();

			let recents = JSON.parse(body);
			return recents;

		} catch (e) {

			alert(e);

		}

	}
	/**
	 * Fetches video information for relating to the trailer for the search query
	 * @param  {string} query The search query when searching for a trailer
	 * @returns {Array} the response from the server -> should be array of video information from the search query provided - should be 4-6 in length
	 */
	async function requestSearchData (query) {

		try {

			query = encodeURIComponent(query);

			// let response = await fetch("http://localhost:8080/search?q=" + query);
			let response = await fetch("https://trailerscentral.herokuapp.com/search?q=" + query);
			let body = await response.text();

			let recents = JSON.parse(body);
			return recents;

		} catch (e) {

			alert(e);

		}

	}
	/**
	 * Uses the requested recent trailer info to update the iframes on screen
	 * @param  {Number} page -> page number to request from
	 * @param  {boolean} initial -> Is the page just loading
	 * @returns {undefined} No return value -> instead updates cards on screen
	 */
	function getRecents (page, initial) {

		requestData(page)
			.then(function (videoData) {

				if (videoData == undefined) {

					return;

				}

				if (page == 1) {

					document.getElementById("nextPage")
						.classList.remove("hide");
					document.getElementById("backPage")
						.classList.add("hide");

				} else if (page == 2) {

					document.getElementById("nextPage")
						.classList.add("hide");
					document.getElementById("backPage")
						.classList.remove("hide");

				}
				// console.log(videoData);
				for (let i = 1; i <= 20; i++) {

					if (videoData[i - 1]) {

						document.getElementById("col" + i)
							.style.display = "block";
						document.getElementById("video" + i)
							.style.display = "block";

						let frame = document.getElementById("video" + i);
						frame.src = "https://www.youtube.com/embed/" + videoData[i - 1]["id"]["videoId"] +
							// "?enablejsapi=1&origin=http://localhost:8080";
							"?enablejsapi=1";

						let title = document.getElementById("title" + i);
						title.innerHTML = videoData[i - 1]["snippet"]["title"];

					} else {

						document.getElementById("video" + i)
							.style.display = "none";

					}

				}
				if (!initial) {

					for (let i = 0; i <= 20; i++) {

						new YT.Player("video" + i, {
							events: {
								"onStateChange": onPlayerStateChange
							},
							host: "https://www.youtube.com",

						});

					}

				}

			})
			.catch(e => alert(e));

	}

	getRecents(1, true); // -> runs on load
	/**
	 * Runs get recents, when moving to the next page (page 2)<br>
	 * Moves user to top of page
	 * @returns {undefined} No return value -> instead updates page to page 2
	 */
	function nextPage () {

		$(document)
			.scrollTop(0);
		getRecents(2, false);

	}

	/**
	 * Runs get recents, when moving to the original page (page 1)<br>
	 * Moves user to top of page
	 * @returns {undefined} No return value -> instead updates page to page 1
	 */
	function backPage () {

		$(document)
			.scrollTop(0);
		getRecents(1, false);

	}

	document.getElementById("nextPage")
		.addEventListener("click", nextPage);
	document.getElementById("backPage")
		.addEventListener("click", backPage);
	/**
	 * Ran when the search button is clicked<br>
	 * Gets the value from either search box<br>
	 * Runs function to request search query from server<br>
	 * Updates videos to show search query<br>
	 * Hides other cards<br>
	 * @returns {undefined} No return value -> instead updates page to new search items
	 */
	function search () {

		let q = document.getElementById("search_query_sideBar")
			.value || document.getElementById("search_query_nav")
			.value;

		// console.log(q);
		if (q != "") {

			requestSearchData(q)
				.then(function (videoData) {

					if (videoData == undefined) {

						throw new Error("Couldn't connect to the server");

					}

					document.getElementById("nextPage")
						.classList.add("hide");
					document.getElementById("backPage")
						.classList.add("hide");
					document.getElementById("search_query_sideBar")
						.value = "";
					document.getElementById("search_query_nav")
						.value = "";
					// console.log(videoData.length);
					for (let i = 1; i <= 4; i++) {

						let frame = document.getElementById("video" + i);
						frame.src = "https://www.youtube.com/embed/" + videoData[i - 1]["id"][
							"videoId"] +
							// "?enablejsapi=1&origin=http://localhost:8080";
							"?enablejsapi=1";

						let title = document.getElementById("title" + i);
						title.innerHTML = videoData[i - 1]["snippet"]["title"];

					}
					for (let i = 5; i <= 20; i++) {

						if (document.getElementById("video" + i)) {

							document.getElementById("col" + i)
								.style.display = "none";

						}

					}

					for (let i = 1; i <= 4; i++) {

						new YT.Player("video" + i, {
							events: {
								"onStateChange": onPlayerStateChange
							}
						});

					}

				})
				.catch(e => alert(e));

		}

	}
	/**
	 * Updates page for requested channel data
	 * @param  {String} q name of channel to request data for
	 * @returns {undefined} No return value -> instead updates page to new channel trailers
	 */
	async function channel (q) {

		if (q != "") {

			requestChannelData(q)
				.then(function (videoData) {

					if (videoData == undefined) {

						throw new Error("Couldn't connect to the server");

					}

					document.getElementById("nextPage")
						.classList.add("hide");
					document.getElementById("backPage")
						.classList.add("hide");
					// console.log(videoData);
					for (let i = 1; i <= 20; i++) {

						if (document.getElementById("video" + i)) {

							document.getElementById("col" + i)
								.style.display = "block";

							let frame = document.getElementById("video" + i);
							frame.src = "https://www.youtube.com/embed/" + videoData[i - 1]["id"][
								"videoId"] +
								// "?enablejsapi=1&origin=http://localhost:8080";
								"?enablejsapi=1";

							let title = document.getElementById("title" + i);
							title.innerHTML = videoData[i - 1]["snippet"]["title"];

						}

					}
					for (let i = 0; i <= 20; i++) {

						new YT.Player("video" + i, {
							events: {
								"onStateChange": onPlayerStateChange
							},
							host: "https://www.youtube.com",

						});

					}

				})
				.catch(e => alert(e));

		}

	}

	// links search function with search btns
	document.getElementById("searchBtn_nav")
		.addEventListener("click", search);
	document.getElementById("searchBtn_sideBar")
		.addEventListener("click", search);


	// links channel buttons with corresponding channel function -> called with anonymous function
	document.getElementById("Disney")
		.addEventListener("click", function () {

			channel("Disney");

		});
	document.getElementById("Pixar")
		.addEventListener("click", function () {

			channel("Disney-Pixar");

		});
	document.getElementById("Marvel")
		.addEventListener("click", function () {

			channel("Marvel");

		});
	document.getElementById("DC")
		.addEventListener("click", function () {

			channel("DC");

		});
	document.getElementById("GoT")
		.addEventListener("click", function () {

			channel("GoT");

		});
	document.getElementById("Netflix")
		.addEventListener("click", function () {

			channel("Netflix");

		});
	document.getElementById("Prime")
		.addEventListener("click", function () {

			channel("Prime");

		});
	document.getElementById("FOX")
		.addEventListener("click", function () {

			channel("FOX");

		});
	document.getElementById("Paramount")
		.addEventListener("click", function () {

			channel("Paramount");

		});
	document.getElementById("WB")
		.addEventListener("click", function () {

			channel("WarnerBros");

		});
	document.getElementById("Sony")
		.addEventListener("click", function () {

			channel("Sony");

		});
	document.getElementById("Lionsgate")
		.addEventListener("click", function () {

			channel("Lionsgate");

		});
	document.getElementById("MGM")
		.addEventListener("click", function () {

			channel("MGM");

		});
	document.getElementById("Home")
		.addEventListener("click", function () {

			getRecents(1,false);

		});


	/**
	 * Register function - ran on button click<br>
	 * Takes information from registration form,<br>
	 * Checks the information - ie for empty input boxes and whether the passwords match etc<br>
	 * Runs check email - returns a true or false for whether the account exists on the server<br>
	 * If the account doesn't exist then it checks the users password,<br>
	 * Posts the information to the server on /register - with the given form data<br>
	 * $.post is used to post the data to the server without changing the access token in the header<br>
	 * The page then customises to suit the signed in user<br>
	 * If the account does exist - this updates in the header to show this and the function returns
	 * @returns {undefined} No return value -> instead updates page with given customise form data
	 */
	async function register () {

		let title = document.getElementById("RegTitle");
		let fname = document.getElementById("RegfName");
		let lname = document.getElementById("ReglName");
		let email = document.getElementById("RegEmail");
		let password = document.getElementById("RegPassword");
		let confPwd = document.getElementById("RegConfPWord");

		if (email.value == "" || password.value == "" || confPwd.value == "") {

			title.innerHTML = "Create Account - Some of the required fields are missing:";
			return;

		}

		if (confPwd.value != password.value) {

			title.innerHTML = "Create Account - The passwords don't match";
			return;

		}

		checkEmail(email.value, title)
			.then(function (exists) {

				if (exists == undefined) {

					return;

				}

				if (!exists) {

					if (checkPassword(password)) {

						let selectedChannels = $("#channelSelect")
							.val() || channels;

						// $.post("http://localhost:8080/register",{fName: fname.value,lName: lname.value,email: email.value, password:password.value, prefs:selectedChannels});
						$.post("https://trailerscentral.herokuapp.com/register", { fName: fname.value,
							lName: lname.value, email: email.value, password: password.value,
							prefs: selectedChannels }),function (resp) {

							resp = JSON.parse(resp);
							setCookie("Token", resp["token"]);

						};

						email.value = "";
						password.value = "";
						confPwd.value = "";
						title.innerHTML = "Create Account";
						lname.value = "";
						updateOnSignIn();
						customisePage(selectedChannels, fname.value);
						fname.value = "";


					} else {

						title.innerHTML =
							"Create Account - The password doesn't meet the requirements" || "";

					}

				} else {

					title.innerHTML = "Create Account - The account already exists" || "";
					email.value = "";

				}

			})
			.catch(e => alert(e));

	}

	document.getElementById("registerBtn")
		.addEventListener("click", register);
	/**
	 * Gets the form data, does a quick check<br>
	 * Then posts the data to the server, which provides a JSON as a response,<br>
	 * result["exists"] is used to see whether the account exists or not (for more custom error messages),<br>
	 * result["correctPassword"] provides a boolean with such information,<br>
	 * result["token"] provides the access token to use when making other post requests to the server<br>
	 * Page then customises appropriately
	 * @returns {undefined} No return value -> instead updates page with accounts customised data
	 */
	async function logIn () {

		let email = document.getElementById("email");
		let pword = document.getElementById("pword");
		let title = document.getElementById("logInTitle");
		if (email.value == "" || pword.value == "") {

			return;

		} else {

			// $.post("http://localhost:8080/login",{email: email.value, pword:pword.value},function (result) {
			$.post("https://trailerscentral.herokuapp.com/login", { email: email.value, pword: pword
				.value },
			function (result) {


				if (result["exists"] && result["correctPassword"]) {

					email.value = "";
					pword.value = "";
					title.innerHTML = "Log in";
					updateOnSignIn();
					customisePage(result["prefs"], result["fName"]);
					setCookie("Token", result["token"]);

				} else if (result["exists"] && !result["correctPassword"]) {

					title.innerHTML = "Log in - The password is incorrect for this account";

				} else if (!result["exists"] && !result["correctPassword"]) {

					title.innerHTML = "Log in - The account doesn't exist";

				}

			});

		}

	}
	document.getElementById("logInBtn")
		.addEventListener("click", logIn);
	/**
	 * When the user is signed in - ie has a valid token<br>
	 * They can update their preferences - this sends their new preferences to my server<br>
	 * $.ajax is used to post the preferences ($.ajax is used instead of $.post as I need to send my access token in the header of the request)
	 * @returns {undefined} No return value -> instead updates page with new prefs data
	 */
	async function updatePrefs () {

		let title = document.getElementById("prefTitle");

		if (getCookie("Token") == "") {

			return;

		} else {

			let newPrefs = $("#updateChannelSelect")
				.val() || channels;
			$.ajax({
				// url: "http://localhost:8080/prefs",
				url: "https://trailerscentral.herokuapp.com/prefs",
				type: "post",
				// "x-access-token":getCookie("Token"),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"x-access-token": getCookie(
						"Token") // If your header name has spaces or any other char not appropriate
				},
				data: {
					prefs: newPrefs
				},
				dataType: "json",
				/**
				 * Customises page with new prefs if successful - if unsuccessful - it alerts the user
				 * @param  {Object} result JSON response from server
				 * @returns {undefined} No return value -> instead updates page with new prefs data
				 */
				success: function (result) {

					if (result["success"]) {

						title.innerHTML = "Log in";
						customisePage(newPrefs, result["fName"]);

					} else {

						alert("unable to update preferences");

					}

				}
			});

		}

	}
	document.getElementById("updatePrefsBtn")
		.addEventListener("click", updatePrefs);

	document.getElementById("deleteAccountBtn").addEventListener("click",function () {

		document.getElementById("ConfBtns").classList.remove("hide");

	});


	/**
	 * Account is deleted if the user is sure, if not the confirmations are hidden
	 * @param  {Boolean} sure Boolean value for whether the user is sure to delete their account
	 * @returns {undefined} No return value -> instead updates page on deletion
	 */
	function deleteConf (sure) {

		if (sure) {

			// post delete
			$.ajax({
				// url: "http://localhost:8080/delete",
				url: "https://trailerscentral.herokuapp.com/deleteaccount",
				type: "post",
				headers: {
					"x-access-token": getCookie("Token") // If your header name has spaces or any other char not appropriate
				},
				/**
				 * Customises page with all prefs if successful - if unsuccessful - it alerts the user and page remains the same
				 * @param  {Object} result JSON response from server
				 * @returns {undefined} No return value -> instead updates page with new prefs data
				 */
				success: function (result) {

					if (result["success"]) {

						signOut();

					} else {

						alert("unable to delete account");

					}

				}
			});

		}
		else {

			document.getElementById("ConfBtns").classList.add("hide");

		}

	}

	document.getElementById("deleteAccountYesConfBtn").addEventListener("click",function () {

		deleteConf(true);

	});
	document.getElementById("deleteAccountNoConfBtn").addEventListener("click",function () {

		deleteConf(false);

	});

});
/**
 * Takes inputed password and checks its string for whether it contains 6-20 letters, and must contain at least one letter, capital letter, and number
 * @param  {String} input string password in password box
 * @returns {boolean} boolean for whether password is ok or not
 */
function checkPassword (input) {

	let passExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
	if (passExp.test(input.value)) {

		return true;

	} else {

		return false;

	}

}
/**
 * Takes inputed email and checks whether it is a well-formed email with regex<br>
 * If so the email is sent to the server with a fetch method, to check whether the account already exists in the server -> sends back JSON with true or false aspect<br>
 * Otherwise the title is updated with to inform the user of what has gone wrong
 * @param  {Object} input the inputbox of the email
 * @param  {Object} title the header html box
 * @returns {Object} JSON of whether the account exists
 */
async function checkEmail (input, title) {

	// disabled as the the /" captures " (which shouldnt be in email) when regexing the email
	// eslint-disable-next-line no-useless-escape
	let emailExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (input.match(emailExp)) {

		// check whether email is linked to account on server

		let email = encodeURIComponent(input);
		try {

			// let free = await fetch("http://localhost:8080/checkAccount?email=" + email);
			let free = await fetch("https://trailerscentral.herokuapp.com/checkAccount?email=" + email);
			free = await free.text();
			free = JSON.parse(free);
			return free["exists"];

		} catch (e) {

			alert(e);

		}

	} else {

		title.innerHTML = "Create Account - The email is incorrect" || "";

	}

}

// ///////////////////////////// -> did have this script to dynamically update the page on scroll but decided to remove it for memory reasons
// /////////////////////////////

// function createVideoRow (num) {

// 	let row = document.createElement("div");
// 	row.classList.add("row");
// 	row.classList.add("cardRow");
// 	row.classList.add("align-items-stretch");
// 	row.id = "rowForCards" + num + 1;

// 	for (let i = 0; i < 4; i++) {

// 		let cardNum = num * 4 + i + 1;
// 		let card = createCard(cardNum);
// 		row.appendChild(card);

// 	}

// 	document.getElementById("rows")
// 		.appendChild(row);

// 	// requestRecent().then(function (videoData) {

// 	for (let i = 0; i < 4; i++) {

// 		let videoNum = num * 4 + i + 1;
// 		new YT.Player("video" + videoNum, {
// 			events: {
// 				"onStateChange": onPlayerStateChange
// 			}
// 		});

// 		let frame = document.getElementById("video" + videoNum);
// 		frame.src = "https://www.youtube.com/embed/" + recents[videoNum - 1]["id"]["videoId"] +
// 			"?enablejsapi=1&origin=http://localhost:8080";

// 		let title = document.getElementById("title" + videoNum);
// 		title.innerHTML = recents[videoNum - 1]["snippet"]["title"];

// 	}

// 	// });

// 	document.getElementById("blur")
// 		.style.height = ($("#rows")
// 			.height() + 19) + "px";

// }

// function createCard (videoNum) {

// 	let col = document.createElement("div");
// 	col.classList.add("col-lg");
// 	col.classList.add("col-sm-6");
// 	col.classList.add("colTrans");
// 	col.id = "col" + videoNum;
// 	let card = document.createElement("div");
// 	card.classList.add("card");

// 	let videoDiv = document.createElement("div");
// 	videoDiv.classList.add("embed-responsive");
// 	videoDiv.classList.add("embed-responsive-16by9");

// 	let video = document.createElement("iframe");
// 	video.setAttribute("allowfullscreen", "");
// 	// video.setAttribute("src","https://www.youtube.com/embed/z-fVkkAaRfw?enablejsapi=1");
// 	video.classList.add("embed-responsive-item");
// 	video.id = "video" + videoNum;

// 	let cardBody = document.createElement("card-body");
// 	cardBody.classList.add("card-body");

// 	let title = document.createElement("h6");
// 	title.classList.add("card-title");
// 	title.appendChild(document.createTextNode("title"));
// 	title.id = "title" + videoNum;

// 	let likeBtn = document.createElement("button");
// 	likeBtn.appendChild(document.createTextNode("Like Button"));

// 	cardBody.appendChild(title);
// 	cardBody.appendChild(likeBtn);

// 	videoDiv.appendChild(video);

// 	card.appendChild(videoDiv);
// 	card.appendChild(cardBody);

// 	col.appendChild(card);

// 	return col;

// }
/**
 * Updates page to only include liked channels, and adds name after welcome title in the sidebar
 * @param  {Array} selectedChannels array of channels the user likes
 * @param  {String} fname Name of user
 * @returns {undefined} No return value -> instead updates page with given new data
 */
function customisePage (selectedChannels, fname) {

	$("#accountModal")
		.modal("hide");
	$("#prefsModal")
		.modal("hide");

	if (selectedChannels.length >= 1) {

		for (let i = 0; i < channels.length; i++) {

			if (selectedChannels.includes(channels[i])) {

				// document.getElementById(channels[i]).style.display = "block";
				document.getElementById(channels[i])
					.parentElement.classList.remove("hide");
				document.getElementById("pref" + channels[i])
					.selected = true;

			} else {

				// document.getElementById(channels[i]).style.display = "none";
				document.getElementById(channels[i])
					.parentElement.classList.add("hide");
				document.getElementById("pref" + channels[i])
					.selected = false;
				// document.getElementById(channels[i]).style.height = "0px";

			}

		}

	}

	let accntName = document.getElementById("accntName");
	if (accntName.innerHTML == "-" || fname == " " || accntName.innerHTML == " ") {

		document.getElementById("accntName")
			.innerHTML = fname;
		document.getElementById("accntName")
			.classList.remove("hide");

	}

}
/**
 * When user signs in - this function runs<br>
 * Updates the sign in button and what it does<br>
 * Unhides the sign out btn
 * @returns {undefined} No return value -> instead updates sign in button's data and links
 */
function updateOnSignIn () {

	let signInBtn = document.getElementById("signInBtn");
	signInBtn.innerHTML = "Preferences";
	let signOutBtn = document.getElementById("signOutBtn");
	signOutBtn.classList.remove("hide");
	$("#signInBtn")
		.attr("data-target", "#prefsModal");

}
