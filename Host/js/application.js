
	var socketServer = config.messaging_server;
	var api_url = config.api_url;
	var gameRoom = "";
	var playerRoom = "";
	var gameInfo = {};
	var teams = [];
	var questions = [];
	var formItems = [];
	var gameInfo = {
			"id":0,
			"status":"stopped",	
			"sessionID":generateID("session"),
			"countdownBeforeStart":5,
			"countdownPerQuestion":30,
			"countdownPerReview":30,
			"teams":teams,
			"questions":questions,
			"formItems":formItems,
			"currentQuestion":"",
		};

	var timerMessage = "Time left: ";
	var gameEnded = false;  
	var playerScores = [];
	var teamScores = [];
	var gamePaused = false;
	var playMedia = false;
	var skipQuestion = false;

	$(window).on("beforeunload", function() { 
	    stopGame();
	})




	//-----------------------------------------------------------------------------
	//        name: Document.ready
	// Description: Executes upon completion of page loading
	//----------------------------------------------------------------------------- 
	$( document ).ready(function() {
	    //$('#bdgeConnect').hide();
	    
	    $('#pnlStart').hide();
	    $('#pnlGame').hide();
	    $('#pnlChoices').hide();
	    $('#pnlScores').hide();
	    $('#errorMessage').hide();
	    $('.btn-control').hide();

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

		 var urlGameID = getUrlParam("session","none");
	     var urlGameDBID = getUrlParam("id","none");
	     var urlResID = getUrlParam("rv","none");

		 if(urlGameDBID != "none" || urlResID != "none")
		 {
		 	getGameInfo();
		 }

		 if(urlGameID != "none")
		 {
		 	gameMessaging.emit('getGameInfo', urlGameID);
		 }


	    switchTheme();
	}



	//##############################################################################################################
	//---------------------------------------------------------------------------------------
	//Name:        GAMEMESSAGING NAMESPACE
	//Description: Namespace for the game management actions... 
	//
	//---------------------------------------------------------------------------------------
    var gameMessaging = io(socketServer + 'game');
	    gameMessaging.on('connect', function () {
		console.log("gameMessaging Connected!");
		$('#bdgeConnect').show();
		$('#bdgeDisconnect').hide();


		//make sure there is a persistant client ID
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



		if(gameRoom != "")
		{
			gameMessaging.emit('joinRoom', gameRoom);
			console.log("Rejoining room - " + gameRoom);
		}
	});

	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.disconnect()
	//Description: Notify the player that they had been disconnected
	//
	//---------------------------------------------------------------------------------------
	gameMessaging.on('disconnect', (reason) => {
	  $('#bdgeConnect').hide();
	  $('#bdgeDisconnect').show();
	  console.log("disconnected"); 
	});

	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.loaded()
	//Description: confirms loading of game info to server and joins admin to game management room
	//---------------------------------------------------------------------------------------
	gameMessaging.on('loaded', function () {
		console.log("Game Info Loaded!");
		//player.loadGame();
	});  


	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.gameInfo()
	//Description: Notify the player that they had been disconnected
	//---------------------------------------------------------------------------------------
	gameMessaging.on('gameInfo', function (msg) {
		console.log("Game Info Retrieved!");
		console.log(msg);

	});



	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.playerID()
	//Description: confirms loading of game info to server and joins admin to game management room
	//---------------------------------------------------------------------------------------
	gameMessaging.on('gameError', function (errorMessage) {
		console.log(errorMessage);
		$('#errorMessage').html(errorMessage);
		$('#errorMessage').show();
	});

	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.joinedRoom()
	//Description: confirms loading of game info to server and joins admin to game management room
	//---------------------------------------------------------------------------------------
	gameMessaging.on('joinedRoom', function (room) {
		console.log("Joined Game room " + room );
		player.register();
	});


	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.playerID()
	//Description: confirms loading of game info to server and joins admin to game management room
	//---------------------------------------------------------------------------------------
	gameMessaging.on('playerID', function (playerID) {
		console.log("Received ID " + playerID );
		player.id = playerID;
	});



	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.start()
	//Description: handles the game start event
	//---------------------------------------------------------------------------------------
	gameMessaging.on('start', function (room) {
		console.log("2 Game Started For " + room);
		$('#btnStart').hide();
		$('#pnlStart').fadeOut();
		$('#pnlGame').fadeIn();

		//performCountdown(player.gameInfo.countdownBeforeStart,"nextQuestion");
		
		if(player.status == "ready")
		{
			$('#pnlGame #lblTitle').html('Game has started')
		}
	});

	

	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.stop()
	//Description: handles the game stop event
	//---------------------------------------------------------------------------------------
	gameMessaging.on('stop', function (room) {
		console.log("Game Stopped For " + room );
		$('#pnlGame').hide();
		$('#pnlStart').fadeIn();
		$('#pnlChoices').hide();
		$('#pnlScores').hide();
		$('#errorMessage').hide();
		$('#lblTitle').html('');
		$('#lblTimer').html('');
		$('#lblAnswer').html('');
		document.location = document.location;
	    
	});


	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.startMedia()
	//Description: starts playing of any media on the screen...
	//---------------------------------------------------------------------------------------
	gameMessaging.on('startMedia', function () {
		var vid = document.getElementById("vdMain"); 
		vid.play();
		console.log("start playing");
	});  

	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.stopMedia()
	//Description: stops playing of any media on the screen...
	//---------------------------------------------------------------------------------------
	gameMessaging.on('stopMedia', function () {
		var vid = document.getElementById("vdMain"); 
		vid.pause();
		console.log("stop playing");

	});


	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.togglePause()
	//Description: confirms loading of game info to server and joins admin to game management room
	//---------------------------------------------------------------------------------------
	gameMessaging.on('togglePause', function (pauseState) {
		

		gamePaused = pauseState;
		console.log(gamePaused);
		console.log("toggling pause 2");

		if(gamePaused == false)
		{
			$('#btnPause').show();
			$('#btnResume').hide();
		}
		else
		{
			$('#btnResume').show();
			$('#btnPause').hide();
		}
		

	});



	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.players()
	//Description: handles the game start event
	//---------------------------------------------------------------------------------------
	gameMessaging.on('players', function (teams) {
		console.log("Players changed....");
		console.log(teams);

		var html = "";
		var counter = 0;
		
		for(var i = 0; i < teams.length; i++)
		{

			$('#lstTeam' + teams[i].id).html("");


			$('#lstTeam' + teams[i].id).html(teams[i].players.length);			
			
			/*
			for(var j = 0; j < teams[i].players.length; j++)
			{

				counter++;
				//get the player team name...
				for (var k = 0; k < teams.length; k++)
				{
					if(teams[k].id == teams[i].players[j].team)
					{
						teamName = teams[k].name;
						break;
					}
				}
				
				html = "<strong>" + teams[i].players[j].name + "</strong><br/>";
				$('#lstTeam' + teams[i].id).append(html);
			}
			*/
			
		}
		//$('#lblTotal').html(counter + " Players");
		
	});





	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.answersUpdated()
	//Description: retrieves the answer from the server and sends it to the player...
	//---------------------------------------------------------------------------------------
	gameMessaging.on('answersUpdated', function (answer) {

	});









	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.scoresUpdated()
	//Description: handles the game stop event
	//---------------------------------------------------------------------------------------
	gameMessaging.on('scoresUpdated', function (scores) {
		console.log(scores);
		$('#pnlChoices').hide();
		$('#pnlScores').fadeIn();
		$('#lblTitle').html('Thank you for playing');
		$('#errorMessage').hide();

		var html = "";
		for(var i = 0; i < 3; i++)
		{
			rank = i + 1;
			try
			{
				html += '<tr>';
				html += '<td><div class="score-cell">' + rank + '</div></td><td><div class="score-cell">' + scores.teams[i].name + '</div></td><td><div class="score-cell">' + scores.teams[i].score + '</div></td>';
				html += '</tr>';
			}
			catch(err){}
		}
		$('#tblTeamScores > tbody').html(html);

		var html = "";
		for(var i = 0; i < 5; i++)
		{
			rank = i + 1;
			try
			{
				html += '<tr>';
				html += '<td><div class="score-cell">' + rank + '</div></td><td><div class="score-cell">' + scores.players[i].name + '</div></td><td><div class="score-cell">' + scores.players[i].score + '</div></td>';
				html += '</tr>';
			}
			catch(err){}
		}
		$('#tblPlayerScore > tbody').html(html);
	    
	});




	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.scoresUpdatedAdmin()
	//Description: handles the game stop event
	//---------------------------------------------------------------------------------------
	gameMessaging.on('scoresUpdatedAdmin', function (scores) {
		console.log("show scores admin");
		
		console.log(player.currentQuestion);

		$('#pnlChoices').hide();
		$('#pnlScores').fadeIn();
		$('#lblTitle').hide();
		$('#errorMessage').hide();
		var socialDisplayTitle = "";

		if(player.currentQuestion.type == "social")
		{

			socialDisplayTitle = scores.displayTitle;
			$('#lblTitle').html(scores.displayTitle);
			$('#lblTitle').show();
			console.log(player.currentQuestion);
		}
		else
		{
			$('#lblTitle').hide();
		}


		if(gameEnded == true)
		{
			$('#lblTitle').html('Thank you for playing');
			$('#lblTitle').show();
			$('#lblTimer').hide();
		}




		//set the messaging for the next countdown...
		if(player.gameInfo.totalQuestions == player.currentQuestion.id)
		{
			timerMessage = "Final Scores: ";
			gameEnded = true;
		}
		else
		{
			timerMessage = "Next Question: ";
		}



	

		$('body').removeClass('question-body');
		$('body').addClass('score-body');

		if(player.gameInfo.themeProperties != undefined && player.gameInfo.themeProperties.scoreImage != "none")
		{

			var scoreImage = api_url + "/themes/image/" + player.gameInfo.themeProperties.scoreImage;
			$('.score-body').css('background-image', 'url(' + scoreImage + ')');
			$('.score-body').css('background-position', 'center');
		  	$('.score-body').css('background-size', '140%');

	  	}


		console.log(scores);



	    
	    $('.score-name').slideUp();
	    if(scores.teams.length < 3)
	    {
	    	max = scores.teams.length;
	    }
	    else
	    {
	    	max = 3;
	    }

		var html = "";
		var prevScore = 0;
		var rank = 1;
		for(var i = 0; i < max; i++)
		{
			if(scores.teams[i].score < prevScore)
			{
				rank = rank + 1;
			}

			prevScore = scores.teams[i].score;
			try
			{
				//html += '<tr>';
				//html += '<td><div class="score-cell">' + rank + '</div></td><td><div class="score-cell">' + scores.teams[i].name + '</div></td><td><div class="score-cell">' + scores.teams[i].score + '</div></td>';
				//html += '</tr>';

				var image = "";
				if(scores.teams[i].image != undefined && scores.teams[i].image != "")
				{
					image = '<img src="' + scores.teams[i].image + '" style="height: 35px; padding: 5px;" class="slide-in">';
				}

				var tempClass = "score-name";
				if(i == 0)
				{
					tempClass = "score-name top";
				}


				html += '<tr class="' + tempClass + '">';
				html += '<td width="10%"> ' + rank + '</td>';
				html += '<td width="20%">' + image + '</td>';
				html += '<td align="left">' + scores.teams[i].name + '&nbsp;&nbsp;&nbsp;<span style="color:#2c3e50;">' + scores.teams[i].social + '</span></td>';
				html += '<td>' + scores.teams[i].score + ' pts</td>';
				html += '</tr>';
			}
			catch(err){}
		}



		$('#tblTeamScores > tbody').html(html);

		 if(scores.players.length < 5)
	    {
	    	max = scores.players.length;
	    }
	    else
	    {
	    	max = 5;
	    }

	    console.log(max);

		var html = "";
		var prevScore = 0;
		rank = 1;
		for(var i = 0; i < max; i++)
		{

			if(scores.players[i].score < prevScore)
			{
				rank = rank + 1;
			}

			prevScore = scores.players[i].score;
			try
			{

				var tempClass = "score-name";
				if(i == 0)
				{
					tempClass = "score-name top";
				}

				var image = "";
				if(scores.players[i].image != undefined && scores.players[i].image != "")
				{
					image = '<img src="' + scores.players[i].image + '" style="height: 35px; padding: 5px;" class="slide-in">';
				}


				//html += '<tr>';
				//html += '<td><div class="score-cell">' + rank + '</div></td><td><div class="score-cell">' + scores.players[i].name + '</div></td><td><div class="score-cell">' + scores.players[i].score + '</div></td>';
				//html += '</tr>';

				html += '<tr class="' + tempClass + '">';
				html += '<td width="10%">' + rank + '</td>';
				html += '<td width="20%">' + image + '</td>';
				html += '<td align="left" >' + scores.players[i].name + '</td>';
				html += '<td>' + scores.players[i].score + ' pts </td>';
				html += '</tr>';


			}
			catch(err){}
		}
		$('#tblPlayerScore > tbody').html(html);

		$('.score-name').slideDown();
		$('.slide-in').slideUp().slideDown();
	    
	});



	//---------------------------------------------------------------------------------------
	//Name:        gameMessaging.tick()
	//Description: handles the game tick event
	//---------------------------------------------------------------------------------------
	gameMessaging.on('tick', function (counter) {
		
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
		console.log("Game Info Retrieved!");
		console.log(msg);
		player.gameInfo = msg;

		console.log(player.gameInfo);

		//console.log("height - " + screen.height);

		gameRoom = msg.id + "_" + msg.sessionID;
		gameMessaging.emit('room', gameRoom);

		//hide the first form...
		$('#pnlSelect').fadeOut();
		$('#pnlStart').fadeIn();
		
		$('#lblGameID').html(player.gameInfo.id);
		$('#pnlGameID').html("Visit sg1.tech and use ID: " + player.gameInfo.id);

		
		new QRCode(document.getElementById("qrcode"), {text:"https://sg1.tech?gameID=" + player.gameInfo.id, height:500, width:500});

		//load the team display...	
		var teams = player.gameInfo.teams;
		var html = "";
		for(var i = 0; i < teams.length; i++)
		{
			var image = "";
			if(teams[i].image != undefined && teams[i].image != "")
			{
				image = '<img class="image-team" align="left" src="' + teams[i].image + '" height="50px;" style="border-radius: 50px; height: 50px; width:50px; padding: 5px;">';
			}
			else
			{
				image = '<div class="team-icon">' + teams[i].name.substr(0,1) + '</div>';
			}

			html += '<div class="team-cell">' + image + '<div class="team-counter" id="lstTeam' + teams[i].id + '">0</div></div>';  
			
		}
		$('#lstPlayers').html(html);



		gameRoom = player.gameInfo.id + "_" + player.gameInfo.sessionID;
		gameMessaging.emit('joinRoom', gameRoom);

		$('#btnStart').show();

		loadTheme();




	});

	//##############################################################################################################
	//---------------------------------------------------------------------------------------
	//Name:        PLAYMESSAGING NAMESPACE
	//Description: Namespace for the game play actions...
	//---------------------------------------------------------------------------------------
    var playMessaging = io(socketServer + 'play');
		playMessaging.on('connect', function () {
		console.log("playMessaging Connected!");

		if(playerRoom != "")
		{
			playMessaging.emit('joinRoom', playerRoom);
			console.log("Rejoining room - " + playerRoom);
		}
	});

	//---------------------------------------------------------------------------------------
	//Name:        playMessaging.joinedRoom()
	//Description: confirms loading of game info to server and joins admin to game management room
	//---------------------------------------------------------------------------------------
	playMessaging.on('joinedRoom', function (room) {
		playerRoom = room;
		console.log("Joined player room " + room );
	});

	//---------------------------------------------------------------------------------------
	//Name:        playMessaging.questionLoaded()
	//Description: handler for the connect event
	//---------------------------------------------------------------------------------------
	playMessaging.on('questionLoaded', function (question) {
		$('#lblTitle').show();
		console.log("loading question");
		timerMessage = "Time Left: ";
		
		$('body').addClass('question-body');
		$('body').removeClass('score-body'); 

		if(player.gameInfo.themeProperties != undefined && player.gameInfo.themeProperties.loaderImage != "none")
		{
			var loaderImage = api_url + "/themes/image/" + player.gameInfo.themeProperties.loaderImage;
		  	$('.question-body').css('background-image', 'url(' + loaderImage + ')');
		  	$('.question-body').css('background-position', 'center');
		  	$('.question-body').css('background-size', '140%');
		}



		if(question.type == "media")
		{
			question.question = question.question + ' <br/><center><video id="vdMain" width="320" controls><source src="movie.mp4" type="video/mp4"><source src="' + question.image + '" type="video/ogg">video not supported</video><br/></center>';
			console.log("video question...");
			togglePause();
			autoPlayMedia();
		}

		if(question.type == "image")
		{
			question.question = question.question + '<center><img src="' + question.image + '" style="height: 350px;"></center>';
		}

		$('#pnlScores').hide();
		$('#errorMessage').hide();
		player.currentQuestion = question;
		$('#lblTitle').html('<small><span style="color: #fa983a; font-size: 10px;"><center>Question ' + question.id + ' of ' + player.gameInfo.totalQuestions + '</center></span></small>');

		console.log(question.type + " question type");
		// && player.gameInfo.teams.length > 1
		if(question.type == "social")
		{
			$('#lblTitle').append("<h3> This is a social question.  Please check your phone. </h3>"  );

		}
		else
		{
			$('.question-link').unbind('click');
			$('#lblAnswer').html('');

			
			$('.player-answer').remove();
			$('.progress').removeClass('choice-selected');
			$('.progress').css('float','');
			$('.progress').css('width','');

			
			$('#lblTitle').append(question.question);
			$('#choice1-label').html(question.response1);
			$('#choice2-label').html(question.response2);
			$('#choice3-label').html(question.response3);
			$('#choice4-label').html(question.response4);

			console.log("choice - " + $('#choice4-label').html());


			$('#progress1').show();
			$('#progress2').show();
			$('#progress3').show();
			$('#progress4').show();

			if($('#choice1-label').html() == "")
				$('#progress1').hide();
			if($('#choice2-label').html() == "")
				$('#progress2').hide();
			if($('#choice3-label').html() == "")
				$('#progress3').hide();
			if($('#choice4-label').html() == "")
				$('#progress4').hide();
			

			$('#choice1').css('width','0%');
			$('#choice2').css('width','0%');
			$('#choice3').css('width','0%');
			$('#choice4').css('width','0%');

			$('.progress-bar').removeClass('bg-success');
			$('.progress-bar').removeClass('bg-danger');
			$('.progress-bar').addClass('bg-primary');


			$('#pnlChoices').fadeIn();
			
			var html = "";

			document.getElementById('vdMain').addEventListener('ended',togglePause,false);



		}

		//if it's a survey question for text...
		if(question.type == "survey")
		{
			$('#lblTitle').append("<h3> This is a survey question.  Please check your phone. </h3>"  );
		}

		if(question.type == "survey" && question.surveyType == "text")
		{
			$('#progress1').hide();
			$('#progress2').hide();
			$('#progress3').hide();
			$('#progress4').hide();
			$('#question-survey').show();
			$('#question-survey').removeAttr("disabled");
 			$('#btnSubmitSurvey').removeAttr("disabled");
		}

		if(question.tip != undefined)
		{
			$('#lblAnswer').html(question.tip);
		}


	});

	//---------------------------------------------------------------------------------------
	//Name:        playMessaging.selectionsUpdated()
	//Description: confirms loading of game info to server and joins admin to game management room
	//---------------------------------------------------------------------------------------
	playMessaging.on('selectionsUpdated', function (answers) 
	{

		if(player.gameInfo.teams.length == 1)
		{
			$('#choice1').css('width',answers[0] + '%');
			$('#choice2').css('width',answers[1] + '%');
			$('#choice3').css('width',answers[2] + '%');
			$('#choice4').css('width',answers[3] + '%');
		}



	});


  


	function loadGame()
	{
		console.log("sending game request...");
		gameMessaging.emit('loadGame', gameInfo);
		gameMessaging.emit('getGameInfo', gameInfo.id);
	}

	function getGameInfo() 
	{
	    
		console.log("getting game info");


		//was there a reservation ID?
		var urlResID = getUrlParam("rv","none");
		if(urlResID != "none")
		{
			var url = config.api_url + "/games/reservations/" + urlResID; 
			var sessionID = urlResID.toUpperCase();
			console.log("res found");
		}
		else
		{
			var url = config.api_url + "/games/" + getUrlParam('id',0); 
			var sessionID = generateID();
		}



		//perform AJAX call to the API to get our data...
		var params = {};

		//perform the call
		fetch(url,{  
		method: 'GET',
		}).then(function (response) 
		{  
		return response.json();
		})  
		.then(function(data) 
		{
			console.log("game data");
			console.log(data);

			var timings = JSON.parse(data.timings);
			var guid = data.hostID;
		

			teams = JSON.parse(data.teams);
			questions = JSON.parse(data.questions);
			formItems = JSON.parse(data.form_items);
			gameInfo.teams = JSON.parse(data.teams);
			gameInfo.questions = JSON.parse(data.questions);
			gameInfo.formItems = JSON.parse(data.form_items);
			gameInfo.id = generatePlayCode();
			gameInfo.gameID = data.ID;
			gameInfo.hostID = guid;
			gameInfo.themeID = data.themeID;
			gameInfo.countdownBeforeStart = timings.timing_start;
			gameInfo.countdownPerQuestion = timings.timing_trivia;
			gameInfo.countdownPerReview = timings.timing_review;

			gameID = data.id;
			console.log("getting data...");
			console.log(gameInfo);

			loadGame();
			

		});






	}


	function skipItem()
	{
		skipQuestion = true;
		gameMessaging.emit('skipItem', player.gameInfo.id, player.gameInfo.sessionID);
	}


	function togglePause()
	{


		gameMessaging.emit('togglePause', player.gameInfo.id, player.gameInfo.sessionID);
	}


	function startGame()
	{
		gameMessaging.emit('startGame', player.gameInfo.id, player.gameInfo.sessionID);

		$('#btnPause').show();
		$('#btnStart').hide();
		$('#btnStop').show();
		$('#btnPause').show();
		$('#btnSkip').show();
		$('#btnResume').hide();
	}

	function stopGame()
	{

		gameMessaging.emit('stopGame', player.gameInfo.id, player.gameInfo.gameID, player.gameInfo.sessionID);
		$('#btnPause').hide();
		$('#btnStop').hide();
		$('#btnStart').show();
		$('#btnPause').hide();
		$('#btnResume').hide();
	}


	function performCountdown(seconds, handler)
    {
        gameMessaging.emit('performCountdown', seconds, player.gameInfo.id, player.gameInfo.sessionID, handler);
    }



	function switchTheme()
	{

		
		switch($('#slctTheme').val()) 
		{
		  case "default":
		    $('#lnkTheme').attr('href','./themes/tv-default.css');
		    break;
		  case "casual":
		    $('#lnkTheme').attr('href','./themes/tv-casual.css');
		    break;
		  case "fun":
		    $('#lnkTheme').attr('href','./themes/tv-fun.css');
		    break;
		  case "strong":
		    $('#lnkTheme').attr('href','./themes/tv-strong.css');
		    break;
		  default:
		    $('#lnkTheme').attr('href','./themes/tv-fun.css');
		} 
		

		


	}

	function loadTheme()
	{
		console.log("loading theme...");
		console.log(player.gameInfo.themeID);

		if(player.gameInfo.themeID != undefined && player.gameInfo.themeID != "")
		{

		  var url = api_url + "/themes/" + player.gameInfo.themeID + "";  
		  var params = {};

		  //perform the call
		  fetch(url,{  
		  	method: 'GET',
		  }).then(function (response) 
		  {  
		  	return response.json();
		  })  
		  .then(function(data) 
		  {

		  	
		  	console.log(data);

		  	if(data.properties != undefined && data.properties != "")
		  	{

			  	var properties = JSON.parse(data.properties);
			  	player.gameInfo.themeProperties = properties;

			  	var loaderImage = api_url + "/themes/image/" + player.gameInfo.themeProperties.loaderImage;
			  	$('.question-body').css('background-image', 'url(' + loaderImage + ')');

			  	var scoreImage = api_url + "/themes/image/" + player.gameInfo.themeProperties.scoreImage;
			  	$('.score-body').css('background-image', 'url(' + scoreImage + ')');

			  	$('.question-body').css('background-position', 'center');
			  	$('.question-body').css('background-size', '140%');

		  	}

		  });


		}
		else
		{
			var properties = {"loaderImage":"none","scoreImage":"none"};
			player.gameInfo.themeProperties = properties;
		}



	}

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


	function getUrlParam(parameter, defaultvalue){
	    var urlparameter = defaultvalue;
	    if(window.location.href.indexOf(parameter) > -1){
	        urlparameter = getUrlVars()[parameter];
	    }

	    return urlparameter;
	}



	function autoPlayMedia()
	{

			//$('#btnStopMedia').show();
			//$('#btnPlayMedia').hide();
			gameMessaging.emit('playMedia', gameInfo.id);
			playMedia = true;
		
	}





	function generatePlayCode()
	{
		   var result           = '';
		   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		   var charactersLength = characters.length;
		   for ( var i = 0; i < 2; i++ ) {
		      result += characters.charAt(Math.floor(Math.random() * charactersLength));
		   }

		   result += Math.floor(Math.random() * 10);
		   result += Math.floor(Math.random() * 10);

		   return result;
	}

	function generateID(seed)
	{

			return seed + '_' + Math.random().toString(36).substr(2, 9);
	}