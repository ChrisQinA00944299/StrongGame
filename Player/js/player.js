
	//---------------------------------------------------------------------------------------
	//Name:        Player
	//Description: Class to hold player information and actions executed by the player
	//---------------------------------------------------------------------------------------
	var player = {

		id: "",
		gameInfo: {},
		name: "",
		team: "",
		social: [],
		answers: [],
		status: "registering",
		currentQuestion: 0,
		currentAnswer: 0,
		gameRoom: "",
		playerRoom: "",

		//-----------------------------------------------------------------------------
		//        name: 
		// Description: 
		//----------------------------------------------------------------------------- 
		continueGame: function()
		{
			

			var tempPlayer = jQuery.parseJSON(Cookies.get('strong_game'));

			player.id = tempPlayer.id;
			player.gameInfo = tempPlayer.gameInfo;
			player.name = tempPlayer.name;
			player.team = tempPlayer.team;
			player.social = tempPlayer.social;
			player.answers = tempPlayer.answers;
			player.status = tempPlayer.status;
			player.currentQuestion = tempPlayer.currentQuestion;
			player.currentAnswer = tempPlayer.currentAnswer;
			player.gameRoom = tempPlayer.gameRoom;
			player.playerRoom = tempPlayer.playerRoom;

			gameMessaging.emit('joinRoom', player.gameRoom);
			playMessaging.emit('joinRoom', player.playerRoom);
			

			$('#pnlContinue').hide();
			$('#pnlGame').show();

		},


		//-----------------------------------------------------------------------------
		//        name: 
		// Description: 
		//----------------------------------------------------------------------------- 	
		reloadGame: function()
		{

			var tempPlayer = jQuery.parseJSON(Cookies.get('strong_game'));

			player.id = tempPlayer.id;
			player.gameInfo = tempPlayer.gameInfo;
			player.name = tempPlayer.name;
			player.team = tempPlayer.team;
			player.social = tempPlayer.social;
			player.answers = tempPlayer.answers;
			player.status = tempPlayer.status;
			player.currentQuestion = tempPlayer.currentQuestion;
			player.currentAnswer = tempPlayer.currentAnswer;
			player.gameRoom = tempPlayer.gameRoom;
			player.playerRoom = tempPlayer.playerRoom;

			player.removePlayer();
			Cookies.remove('strong_game');
			window.location = window.location;
		},



		//-----------------------------------------------------------------------------
		//        name: 
		// Description: 
		//----------------------------------------------------------------------------- 
 		loadGame: function()
 		{


 			if($('#frmGameStart').valid())
 			{
 				
	 			var gameID = $('#txtGameID').val().toUpperCase();
	 			gameMessaging.emit('getGameInfo', gameID);
 			}
 			
 		},


 		//-----------------------------------------------------------------------------
		//        name: 
		// Description: 
		//----------------------------------------------------------------------------- 
 		register: function()
 		{

			$.validator.addMethod("valueNotEquals", function(value, element, arg){
			  return arg !== value;
			 }, "Value must not equal arg.");

 			//validate any form items...
 			$('#frmPlayerInfo').validate({
			    rules: {
				   slctTeam: { valueNotEquals: "none" }
				  },
				  messages: {
				   slctTeam: { valueNotEquals: "Please select a Team" }
				  } 

			});

 			//remove any profanity...
			$('.no-profan').each(function() {
			    $(this).rules('add', {
			        required: true,
			        noprofan:"noprofan",
			        messages: {
			            required:  "This item is required",
			            noprofan:  "This name is disallowed, please use something else",
			        }
			    });
			});


			//if the registration form is valid...
 			if($('#frmPlayerInfo').valid())
 			{
	 			//populate local player object with values...
	 			player.name = $('#txtName').val();
	 			player.team = $('#slctTeam').val();
	 			
	 			//build our social answers from the player
	 			for(var i = 0; i < player.gameInfo.formItems.length; i++)
				{
					var tempItem = {};
					tempItem.question = player.gameInfo.formItems[i].question;
					tempItem.answer = $('#txtSocial_' + player.gameInfo.formItems[i].question).val();
					player.social[player.gameInfo.formItems[i].question] = tempItem;
				}


				//prep our player object to send to the server
				var tempObject = {
					uid: player.uid,
					name: player.name,
					team: player.team,
					social: player.social,
					gameID: player.gameInfo.id,
					sessionID: player.gameInfo.sessionID,
					answers: player.answers,
					playerRoom: player.playerRoom,
					gameRoom: player.gameRoom,
					score: 0,
				}


				//send player object to the server
				gameMessaging.emit('addPlayer', tempObject);

				//save a local session just in case they need to refres
				player.status = "ready";

				//join the player room
				playRoom = player.team + "_" + player.gameInfo.sessionID;
				playMessaging.emit('joinRoom', playRoom); 


				
			}


 		},


 		//-----------------------------------------------------------------------------
		//        name: removePlayer();
		// Description: Removes the player from the game server
		//----------------------------------------------------------------------------- 
 		removePlayer: function()
 		{
 			gameMessaging.emit('removePlayer', player.gameInfo.id, player.gameInfo.sessionID, player.id); 
 		},


 		//-----------------------------------------------------------------------------
		//        name: selectAnswer()
		// Description: Sends the player's answer selection to the Game server
		//----------------------------------------------------------------------------- 
 		selectAnswer: function(choice)
 		{


 			//prevent the player from submitting answers when the game is paused or not showing a question
 			if(gamePaused != true && globalCounter > 0 &&  globalState == "question")
 			{

 				//resets the choice selection bars/buttons
	 			$('.progress').removeClass('choice-selected');
	 			$('#progress' + choice).addClass('choice-selected');

	 			//if the question is a survey (not textbox type) then after selection of the answer, hide the rest of the "answers"
	 			if(player.currentQuestion.type == "survey" && choice != 'surveyText')
	 			{

	  				$('.question-link').bind('click', function(e){
			        		e.preventDefault();
					})

	  				
	 				for(var i = 0; i < 5; i++)
	 				{
	 					if(i != choice)
		 				{
		 					$('#question-link-' + i).hide();
		 				}
	 				}
	 				


			 		//choice = $('#choice' + choice + '-label').html();
	 				$('#choice' + choice).css('width','100%');



	 				$('#lblAnswer').html('<center><h5>Thank you for your response!</h5></center>');
	 			}
	 			//if survey question with textbox show confirmation screen after submitting...
	 			else if(player.currentQuestion.type == "survey" && choice == 'surveyText')
	 			{
	 				$('#lblAnswer').html('<center><h5>Thank you for your response!</h5></center>');
	 			}


	 			if(choice == "surveyText")
	 			{
	 				console.log('submitted');
	 				choice = $('#question-response').val();
	 				$('#question-survey').hide();
	 				$('#btnSubmitSurvey').hide();
	 				console.log( $('#question-response').val());
	 			}


	 			console.log(choice);
	 			var timestamp = Math.floor(Date.now() / 1000);
	 			
	 			var message = 
	 			{
	 				timestamp: timestamp,
	 				teamID: player.team,
	 				playerID: player.id,
	 				gameID: player.gameInfo.id,
	 				sessionID: player.gameInfo.sessionID,
	 				questionID: player.currentQuestion.id,
	 				question: player.currentQuestion.question,
	 				answer: choice,
	 				type: player.currentQuestion.type,
	 			}
	 			
	 			player.currentAnswer = choice; 			
	 			playMessaging.emit('submitAnswer', message); 
	 		}
	 		else
	 		{
	 			console.log("can't select");
	 			console.log("paused - "+  gamePaused);
	 			console.log("globalCounter - "+  globalCounter);
	 			console.log("globalState - "+  globalState);
	 		}

 		},


	}



