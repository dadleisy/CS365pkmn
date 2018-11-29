// mongo.db server stuff
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
// var ObjectID = mongodb.ObjectID;
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getUsernameListLowerCase() { // borrowing this for our own checks. Thanks! :-)
    var ret = [];

    for (i in trainerNames) {
        ret.push(trainerNames[i].toLowerCase()); // send out all names
    }

    return ret;
}

function sendQueue(q) {
    return q;
}

function whatTrainer(indexID) {
    if (queue[queue.indexOf(trainerNames[indexID])] == queue[0]) {
        console.log("T1");
        return true;
    }
    else {
        console.log("T2");
        return false;
    }
}

function pkmnArray2Class(array) {
    // id, name, image, maxHealth, type, atk, def, spd, m1name, m1pwr, m1acr, m2name, m2pwr, m2acr, m3name, m3pwr, m3acr, m4name, m4pwr, m4acr
    return new pokemon(array._id , array.name, array.image, array.hp, array.type, array.atk, array.def, array.spd, array.m1name, array.m1pwr, array.m1acr, array.m2name, array.m2pwr, array.m2acr, array.m3name, array.m3pwr, array.m3acr, array.m4name, array.m4pwr, array.m4acr);
}

// function bonusDMG { ADD IF TIME, will do a calculation if move is of right type against pokemon, attack bonus

// }

var trainerNames = [];
var queue = [];
var ready = 0;

// player one and two
var p1 = [];
var p2 = [];
var playerOnePokemon = {};
var playerTwoPokemon = {};
// POKEMON INITIALIZATION SECTION
// To do types in a fake way, I am going to write a function 

// _id : 6, name : "Charizard", hp : 153, atk : 93, def : 98, spd : 120, m1name : "Slash", m1pwr : 40, m1acr : 100, m2name : "Fire Blast", m2pwr : 110, m2acr : 85, m3name : "Fire Spin", m3pwr : 35, m3acr : 85, m4name : "Fly", m4pwr : 90, m4acr : 95
function pokemon(id, name, image, maxHealth, type, atk, def, spd, m1name, m1pwr, m1acr, m2name, m2pwr, m2acr, m3name, m3pwr, m3acr, m4name, m4pwr, m4acr) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.type = type;
    this.atk = atk;
    this.def = def;
    this.spd = spd;
    // attack 1
    this.m1name = m1name;
    this.m1pwr = m1pwr;
    this.m1acr = m1acr;
    // attack 2
    this.m2name = m2name;
    this.m2pwr = m2pwr;
    this.m2acr = m2acr;
    // attack 3
    this.m3name = m3name;
    this.m3pwr = m3pwr;
    this.m3acr = m3acr;
    // attack 4
    this.m4name = m4name;
    this.m4pwr = m4pwr;
    this.m4acr = m4acr;

    this.getCurrentHealth = function () {
        return this.currentHealth;
    }

    this.getSprite = function () {
        return this.image;
    }

    this.getName = function () {
        return this.name;
    }

    this.getSpeed = function (){
        return this.spd;
    }
    this.getType = function(){
        return this.type;
    }

    this.getAttack1Info = function () {
        var attackInfo = [];
        attackInfo[0] = this.m1name;
        attackInfo[1] = this.m1pwr;
        attackInfo[2] = this.m1acr;
        //attack type
        return attackInfo;
    }
    this.getAttack2Info = function () {
        var attackInfo = [];
        attackInfo[0] = this.m2name;
        attackInfo[1] = this.m2pwr;
        attackInfo[2] = this.m2acr;
        //attack type
        return attackInfo;
    }
    this.getAttack3Info = function () {
        var attackInfo = [];
        attackInfo[0] = this.m3name;
        attackInfo[1] = this.m3pwr;
        attackInfo[2] = this.m3acr;
        //attack type
        return attackInfo;
    }
    this.getAttack4Info = function () {
        var attackInfo = [];
        attackInfo[0] = this.m4name;
        attackInfo[1] = this.m4pwr;
        attackInfo[2] = this.m4acr;
        //attack type
        return attackInfo;
    }
    this.effectPokemonHealth = function (healOrDamage, amount) {
        if (healOrDamage == true) {
            this.currentHealth -= amount;
        }
        else {
            this.currentHealth += amount;
        }
    }
    this.isKOed = function () {
        if (this.currentHealth <= 0) {
            return true;
        }
        return false;
    }
    this.quickFindAttack = function (attackNumber) {
        if (attackNumber == 1) {
            return this.getAttack1Info();
        }
        else if (attackNumber == 2) {
            return this.getAttack2Info();
        }
        else if (attackNumber == 3) {
            return this.getAttack3Info();
        }
        else if (attackNumber == 4) {
            return this.getAttack4Info();
        }
    }
} // end PKMN initializer

/***********************************zack added on 11/28/18*************************************************/
function trainer (name, pokemon1, pokemon2, pokemon3){
    this.name = name;
    this.pokemon1 = pokemon1;
    this.pokemon2 = pokemon2;
    this.pokemon3 = pokemon3;
    this.currentlyUseingPokemon = 1;//1, 2, or 3
    this.numberNotKOed = 3;
    this.potions = 1;

    this.getName = function(){
        return this.name;
    }
    this.setName = function(newName){
        this.name = newName;
    }
    this.getCurrentlyUseingPokemon = function(){
        return "pokemon"+this.currentlyUseingPokemon;
    }
    this.getNumberOfPokemonLeft = function(){
        return this.numberNotKOed;
    }
    this.changePokemon = function(changeTo){
        if(this["pokemon"+changeTo].getCurrentHealth() > 0){
            this.currentlyUseingPokemon = changeTo;
        }else{
            return -1;
        }
    }
    this.pokemonKOed = function(){
        this.numberNotKOed = this.numberNotKOed - 1;
        return this.numberNotKOed; 
    }
}
//an example of adding pokemon to trainers
//creating the pokemon and adding them to their trainer can be moved safely to anywere below this point and above autoswap().
//pokemon must be created before adding them to trainers.
//the trainers var names must be "trainerOne" and "trainerTwo". pokemmons var name can be anything

 var playerOnePokemon1 = new pokemon (3, "defaultName1", "default.PNG", 150, "type", 1, 1, 1, "Attack 1", 20, 1, "Attack 2", 30, 1, "Attack 3", 40, 1, "Attack 4", 150, 1);
 var playerOnePokemon2 = new pokemon (6, "defaultName2", "default.PNG", 150, "type", 1, 1, 1, "Attack 1", 20, 1, "Attack 2", 30, 1, "Attack 3", 40, 1, "Attack 4", 150, 1);
 var playerOnePokemon3 = new pokemon (9, "defaultName3", "default.PNG", 150, "type", 1, 1, 1, "Attack 1", 20, 1, "Attack 2", 30, 1, "Attack 3", 40, 1, "Attack 4", 150, 1);
  
 var playerTwoPokemon1 = new pokemon (3, "defaultName1", "default.PNG", 150, "type", 1, 1, 1, "Attack 1", 20, 1, "Attack 2", 30, 1, "Attack 3", 40, 1, "Attack 4", 150, 1);
 var playerTwoPokemon2 = new pokemon (6, "defaultName2", "default.PNG", 150, "type", 1, 1, 1, "Attack 1", 20, 1, "Attack 2", 30, 1, "Attack 3", 40, 1, "Attack 4", 150, 1);
 var playerTwoPokemon3 = new pokemon (9, "defaultName3", "default.PNG", 150, "type", 1, 1, 1, "Attack 1", 20, 1, "Attack 2", 30, 1, "Attack 3", 40, 1, "Attack 4", 150, 1);
 
 var trainerOne = new trainer("playerOne", playerOnePokemon1, playerOnePokemon2, playerOnePokemon3);
 var trainerTwo = new trainer("playerTwo", playerTwoPokemon1, playerTwoPokemon2, playerTwoPokemon3);
 

/***********************************end of first new addition***********************************************/

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//set these when grabbing from the data base
// CHANGE FOR NEW SYSTEM !!!

io.on("connection", function (socket) {
    console.log("Somebody connected.");
    // update trainer name

    socket.on("disconnect", function () {
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

    socket.on("setTrainer", function (username, callbackFunctionForClient) {
        if (getUsernameListLowerCase().indexOf(username.toLowerCase()) >= 0 || username == "") { //username already exists.
            callbackFunctionForClient(false);
        }
        else {
            queue.push(username); // set queue position
            trainerNames[socket.id] = username; // may have to disconnect
            console.log("My socket's ID is: " + queue[queue.length - 1]);
            if (queue.length >= 2) {
                // function for checking if you're real
                if (queue[queue.indexOf(trainerNames[socket.id])] == queue[0] || queue[queue.indexOf(trainerNames[socket.id])] == queue[1]) {
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

    socket.on("sendPKMN", function () { // sends array of PKMN to list for picking
        db.collection("pkmn").find({}).toArray(function (err, pokemon) {
            if (err != null) {
                console.log("ERROR: " + err);
            }
            else {
                //console.log(pokemon);
                socket.emit("addPKMNtoList", pokemon);
            }
        });
    });

    socket.on("setPKMN", function (pkmn1, pkmn2, pkmn3, callbackFunctionForClient) { // sets a players pokemon from their selection
        // queue.indexOf(trainerNames[socket.id]) // will be zero or one
        var validTeam = 0;
        db.collection("pkmn").find({ _id: parseFloat(pkmn1) }).toArray(function (err, pkmnID1) { // PKMN 1
            var tempPKMN1 = pkmnID1; // gives array containing one PKMN object
            if (tempPKMN1.length) { // if there's a pokemon in there
                validTeam += 1; // one pokemon good!
                // time to set PKMN into player array
                if (whatTrainer(socket.id)) { // if you're P1 or P2
                    p1[0] = pkmnArray2Class(tempPKMN1[0]);
                    playerOnePokemon = pkmnArray2Class(tempPKMN1[0]); // sends array to constructor and returns pokemon(args)
                    // console.log(tempPKMN1[0]._id);
                    // console.log(playerOnePokemon);
                }
                else {
                    p2[0] = pkmnArray2Class(tempPKMN1[0]);
                    playerTwoPokemon = pkmnArray2Class(tempPKMN1[0]); // sends array to constructor and returns pokemon(args)
                }
                    // console.log("Valid PKMN 1");
            }
        });
        db.collection("pkmn").find({ _id: parseFloat(pkmn2) }).toArray(function (err, pkmnID1) { // PKMN 2
            var tempPKMN1 = pkmnID1;
            if (tempPKMN1.length) { // if there's a pokemon in there
                validTeam += 1; // one pokemon good!
                // time to set PKMN into player array
                if (whatTrainer(socket.id)) { // if you're P1 or P2
                    p1[1] = pkmnArray2Class(tempPKMN1[0]);
                    //playerOnePokemon = pkmnArray2Class(tempPKMN1[0]); // sends array to constructor and returns pokemon(args)
                    // console.log(tempPKMN1[0]._id);
                    // console.log(playerOnePokemon);
                }
                else {
                    p2[1] = pkmnArray2Class(tempPKMN1[0]);
                    //playerTwoPokemon = pkmnArray2Class(tempPKMN1[0]); // sends array to constructor and returns pokemon(args)
                }
                    // console.log("Valid PKMN 2");
            }
        });
        db.collection("pkmn").find({ _id: parseFloat(pkmn3) }).toArray(function (err, pkmnID1) { // PKMN 3
            var tempPKMN1 = pkmnID1;
            if (tempPKMN1.length) { // if there's a pokemon in there
                validTeam += 1; // one pokemon good!
                // time to set PKMN into player array
                if (whatTrainer(socket.id)) { // if you're P1 or P2
                    p1[2] = pkmnArray2Class(tempPKMN1[0]);
                    //playerOnePokemon = pkmnArray2Class(tempPKMN1[0]); // sends array to constructor and returns pokemon(args)
                    // console.log(tempPKMN1[0]._id);
                    // console.log(playerOnePokemon);
                }
                else {
                    p2[2] = pkmnArray2Class(tempPKMN1[0]);
                    //playerTwoPokemon = pkmnArray2Class(tempPKMN1[0]); // sends array to constructor and returns pokemon(args)
                }
                    // console.log("Valid PKMN 3");
            }

            // apparently this happens all asynchronously, so I need to put team checker in here
            if (validTeam == 3) { // check if there are three valid PKMN in team
                callbackFunctionForClient(true);
                if (ready >= 1) {
                    var currentPKMN = [p1[0], p2[0]];
                    // start game
                    // console.log(playerOnePokemon);
                    io.emit("effectPlayerOneHealth", playerOnePokemon.getCurrentHealth());
                    io.emit("effectPlayerTwoHealth", playerTwoPokemon.getCurrentHealth());
                    io.emit("getAllBasicInfoOfPlayerOnePokemon", playerOnePokemon.getName(), playerOnePokemon.getSprite(), playerOnePokemon.getCurrentHealth(), playerOnePokemon.m1name, playerOnePokemon.m2name, playerOnePokemon.m3name, playerOnePokemon.m4name);
                    io.emit("getAllBasicInfoOfPlayerTwoPokemon", playerTwoPokemon.getName(), playerTwoPokemon.getSprite(), playerTwoPokemon.getCurrentHealth(), playerTwoPokemon.m1name, playerTwoPokemon.m2name, playerTwoPokemon.m3name, playerTwoPokemon.m4name);
                    io.emit("gameReady");
                    console.log("Game ready");
                }
                else {
                    ready += 1;
                    console.log("ready ++1");
                }
                // IF ready = 1, EMIT BATTLE !!!
                // set up next step of game (server side)
                // change box for win before game starts
            }
            else {
                callbackFunctionForClient(false);
                // say no, make them repick
            }
        });

    }); // END  OF SOCKET.ON "SET PKMN"

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var playerOneReady = false;
    var playerTwoReady = false;
    var playerOneAttackedWith = -1;
    var playerTwoAttackedWith = -1;

/*****************************************zack added on 11/28/18*******************************************/
//currently this just instantly swaps to the next available pokemon
    function autoSwap(player){
        console.log(player.getName()+" stared with "+player[player.getCurrentlyUseingPokemon()].name);
        var i;
        for(i = 1; i < 4; i++){
            console.log("i = "+i);
            if (player["pokemon"+i].isKOed() == false){
                player.changePokemon(i);
                break;
            }
        }
        console.log(player.getName()+" is now useing "+player[player.getCurrentlyUseingPokemon()].name);
        //TODO:update to say what happened
        var sendTo;
        if(player == trainerOne){
            sendTo = "PlayerOne";
        }
        else{
            sendTo = "PlayerTwo";
        }

        //need say pokemon were switch
        io.emit("effect"+sendTo+"Health", player[player.getCurrentlyUseingPokemon()].getCurrentHealth());
        io.emit("getAllBasicInfoOf"+sendTo+"Pokemon", player[player.getCurrentlyUseingPokemon()].getName(), player[player.getCurrentlyUseingPokemon()].getSprite(), player[player.getCurrentlyUseingPokemon()].getCurrentHealth(), player[player.getCurrentlyUseingPokemon()].m1name, player[player.getCurrentlyUseingPokemon()].m2name, player[player.getCurrentlyUseingPokemon()].m3name, player[player.getCurrentlyUseingPokemon()].m4name);
    }


/*****************************************generic attack function*******************************************/
    function easyAttack(attacker, attackWith, gotAttacked){

        //who attacked
        if(attacker == trainerOne){
            io.emit("whoAttackedFirst", 1);
        }
        else if(attacker == trainerTwo){
            io.emit("whoAttackedFirst", 2);
        }

        //damage the the pokemon took
        gotAttacked[gotAttacked.getCurrentlyUseingPokemon()].effectPokemonHealth(true, attacker[attacker.getCurrentlyUseingPokemon()].quickFindAttack(attackWith)[1]);
        var sendTo;
        if(gotAttacked == trainerOne){
            sendTo = "PlayerOne";
        }else if(gotAttacked == trainerTwo){
            sendTo = "PlayerTwo";
        }
        io.emit("effect"+sendTo+"Health", gotAttacked[gotAttacked.getCurrentlyUseingPokemon()].getCurrentHealth());
        
        //check if a pokemon KOed
        if(gotAttacked[gotAttacked.getCurrentlyUseingPokemon()].isKOed() == true){

            //check if a trainer has any non-KOed pokemon
            gotAttacked.pokemonKOed();//reduces the number of non-KOed pokemon by 1
            if(0 < gotAttacked.getNumberOfPokemonLeft()){

                //swap to a non-KOed pokemon
                autoSwap(gotAttacked);
            }
            else {
                console.log("The winner is "+attacker.name)
            }
        }
    }

/***********************************************swapping pokemon***********************************/
     //swap player one's pokemon
     socket.on("playerOneSwap1", function(){
        if(trainerOne.changePokemon(1) != -1){
            io.emit("effectPlayerOneHealth", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth());
            io.emit("getAllBasicInfoOfPlayerOnePokemon", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getSprite(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].attack1Name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].attack2Name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].attack3Name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].attack4Name);
        }
        else{
            console.log("pokemon is KOed");
        }
    });
    socket.on("playerOneSwap2", function(){
        if(trainerOne.changePokemon(2) != -1){
            io.emit("effectPlayerOneHealth", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth());
            io.emit("getAllBasicInfoOfPlayerOnePokemon", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getSprite(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].attack1Name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].attack2Name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].attack3Name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].attack4Name);
        }
        else{
            console.log("pokemon is KOed");
        }
    });
    socket.on("playerOneSwap3", function(){
        if(trainerOne.changePokemon(3) != -1){
            io.emit("effectPlayerOneHealth", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth());
            io.emit("getAllBasicInfoOfPlayerOnePokemon", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getSprite(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].attack1Name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].attack2Name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].attack3Name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].attack4Name);
        }
        else{
            console.log("pokemon is KOed");
        }
    });

    //swaps player two's pokemon
    socket.on("playerTwoSwap1", function(){
        if(trainerTwo.changePokemon(1) != -1){
            io.emit("effectPlayerTwoHealth", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth());
            io.emit("getAllBasicInfoOfPlayerTwoPokemon", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getSprite(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].attack1Name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].attack2Name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].attack3Name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].attack4Name);
        }else{
            console.log("pokemon is KOed");
        }
    });
    socket.on("playerTwoSwap2", function(){
        if(trainerTwo.changePokemon(2) != -1){
            io.emit("effectPlayerTwoHealth", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth());
            io.emit("getAllBasicInfoOfPlayerTwoPokemon", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getSprite(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].attack1Name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].attack2Name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].attack3Name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].attack4Name);
        }else{
            console.log("pokemon is KOed");
        }
    });
    socket.on("playerTwoSwap3", function(){
        if(trainerTwo.changePokemon(3) != -1){
            io.emit("effectPlayerTwoHealth", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth());
            io.emit("getAllBasicInfoOfPlayerTwoPokemon", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getSprite(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].attack1Name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].attack2Name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].attack3Name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].attack4Name);
        }else{
            console.log("pokemon is KOed");
        }
    });


/*****************************************end of second addition*******************************************/





    // PICK MOVES HERE

    socket.on("firstAttack1", function () {
        playerOneAttackedWith = 1;
        playerOneReady = true;
        fight(playerOneReady, playerTwoReady);
    });
    socket.on("firstAttack2", function () {
        playerTwoAttackedWith = 1;
        playerTwoReady = true;
        fight(playerOneReady, playerTwoReady);
    });

    socket.on("secondAttack1", function () {
        playerOneAttackedWith = 2;
        playerOneReady = true;
        fight(playerOneReady, playerTwoReady);
    });
    socket.on("secondAttack2", function () {
        playerTwoAttackedWith = 2;
        playerTwoReady = true;
        fight(playerOneReady, playerTwoReady);
    });

    socket.on("thirdAttack1", function () {
        playerOneAttackedWith = 3;
        playerOneReady = true;
        fight(playerOneReady, playerTwoReady);
    });
    socket.on("thirdAttack2", function () {
        playerTwoAttackedWith = 3;
        playerTwoReady = true;
        fight(playerOneReady, playerTwoReady);
    });

    socket.on("fourthAttack1", function () {
        playerOneAttackedWith = 4;
        playerOneReady = true;
        fight(playerOneReady, playerTwoReady);
    });
    socket.on("fourthAttack2", function () {
        playerTwoAttackedWith = 4;
        playerTwoReady = true;
        fight(playerOneReady, playerTwoReady);
    });

    // SOCKET ON SWITCH POKEMON
    // SOCKET ON USE ITEM

/***************************************the updated fight function*******************************************/

    function fight(readyOne, readyTwo){
        if(readyOne == true && readyTwo == true){
            //makePlayerSpeedsRandom();
            //if(playerOneSpeed >= playerTwoSpeed){
            if(trainerOne[trainerOne.getCurrentlyUseingPokemon()].getSpeed() >= trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getSpeed()){
                easyAttack(trainerOne, playerOneAttackedWith, trainerTwo);
                easyAttack(trainerTwo, playerTwoAttackedWith, trainerOne);
            }
            else{
                easyAttack(trainerTwo, playerTwoAttackedWith, trainerOne);
                easyAttack(trainerOne, playerOneAttackedWith, trainerTwo);
            }
            playerOneReady = false;
            playerTwoReady = false;
        }
    }
/******************************************end of updated fight function***********************************/

/*
//this can now be safely removed
    function fight(readyOne, readyTwo) {// ACTIVATES WHEN PLAYERS HAVE CHOSE MOVES
        if (readyOne == true && readyTwo == true) {
            makePlayerSpeedsRandom(); // no longer random, pull pokemon speeds !!!
            if (playerOneSpeed >= playerTwoSpeed) {
                io.emit("whoAttackedFirst", 1);
                playerTwoPokemon.effectPokemonHealth(true, playerOnePokemon.quickFindAttack(playerOneAttackedWith)[1]);
                io.emit("effectPlayerTwoHealth", playerTwoPokemon.getCurrentHealth());
                if (playerTwoPokemon.isKOed() == true) {
                    console.log("player one won")
                }
                playerOnePokemon.effectPokemonHealth(true, playerTwoPokemon.quickFindAttack(playerTwoAttackedWith)[1]);
                io.emit("effectPlayerOneHealth", playerOnePokemon.getCurrentHealth());
                if (playerOnePokemon.isKOed() == true) {
                    console.log("player two won")
                }
            }
            else {
                io.emit("whoAttackedFirst", 2);
                playerOnePokemon.effectPokemonHealth(true, playerTwoPokemon.quickFindAttack(playerTwoAttackedWith)[1]);
                io.emit("effectPlayerOneHealth", playerOnePokemon.getCurrentHealth());
                if (playerOnePokemon.isKOed() == true) {
                    console.log("player two won")
                }
                playerTwoPokemon.effectPokemonHealth(true, playerOnePokemon.quickFindAttack(playerOneAttackedWith)[1]);
                io.emit("effectPlayerTwoHealth", playerTwoPokemon.getCurrentHealth());
                if (playerTwoPokemon.isKOed() == true) {
                    console.log("player one won")
                }
            }
            playerOneReady = false;
            playerTwoReady = false;
        }
    }

    */

}); // end on connection

//server.listen(80, function () {
//    console.log("Server is waiting on port 80.");
//});

var dbName = "pokemon";

client.connect(function (err) {
    if (err != null) throw err;
    else {
        db = client.db(dbName);
        console.log()
        // add default pokemon to game
        db.collection("pkmn").insertOne({ _id: 6, name: "Charizard", image: "poke.jpg", hp: 153, type: 0, atk: 93, def: 98, spd: 120, m1name: "Slash", m1pwr: 40, m1acr: 100, m2name: "Fire Blast", m2pwr: 110, m2acr: 85, m3name: "Fire Spin", m3pwr: 35, m3acr: 85, m4name: "Fly", m4pwr: 90, m4acr: 95 });
        db.collection("pkmn").insertOne({ _id: 9, name: "Blastoise", image: "poke.jpg", hp: 154, type: 0, atk: 92, def: 120, spd: 98, m1name: "Tackle", m1pwr: 40, m1acr: 100, m2name: "Fire Blast", m2pwr: 110, m2acr: 85, m3name: "Fire Spin", m3pwr: 35, m3acr: 85, m4name: "Fly", m4pwr: 90, m4acr: 95 });
        db.collection("pkmn").insertOne({ _id: 3, name: "Venasaur", image: "poke.jpg", hp: 155, type: 0, atk: 91, def: 103, spd: 100, m1name: "Scratch", m1pwr: 40, m1acr: 100, m2name: "Fire Blast", m2pwr: 110, m2acr: 85, m3name: "Fire Spin", m3pwr: 35, m3acr: 85, m4name: "Fly", m4pwr: 90, m4acr: 95 });
        db.collection("pkmn").insertOne({ _id: 51, name: "Machamp", image: "poke.jpg", hp: 150, type: 0, atk: 93, def: 98, spd: 120, m1name: "Slam", m1pwr: 40, m1acr: 100, m2name: "Fire Blast", m2pwr: 110, m2acr: 85, m3name: "Fire Spin", m3pwr: 35, m3acr: 85, m4name: "Fly", m4pwr: 90, m4acr: 95, });


        server.listen(80, function () {
            console.log("Mongo Server with socket.io is ready.");
        });
    }
});