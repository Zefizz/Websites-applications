/* function to get hero data from the server as JSON text
 * hero and style data returned in one JSON object */
function getHero(name) {			
	xhr = new XMLHttpRequest();
	xhr.open('GET','/hero?name='+name,false);
	xhr.send();
	return JSON.parse(xhr.responseText);
}

/*helper function to get hero info from a form select element by id*/
function getHeroFromForm(id) {
	var select = document.getElementById(id);
	drawHeroInfo(select[select.selectedIndex].value);
}

/* get the superhero object and do things with it */
function drawHeroInfo(name) {
	var heroObj = getHero(name);
	var style = document.getElementById('div2').style
	
	style.backgroundColor = heroObj.style.backgroundColor;
	style.color = heroObj.style.color;
	style.borderColor = heroObj.style.borderColor || "black";
	
	document.getElementById('name').value = heroObj.name;
	document.getElementById('ego').value  = heroObj.alterEgo;
	document.getElementById('juri').value = heroObj.jurisdiction;
	
	/*get superpowers and append all superpower data*/
	var powerArea = document.getElementById('powers');
	powerArea.innerHTML = '';	//refresh the test area
	for(var i=0;i<heroObj.superpowers.length;i++)
		powerArea.innerHTML += heroObj.superpowers[i] + '\n';
}

/*put the hero names into the form*/
function populateOptions(allHeroes) {
	heroNames = allHeroes.heroes;
	var options = document.getElementById('selector').options;
	for(var i=0; i<heroNames.length; i++)
		options[i].innerHTML = sterilizeHero(heroNames[i]);
}

/*simple way to split the expected strings*/
function sterilizeHero(str) {
	var p1 = str.split('.');
	var p2 = p1[0].split('_');
	if(!p2[1]) return p2[0];
	else return p2[0]+ ' ' + p2[1];
}

/* send request for /allHeroes, then pupulate
 * the form with the relavent names */
window.addEventListener('load',function(ent) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET','/allHeroes',false);
	xhr.send();
	populateOptions(JSON.parse(xhr.responseText));
});

function sayHello() {
	alert('hello');
}