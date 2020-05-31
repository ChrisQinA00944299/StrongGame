# Strong Game Host App

**description**
A lightweight web application used by the host

**dependencies**

-  Jquery 2.x or above
-  Bootstrap 3
-  Socket.io


**folder/files**

-  **css** *folder that holds the custom styling used by the player application*
-  **images** folder that holds the images used by the application
-  **js**    *folder that holds the javascript code used by the application*
    -  **application.js** *holds the main js library loaded by the application.*
    -  **player.js** *holds the player object used by application.js*
-  **lib** *folder that holds the dependencies such as socket.io library, jQuery, etc..*



**Chain of execution**  
The following chain of actions are performed when the host app is loaded and a game session is under way.  Note that I did not include utility functions but hopefully this makes walking through the code easier.

1.  document.ready() //starting point of the application
2.  checkparams() //checks to see if any URL params were passed in.  calls game server for game information...
3.  getGameInfo() //gets the game info from the API
4.  loadGame() //loads the game info to the game server
5.  gameInfo() //handles the returned game info from the server. N/A since host already has the info.  
6.  players() //receives lists of player in teams to show to the screen
7.  startGame() //game starts
8.  questionLoaded() //loads question
9.  scoresUpdate() // loads scoreboard between questions
10.  stopGame() //stops and reloads the app

