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

	let totalRows = 1;
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
		for (let i = 1;i <= 4;i++) {

			let frame = document.getElementById("video" + i);
			frame.src = "https://www.youtube.com/embed/" + videoData["data"]["items"][i - 1]["id"]["videoId"];
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

}
function createCard (videoNum) {

	let col = document.createElement("div");
	col.classList.add("col-lg-3");
	col.classList.add("col-sm-6");

	let card = document.createElement("div");
	card.classList.add("card");


	let videoDiv = document.createElement("div");
	videoDiv.classList.add("embed-responsive");
	videoDiv.classList.add("embed-responsive-16by9");

	let video = document.createElement("iframe");
	video.setAttribute("allowfullscreen","");
	video.setAttribute("src","https://www.youtube.com/embed/z-fVkkAaRfw");
	video.classList.add("embed-responsive-item");
	video.id = "video" + videoNum;

	let cardBody = document.createElement("card-body");
	cardBody.classList.add("card-body");

	let title = document.createElement("h6");
	title.classList.add("card-title");
	title.appendChild(document.createTextNode("title"));
	title.id = "Title" + videoNum;

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
