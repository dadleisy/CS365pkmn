// mongo.db server stuff
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
//var ObjectID = mongodb.ObjectID;
var client = new MongoClient("mongodb://localhost:27017", { useNewUrlParser: true });
var db;

var express = require("express");
var app = express();
var http = require("http");
var server = http.Server(app);
var socketio = require("socket.io");
var io = socketio(server);
app.use(express.static("pub"));

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

function getUsernameListLowerCase() { // borrowing this for our own checks. Thanks! :-)
	var ret = [];

	for(i in trainerNames) {
		ret.push(trainerNames[i].toLowerCase()); // send out all names
	}

	return ret;
}

function sendQueue(q) {
    return q;
}

var trainerNames = [];
var queue = [];
var sizeQueue = 0;

// player one and two
// DONT KNOW if we will need these?
var p1 = [];
var p2 = [];

// database insert of Pokemon
var pkmn = {name: "name", hp: 0, atk: 0, def: 0, spd: 0, m1: 0, m2: 0, m3: 0, m4: 0};
var move = {moveName: "name", power: "power", acr: "acr"};
//db.insert(new pkmn("Blastoise", 154, 92, 120, 98, "tackle", 40, 100, "tackle", 40, 100, "tackle", 40, 100, "tackle", 40, 100));
//db.insert(new pkmn("Venasaur", 155, 91, 103, 100, "tackle", 40, 100, "tackle", 40, 100, "tackle", 40, 100, "tackle", 40, 100));


// I dont want to mess with your variables, so I will just add the this.attribute to this section

// !!!!! BIG UPDATE: CHANGING attack#name, attack#damage to OBJECT "attack1"
function pokemon(name, image, maxHealth, attack, defense, speed, attack1, attack2, attack3, attack4) {
    this.name = name;
    this.image = image;
    this.maxHealth = maxHealth; 
    this.currentHealth = maxHealth;

    // add new variable

    // convert broken variables into objects

    this.attack1 = {name: "name", power: 0, accuracy: 0};
    this.attack2 = {name: "name", power: 0, accuracy: 0};
    this.attack3 = {name: "name", power: 0, accuracy: 0};
    this.attack4 = {name: "name", power: 0, accuracy: 0};
    this.getCurrentHealth = function(){
        return this.currentHealth;
    }

    this.getSprite = function(){
        return this.image;
    }

    this.getName = function(){
        return this.name;
    }

    this.getAttack1Info = function(){
        var attackInfo = [];
            attackInfo [0] = this.attack1Name;
            attackInfo [1] = this.attack1Damage;
            //number of attacks left
            //attack speed
            //attack type
            //etc...
        return attackInfo;
    }
    this.getAttack2Info = function(){
        var attackInfo = [];
            attackInfo [0] = this.attack2Name;
            attackInfo [1] = this.attack2Damage;
        return attackInfo;
    }
    this.getAttack3Info = function(){
        var attackInfo = [];
            attackInfo [0] = this.attack3Name;
            attackInfo [1] = this.attack3Damage;
        return attackInfo;
    }
    this.getAttack4Info = function(){
        var attackInfo = [];
            attackInfo [0] = this.attack4Name;
            attackInfo [1] = this.attack4Damage;
        return attackInfo;
    }
    this.effectPokemonHealth = function (healOrDamage, amount){
        if(healOrDamage == true){
            this.currentHealth -= amount;
        }
        else{
            this.currentHealth += amount;
        }
    }
    this.isKOed = function(){
        if(this.currentHealth <= 0){
            return true;
        }
        return false;
    }
    this.quickFindAttack = function(attackNumber){
        if(attackNumber == 1){
            return this.getAttack1Info();
        }
        else if(attackNumber == 2){
            return this.getAttack2Info();
        }
        else if(attackNumber == 3){
            return this.getAttack3Info();
        }
        else if(attackNumber == 4){
            return this.getAttack4Info();
        }
    }
} // end PKMN initializer

//set these when grabbing from the data base
var playerOnePokemon = new pokemon ("default1", "default.PNG", 150, "Attack 1", 20, "Attack 2", 30, "Attack 3", 40, "Attack 4", 50,);
var playerTwoPokemon = new pokemon ("default2", "default.PNG", 150, "Attack 1", 20, "Attack 2", 30, "Attack 3", 40, "Attack 4", 50,);



/*
picking from data base

var playerOne = [3];
(int i = 0; i < playerOne.length; i++){
    var playerOnePokemon = new pokemon (~~~~~~~~~);
    playerOne[i] = playerOnePokemon;
}
*/



/********************************************** remove stuff below **************************************/


var playerOneSpeed = 0;
var playerTwoSpeed = 0;

function makePlayerSpeedsRandom(){
    playerOneSpeed = Math.floor(Math.random() * Math.floor(100));
    playerTwoSpeed = Math.floor(Math.random() * Math.floor(100));
}


/******************************************** remove stuff above ************************************************/





io.on("connection", function(socket) {
    console.log("Somebody connected.");
    // update trainer name

    socket.on("disconnect", function() {
		//This particular socket connection was terminated (probably the client went to a different page
		//or closed their browser).
		console.log(trainerNames[socket.id] + " disconnected.");
        delete queue[queue.indexOf(trainerNames[socket.id])]; // pop guy from queue
        delete trainerNames[socket.id]; // pop guy from game world
        queue = queue.filter(Boolean); // get rid of empties
        console.log(queue);
        io.emit("updateQueue", sendQueue(queue));
        io.emit("showPKMN", sendQueue(queue));
	});

    socket.on("setTrainer", function(username, callbackFunctionForClient) {
		if (getUsernameListLowerCase().indexOf(username.toLowerCase()) >= 0 || username == "") { //username already exists.
			callbackFunctionForClient(false);
		}
		else {
            sizeQueue += 1; // increase size of queue
            queue.push(username); // set queue position
            trainerNames[socket.id] = username; // may have to disconnect
            console.log("My socket's ID is: " + queue[queue.length - 1]);
            if (queue.length >= 2) {
                // function for checking if you're real
                if ( queue[queue.indexOf(trainerNames[socket.id])] == queue[0] || queue[queue.indexOf(trainerNames[socket.id])] == queue[1]) {
                    // if you are playing, get the Pokemon pick menu
                    io.emit("showPKMN", sendQueue(queue));
                }
                else {
                    // display the "Players are choosing pokemon" screen
                }
            }
			io.emit("updateQueue", sendQueue(queue));
			callbackFunctionForClient(true);
		}
    });
    
    socket.on("sendPKMN", function() { // sends array of PKMN to list for picking
		db.collection("pkmn").find({}).toArray(function(err, pokemon) {
			if (err!=null) {
				console.log("ERROR: " + err);
			}
			else {
                console.log(pokemon);
				socket.emit("addPKMNtoList", pokemon);
			}
		});
    });
    
    socket.on("setPKMN", function(pkmn1, pkmn2, pkmn3, callbackFunctionForClient) { // sets a players pokemon from their selection
        // queue.indexOf(trainerNames[socket.id]) // will be zero or one
        var tempPKMN1 = db.collection("pkmn").find({_id : pkmn1});
        console.log(tempPKMN1);
        if (tempPKMN1.length) {
            // pokemon good
            console.log("Valid PKMN 1");
        }
    });






    // start game
    io.emit("effectPlayerOneHealth", playerOnePokemon.getCurrentHealth());
    io.emit("effectPlayerTwoHealth", playerTwoPokemon.getCurrentHealth());
    io.emit("getAllBasicInfoOfPlayerOnePokemon", playerOnePokemon.getName(), playerOnePokemon.getSprite(), playerOnePokemon.getCurrentHealth(), playerOnePokemon.attack1Name, playerOnePokemon.attack2Name, playerOnePokemon.attack3Name, playerOnePokemon.attack4Name);
    io.emit("getAllBasicInfoOfPlayerTwoPokemon", playerTwoPokemon.getName(), playerTwoPokemon.getSprite(), playerTwoPokemon.getCurrentHealth(), playerTwoPokemon.attack1Name, playerTwoPokemon.attack2Name, playerTwoPokemon.attack3Name, playerTwoPokemon.attack4Name);

    var playerOneReady = false;
    var playerTwoReady = false;
    var playerOneAttackedWith = -1;
    var playerTwoAttackedWith = -1;

    function fight(readyOne, readyTwo){
        if(readyOne == true && readyTwo == true){
            makePlayerSpeedsRandom();
            if(playerOneSpeed >= playerTwoSpeed){
                io.emit("whoAttackedFirst", 1);
                playerTwoPokemon.effectPokemonHealth(true, playerOnePokemon.quickFindAttack(playerOneAttackedWith)[1]);
                io.emit("effectPlayerTwoHealth", playerTwoPokemon.getCurrentHealth());
                if(playerTwoPokemon.isKOed() == true){
                    console.log("player one won")
                }
                playerOnePokemon.effectPokemonHealth(true, playerTwoPokemon.quickFindAttack(playerTwoAttackedWith)[1]);
                io.emit("effectPlayerOneHealth", playerOnePokemon.getCurrentHealth());
                if(playerOnePokemon.isKOed() == true){
                    console.log("player two won")
                }          
            }
            else{
                io.emit("whoAttackedFirst", 2);
                playerOnePokemon.effectPokemonHealth(true, playerTwoPokemon.quickFindAttack(playerTwoAttackedWith)[1]);
                io.emit("effectPlayerOneHealth", playerOnePokemon.getCurrentHealth());
                if(playerOnePokemon.isKOed() == true){
                    console.log("player two won")
                }
                playerTwoPokemon.effectPokemonHealth(true, playerOnePokemon.quickFindAttack(playerOneAttackedWith)[1]);
                io.emit("effectPlayerTwoHealth", playerTwoPokemon.getCurrentHealth());
                if(playerTwoPokemon.isKOed() == true){
                    console.log("player one won")
                }
            }
            playerOneReady = false;
            playerTwoReady = false;
        }
    }


    socket.on("firstAttack1", function(){
        playerOneAttackedWith = 1;
        playerOneReady = true;
        fight(playerOneReady, playerTwoReady);
    });
    socket.on("firstAttack2", function(){
        playerTwoAttackedWith = 1;
        playerTwoReady = true;
        fight(playerOneReady, playerTwoReady);
    });

    socket.on("secondAttack1", function(){
        playerOneAttackedWith = 2;
        playerOneReady = true;
        fight(playerOneReady, playerTwoReady);
    });
    socket.on("secondAttack2", function(){
        playerTwoAttackedWith = 2;
        playerTwoReady = true;
        fight(playerOneReady, playerTwoReady);
    });

    socket.on("thirdAttack1", function(){
        playerOneAttackedWith = 3;
        playerOneReady = true;
        fight(playerOneReady, playerTwoReady);
    });
    socket.on("thirdAttack2", function(){
        playerTwoAttackedWith = 3;
        playerTwoReady = true;
        fight(playerOneReady, playerTwoReady);
    });

    socket.on("fourthAttack1", function(){
        playerOneAttackedWith = 4;
        playerOneReady = true;
        fight(playerOneReady, playerTwoReady);
    });
    socket.on("fourthAttack2", function(){
        playerTwoAttackedWith = 4;
        playerTwoReady = true;
        fight(playerOneReady, playerTwoReady);
    });

}); // end on connection

//server.listen(80, function () {
//    console.log("Server is waiting on port 80.");
//});

var dbName = "pokemon";

client.connect(function(err) {
	if (err != null) throw err;
	else {
        db = client.db(dbName);
        console.log()
        // add default pokemon to game
        db.collection("pkmn").insertOne({_id : 6, name : "Charizard", hp : 153, atk : 93, def : 98, spd : 120, m1name : "Slash", m1pwr : 40, m1acr : 100, m2name : "Fire Blast", m2pwr : 110, m2acr : 85, m3name : "Fire Spin", m3pwr : 35, m3acr : 85, m4name : "Fly", m4pwr : 90, m4acr : 95,});
        db.collection("pkmn").insertOne({_id : 9, name : "Blastoise", hp : 154, atk : 92, def : 120, spd : 98, m1name : "Tackle", m1pwr : 40, m1acr : 100, m2name : "Fire Blast", m2pwr : 110, m2acr : 85, m3name : "Fire Spin", m3pwr : 35, m3acr : 85, m4name : "Fly", m4pwr : 90, m4acr : 95,});
        db.collection("pkmn").insertOne({_id : 3, name : "Venasaur", hp : 155, atk : 91, def : 103, spd : 100, m1name : "Scratch", m1pwr : 40, m1acr : 100, m2name : "Fire Blast", m2pwr : 110, m2acr : 85, m3name : "Fire Spin", m3pwr : 35, m3acr : 85, m4name : "Fly", m4pwr : 90, m4acr : 95,});
        155, 91, 103, 100,
        db.collection("pkmn").insertOne({_id : 51, name : "Machamp", hp : 153, atk : 93, def : 98, spd : 120, m1name : "Slam", m1pwr : 40, m1acr : 100, m2name : "Fire Blast", m2pwr : 110, m2acr : 85, m3name : "Fire Spin", m3pwr : 35, m3acr : 85, m4name : "Fly", m4pwr : 90, m4acr : 95,});

        
        server.listen(80, function() {
			console.log("Mongo Server with socket.io is ready.");
		});
	}
});

//console.log(db);
//db.collection("pkmn").insertOne({_id : 6, name : "Charizard", hp : 153, atk : 93, def : 98, spd : 120, m1name : "tackle", m1pwr : 40, m1acr : 100});
