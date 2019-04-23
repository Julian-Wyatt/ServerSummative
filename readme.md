# Server Summative:

### Website and API Description:
The Webpage will contain trailers and the user will be able to customise account details and search parameters when searching for specific trailers.
The API will make all the requests to YT, as well as serving the client side data, and customisation.


# Client-side Documentation

## General instructions and descriptions:

Documentation for website hosted on https://trailerscentral.herokuapp.com/Documentation:

When the page loads you have the main trailers section which is the middle part, along with the sidebar and main navbar.

By default the website will show the recent trailers, which is sent to the client side by a fetch request for a JSON file. 

The client side pocesses the recieved JSON and adds the links to the iframes, which automatically update the thumbnails. 

There is a second page of recents available at the bottom, which sends the next 20+ video data in an iframe. 

There would be more pages but I had to limit this. I will explain in the API documentation.

Along the sidebar, the user can select different (preselected channels to view trailers from, if for example they wish to see just Disney or just Marvel trailers.) These act similarly to genres. 

The user can create an account at the bottom, this will enable them to alter their preferences so they see different channels along the sidebar, 
it will also minorly customise the page, with a welcome of their name, and should they link their google account it will show their google profile picture as well.

In order link your google account you must have an account with the same email as your google account (obviously the password should be different).

Along the topmost navbar there is a search section, which will show exactly 4 results for what has been searched, which will shift and automatically update over the trailers section.

The footer along the bottom of the page is there for general info, ie a little about the author, and links to my github account, along with webpages for both the client side and server side documentation.

However for submission most of the footer will contain placeholder text for anonymity purposes.

## Little extra detail:
I decided to use the youtube iframe api. This allows me to use event listeners for actions such as playing and stopping videos. 
Therefore I decided that on play would result in changing the bootstrap card size in the column, while also blurring the background in the process. 
The background only has a faint blur during this and moves down from the top (this is also quite fragile as it is an experimental feature in MDN CSS and they're only available in edge and safari browsers). 
There are also blurs when trailers move behind the top navbar.  

## Client-side code: 
See full client side code documentation provided on the website:

https://trailerscentral.herokuapp.com/Documentation/clientDOC.html


# Server-side Documentation

For the full server-side code documentation see the link below; this will just be a summary.

App.js contains all of the get/ post functions as well as a few extra functions. Server.js contains the app.listen only, this is so I can jest test app.js with app.test.js

I decided to name all the app.js functions so I can list the GET & POST methods with: 
```javascript
app.get("/channelID",getChannelID);
app.get("/search",getSearch);
app.get("/channeldata",getChannelData);
app.get("/recent", getRecent);
app.get("/prefs", getPrefs);
app.post ("/prefs", postPrefs);
app.post("/register",postRegister);
app.get("/checkAccount",getCheckAccount);
app.post("/login", postLogin);
app.post("/deleteaccount", postDeleteAccount);
```
This therefore looks much neater, while also allowing me to properly JSDoc comment my functions as they won't be anonymous.

From top to bottom of the list above, we have:

getChannelID, which will return 3 channels with the given title query given in the URL.

getSearch, which will return 6 videos with the given search criteria q given in the URL, such that it searches Youtube for ```javascript q + " Trailer"```.

getChannelData, which will return the JSON data for the given channel in the URL, if it isn't saved (and is part of my list in channels.json) then it will search Youtube for it.

getRecent, which is similar to getChannelData, except it is recent trailers saved in recents.json.

getPrefs, which will return the preferences and some other data for a given token or email. If an email is given a new token will be provided.

postPrefs, which will update the users preferences, defined by the `x-access-token` provided in the header of the request.

postRegister, which will take in form data, such as email and password (the required data), and some preferences and possibly a name, creating an account which will customise the page the user sees. The password will be encrypted using industry standard bcrypt and stored in a JSON.

getCheckAccount, which will return a basic JSON to see whether the account exists or not, which will return 200 codes as the request is successful and a JSON is received as a response.

postLogin, which will log the user in to the website, using their email and password which are on the server. The password will be bcrypt compared with the stored password asynchronously. Log in will occur if successful which will send log in data to the client

postDeleteAccount, which will delete the account linked to the token which is sent in the header.

## Server-side code
See full Server side code documentation provided on the website:

https://trailerscentral.herokuapp.com/Documentation/apiDOC.html

# Licensing Links:

Placeholder.png -> https://pixabay.com/service/terms/ -> https://pixabay.com/users/wingtilldie-3058071/

Youtube's Terms of Service: https://www.youtube.com/static?gl=GB&template=terms -> Relevent sections are: 5.1.A & 5.1.C

Favicon.ico's link: https://icons8.com/icons/set/film

# Known Bugs
Ad-blockers must be turned off due to further erroring in the console

The YT Iframe API gives errors in the console such as: 

Failed to execute 'postMessage' on 'DOMWindow': The target origin provided ('https://www.youtube.com') does not match the recipient window's origin ('https://trailerscentral.herokuapp.com').

A link to fix this is: https://stackoverflow.com/questions/7443578/youtube-iframe-api-how-do-i-control-a-iframe-player-thats-already-in-the-html

Transparent background stops appearing after watching a few videos and switching between fullscreen and normal.

NOTE: When using https://trailerscentral.herokuapp.com, the data isn't persistant, and therefore does not save new accounts permanently when the server resets (which is nightly or when it is not used for a longer period of time). Instead use the localhost process to test this.

NOTE: When using the localhost version, you must provide your own API Key in the environment variables file (named .env) in the server's directory. Otherwise no YT based interaction will work.

NOTE: When using the localhost version or jest testing you must leave lines 15 and 16 in app.js annotated out. These are there to redirect all requests without https to the https version, therefore making it a secure connection.



