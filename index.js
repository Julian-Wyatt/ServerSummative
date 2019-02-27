document.addEventListener("DOMContentLoaded", function () {


	let collapseBtn = document.getElementById("sidebarCollapse");
	function collapse () {
		let sidebar = document.getElementById("sidebar");
		sidebar.classList.toggle("active");
	}
	collapseBtn.addEventListener("click",collapse);

});             