var express = require("express");
var app  = express();


app.use(express.static("client"));

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

let recents = [1,"2","3","4","5"];
app.get("/recent", function(req,res){

	
	
	res.send(recents);
	//res.send(recents);
	res.end();
});



app.listen(8080);

