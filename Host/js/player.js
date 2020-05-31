
	//---------------------------------------------------------------------------------------
	//Name:        Player
	//Description: Class to handle Player gameplay events....
	//---------------------------------------------------------------------------------------
	var player = {

		id: "",
		gameID:"",
		gameInfo: {},
		name: "",
		team: "",
		social: [],
		answers: [],
		status: "registering",
		currentQuestion: 0,
		currentAnswer: 0,


 		loadGame: function()
 		{
 			console.log("sending game request...");
 			gameMessaging.emit('loadGame', gameInfo);
 			gameMessaging.emit('getGameInfo', gameInfo.id);
 		},

 		register: function()
 		{

 			//populate local player object with values...
 			player.name = "spectator";
 			player.team = 0;
 			
 			//console.log(player.gameInfo.formItems);
 			for(var i = 0; i < player.gameInfo.formItems.length; i++)
			{
				var tempItem = {};
				tempItem.question = player.gameInfo.formItems[i].question;
				tempItem.answer = $('#txtSocial_' + player.gameInfo.formItems[i].question).val();
				player.social[player.gameInfo.formItems[i].question] = tempItem;
			}

			//console.log(player.social);

			//prep our player object to send to the server
			var tempObject = {
				name: player.name,
				gameID: player.gameInfo.id,
				sessionID: player.gameInfo.sessionID,
			}

		
			player.status = "ready";

			playRoom = 1 + "_" + player.gameInfo.sessionID;
			playMessaging.emit('joinRoom', playRoom); 

 		},

 		selectAnswer: function(choice)
 		{

 			$('.progress').removeClass('choice-selected');
 			$('#progress' + choice).addClass('choice-selected');

 			console.log("selected - " + choice);
 			var message = 
 			{
 				teamID: player.team,
 				playerID: player.id,
 				gameID: player.gameInfo.id,
 				sessionID: player.gameInfo.sessionID,
 				questionID: player.currentQuestion.id,
 				answer: choice,
 			}
 			console.log(message);
 			player.currentAnswer = choice; 			
 			playMessaging.emit('submitAnswer', message); 

 		},


	}