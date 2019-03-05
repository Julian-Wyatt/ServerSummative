function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
	console.log('Name: ' + profile.getName());
	let accntText = document.getElementById("accntName");
	accntText.textContent = profile.getName();
	console.log('Image URL: ' + profile.getImageUrl());
	console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
	
}

function signOut(){
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
			console.log(recents);
		}
		catch (e){
			alert(e);
		}
	}

	recent();

});             