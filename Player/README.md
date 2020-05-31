# Strong Game Player App

**description**
A lightweight web application used by players of the Strong Game 

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
The following chain of actions are performed when the player app is loaded and a game session is under way.  Note that I did not include utility functions but hopefully this makes walking through the code easier.

1.  document.ready() //starting point of the application
2.  checkparams() //checks to see if any URL params were passed in.  calls game server for game information...
3.  gameInfo() //handles the returned game info from the server
4.  player.register() // submits player information to the game server
5.  start() //game starts
6.  questionLoaded() //loads question
7.  answersUpdated() //loads the answers
8.  scoresUpdate() // loads final scoreboard 
9.  stop() //stops and reloads the app

