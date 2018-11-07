// mongo.db server stuff
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;
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

var trainerNames = [];
var queue = [];

// player one and two
var p1 = [];
var p2 = [];

// database insert of Pokemon
var pkmn = {name: "name", hp: 0, atk: 0, def: 0, spd: 0, m1: 0, m2: 0, m3: 0, m4: 0};
var move = {moveName: "name", power: "power", acr: "acr"};
//db.pokemon.insert(new pkmn("Charizard", 153, 93, 98, 120, new move("tackle", 40, 100), new move("tackle", 40, 100), new move("tackle", 40, 100), new move("tackle", 40, 100)));
//db.pokemon.insert(new pkmn("Blastoise", 154, 92, 120, 98, new move("tackle", 40, 100), new move("tackle", 40, 100), new move("tackle", 40, 100), new move("tackle", 40, 100)));
//db.pokemon.insert(new pkmn("Venasaur", 155, 91, 103, 100, new move("tackle", 40, 100), new move("tackle", 40, 100), new move("tackle", 40, 100), new move("tackle", 40, 100)));

function pokemon(name, image, maxHealth, attack, defense, speed, attack1Name, attack1Damage, attack2Name, attack2Damage, attack3Name, attack3Damage, attack4Name, attack4Damage,) {
    this.name = name;
    this.image = image;
    this.maxHealth = maxHealth; 
    this.currentHealth = maxHealth;

    // add new variable

    // convert broken variables into objects

    this.attack1Name = attack1Name;
    this.attack1Damage = attack1Damage;
    this.attack2Name = attack2Name;
    this.attack2Damage = attack2Damage;
    this.attack3Name = attack3Name;
    this.attack3Damage = attack3Damage;
    this.attack4Name = attack4Name;
    this.attack4Damage = attack4Damage;

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

server.listen(80, function () {
    console.log("Server is waiting on port 80.");
});