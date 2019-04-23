# Server Summative:

## initial commit

### Description:
Webpage which contains trailers that can be liked, and customise to account details and search params

https://icons8.com/icons/set/film - favicon.ico link

Turn adblockers off

Bugs: https://stackoverflow.com/questions/7443578/youtube-iframe-api-how-do-i-control-a-iframe-player-thats-already-in-the-html

Licensing: https://pixabay.com/service/terms/ -> https://pixabay.com/users/wingtilldie-3058071/ -> placeholder.png
https://www.youtube.com/static?gl=GB&template=terms -> 5.1.A & 5.1.C

Change frame border html attribute on iframes

## Client-side Documentation

#General instructions and descriptions:

Documentation for website hosted on https://trailerscentral.herokuapp.com:
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

#Little extra detail:
I decided to use the youtube iframe api. This allows me to use event listeners for actions such as playing and stopping videos. Therefore I decided that on play would result in changing the bootstrap card size in the column, while also blurring the background in the process. The background only has a faint blur during this and moves down from the top (this is also quite fragile as it is an experimental feature in MDN CSS and they're only available in edge and safari browsers). There are also blurs when trailers move behind the top navbar.  

#Client side code: 
See full client side code documentation provided on the website:


#Known Bugs


##Server-side Documentation
https://trailerscentral.herokuapp.com/Documentation/apiDOC.html

##Licensing Links:




