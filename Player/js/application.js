
	var socketServer = config.messaging_server;
	var api_url = config.api_url;
	var timerMessage = "Time left: ";
	var profanFilter = [];
	var globalCounter = 0;
	var globalState = "ready";
	var gamePaused = false;
	var gameStarted = false;  
	
	//var gameRoom = "";
	//var playerRoom = "";
 


	//-----------------------------------------------------------------------------
	//        name: Document.ready
	// Description: Executes upon completion of page loading
	//----------------------------------------------------------------------------- 
	$( document ).ready(function() {
	    $('#bdgeConnect').hide();
	    $('#pnlPlayer').hide();
	    $('#pnlGame').hide();
	    $('#pnlChoices').hide();
	    $('#pnlScores').hide();
	    $('#errorMessage').hide();
	    $('#pnlContinue').hide();
	    $('#pnlTerms').hide();
	    $('#pnlWait').hide();
	    $('#lblTerms').load("./html/TOS.html");

	    
	    //Did they accidentally refresh the screen?  Reload the game if so...
	    if(Cookies.get('strong_game') != undefined)
	    {
	    	$('#pnlContinue').show();
	    	$('#pnlRegister').hide();
	    }

	    //load our list of disallowed words
	     $.getJSON("https://sg1.tech/lib/profanity.json", function(result)
	     {
			profanFilter = result;  
		 });


		 //load our player object and kick off application initialization...
		 jQuery.getScript("./js/player.js")
			.done(function() {
				console.log(player);
				checkParams();
		});

	     

	});


	//---------------------------------------------------------------------------------------
	//Name:        checkParams()
	//Description: Checks to see if any parameters were passed to the player application and attempts to bootstrap parts of the player app.
	//
	//---------------------------------------------------------------------------------------
	function checkParams()
	{
		 //are we passing in a game ID?  If so, go ahead and load the game info from the game server.
		 var urlGameID = getUrlParam("gameID","none");
		 if(urlGameID != "none" && Cookies.get('strong_game') == undefined)
		 {
		 	gameMessaging.emit('getGameInfo', urlGameID);
		 }

		 //Are we looking for a reservation?  If so, load the game info from the game server.
		 var urlReservationID = getUrlParam("rv","none");
		 if(urlReservationID != "none" && Cookies.get('strong_game') == undefined)
		 {
		 	console.log("getting reservation");
		 	gameMessaging.emit('getGameInfo', urlReservationID.toUpperCase());
		 }
	}



	//##############################################################################################################
	//---------------------------------------------------------------------------------------
	//Name:        GAMEMESSAGING NAMESPACE
	//Description: Namespace for the game management actions... 
	//
	//---------------------------------------------------------------------------------------
    var gameMessaging = io(socketServer + 'game');
	    gameMessaging.on('connect', function () {


		$('#bdgeConnect').show();
		$('#bdgeDisconnect').hide();

		//make sure there is a persistant client ID.  
		if(Cookies.get('strong_game_client') != undefined)
	    {
	    	gameMessaging.emit('registerClientID', Cookies.get('strong_game_client'));
		}
		else
		{
			var clientID = generateID();
			Cookies.set('strong_game_client',clientID);
			gameMessaging.emit('registerClientID', clientID);
		}

		//if they already joined earlier, rejoin the game...
		if(player.gameRoom != "")
		{
			gameMessaging.emit('joinRoom', player.gameRoom);
		}
	}); 

	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.disconnect()
	//Description: Notify the player that they had been disconnected
	//
	//---------------------------------------------------------------------------------------
	gameMessaging.on('disconnect', function (reason){
	  $('#bdgeConnect').hide();
	  $('#bdgeDisconnect').show();
	  console.log("disconnect " + reason);
	});



	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.playerID()
	//Description: confirms loading of game info to server and joins admin to game management room
	//---------------------------------------------------------------------------------------
	gameMessaging.on('gameError', function (errorMessage) {
		

		//were they try to find a reservation?
		var urlReservationID = getUrlParam("rv","none");
		if(errorMessage == "Game not found" && urlReservationID != "none")
		{
			//errorMessage = "Oh no! - The game is not in session yet.  <br/><br/> Please confirm with the host for game schedule. ";
			$('#pnlWait').fadeIn();
			$('#pnlRegister').fadeOut();

			var urlReservationID = getUrlParam("rv","none");
			 if(urlReservationID != "none")
			 {
			 	console.log("getting reservation");
			 	setTimeout(function(){ gameMessaging.emit('getGameInfo', urlReservationID); }, 30000);
			 	
			 }
			 
		}
		else
		{
			$('#errorMessage').html(errorMessage);
			$('#errorMessage').show();	
		}

		
	});

	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.joinedRoom()
	//Description: Handler when the player joings a game room.
	//---------------------------------------------------------------------------------------
	gameMessaging.on('joinedRoom', function (room) {
		
	});


	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.joinedRoom()
	//Description: Handler to place them in a queue to join a game under session at the next question...
	//---------------------------------------------------------------------------------------
	gameMessaging.on('queuePending', function (room) {
		$('#pnlGame #lblTitle').html('Game is currently under way.  <br/> You will be added on the next Question')
	});	


	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.playerID()
	//Description: confirms loading of game info from the server and places the player in a "waiting for game start" state
	//---------------------------------------------------------------------------------------
	gameMessaging.on('playerID', function (playerID) {
		
		player.id = playerID;

		//save the session locally in case of refresh....
		Cookies.set('strong_game',player);

		$('#lstPlayers').show();
		$('#lstPlayers').html('');
		$('#pnlPlayer').fadeOut();
		$('#pnlGame').fadeIn();
		

	});

	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.players()
	//Description: Called from the game server to update the list of players in a team when a new player joins
	//---------------------------------------------------------------------------------------
	gameMessaging.on('players', function (teams) {


		if(gameStarted == false)
		{
			//console.log(players);
			var html = "<h4>Players in your Team</h4><ul>";
			var counter = 0;
			for(var i = 0; i < teams.length; i++)
			{


				if(teams[i].id == player.team)
				{

					console.log("match");
					for(var j = 0; j < teams[i].players.length; j++)
					{
					
						html += '<li><strong>' + teams[i].players[j].name + '</strong></li>';
					}
					
				}

			}

			html += "</ul>";
			console.log("players--");
			$('#lblTotal').html(counter + " Players");
			$('#lstPlayers').html(html);
			$('#lstPlayers').show();
		}
	});



	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.isDuplicate()
	//Description: Server rejected player info submission due to duplicated name.  Prompt the player to change name
	//---------------------------------------------------------------------------------------
	gameMessaging.on('isDuplicate', function () {
		
			console.log("duplicate");
			//show duplicate validation error...
 			var validator = $('#frmPlayerInfo').validate();

 			validator.showErrors({"txtName": "Duplicate Name - Please use a different variation"});


	});


	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.start()
	//Description: handles the game start event
	//---------------------------------------------------------------------------------------
	gameMessaging.on('start', function (room) {
		
		if(player.status == "ready")
		{
			$('#pnlGame #lblTitle').html('Game has started...');
			$('#lstPlayers').hide();
			gameStarted = true;
		}
	});

	

	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.stop()
	//Description: handles the game stop event
	//---------------------------------------------------------------------------------------
	gameMessaging.on('stop', function (room) {
		
		$('#pnlGame').hide();
		$('#pnlPlayer').hide();
		$('#pnlRegister').fadeIn();
		$('#pnlChoices').hide();
		$('#pnlScores').hide();
		$('#errorMessage').hide();
		$('#lblTitle').html('');
		$('#lblTimer').html('');
		$('#lblAnswer').html('');
		$('#pnlContinue').hide();
		$('#lstPlayers').hide();
		$('#pnlWait').hide();


		var url = window.location.href.split('?')[0]

		Cookies.remove('strong_game');
		gameStarted = false;
		document.location = url;
		
		
	    
	});








	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.stop()
	//Description: handles the final scoreboard update event
	//---------------------------------------------------------------------------------------
	gameMessaging.on('scoresUpdated', function (scores) {

		globalState = "scores";
		
		console.log("show ending scoreboard");
		
		$('#pnlChoices').hide();
		$('#pnlScores').fadeIn();
		$('#lblTitle').html('Thank you for playing');
		$('#errorMessage').hide();
		$('#lstPlayers').hide();

		var html = "";
		for(var i = 0; i < scores.teams.length; i++)
		{
			try
			{
				html += '<tr>';
				html += '<td></td><td>' + scores.teams[i].name + '</td><td>' + scores.teams[i].score + '</td>';
				html += '</tr>';
			}
			catch(err){}
		}
		$('#tblTeamScores > tbody').html(html);

		var html = "";
		for(var i = 0; i < scores.players.length; i++)
		{
			try
			{
				html += '<tr>';
				html += '<td></td><td>' + scores.players[i].name + '</td><td>' + scores.players[i].score + '</td>';
				html += '</tr>';
			}
			catch(err){}
		}
		$('#tblPlayerScore > tbody').html(html);
		Cookies.remove('strong_game');
	    
	});


	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.tick()
	//Description: handles the game countdown event
	//---------------------------------------------------------------------------------------
	gameMessaging.on('tick', function (counter) {
		
		globalCounter = counter;

		if(counter < 10)
        {
             $('#lblTimer').html(timerMessage + " <span style='color: #FF0000;'> <strong>" + counter + "</strong></span> seconds");
        }
        else
        {
             $('#lblTimer').html(timerMessage + " <strong>" + counter + "</strong> seconds");
        }
	});




	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.gameInfo()
	//Description: handles response from server on loading game information...
	//
	//---------------------------------------------------------------------------------------
	gameMessaging.on('gameInfo', function (msg) {
		
		
		player.gameInfo = msg;

		player.gameRoom = msg.id + "_" + msg.sessionID;
		gameMessaging.emit('room', player.gameRoom);

		//hide the first form...
		$('#pnlRegister').fadeOut();
		$('#pnlWait').fadeOut();
		$('#pnlPlayer').fadeIn();

		//show the following form and render fields...
		var html = ''; //<option value="none">Select a team</option>';
		for(var i = 0; i < msg.teams.length; i++)
		{
			html += '<option value="' + msg.teams[i].id + '">' + msg.teams[i].name + '</option>';
		}
		$('#slctTeam').html(html);

		html = "";

		for(var i = 0; i < msg.formItems.length; i++)
		{

			html += '<div class="form-group">';
			html += '<label for="txtSocial_' + msg.formItems[i].question + '">' + msg.formItems[i].title + '</label>';
			html += '<input type="text" class="form-control no-profan" maxlength="30" id="txtSocial_' + msg.formItems[i].question + '" name="txtSocial_' + msg.formItems[i].question + '" aria-describedby="" placeholder="" required>';
			html += '</div>';
		}

		$('#pnlSocial').html(html);

		player.gameRoom = player.gameInfo.id + "_" + player.gameInfo.sessionID;
		gameMessaging.emit('joinRoom', player.gameRoom);

		//are we passing in a team?
		var teamRes = getUrlParam("team","none");

		if(teamRes != "none")
		{
			$('#slctTeam').val(teamRes);
		}

		$('#sbPnlTeamFrm').hide();
		$('#lblTeam').html($('#slctTeam option:selected').text());
		$('#sbPnlTeamLbl').show();


	});

	//##############################################################################################################
	//---------------------------------------------------------------------------------------
	//Name:        PLAYMESSAGING NAMESPACE
	//Description: Namespace for the game play actions...
	//---------------------------------------------------------------------------------------
    var playMessaging = io(socketServer + 'play');
	playMessaging.on('connect', function () {
		

		if(player.playerRoom != "")
		{
			playMessaging.emit('joinRoom', player.playerRoom);
			
		}
	});


	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.togglePause()
	//Description: toggles the pause event
	//---------------------------------------------------------------------------------------
	gameMessaging.on('togglePause', function (pauseState) {
		
		/*
		if(gamePaused == false)
		{
			gamePaused = true;
			
		}
		else
		{
			gamePaused = false;

		}
		*/

		gamePaused = pauseState;

		console.log("toggle paause 2");
		



	});



	//---------------------------------------------------------------------------------------
	//Name:        playMessaging.joinedRoom()
	//Description: confirms loading of game info to server and joins player to the player's team room
	//---------------------------------------------------------------------------------------
	playMessaging.on('joinedRoom', function (room) {
		player.playerRoom = room;
		
		Cookies.set('strong_game',player);
	});

	//---------------------------------------------------------------------------------------
	//Name:        playMessaging.questionLoaded()
	//Description: handles the loading of a new question to the player
	//---------------------------------------------------------------------------------------
	playMessaging.on('questionLoaded', function (question) {
		
		console.log("question loaded");
		$('.progress').show();

		globalState = "question";
		timerMessage = "Time Left: ";

		$('#question-link-1').show();
		$('#question-link-2').show();
		$('#question-link-3').show();
		$('#question-link-4').show();

		$('#question-survey').hide();
		$('#lstPlayers').hide();
		

		if(question.type == "image")
		{
			question.question = question.question + "<br/><small style='color: #e67e22;'>Please look up at the main screen</small>";
		}



		$('.question-link').unbind('click');
		$('.question-link').blur();
		$('#lblAnswer').html('');

		player.currentQuestion = question;
		$('.player-answer').remove();
		$('.choice-selected').remove();
		$('.progress').removeClass('choice-selected');
		$('.progress').removeClass('progress-review');
		$('.progress').css('float','');
		$('.progress').css('width','');


		$('#lblTitle').html(question.question);
		$('#choice1-label').html(question.response1);
		$('#choice2-label').html(question.response2);
		$('#choice3-label').html(question.response3);
		$('#choice4-label').html(question.response4);

		$('#choice1-label').css("text-align","left");
		$('#choice2-label').css("text-align","left");
		$('#choice3-label').css("text-align","left");
		$('#choice4-label').css("text-align","left");

		$('#choice1-label').css("width","1000px");
		$('#choice2-label').css("width","1000px");
		$('#choice3-label').css("width","1000px");
		$('#choice4-label').css("width","1000px");

		$('#choice1').css('width','0%');
		$('#choice2').css('width','0%');
		$('#choice3').css('width','0%');
		$('#choice4').css('width','0%');

		$('.progress-bar').removeClass('bg-success');
		$('.progress-bar').removeClass('bg-danger');
		$('.progress-bar').addClass('bg-primary');

		

		if($('#choice1-label').html() == "")
			$('#question-link-1').hide();
		if($('#choice2-label').html() == "")
			$('#question-link-2').hide();
		if($('#choice3-label').html() == "")
			$('#question-link-3').hide();
		if($('#choice4-label').html() == "")
			$('#question-link-4').hide();


		$('#pnlChoices').fadeIn();
		$('#pnlScores').hide();
		$('#errorMessage').hide();
		$('#pnlContinue').hide();

		//if it's a survey question for text...
		if(question.type == "survey" && question.surveyType == "text")
		{
			$('#question-link-1').hide();
			$('#question-link-2').hide();
			$('#question-link-3').hide();
			$('#question-link-4').hide();
			$('#question-survey').show();
			$('#question-survey').removeAttr("disabled");
 			$('#btnSubmitSurvey').removeAttr("disabled");
		}


		var html = "";
	
		Cookies.set('strong_game',player);
		


	});

	//---------------------------------------------------------------------------------------
	//Name:        playMessaging.answersUpdated()
	//Description: handles the answer from the server
	//---------------------------------------------------------------------------------------
	playMessaging.on('answersUpdated', function (answer) {
		
		globalState = "answer";
		

		if(player.gameInfo.totalQuestions == player.currentQuestion.id)
		{
			timerMessage = "Game Ending in: ";
		}
		else
		{
			timerMessage = "Next Question: ";
		}
		

		$('.question-link').bind('click', function(e){
        		e.preventDefault();
		})

		//highlight team selection...

		if(player.currentQuestion.type != "survey")
		{

			var max = 0;
			var teamChoice = 0;
			for(var i = 1; i < 5; i++)
			{
				if(parseInt($('#choice' + i).css('width')) >= max)
				{
					max = parseInt($('#choice' + i).css('width'));
					teamChoice = i;
				}
			}

			$('.progress').removeClass('choice-selected');
			$('.progress').addClass('progress-review');

			var percentWidth = parseInt($('#choice' + teamChoice).css('width')) / parseInt($('#progress' + teamChoice).css('width'));

			

			if(teamChoice == answer && percentWidth > .50)
			{
				$('#choice' + teamChoice).addClass('bg-success');
			}
			else
			{
				$('#choice' + teamChoice).addClass('bg-danger');
			}


			//update team's choice...


			//update player's choice....
			$('.progress').css('width','90%');
			$('.progress').css('float','left');
			$('.progress').css('margin-bottom','10px;');
			if(answer == player.currentAnswer)
			{
				
				$('#question-link-' + player.currentAnswer).append('<i class="fas fa-check player-answer player-answer-correct"></i>');
			}
			else
			{
				$('#question-link-' + player.currentAnswer).append('<i class="fas fa-ban player-answer player-answer-wrong"></i>');
			}


			$('#lblAnswer').html('<h5>The correct answer is: <span style="color: #e67e22"><strong>' + $('#choice' + answer + '-label').html() + '</strong></span>');

		}
		else
		{
			$('.progress').removeClass('choice-selected');
			$('.progress').addClass('progress-review');
			$('.progress').hide();
			$('#lblAnswer').html('<center><p style="color:#FFFFFF;">Please stand by for next question</p></center>');
		}

		Cookies.set('strong_game',player);


	});



	//---------------------------------------------------------------------------------------
	//Name:        playMessaging.selectionsUpdated()
	//Description: Handles team selection updates from the server
	//---------------------------------------------------------------------------------------
	playMessaging.on('selectionsUpdated', function (answers) 
	{

		if(player.currentQuestion.type != "survey")
		{
			$('#choice1').css('width',answers[0] + '%');
			$('#choice2').css('width',answers[1] + '%');
			$('#choice3').css('width',answers[2] + '%');
			$('#choice4').css('width',answers[3] + '%');
		}

	});








	//-----------------------------------------------------------------------------
	//        name: 
	// Description: 
	//----------------------------------------------------------------------------- 
	function toggleTerms()
	{
		$('#pnlTerms').toggle();
		$('#pnlRegister').toggle();
	}

	//-----------------------------------------------------------------------------
	//        name: openChangeTeam()
	// Description: toggles the team selection dropdown to switch teams for games with reserved URL's
	//----------------------------------------------------------------------------- 
	function openChangeTeam()
	{
	
		$('#sbPnlTeamFrm').show();
		$('#sbPnlTeamLbl').hide();

	}

	//-----------------------------------------------------------------------------
	//        name: applyTeamSelection()
	// Description: Applies the team selection on dropdown change...
	//----------------------------------------------------------------------------- 
	function applyTeamSelection()
	{
	
		$('#sbPnlTeamFrm').hide();
		$('#lblTeam').html($('#slctTeam option:selected').text());
		$('#sbPnlTeamLbl').show();

	}


	//-----------------------------------------------------------------------------
	//        name: changeTeam()
	// Description: Resets the player screen so they can select a different team.
	//----------------------------------------------------------------------------- 
	function changeTeam()
	{
		player.removePlayer();
		location.reload();
	}
  


	//-----------------------------------------------------------------------------
	//        name: 
	// Description: 
	//----------------------------------------------------------------------------- 
	// this one requires the text "buga", we define a default message, too
	$.validator.addMethod("noprofan", function(value) {

		//
		var result = true;
		
		
		for(var i = 0; i < profanFilter.length; i++)
		{
			if(value.toLowerCase().indexOf(profanFilter[i].toLowerCase()) != -1)
			{
				
				result = false;
			}

		}

		return result;
		
		
	}, '');


	//-----------------------------------------------------------------------------
	//        name: 
	// Description: 
	//----------------------------------------------------------------------------- 
	function getUrlVars() 
	{
	    var vars = {};
	    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	        vars[key] = value;
	    });
	    //console.log("vars");
	    //console.log(vars);
	    return vars;

	}


	//-----------------------------------------------------------------------------
	//        name: 
	// Description: 
	//----------------------------------------------------------------------------- 
	function getUrlParam(parameter, defaultvalue){
	    var urlparameter = defaultvalue;
	    if(window.location.href.indexOf(parameter) > -1){
	        urlparameter = getUrlVars()[parameter];
	    }

	    return urlparameter;
	}


	//-----------------------------------------------------------------------------
	//        name: 
	// Description: 
	//----------------------------------------------------------------------------- 
	function generateID()
	{
	  return Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
	}

