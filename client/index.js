/* global gapi */

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

function signOut () {		// add this with DOM

	// same here, ping server, then ping back with sign out
	let auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {

		console.log("User signed out.");

	});

}

$(document).ready(function () {

	let tag = document.createElement("script");
	tag.id = "iframe-demo";
	tag.src = "https://www.youtube.com/iframe_api";
	let firstScriptTag = document.getElementsByTagName("script")[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


	let totalRows = 3;
	$(window).scroll(function () {

		if($(window).scrollTop() + $(window).height() == $(document).height()) {

			// add more divs with videos at this point, leaving this point in the page to no longer be at the bottom
			if (totalRows < 6) {

				createVideoRow(totalRows);
				totalRows++;


			}

		}

	});

});

function onYouTubeIframeAPIReady () {


	for (let i = 1 ; i <= 12;i++) {

		new YT.Player("video" + i, {
			events: {
				"onStateChange": onPlayerStateChange
			}
		});

	}


}

function onPlayerStateChange (event) {

	// changeBorderColor(event.data);


	// here do the required css.
	if (event.data == 1) {

		// document.getElementById("rows").classList.add("blur");


		document.getElementById("col" + event.target["a"]["id"].substring(5)).classList.remove("col-lg");
		document.getElementById("col" + event.target["a"]["id"].substring(5)).classList.add("col-lg-6");
		document.getElementById("col" + event.target["a"]["id"].substring(5)).style.zIndex = 200;
		document.getElementById("blur").classList.toggle("active");
		document.getElementById("blur").style.height = ($("#rows").height() + 19) + "px";

	}
	else if (event.data == 2 || event.data == 0) {

		document.getElementById("col" + event.target["a"]["id"].substring(5)).classList.remove("col-lg-6");
		document.getElementById("col" + event.target["a"]["id"].substring(5)).classList.add("col-lg");
		document.getElementById("col" + event.target["a"]["id"].substring(5)).style.zIndex = 0;
		document.getElementById("blur").classList.toggle("active");
		document.getElementById("blur").style.height = ($("#rows").height() + 19) + "px";
	}

}


async function requestRecent () {

	try{

		let response = await fetch("http://localhost:8080/requestrecent");
		let body = await response.text();

		let recents = JSON.parse(body);
		return recents;

	}
	catch (e) {

		alert(e);

	}

}


document.addEventListener("DOMContentLoaded", function () {


	let collapseBtn = document.getElementById("sidebarCollapse");
	function collapse () {

		let sidebar = document.getElementById("sidebar");
		sidebar.classList.toggle("active");

	}

	collapseBtn.addEventListener("click",collapse);

	async function recent () {

		try{

			let response = await fetch("http://localhost:8080/recent");
			let body = await response.text();

			let recents = JSON.parse(body);
			return recents;

		}
		catch (e) {

			alert(e);

		}

	}


	recent().then(function (videoData) {


		console.log(videoData);
		for (let i = 1;i <= 12;i++) {

			let frame = document.getElementById("video" + i);
			frame.src = "https://www.youtube.com/embed/" + videoData["data"]["items"][i - 1]["id"]["videoId"] + "?enablejsapi=1";

			let title = document.getElementById("title" + i);
			title.innerHTML = videoData["data"]["items"][i - 1]["snippet"]["title"];

		}

	});

	let gSignOut = document.getElementById("gSignOut");
	gSignOut.addEventListener("click",signOut);


});


function createVideoRow  (num) {

	let row = document.createElement("div");
	row.classList.add("row");
	row.classList.add("cardRow");
	row.classList.add("align-items-stretch");
	row.id = "rowForCards" + num + 1;

	for (let i = 0; i < 4;i++) {

		let cardNum = num * 4 + i + 1;
		let card = createCard(cardNum);
		row.appendChild(card);


	}


	document.getElementById("rows").appendChild(row);

	requestRecent().then(function (videoData) {

		for (let i = 0;i < 4;i++) {

			let videoNum = num * 4 + i + 1;
			new YT.Player("video" + videoNum, {
				events: {
					"onStateChange": onPlayerStateChange
				}
			});

			let frame = document.getElementById("video" + videoNum);
			frame.src = "https://www.youtube.com/embed/" + videoData["data"]["items"][videoNum - 1]["id"]["videoId"] + "?enablejsapi=1";

			let title = document.getElementById("title" + videoNum);
			title.innerHTML = videoData["data"]["items"][videoNum - 1]["snippet"]["title"];


		}

	});

	document.getElementById("blur").style.height = ($("#rows").height() + 19) + "px";


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
	video.setAttribute("allowfullscreen","");
	video.setAttribute("src","https://www.youtube.com/embed/z-fVkkAaRfw?enablejsapi=1");
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
