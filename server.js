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
    return new pokemon(array._id, array.name, array.image, array.hp, array.type, array.atk, array.def, array.spd, array.m1name, array.m1pwr, array.m1acr, array.m2name, array.m2pwr, array.m2acr, array.m3name, array.m3pwr, array.m3acr, array.m4name, array.m4pwr, array.m4acr);
}

function dmgCalc(pwr, acr, atk, def) { // calculates if it hits and how much damage it does
    // execute move is random chance is below accuracy
    var rando = Math.floor(Math.random() * 100);
    //console.log("R " + rando +" ACR "+ acr);
    if (rando < acr) {
        return Math.floor(.44 * pwr * (atk / def));
    }
    else return 0;
}
// function bonusDMG { ADD IF TIME, will do a calculation if move is of right type against pokemon, attack bonus

// }

var trainerNames = [];
var queue = [];
var loser = "";
var ready = 0;
var checkReady = false;

// player one and two
var p1 = [];
var p2 = [];
var playerOnePokemon = {};
var playerTwoPokemon = {};

var playerOneReady = false;
var playerTwoReady = false;
var playerOneAttackedWith = -1;
var playerTwoAttackedWith = -1;

var ko = false;
var battleText = "";

var fightOne = false;
var fightTwo = false;

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

    this.getSpeed = function () {
        return this.spd;
    }
    this.getType = function () {
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
function trainer(name, pokemon1, pokemon2, pokemon3) {
    this.name = name;
    this.pokemon1 = pokemon1;
    this.pokemon2 = pokemon2;
    this.pokemon3 = pokemon3;
    this.pkmnArray = [this.pokemon1, this.pokemon2, this.pokemon3]; // need this for swaps
    this.currentlyUseingPokemon = 1;//1, 2, or 3
    this.numberNotKOed = 3;
    this.potions = 1;

    this.koUpdate = function () {
        this.pkmnArray = [this.pokemon1, this.pokemon2, this.pokemon3];
    }

    this.usePotion = function (whichPKMN) {
        if (this["pokemon" + whichPKMN].currentHealth == this["pokemon" + whichPKMN].maxHealth) {
            return false; // dont let them heal if health is full
        }
        else if (this["pokemon" + whichPKMN].currentHealth > this["pokemon" + whichPKMN].maxHealth - 50) {
            this["pokemon" + whichPKMN].currentHealth = this["pokemon" + whichPKMN].maxHealth;
            this.potions = 0;
            return true;
        }
        else {
            this["pokemon" + whichPKMN].currentHealth += 50;
            this.potions = 0;
            return true;
        }
    }

    this.getName = function () {
        return this.name;
    }
    this.setName = function (newName) {
        this.name = newName;
    }
    this.getCurrentlyUseingPokemon = function () {
        return "pokemon" + this.currentlyUseingPokemon;
    }
    this.getNumberOfPokemonLeft = function () {
        return this.numberNotKOed;
    }
    this.changePokemon = function (changeTo) {
        // need to reset pokemon array for alive checks
        this.pkmnArray = [this.pokemon1, this.pokemon2, this.pokemon3];
        if (this["pokemon" + changeTo].getCurrentHealth() > 0) {
            this.currentlyUseingPokemon = changeTo;
            //console.log(this["pokemon" + Number(this.currentlyUseingPokemon)]);
        } else {
            //console.log("BAD PKMN HP: " + this["pokemon" + Number(this.currentlyUseingPokemon)].getCurrentHealth());
            return -1;
        }
    }
    this.pokemonKOed = function () {
        this.numberNotKOed = this.numberNotKOed - 1;
        return this.numberNotKOed;
    }
}
//an example of adding pokemon to trainers
//creating the pokemon and adding them to their trainer can be moved safely to anywere below this point and above autoswap().
//pokemon must be created before adding them to trainers.
//the trainers var names must be "trainerOne" and "trainerTwo". pokemmons var name can be anything

var playerOnePokemon1 = new pokemon(3, "defaultName1", "default.PNG", 150, "type", 1, 1, 1, "Attack 1", 20, 1, "Attack 2", 30, 1, "Attack 3", 40, 1, "Attack 4", 150, 1);
var playerOnePokemon2 = new pokemon(6, "defaultName2", "default.PNG", 150, "type", 1, 1, 1, "Attack 1", 20, 1, "Attack 2", 30, 1, "Attack 3", 40, 1, "Attack 4", 150, 1);
var playerOnePokemon3 = new pokemon(9, "defaultName3", "default.PNG", 150, "type", 1, 1, 1, "Attack 1", 20, 1, "Attack 2", 30, 1, "Attack 3", 40, 1, "Attack 4", 150, 1);

var playerTwoPokemon1 = new pokemon(3, "defaultName1", "default.PNG", 150, "type", 1, 1, 1, "Attack 1", 20, 1, "Attack 2", 30, 1, "Attack 3", 40, 1, "Attack 4", 150, 1);
var playerTwoPokemon2 = new pokemon(6, "defaultName2", "default.PNG", 150, "type", 1, 1, 1, "Attack 1", 20, 1, "Attack 2", 30, 1, "Attack 3", 40, 1, "Attack 4", 150, 1);
var playerTwoPokemon3 = new pokemon(9, "defaultName3", "default.PNG", 150, "type", 1, 1, 1, "Attack 1", 20, 1, "Attack 2", 30, 1, "Attack 3", 40, 1, "Attack 4", 150, 1);

var trainerOne = new trainer("playerOne", playerOnePokemon1, playerOnePokemon2, playerOnePokemon3);
var trainerTwo = new trainer("playerTwo", playerTwoPokemon1, playerTwoPokemon2, playerTwoPokemon3);


/***********************************end of first new addition***********************************************/

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//set these when grabbing from the data base
// CHANGE FOR NEW SYSTEM !!!

io.on("connection", function (socket) {
    console.log("Somebody connected.");
    if (checkReady) { // if game is going
        socket.emit("effectPlayerOneHealth", playerOnePokemon.getCurrentHealth());
        socket.emit("effectPlayerTwoHealth", playerTwoPokemon.getCurrentHealth());
        socket.emit("getAllBasicInfoOfPlayerOnePokemon", playerOnePokemon.getName(), playerOnePokemon.getSprite(), playerOnePokemon.getCurrentHealth(), playerOnePokemon.m1name, playerOnePokemon.m2name, playerOnePokemon.m3name, playerOnePokemon.m4name);
        socket.emit("getAllBasicInfoOfPlayerTwoPokemon", playerTwoPokemon.getName(), playerTwoPokemon.getSprite(), playerTwoPokemon.getCurrentHealth(), playerTwoPokemon.m1name, playerTwoPokemon.m2name, playerTwoPokemon.m3name, playerTwoPokemon.m4name);
        socket.emit("setupItemAndSwap", p1[0].name, p1[1].name, p1[2].name, p2[0].name, p2[1].name, p2[2].name);
        socket.emit("gameReady");
    }
    // update trainer name
    // check status of game

    socket.on("disconnect", function () {
        //This particular socket connection was terminated (probably the client went to a different page
        //or closed their browser).
        console.log(trainerNames[socket.id] + " disconnected.");
        if (queue.indexOf(trainerNames[socket.id]) == 0) {
            // if you're player 2 and leave, trigger game over
            io.emit("grabID", 22, ""); // should send game over to server
        }
        else if (queue.indexOf(trainerNames[socket.id]) == 1) {
            // if you're player 2 and leave, trigger game over
            io.emit("grabID", 11, ""); // should send game over to server
        }
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
            socket.emit("gameCheck");
            
            if (checkReady) {
                socket.emit("gameReady");
            }

            // end else
            //socket.emit("gameCheck", checkReady);
        }
    });

    socket.on("grabQ", function () { // updates queue after game
        console.log("grab Q");
        io.emit("updateQueue", sendQueue(queue));
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
                    //var currentPKMN = [p1[0], p2[0]];
                    trainerOne.name = queue[0];
                    trainerTwo.name = queue[1];
                    console.log(trainerOne.name + " " + trainerTwo.name);
                    trainerOne.currentlyUseingPokemon = 1;
                    trainerOne.pokemon1 = p1[0];
                    trainerOne.pokemon2 = p1[1];
                    trainerOne.pokemon3 = p1[2];
                    trainerTwo.currentlyUseingPokemon = 1;
                    trainerTwo.pokemon1 = p2[0];
                    trainerTwo.pokemon2 = p2[1];
                    trainerTwo.pokemon3 = p2[2];
                    //console.log(trainerOne);
                    // start game
                    checkReady = true;
                    // console.log(playerOnePokemon);
                    io.emit("effectPlayerOneHealth", playerOnePokemon.getCurrentHealth());
                    io.emit("effectPlayerTwoHealth", playerTwoPokemon.getCurrentHealth());
                    io.emit("getAllBasicInfoOfPlayerOnePokemon", playerOnePokemon.getName(), playerOnePokemon.getSprite(), playerOnePokemon.getCurrentHealth(), playerOnePokemon.m1name, playerOnePokemon.m2name, playerOnePokemon.m3name, playerOnePokemon.m4name);
                    io.emit("getAllBasicInfoOfPlayerTwoPokemon", playerTwoPokemon.getName(), playerTwoPokemon.getSprite(), playerTwoPokemon.getCurrentHealth(), playerTwoPokemon.m1name, playerTwoPokemon.m2name, playerTwoPokemon.m3name, playerTwoPokemon.m4name);
                    io.emit("setupItemAndSwap", p1[0].name, p1[1].name, p1[2].name, p2[0].name, p2[1].name, p2[2].name);
                    //if (queue)
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

    /*****************************************generic attack function*******************************************/
    function easyAttack(attacker, attackWith, gotAttacked) {

        ko = false; // reset check in case things break

        //damage the the pokemon took
        var atkPKMN = attacker[attacker.getCurrentlyUseingPokemon()].getName();
        var atkMove = attacker[attacker.getCurrentlyUseingPokemon()].quickFindAttack(attackWith);
        var aPKMNatk = attacker[attacker.getCurrentlyUseingPokemon()].atk;
        var dPKMNdef = gotAttacked[gotAttacked.getCurrentlyUseingPokemon()].getSpeed();
        var dmgDone = dmgCalc(atkMove[1], atkMove[2], aPKMNatk, dPKMNdef);
        console.log(attacker.name + " " + attacker.getName() + " " + attacker.pokemon1.name + " " + atkPKMN);
        gotAttacked[gotAttacked.getCurrentlyUseingPokemon()].effectPokemonHealth(true, dmgDone);

        // text out how much damage done by move
        if (dmgDone > 0) battleText += attacker.getName() + "'s " + atkPKMN + " attacked for " + dmgDone + " damage! <br>";
        else battleText += attacker.getName() + "'s " + atkPKMN + " missed! <br>";

        var sendTo;
        if (gotAttacked == trainerOne) {
            sendTo = "PlayerOne";
        } else if (gotAttacked == trainerTwo) {
            sendTo = "PlayerTwo";
        }

        // yell to client to update health
        io.emit("effect" + sendTo + "Health", gotAttacked[gotAttacked.getCurrentlyUseingPokemon()].getCurrentHealth());

        //check if a pokemon KOed
        if (gotAttacked[gotAttacked.getCurrentlyUseingPokemon()].isKOed() == true) { // if pokemon is outie
            ko = true;
        }
    }

    /***************************************the updated fight function*******************************************/

    function fight(readyOne, readyTwo, fightOne, fightTwo) {

        // every easyAttack append some words to a string
        // console.log("P1 = " + String(fightOne) + " P2 = " + String(fightTwo));
        if (readyOne == true && readyTwo == true) {
            if (trainerOne[trainerOne.getCurrentlyUseingPokemon()].getSpeed() >= trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getSpeed()) {
                // \/\/\/ true only if player is fighting (i.e. not swapping or item)
                if (fightOne) {
                    easyAttack(trainerOne, playerOneAttackedWith, trainerTwo); // !!!
                    //console.log("Fight One success! PKMN health now " + trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth() + " HP");
                }
                if (ko) { // if P2 PKMN got knocked out, he doesnt get to attack
                    trainerOne.koUpdate();
                    trainerTwo.koUpdate();
                    battleText += trainerTwo.getName() + "'s " + trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName() + " fainted! <br>";
                    // show KO text
                    trainerTwo.pokemonKOed(); // reduces #
                    checkWinAndSwap(trainerTwo); // check if swappable, if not trigger P1 win
                    if (ko) { // if no pokemon remain
                        ko = false; // reset for next match
                        // game over. call P1 win
                        loser = trainerTwo.getName();
                        io.emit("grabID", 11, battleText); // !!! Server GUI update status victory
                        // !!!!!!
                    }
                    else {
                        battleText += trainerTwo.getName() + " will send out a new Pokemon.<br>";
                        io.emit("grabID", 2, battleText); // !!! Server GUI update status swap
                    }
                    // force swap
                }
                else { // other guy gets to attack
                    // \/\/\/ true only if player is fighting (i.e. not swapping or item)
                    if (fightTwo) easyAttack(trainerTwo, playerTwoAttackedWith, trainerOne);
                    if (ko) { // if this guy fainted ...
                        trainerOne.koUpdate();
                        trainerTwo.koUpdate();
                        trainerOne.pokemonKOed(); // reduces #
                        battleText += trainerOne.getName() + "'s " + trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName() + " fainted! <br>";
                        checkWinAndSwap(trainerOne); // will update ko to false if new pokemon exists
                        if (ko) { // if no pokemon remain
                            ko = false;
                            // game over. call P2 win
                            loser = trainerOne.getName();
                            io.emit("grabID", 22, battleText); // !!! Server GUI update status victory
                            // !!!!!!
                        }
                        else {
                            battleText += trainerOne.getName() + " will send out a new Pokemon.<br>";
                            io.emit("grabID", 1, battleText); // !!! Server GUI update status faint
                        }
                    }
                    else io.emit("grabID", 0, battleText); // !!! Server GUI update status regular
                    console.log("grabID called!");
                } // end else (p2 attack if not KO)
            } // end attack
            else {
                // \/\/\/ true only if player is fighting (i.e. not swapping or item)
                if (fightTwo) easyAttack(trainerTwo, playerTwoAttackedWith, trainerOne); // !!!
                if (ko) { // if P1 PKMN got knocked out, he doesnt get to attack
                    trainerOne.koUpdate();
                    trainerTwo.koUpdate();
                    trainerOne.pokemonKOed(); // reduces #
                    battleText += trainerOne.getName() + "'s " + trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName() + " fainted! <br>";
                    // show KO text
                    checkWinAndSwap(trainerOne); // check if swappable, if not trigger P1 win
                    if (ko) { // if no pokemon remain
                        ko = false; // reset for next match
                        // game over. call P1 win
                        loser = trainerOne.getName();
                        io.emit("grabID", 22, battleText); // !!! Server GUI update status victory
                        // !!!!!!
                    }
                    else {
                        battleText += trainerOne.getName() + " will send out a new Pokemon.<br>";
                        io.emit("grabID", 1, battleText); // !!! Server GUI update status swap
                    }
                    // force swap
                }
                else { // other guy gets to attack
                    // \/\/\/ true only if player is fighting (i.e. not swapping or item)
                    if (fightOne) easyAttack(trainerOne, playerOneAttackedWith, trainerTwo);
                    if (ko) { // if this guy fainted ...
                        trainerOne.koUpdate();
                        trainerTwo.koUpdate();
                        trainerTwo.pokemonKOed(); // reduces #
                        battleText += trainerTwo.getName() + "'s " + trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName() + " fainted! <br>";
                        checkWinAndSwap(trainerTwo); // will update ko to false if new pokemon exists
                        if (ko) { // if no pokemon remain
                            ko = false;
                            // game over. call P1 win
                            loser = trainerTwo.getName();
                            io.emit("grabID", 11, battleText); // !!! Server GUI update status victory
                            // !!!!!!
                        }
                        else {
                            battleText += trainerTwo.getName() + " will send out a new Pokemon.<br>";
                            io.emit("grabID", 2, battleText); // !!! Server GUI update status faint
                        }
                    }
                    else io.emit("grabID", 0, battleText); // !!! Server GUI update status regular
                    console.log("Server Update GUI 0");
                } // end else (p2 attack if not KO)
            } // end attack

            playerOneReady = false;
            playerTwoReady = false;
            battleText = ""; // clear battle text
        }

    }

    socket.on("grabIDtoServerGUI", function (status, battleText) {
        if (status == 100) {
            console.log("Status 100");
        }
        socket.emit("serverUpdateGUI", status, battleText, trainerNames[socket.id]);
        //console.log(socket.id + " " + trainerNames[socket.id]);
        //console.log("id2server");
    });

    function checkWinAndSwap(trainer) {
        if (trainer.getNumberOfPokemonLeft() > 0) { // pokemon still exist
            // thus force swap
            ko = false; // wait to show menu until after
        }
    }
    /******************************************end of updated fight function***********************************/

    /***********************************************swapping pokemon***********************************/
    //swap player one's pokemon
    socket.on("playerOneSwap1", function () {
        if (trainerOne.currentlyUseingPokemon != 1 && !trainerOne.pkmnArray[0].isKOed()) {
            if (trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth() > 0) {
                // if your current pokemon is not currently KO'ed
                trainerOne.changePokemon(1); // change to that pokemon
                io.emit("effectPlayerOneHealth", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth());
                io.emit("getAllBasicInfoOfPlayerOnePokemon", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getSprite(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].m1name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m2name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m3name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m4name);
                battleText += trainerOne.getName() + " will send out " + trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName() + ". <br>";
                playerOneAttackedWith = 1; // this is a move # - doesnt matter if you're not fighting
                playerOneReady = true;
                fightOne = false;
                socket.emit("nonAttack");
                fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
            }
            else {
                trainerOne.changePokemon(1);
                io.emit("effectPlayerOneHealth", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth());
                io.emit("getAllBasicInfoOfPlayerOnePokemon", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getSprite(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].m1name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m2name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m3name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m4name);
                io.emit("grabID", -1, "");
            }
        }
        else {
            console.log("pokemon is KOed");
        }
    });
    socket.on("playerOneSwap2", function () {
        if (trainerOne.currentlyUseingPokemon != 2 && !trainerOne.pkmnArray[1].isKOed()) {
            if (trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth() > 0) {
                // if your current pokemon is not currently KO'ed
                trainerOne.changePokemon(2); // change to that pokemon
                io.emit("effectPlayerOneHealth", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth());
                io.emit("getAllBasicInfoOfPlayerOnePokemon", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getSprite(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].m1name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m2name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m3name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m4name);
                battleText += trainerOne.getName() + " will send out " + trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName() + ". <br>";
                playerOneAttackedWith = 1; // this is a move # - doesnt matter if you're not fighting
                playerOneReady = true;
                fightOne = false;
                socket.emit("nonAttack");
                fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
            }
            else {
                trainerOne.changePokemon(2);
                io.emit("effectPlayerOneHealth", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth());
                io.emit("getAllBasicInfoOfPlayerOnePokemon", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getSprite(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].m1name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m2name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m3name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m4name);
                console.log("GRAB ID");
                io.emit("grabID", -1, "");
            }
        }
        else {
            console.log("pokemon is KOed");
        }
    });
    socket.on("playerOneSwap3", function () {
        if (trainerOne.currentlyUseingPokemon != 3 && !trainerOne.pkmnArray[2].isKOed()) {
            if (trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth() > 0) {
                // if your current pokemon is not currently KO'ed
                trainerOne.changePokemon(3); // change to that pokemon
                io.emit("effectPlayerOneHealth", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth());
                io.emit("getAllBasicInfoOfPlayerOnePokemon", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getSprite(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].m1name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m2name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m3name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m4name);
                battleText += trainerOne.getName() + " will send out " + trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName() + ". <br>";
                playerOneAttackedWith = 1; // this is a move # - doesnt matter if you're not fighting
                playerOneReady = true;
                fightOne = false;
                socket.emit("nonAttack");
                fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
            }
            else {
                trainerOne.changePokemon(3);
                io.emit("effectPlayerOneHealth", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth());
                io.emit("getAllBasicInfoOfPlayerOnePokemon", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getName(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getSprite(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerOne[trainerOne.getCurrentlyUseingPokemon()].m1name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m2name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m3name, trainerOne[trainerOne.getCurrentlyUseingPokemon()].m4name);
                io.emit("grabID", -1, "");
            }
        }
        else {
            console.log("pokemon is KOed");
        }
    });

    //swaps player two's pokemon
    socket.on("playerTwoSwap1", function () {
        if (trainerTwo.currentlyUseingPokemon != 1 && !trainerTwo.pkmnArray[0].isKOed()) {
            if (trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth() > 0) {
                // if your current pokemon is not currently KO'ed
                trainerTwo.changePokemon(1); // change to that pokemon
                io.emit("effectPlayerTwoHealth", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth());
                io.emit("getAllBasicInfoOfPlayerTwoPokemon", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getSprite(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m1name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m2name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m3name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m4name);
                battleText += trainerTwo.getName() + " will send out " + trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName() + ". <br>";
                playerTwoAttackedWith = 1; // this is a move # - doesnt matter if you're not fighting
                playerTwoReady = true;
                fightTwo = false;
                socket.emit("nonAttack");
                fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
            }
            else {
                trainerTwo.changePokemon(1);
                io.emit("effectPlayerTwoHealth", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth());
                io.emit("getAllBasicInfoOfPlayerTwoPokemon", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getSprite(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m1name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m2name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m3name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m4name);
                io.emit("grabID", -1, "");
            }
        }
        else {
            console.log("pokemon is KOed");
        }
    });
    socket.on("playerTwoSwap2", function () {
        if (trainerTwo.currentlyUseingPokemon != 2 && !trainerTwo.pkmnArray[1].isKOed()) {
            if (trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth() > 0) {
                // if your current pokemon is not currently KO'ed
                trainerTwo.changePokemon(2); // change to that pokemon
                io.emit("effectPlayerTwoHealth", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth());
                io.emit("getAllBasicInfoOfPlayerTwoPokemon", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getSprite(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m1name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m2name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m3name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m4name);
                battleText += trainerTwo.getName() + " will send out " + trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName() + ". <br>";
                playerTwoAttackedWith = 1; // this is a move # - doesnt matter if you're not fighting
                playerTwoReady = true;
                fightTwo = false;
                socket.emit("nonAttack");
                fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
            }
            else {
                trainerTwo.changePokemon(2);
                io.emit("effectPlayerTwoHealth", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth());
                io.emit("getAllBasicInfoOfPlayerTwoPokemon", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getSprite(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m1name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m2name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m3name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m4name);
                io.emit("grabID", -1, "");
            }
        }
        else {
            console.log("pokemon is KOed");
        }
    });
    socket.on("playerTwoSwap3", function () {
        if (trainerTwo.currentlyUseingPokemon != 3 && !trainerTwo.pkmnArray[2].isKOed()) {
            if (trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth() > 0) {
                // if your current pokemon is not currently KO'ed
                trainerTwo.changePokemon(3); // change to that pokemon
                io.emit("effectPlayerTwoHealth", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth());
                io.emit("getAllBasicInfoOfPlayerTwoPokemon", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getSprite(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m1name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m2name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m3name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m4name);
                battleText += trainerTwo.getName() + " will send out " + trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName() + ". <br>";
                playerTwoAttackedWith = 1; // this is a move # - doesnt matter if you're not fighting
                playerTwoReady = true;
                fightTwo = false;
                socket.emit("nonAttack");
                fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
            }
            else {
                trainerTwo.changePokemon(3);
                io.emit("effectPlayerTwoHealth", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth());
                io.emit("getAllBasicInfoOfPlayerTwoPokemon", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getName(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getSprite(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth(), trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m1name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m2name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m3name, trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].m4name);
                io.emit("grabID", -1, "");
            }
        }
        else {
            console.log("pokemon is KOed");
        }
    });


    /*****************************************end of second addition*******************************************/

    // PICK MOVES HERE
    // thinking this doesnt need change. Sets variable to true, tries to run fight function
    // just need to make sure fight function spits out a GUI reset

    socket.on("firstAttack1", function () {
        playerOneAttackedWith = 1;
        playerOneReady = true;
        fightOne = true;
        fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
    });
    socket.on("firstAttack2", function () {
        playerTwoAttackedWith = 1;
        playerTwoReady = true;
        fightTwo = true;
        fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
    });

    socket.on("secondAttack1", function () {
        playerOneAttackedWith = 2;
        playerOneReady = true;
        fightOne = true;
        fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
    });
    socket.on("secondAttack2", function () {
        playerTwoAttackedWith = 2;
        playerTwoReady = true;
        fightTwo = true;
        fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
    });

    socket.on("thirdAttack1", function () {
        playerOneAttackedWith = 3;
        playerOneReady = true;
        fightOne = true;
        fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
    });
    socket.on("thirdAttack2", function () {
        playerTwoAttackedWith = 3;
        playerTwoReady = true;
        fightTwo = true;
        fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
    });

    socket.on("fourthAttack1", function () {
        playerOneAttackedWith = 4;
        playerOneReady = true;
        fightOne = true;
        fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
    });
    socket.on("fourthAttack2", function () {
        playerTwoAttackedWith = 4;
        playerTwoReady = true;
        fightTwo = true;
        fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
    });

    // SOCKET ON USE ITEM
    socket.on("playerOneItem", function (pkmn) {
        trainerOne.koUpdate(); // get pkmnArrayto current health
        if (trainerTwo.potions) { // if you still have your potion
            if (!trainerOne.pkmnArray[pkmn - 1].isKOed() && trainerOne.usePotion(pkmn)) {
                battleText += trainerOne.getName() + " used a potion on " + trainerOne.pkmnArray[pkmn - 1].name + ". <br>";
                playerOneAttackedWith = 1; // this is a move # - doesnt matter if you're not fighting
                playerOneReady = true;
                fightOne = false;
                // uses the potion during the check if true
                io.emit("effectPlayerOneHealth", trainerOne[trainerOne.getCurrentlyUseingPokemon()].getCurrentHealth());
                socket.emit("nonAttack");
                fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
            }
            else {
                console.log("He dead");
            }
        }
        else { // no potions
            console.log("NO!");
            socket.emit("noPotion", 1);
        }
    });

    socket.on("playerTwoItem", function (pkmn) {
        trainerTwo.koUpdate(); // get pkmnArrayto current health
        if (trainerTwo.potions) { // if you still have your potion

            if (!trainerTwo.pkmnArray[pkmn - 1].isKOed() && trainerTwo.usePotion(pkmn)) {
                battleText += trainerTwo.getName() + " used a potion on " + trainerTwo.pkmnArray[pkmn - 1].name + ". <br>";
                playerTwoAttackedWith = 1; // this is a move # - doesnt matter if you're not fighting
                playerTwoReady = true;
                fightTwo = false;
                // uses the potion during the check if true
                io.emit("effectPlayerTwoHealth", trainerTwo[trainerTwo.getCurrentlyUseingPokemon()].getCurrentHealth());
                socket.emit("nonAttack");
                fight(playerOneReady, playerTwoReady, fightOne, fightTwo);
            }
            else {
                console.log("He dead");
            }
        }
        else { // no potions
            console.log("NO!");
            socket.emit("noPotion", 2);
        }
    });

    socket.on("gameOver", function () {
        // called when victory is achieved
        ready = 0;
        checkReady = false;
        delete queue[queue.indexOf(loser)]; // pop loser from queue
        queue.push(loser); // puts loser to back of queue
        queue = queue.filter(Boolean); // get rid of empties
        console.log(queue);
        io.emit("updateQueue", sendQueue(queue));
        socket.emit("reset");
        //io.emit("grabID", 100, ""); // sends global update and sends everyone back to the start
    });

}); // end on connection

//server.listen(80, function () {
//    console.log("Server is waiting on port 80.");
//});

var dbName = "pokemon";

client.connect(function (err) {
    if (err != null) throw err;
    else {
        db = client.db(dbName);
        // add default pokemon to game
        db.collection("pkmn").remove();
        db.collection("pkmn").insertOne({ _id: 6, name: "Charizard", image: "poke.jpg", hp: 153, type: 0, atk: 93, def: 98, spd: 120, m1name: "Slash", m1pwr: 40, m1acr: 100, m2name: "Fire Blast", m2pwr: 110, m2acr: 85, m3name: "Fire Spin", m3pwr: 35, m3acr: 85, m4name: "Fly", m4pwr: 90, m4acr: 95 });
        db.collection("pkmn").insertOne({ _id: 9, name: "Blastoise", image: "poke.jpg", hp: 154, type: 0, atk: 92, def: 120, spd: 98, m1name: "Tackle", m1pwr: 40, m1acr: 100, m2name: "Fire Blast", m2pwr: 110, m2acr: 85, m3name: "Fire Spin", m3pwr: 35, m3acr: 85, m4name: "Fly", m4pwr: 90, m4acr: 95 });
        db.collection("pkmn").insertOne({ _id: 3, name: "Venasaur", image: "poke.jpg", hp: 155, type: 0, atk: 91, def: 103, spd: 100, m1name: "Scratch", m1pwr: 40, m1acr: 100, m2name: "Fire Blast", m2pwr: 110, m2acr: 85, m3name: "Fire Spin", m3pwr: 35, m3acr: 85, m4name: "Fly", m4pwr: 90, m4acr: 95 });
        db.collection("pkmn").insertOne({ _id: 51, name: "Machamp", image: "poke.jpg", hp: 150, type: 0, atk: 9300, def: 98, spd: 120, m1name: "Slam", m1pwr: 40, m1acr: 100, m2name: "Fire Blast", m2pwr: 110, m2acr: 85, m3name: "Fire Spin", m3pwr: 35, m3acr: 85, m4name: "Fly", m4pwr: 90, m4acr: 95, });

        server.listen(80, function () {
            console.log("Mongo Server with socket.io is ready.");
        });
    }
});