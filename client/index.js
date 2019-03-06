/* global gapi */

function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	console.log("ID: " + profile.getId()); // Do not send to your backend! Use an ID token instead.
	console.log("Name: " + profile.getName());
	let accntText = document.getElementById("accntName");
	accntText.textContent = profile.getName();
	console.log("Image URL: " + profile.getImageUrl());
	console.log("Email: " + profile.getEmail()); // This is null if the 'email' scope is not present.


	// send info to server and handle there

	
}

function signOut(){		//add this with DOM 
	// same here, ping server, then ping back with sign out 
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		console.log("User signed out.");
	});
}





document.addEventListener("DOMContentLoaded", function () {


	let collapseBtn = document.getElementById("sidebarCollapse");
	function collapse () {
		let sidebar = document.getElementById("sidebar");
		sidebar.classList.toggle("active");
	}
	collapseBtn.addEventListener("click",collapse);

	async function recent(){
		try{
			let response = await fetch("http://localhost:8080/recent");
			let body = await response.text();
			
			let recents = JSON.parse(body);
			return recents;

		}
		catch (e){
			alert(e);
		}
	}

	recent().then(function (videoData){
		console.log(videoData);
		for (let i=1;i<=4;i++){
			let frame = document.getElementById("video"+i);
			frame.src = "https://www.youtube.com/embed/" + videoData["items"][i-1]["id"]["videoId"];
			let title = document.getElementById("title"+i);
			title.innerHTML = videoData["items"][i-1]["snippet"]["title"];
		}
	});

	let gSignOut = document.getElementById("gSignOut");
	gSignOut.addEventListener("click",signOut);
	

	

});             