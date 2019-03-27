/* global gapi recents*/

let recents = "";
let channels = ["Disney","Pixar","Marvel","DC","GoT","Netflix", "Prime", "FOX", "Paramount","WB", "Sony", "Lionsgate", "MGM"];

function onSignIn (googleUser) {

	let profile = googleUser.getBasicProfile();
	console.log("ID: " + profile.getId()); // Do not send to your backend! Use an ID token instead.
	console.log("Name: " + profile.getName());
	let accntText = document.getElementById("accntName");
	accntText.textContent = profile.getName();
	console.log("Image URL: " + profile.getImageUrl());
	console.log("Email: " + profile.getEmail()); // This is null if the 'email' scope is not present.

	// send info to server and handle there

}

function signOut () { // add this with DOM

	// same here, ping server, then ping back with sign out
	let auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut()
		.then(function () {

			console.log("User signed out.");

		});

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

		// let totalRows = 3;
		// $(window).scroll(function () {

		// 	if (document.getElementById("col5").style.display != "none") {

		// 		if($(window).scrollTop() + $(window).height() == $(document).height()) {

		// 			// add more divs with videos at this point, leaving this point in the page to no longer be at the bottom
		// 			if (totalRows < 6) {

		// 				// createVideoRow(totalRows);
		// 				// totalRows++;

		// 			}

		// 		}

		// 	}

		// });

		$("#search_query")
			.keyup(function (event) {

				if (event.keyCode === 13) {

					$("#searchBtn")
						.click();

				}

			});

	});

function onYouTubeIframeAPIReady () {

	for (let i = 0; i <= 24; i++) {

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
				.height() + 19) + "px";

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
			.style.height = ($("#rows")
				.height()) + "px";

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

	async function requestData () {

		try {

			let response = await fetch("http://localhost:8080/recent");
			let body = await response.text();
			console.log("called recent fetch");
			let recents = JSON.parse(body);
			return recents;

		} catch (e) {

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

	function getRecents () {

		requestData()
			.then(function (videoData) {

				recents = videoData;
				console.log(videoData);
				for (let i = 1; i <= 24; i++) {

					document.getElementById("col" + i)
						.style.display = "block";

					let frame = document.getElementById("video" + i);
					frame.src = "https://www.youtube.com/embed/" + videoData[i - 1]["id"]["videoId"] +
						"?enablejsapi=1&origin=http://localhost:8080";

					let title = document.getElementById("title" + i);
					title.innerHTML = videoData[i - 1]["snippet"]["title"];

				}

			});

	}

	getRecents();

	async function search () {

		let q = document.getElementById("search_query")
			.value;

		console.log(q);
		if (q != "") {

			requestSearchData(q)
				.then(function (videoData) {

					try {

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

					} catch (err) {

						alert(err);

					}

				});

		}

	}

	async function channel (q) {

		if (q != "") {

			requestChannelData(q)
				.then(function (videoData) {

					try {

						console.log(videoData);
						for (let i = 1; i <= 24; i++) {

							if (document.getElementById("video" + i)) {

								let frame = document.getElementById("video" + i);
								frame.src = "https://www.youtube.com/embed/" + videoData[i - 1]["id"][
									"videoId"] +
									"?enablejsapi=1&origin=http://localhost:8080";

								let title = document.getElementById("title" + i);
								title.innerHTML = videoData[i - 1]["snippet"]["title"];

							}

						}

					} catch (err) {

						alert(err);

					}

				});

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
		.addEventListener("click", getRecents);

	let gSignOut = document.getElementById("gSignOut");
	gSignOut.addEventListener("click",signOut);


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

				if (!exists) {

					if (checkPassword(password)) {

						let selectedChannels = $("#channelSelect").val();
						console.log("post results");
						$.post("http://localhost:8080/register",{fName: fname.value,lName: lname.value,email: email.value, password:password.value, prefs:selectedChannels});
						customisePage(selectedChannels,fname.value);

					}
					else {

						title.innerHTML = "Create Account - The password doesn't meet the requirements";

					}

				}

				else {

					title.innerHTML = "Create Account - The account already exists";
					email.value = "";

				}

			});


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
		let free = await fetch("http://localhost:8080/checkAccount?email=" + email);

		free = await free.text();
		free = JSON.parse(free);
		return free["exists"];

	}
	else{

		title.innerHTML = "Create Account - The email is incorrect";

	}

}

function customisePage (selectedChannels,fname) {

	$("#accountModal").modal("hide");
	if (selectedChannels.length >= 1) {

		for (let i = 0;i < channels.length;i++) {

			if (selectedChannels.includes(channels[i])) {

				//document.getElementById(channels[i]).style.display = "block";
				document.getElementById(channels[i]).parentElement.classList.remove("hide");

			}
			else {

				//document.getElementById(channels[i]).style.display = "none";
				document.getElementById(channels[i]).parentElement.classList.add("hide");
				//document.getElementById(channels[i]).style.height = "0px";

			}

		}

	}
	document.getElementById("accntName").innerHTML = fname + " ";

}

// /////////////////////////////
// /////////////////////////////


function createVideoRow (num) {

	let row = document.createElement("div");
	row.classList.add("row");
	row.classList.add("cardRow");
	row.classList.add("align-items-stretch");
	row.id = "rowForCards" + num + 1;

	for (let i = 0; i < 4; i++) {

		let cardNum = num * 4 + i + 1;
		let card = createCard(cardNum);
		row.appendChild(card);

	}

	document.getElementById("rows")
		.appendChild(row);

	// requestRecent().then(function (videoData) {

	for (let i = 0; i < 4; i++) {

		let videoNum = num * 4 + i + 1;
		new YT.Player("video" + videoNum, {
			events: {
				"onStateChange": onPlayerStateChange
			}
		});

		let frame = document.getElementById("video" + videoNum);
		frame.src = "https://www.youtube.com/embed/" + recents[videoNum - 1]["id"]["videoId"] +
			"?enablejsapi=1&origin=http://localhost:8080";

		let title = document.getElementById("title" + videoNum);
		title.innerHTML = recents[videoNum - 1]["snippet"]["title"];

	}

	// });

	document.getElementById("blur")
		.style.height = ($("#rows")
			.height() + 19) + "px";

}

function createCard (videoNum) {

	let col = document.createElement("div");
	col.classList.add("col-lg");
	col.classList.add("col-sm-6");
	col.classList.add("colTrans");
	col.id = "col" + videoNum;
	let card = document.createElement("div");
	card.classList.add("card");

	let videoDiv = document.createElement("div");
	videoDiv.classList.add("embed-responsive");
	videoDiv.classList.add("embed-responsive-16by9");

	let video = document.createElement("iframe");
	video.setAttribute("allowfullscreen", "");
	// video.setAttribute("src","https://www.youtube.com/embed/z-fVkkAaRfw?enablejsapi=1");
	video.classList.add("embed-responsive-item");
	video.id = "video" + videoNum;

	let cardBody = document.createElement("card-body");
	cardBody.classList.add("card-body");

	let title = document.createElement("h6");
	title.classList.add("card-title");
	title.appendChild(document.createTextNode("title"));
	title.id = "title" + videoNum;

	let likeBtn = document.createElement("button");
	likeBtn.appendChild(document.createTextNode("Like Button"));

	cardBody.appendChild(title);
	cardBody.appendChild(likeBtn);

	videoDiv.appendChild(video);

	card.appendChild(videoDiv);
	card.appendChild(cardBody);

	col.appendChild(card);

	return col;

}
