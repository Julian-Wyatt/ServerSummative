let channels = ["Disney","Pixar","Marvel","DC","GoT","Netflix", "Prime", "FOX", "Paramount","WB", "Sony", "Lionsgate", "MGM"];

// disabled as it is defined in html and in JQuery section below approx line 77
// eslint-disable-next-line no-unused-vars
function onSignIn (googleUser) {

	let profile = googleUser.getBasicProfile();
	console.log("ID: " + profile.getId()); // Do not send to your backend! Use an ID token instead.
	console.log("Name: " + profile.getName());
	// let accntText = document.getElementById("accntName");
	// accntText.textContent = profile.getName();
	console.log("Image URL: " + profile.getImageUrl());
	let accntImage = document.getElementById("accntImage");
	accntImage.src = profile.getImageUrl();
	accntImage.classList.remove("hide");
	console.log("Email: " + profile.getEmail()); // This is null if the 'email' scope is not present.


	getPrefs(profile.getEmail())
		.then(function (response) {

			if (response == undefined) {

				return;

			}
			document.getElementById("prefEmail").value = profile.getEmail();
			updateOnSignIn();
			customisePage(response,profile.getName());

		}).catch(e=>alert(e));

	// send info to server and handle there

}

async function getPrefs (email) {

	try {

		let response = await fetch("http://localhost:8080/prefs?email=" + email);
		let body = await response.text();
		console.log(body);
		return body;

	}
	catch(e) {

		alert(e);

	}

}

function signOut () { // add this with DOM

	// same here, ping server, then ping back with sign out
	let auth2 = gapi.auth2.getAuthInstance();

	auth2.signOut()
		.then(function () {

			console.log("User signed out.");

		}).catch(e=>alert(e));


	customisePage(channels," ");
	document.getElementById("accntImage").classList.add("hide");
	let signInBtn = document.getElementById("signInBtn");
	signInBtn.innerHTML = "Sign in";
	let signOutBtn = document.getElementById("signOutBtn");
	signOutBtn.classList.add("hide");
	$("#signInBtn").attr("data-target","#accountModal");

}

$(document)
	.ready(function () {

		$(document)
			.scrollTop(0);


		let tag = document.createElement("script");
		tag.id = "iframe-demo";
		tag.src = "https://www.youtube.com/iframe_api";
		let firstScriptTag = document.getElementsByTagName("script")[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		$("#googleSignIn").attr("data-onsuccess","onSignIn");

		$("#search_query")
			.keyup(function (event) {

				if (event.keyCode === 13) {

					$("#searchBtn")
						.click();

				}

			});

	});

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
function onYouTubeIframeAPIReady () {

	for (let i = 0; i <= 20; i++) {

		new YT.Player("video" + i, {
			events: {
				"onStateChange": onPlayerStateChange
			},
			host: "https://www.youtube.com",

		});

	}

}


function onPlayerStateChange (event) {

	// changeBorderColor(event.data);

	console.log("state change");
	// here do the required css.
	if (event.data == 1) {

		// document.getElementById("rows").classList.add("blur");

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

	let collapseBtn = document.getElementById("sidebarCollapse");

	function collapse () {

		let sidebar = document.getElementById("sidebar");
		sidebar.classList.toggle("active");
		let footer = document.getElementById("footer");
		footer.classList.toggle("active");

	}

	collapseBtn.addEventListener("click", collapse);
	document.getElementById("signOutBtn").addEventListener("click",signOut);

	async function requestChannelData (channel) {

		try {

			let response = await fetch("http://localhost:8080/channeldata?channel=" + channel);
			let body = await response.text();
			console.log("called recent fetch");
			let recents = JSON.parse(body);
			return recents;

		} catch (e) {

			alert(e);

		}

	}

	async function requestData (page) {

		try {

			let response = await fetch("http://localhost:8080/recent?page=" + page);
			let body = await response.text();
			console.log("called recent fetch");
			let recents = JSON.parse(body);
			return recents;

		} catch (e) {

			console.log("here");
			alert(e);

		}

	}

	async function requestSearchData (query) {

		try {

			console.log(query);

			let response = await fetch("http://localhost:8080/search?q=" + query);
			let body = await response.text();
			console.log("called search fetch");
			let recents = JSON.parse(body);
			return recents;

		} catch (e) {

			alert(e);

		}

	}

	function getRecents (page,initial) {

		requestData(page)
			.then(function (videoData) {

				if (videoData == undefined) {

					return;

				}

				if (page == 1) {

					document.getElementById("nextPage").classList.remove("hide");
					document.getElementById("backPage").classList.add("hide");

				}
				else if (page == 2) {

					document.getElementById("nextPage").classList.add("hide");
					document.getElementById("backPage").classList.remove("hide");

				}
				console.log(videoData);
				for (let i = 1; i <= 20; i++) {

					if (videoData[i - 1]) {

						document.getElementById("col" + i)
							.style.display = "block";

						let frame = document.getElementById("video" + i);
						frame.src = "https://www.youtube.com/embed/" + videoData[i - 1]["id"]["videoId"] +
						"?enablejsapi=1&origin=http://localhost:8080";

						let title = document.getElementById("title" + i);
						title.innerHTML = videoData[i - 1]["snippet"]["title"];

					}
					else{

						document.getElementById("col" + i)
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

	getRecents(1,true);

	function nextPage () {

		$(document)
			.scrollTop(0);
		getRecents(2,false);

	}
	function backPage () {

		$(document)
			.scrollTop(0);
		getRecents(1,false);

	}


	document.getElementById("nextPage").addEventListener("click",nextPage);
	document.getElementById("backPage").addEventListener("click",backPage);

	function search () {

		let q = document.getElementById("search_query")
			.value;

		console.log(q);
		if (q != "") {

			requestSearchData(q)
				.then(function (videoData) {

					if (videoData == undefined) {

						throw new Error("Couldn't connect to the server");

					}

					document.getElementById("nextPage").classList.add("hide");
					document.getElementById("backPage").classList.add("hide");
					document.getElementById("search_query").value = "";
					console.log(videoData);
					for (let i = 1; i <= 4; i++) {

						let frame = document.getElementById("video" + i);
						frame.src = "https://www.youtube.com/embed/" + videoData[i - 1]["id"][
							"videoId"] +
							"?enablejsapi=1&origin=http://localhost:8080";

						let title = document.getElementById("title" + i);
						title.innerHTML = videoData[i - 1]["snippet"]["title"];

					}
					for (let i = 5; i <= 24; i++) {

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


				}).catch(e=>alert(e));

		}

	}

	async function channel (q) {

		if (q != "") {

			requestChannelData(q)
				.then(function (videoData) {

					if (videoData == undefined) {

						throw new Error("Couldn't connect to the server");

					}


					document.getElementById("nextPage").classList.add("hide");
					document.getElementById("backPage").classList.add("hide");
					console.log(videoData);
					for (let i = 1; i <= 20; i++) {

						if (document.getElementById("video" + i)) {

							document.getElementById("col" + i)
								.style.display = "block";

							let frame = document.getElementById("video" + i);
							frame.src = "https://www.youtube.com/embed/" + videoData[i - 1]["id"][
								"videoId"] +
								"?enablejsapi=1&origin=http://localhost:8080";

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


				}).catch(e=>alert(e));

		}

	}

	document.getElementById("searchBtn")
		.addEventListener("click", search);
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

			getRecents(1);

		});

	// let gSignOut = document.getElementById("gSignOut");
	// gSignOut.addEventListener("click",signOut);


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

		checkEmail(email,title)
			.then(function (exists) {

				if (exists == undefined) {

					return;

				}

				if (!exists) {

					if (checkPassword(password)) {

						let selectedChannels = $("#channelSelect").val();
						console.log("post results");
						$.post("http://localhost:8080/register",{fName: fname.value,lName: lname.value,email: email.value, password:password.value, prefs:selectedChannels});
						email.value = "";
						password.value = "";
						confPwd.value = "";
						title.innerHTML = "Create Account";
						lname.value = "";
						customisePage(selectedChannels,fname.value);
						fname.value = "";


					}
					else {

						title.innerHTML = "Create Account - The password doesn't meet the requirements";

					}

				}

				else {

					title.innerHTML = "Create Account - The account already exists";
					email.value = "";

				}

			}).catch(e=>alert(e));


	}

	document.getElementById("registerBtn").addEventListener("click",register);


	async function logIn () {

		let email = document.getElementById("email");
		let pword = document.getElementById("pword");
		let title = document.getElementById("logInTitle");
		if (email.value == "" || pword.value == "") {

			return;

		}
		else {

			$.post("http://localhost:8080/login",{email: email.value, pword:pword.value},function (result) {

				if (result["exists"] && result["correctPassword"]) {

					console.log("logged in");
					console.log(result);
					document.getElementById("prefEmail").value = email.value;
					email.value = "";
					pword.value = "";
					title.innerHTML = "Log in";
					updateOnSignIn();
					customisePage(result["prefs"],result["fName"]);

				}
				else if (result["exists"] && !result["correctPassword"]) {

					title.innerHTML = "Log in - The password is incorrect for this account";

				}
				else if (!result["exists"] && !result["correctPassword"]) {

					title.innerHTML = "Log in - The account doesn't exist";

				}

			});


		}

	}
	document.getElementById("logInBtn").addEventListener("click",logIn);

	async function updatePrefs () {

		let email = document.getElementById("prefEmail");
		let pword = document.getElementById("prefPword");
		let title = document.getElementById("prefTitle");
		console.log(email.value);
		if (email.value == "" || pword.value == "") {

			return;

		}


		else {

			$.post("http://localhost:8080/prefs",{email: email.value, pword:pword.value,prefs:$("#updateChannelSelect").val()},function (result) {

				if (result["success"]) {

					console.log("logged in");
					console.log(result);
					pword.value = "";
					title.innerHTML = "Log in";
					customisePage($("#updateChannelSelect").val(),result["fName"]);

				}
				else if (result["exists"] && !result["correctPassword"]) {

					title.innerHTML = "Preferences - The password is incorrect for this account";

				}
				else if (!result["exists"] && !result["correctPassword"]) {

					title.innerHTML = "Preferences - The account doesn't exist";

				}

			});


		}

	}
	document.getElementById("updatePrefsBtn").addEventListener("click",updatePrefs);


});


function checkPassword (input) {

	let passExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
	if (passExp.test(input.value)) {

		console.log("password ok");
		return true;

	}
	else {

		return false;

	}

}
async function checkEmail (input,title) {

	// disabled as the the /" captures " (which shouldnt be in email) when regexing the email
	// eslint-disable-next-line no-useless-escape
	let emailExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (input.value.match(emailExp)) {

		// check whether email is linked to account on server
		console.log("email ok");
		let email = encodeURIComponent(input.value);
		try {

			let free = await fetch("http://localhost:8080/checkAccount?email=" + email);

			free = await free.text();
			free = JSON.parse(free);
			return free["exists"];

		}

		catch(e) {

			alert(e);

		}

	}
	else{

		title.innerHTML = "Create Account - The email is incorrect";

	}

}

function customisePage (selectedChannels,fname) {

	$("#accountModal").modal("hide");
	$("#prefsModal").modal("hide");
	if (selectedChannels.length >= 1) {

		for (let i = 0;i < channels.length;i++) {

			if (selectedChannels.includes(channels[i])) {

				// document.getElementById(channels[i]).style.display = "block";
				document.getElementById(channels[i]).parentElement.classList.remove("hide");
				document.getElementById("pref" + channels[i]).selected = true;

			}
			else {

				// document.getElementById(channels[i]).style.display = "none";
				document.getElementById(channels[i]).parentElement.classList.add("hide");
				document.getElementById("pref" + channels[i]).selected = false;
				// document.getElementById(channels[i]).style.height = "0px";

			}

		}

	}
	let accntName = document.getElementById("accntName");
	if (accntName.innerHTML == "-" || fname == " " || accntName.innerHTML == " ") {

		document.getElementById("accntName").innerHTML = fname;
		document.getElementById("accntName").classList.remove("hide");

	}

}


// /////////////////////////////
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


function updateOnSignIn () {

	let signInBtn = document.getElementById("signInBtn");
	signInBtn.innerHTML = "Preferences";
	let signOutBtn = document.getElementById("signOutBtn");
	signOutBtn.classList.remove("hide");
	$("#signInBtn").attr("data-target","#prefsModal");


}
