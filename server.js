/*eslint-env node*/


var express = require("express");
var app  = express();

app.get("/",function(req,resp){

	resp.sendFile("client/index.html",{root: __dirname });
	
});

app.get("/style.css", function(req, res) {
	res.sendFile(__dirname + "/client/" + "style.css");
});

app.get("/index.js", function(req, res) {
	res.sendFile(__dirname + "/client/" + "index.js");
});

app.get("/placeholder.png", function(req, res) {
	res.sendFile(__dirname + "/client/" + "placeholder.png");
});


app.listen(8080);

