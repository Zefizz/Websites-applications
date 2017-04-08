/* Author: Zefizz ********* */
/*         *********        */
/*         *********        */

var currentUser    = '';
var flippedColor   = '#def';
var unflippedColor = '#aaa';
var lastCard       = undefined;
var lastCardValue  = -1;
var boardSize      = 4;
var canFlipNext    = false;
var guessesMade    = 0;
var startNewGame   = undefined;

/*do the things when ready*/
$(document).ready(function(){
	/*draw the cards*/
	$('#div2').append("<table><tr id='row1'/><td><div class='card' id='00' value='down'></td><td><div class='card' id='01' value='down'></td>"+
					"<td><div class='card' id='02' value='down'></td><td><div class='card' id='03' value='down'></td></tr><tr id='row2'/>"+
					"<td><div class='card' id='10' value='down'></td><td><div class='card' id='11' value='down'></td>"+
					"<td><div class='card' id='12' value='down'></td><td><div class='card' id='13' value='down'></td></tr><tr id='row3'/>"+
					"<td><div class='card' id='20' value='down'></td><td><div class='card' id='21' value='down'></td>"+
					"<td><div class='card' id='22' value='down'></td><td><div class='card' id='23' value='down'></td></tr><tr id='row4'/>"+
					"<td><div class='card' id='30' value='down'></td><td><div class='card' id='31' value='down'></td>"+
					"<td><div class='card' id='32' value='down'></td><td><div class='card' id='33' value='down'></td></tr></table>");

	/*ask user for name, andstart the game*/
	currentUser = prompt("What is your name?");
	if(currentUser==='')
		currentUser = 'Jason';	//default name
	
	/*start a new game -> define within ready to
	 *ensure it exists before being called*/
	startNewGame = function(){
		guessesMade = 0;
		correctCount = 0;
		lastCard = undefined;
		lastCardValue = -1;
		/*send name to server in JSON string*/
		var nameObj = { name : currentUser };
		
		$.post('/memory/intro',JSON.stringify(nameObj));
	};
	canFlipNext = true;
	/*start the handler*/
	$('div.card').on('click',cardClickHandler);
	
	startNewGame();
});


/*send GET request everytime a card is clicked*/
/*the id of the div is the row and column indices*/
function cardClickHandler() {

	if(!canFlipNext) return;
	
	//check if the card has been flipped
	if( $(this).attr('value')==='down' ) {
		var card = $(this);
		//flip the card
		var row = card.attr('id')[0];
		var col = card.attr('id')[1];
		$.get('/memory/card?name='+currentUser+'&row='+row+'&col='+col,function(data) {
			flipCard(card,data);
		});		
	} //else do nothing - card is flipped
}

/*flip the card and decide what to do*/
function flipCard(card,data) {
	
	/*flip the card*/
	card.append('<p>'+data+'</p>');
	card.css('backgroundColor',flippedColor);
	card.attr('value','up');
	
	if(lastCard) {	//there is a card waiting
		guessesMade++;
		canFlipNext = false;
		/*wait for a second before ddeciding what to do*/
		window.setTimeout(function(){
			/*check if there is a match - card stayes downs and memory cleared*/
			if(lastCardValue===data) {
				/*the game is over- start a new game*/
				if(++correctCount === boardSize*boardSize/2) {
					alert('Congrats! You took '+guessesMade+' guesses to win.');
					/*flip all cards back down and start a new game*/
					$('.card').css('backgroundColor',unflippedColor);
					$('.card').empty();
					$('.card').attr('value','down');
					startNewGame();
				}
			}
			else {	//flip both cards back down
				card.css('backgroundColor',unflippedColor);
				lastCard.css('backgroundColor',unflippedColor);
				card.attr('value','down');
				lastCard.attr('value','down');	
				card.empty();
				lastCard.empty();
			}
			/*clear memory of the last card, allow flipping again*/
			lastCard = undefined;
			lastCardValue = -1;
			canFlipNext = true;
		},1000);
	}
	else {//last card becomes this card
		lastCard = card;
		lastCardValue = data;
	}
}

function startNewGame() {
	
}

function foo(){};

/*say Hello*/
function sayHello() {
	alert('hello');
}
