//var whatMenu = 0;//0 is main battle menu. 1 is the fight menu, 2 is battle text
// I'm guessing this got manually hard-coded. Searched the file and this is its only instance
// In that case Im going to use it to see if the game is alive or not.
var gameReady = false;

playerOne = 1;
playerTwo = 1;
var socket = io();
var trainerLocal = "none";
var localQueue = [];

var playerOneHealth;
var playerTwoHealth;
var playerOnesCurrentPokemonName;
var playerTwosCurrentPokemonName;
var attackOrder = -1;

function showMainBattleMenu(player) {
    $("#player" + player + "WaitText").hide();
    $("#player" + player + "FightMenu").hide();
    $("#player" + player + "Menu").show();
}
function showFightMenu(player) {
    $("#player" + player + "WaitText").hide();
    $("#player" + player + "Menu").hide();
    $("#player" + player + "FightMenu").show();
}

function showWaitText(player) {
    $("#player" + player + "WaitText").show();
    $("#player" + player + "Menu").hide();
    $("#player" + player + "FightMenu").hide();
}

function showTextField() {
    $("#textField").show();
    $(".splitMenu").hide();
}

function showItemMenu(player) {
    $("#player" + player + "ItemMenu").show();
    $("#player" + player + "Menu").hide();
    $("#player" + player + "FightMenu").hide();
}
/*************************zack added 11/29/18****************************/

function showSwapMenu(player, faint) {
    if (faint) { // if this is caused via pokemon fainting
        $("#player" + player + "SwapMenu").show();
        $("#textField").hide();
    }
    else {
        $("#player" + player + "SwapMenu").show();
        $("#player" + player + "Menu").hide();
    }
}

function hideSwapMenu(player) {
    $("#player" + player + "SwapMenu").hide();
    $("#player" + player + "Menu").show();
}

/*********************************end of first******************************************/

socket.on("addPKMNtoList", function (pkmnArray) { // adds Pokemon to the pokemon select screen
    $(".pkmn").html("");
    var tsize = pkmnArray.length;
    var i = 0;
    while (tsize > 0) {
        if (tsize >= 3) {
            console.log(pkmnArray[i].name);
            $(".pkmn").append("<tr><td>" + pkmnArray[i]._id + " " + pkmnArray[i].name + "</td>");
            i += 1;
            console.log(pkmnArray[i].name);
            $(".pkmn").append("<td>" + pkmnArray[i]._id + " " + pkmnArray[i].name + "</td>");
            i += 1;
            console.log(pkmnArray[i].name);
            $(".pkmn").append("<td>" + pkmnArray[i]._id + " " + pkmnArray[i].name + "</td></tr>");
            i += 1;
            tsize -= 3;
        }
        else if (tsize == 2) {
            console.log(pkmnArray[i].name);
            $(".pkmn").append("<tr><td>" + pkmnArray[i]._id + " " + pkmnArray[i].name + "</td>");
            i += 1;
            console.log(pkmnArray[i].name);
            $(".pkmn").append("<td>" + pkmnArray[i]._id + " " + pkmnArray[i].name + "</td></tr>");
            i += 1;
            tsize = 0;
        }
        else if (tsize == 1) {
            console.log(pkmnArray[i].name);
            $(".pkmn").append("<tr><td>" + pkmnArray[i]._id + " " + pkmnArray[i].name + "</td></tr>");
            i += 1;
            tsize = 0;
        }
    }
});

function setThingsUp() {
    $("#playerOneMenu").hide();
    $("#playerTwoMenu").hide();
    $("#playerOneFightMenu").hide();
    $("#playerTwoFightMenu").hide();
    $("#playerOneSwapMenu").hide();
    $("#playerTwoSwapMenu").hide();
    $("#playerOneItemMenu").hide();
    $("#playerTwoItemMenu").hide();
    $("#playerOneWaitText").hide();
    $("#playerTwoWaitText").hide();
    $("#textField").hide();

    $("#pkmnTable").hide();
    $(".queue").hide();
    $(".pick").hide();
    $("#imageField").hide();

    // Set Trainer names

    $("#trainerName").click(function (event) {
        //The function I'm passing here is a callback, and socket.io allows the server to "call" that function.
        trainerLocal = $("#trainer").val();
        socket.emit("setTrainer", $("#trainer").val(), function (loginSuccessful) {
            if (loginSuccessful === true) {
                $(".playerPick").hide(); // change for trainer
                $(".queue").show();
            }
            else {
                alert("Error: This trainer name is already in use.");
            }

            $("#userText").val("");
        });
        event.preventDefault(); //preventing the browser's default behavior of "submitting" the form.
    });

    $("#T1").click(function () {
        trainerLocal = "T1";
        socket.emit("setTrainer", "T1", function (L) { });
        socket.emit("setPKMN", 3, 6, 9, function (L) { });
        $(".playerPick").hide(); // change for trainer
    });

    $("#T2").click(function () {
        trainerLocal = "T2";
        socket.emit("setTrainer", "T2", function (L) { });
        socket.emit("setPKMN", 6, 51, 9, function (L) { });
        $(".playerPick").hide(); // change for trainer
    });

    $("#pickPKMN").click(function () { // send PKMN choices to server
        socket.emit("setPKMN", $("#pkmn1").val(), $("#pkmn2").val(), $("#pkmn3").val(), function (validPKMN) {
            // if successful, show appropriate screen
            // if unsuccessful, prompt to pick proper pokemon IDs
            if (!validPKMN) {
                alert("Error! One or more of the Pokemon IDs were not valid. Please try again.");
            }
        });
        console.log("Clicked pick PKMN button");

    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
        function updateGUI() { // may have to mess with this for base case
            // console.log("GUI UPDATE");
            if (gameReady) {
                // !!! this might be the only thing I need
                $(document.getElementById("oppenetHealth")).width(playerTwoHealth);
                $(document.getElementById("playerHealth")).width(playerOneHealth);
    
                if (playerOne == 0 && playerTwo == 0 && (attackOrder == 1 || attackOrder == 2)) {
                    $("#playerOneFightMenu").hide();
                    $("#playerTwoFightMenu").hide();
                    $("#playerOneWaitText").hide();
                    $("#playerTwoWaitText").hide();
    
    
                    // DONT NEED if doing one line attack
                    /* if (attackOrder == 1) {
                        $("#battleText").text(playerOnesCurrentPokemonName + " attacked " + playerTwosCurrentPokemonName + " first");
                    }
                    else if (attackOrder == 2) {
                        $("#battleText").text(playerTwosCurrentPokemonName + " attacked " + playerOnesCurrentPokemonName + " first");
                    }
                    else {
                        $("#battleText").text("Error");
                    }
    
                    attackOrder = -1;
                    $("#textField").show();
    
                    setTimeout(function () {
                        $("#textField").hide();
                        playerOne = 1;
                        playerTwo = 1;
                        updateGUI();
                    }, 3000);
                } else if (playerOne == 3 && playerTwo == 3) {
                    playerOne = 0;
                    playerTwo = 0;
                    updateGUI();
                }
                else {
                    if (playerOne == 1) {
                        showMainBattleMenu("One");
                    }
                    else if (playerOne == 2) {
                        showFightMenu("One");
                    }
                    else if (playerOne == 3) {
                        showWaitText("One");
                    }
                    if (playerTwo == 1) {
                        showMainBattleMenu("Two");
                    }
                    else if (playerTwo == 2) {
                        showFightMenu("Two");
                    }
                    else if (playerTwo == 3) {
                        showWaitText("Two");
                    }
                }
            }
        }  */

    $("#fight1").click(function () {
        showFightMenu("One"); // will show fight menu
    });
    $("#fight2").click(function () {
        showFightMenu("Two"); // will show fight menu
    });

    $("#item1").click(function () { // click P1 icon
        showItemMenu("One"); // will show fight menu
        // !!! update buttons to HP
    });
    $("#playerOneItem1").click(function () {
        socket.emit("playerOneItem", 1);
    });
    $("#playerOneItem2").click(function () {
        socket.emit("playerOneItem", 2);
    });
    $("#playerOneItem3").click(function () {
        socket.emit("playerOneItem", 3);
    });

    $("#item2").click(function () {
        showItemMenu("Two"); // will show fight menu
    });
    $("#playerTwoItem1").click(function () {
        socket.emit("playerTwoItem", 1);
    });
    $("#playerTwoItem2").click(function () {
        socket.emit("playerTwoItem", 2);
    });
    $("#playerTwoItem3").click(function () {
        socket.emit("playerTwoItem", 3);
    });

    $(".playerOneReturn").click(function () {
        $(".splitMenu").hide();
        showMainBattleMenu("One");
    });

    $(".playerTwoReturn").click(function () {
        $(".splitMenu").hide();
        showMainBattleMenu("Two");
    });

    /**********************************changed this*************************/

    $("#swap1").click(function () {
        showSwapMenu("One");
    });
    $("#swap2").click(function () {
        showSwapMenu("Two");
    });

    /*************************************end of that change*********************/

    $("#run1").click(function () {
        $("#battleText").text("You can't run from a trainer battle!");
        showTextField();
        setTimeout(function () { // make it hang out on screen for three seconds
            $("#textField").hide();
            $("#playerOneMenu").show();
            //socket.emit("grabID", -1, "");
        }, 3000);
    });

    $("#run2").click(function () {
        $("#battleText").text("You can't run from a trainer battle!");
        showTextField();
        setTimeout(function () { // make it hang out on screen for three seconds
            $("#textField").hide();
            $("#playerTwoMenu").show();
            //socket.emit("grabID", -1, "");
        }, 3000);
    });

    socket.on("noPotion", function (who) {
        console.log("Made it here");
        $("#battleText").text("You are out of potions!");
        showTextField();
        setTimeout(function () { // make it hang out on screen for three seconds
            $("#textField").hide();
            if (who == 1) {
                $("#playerOneMenu").show();
            }
            else {
                $("#playerTwoMenu").show();
            }
            //socket.emit("grabID", -1, "");
        }, 3000);
    });

    /***************************************added this*****************************/
    // !!! Thinking I don't need to updateGUI because the gameLoop will handle that
    //swap menu for player one
    $("#playerOneSwap1").click(function () {
        socket.emit("playerOneSwap1");
    });

    $("#playerOneSwap2").click(function () {
        socket.emit("playerOneSwap2");
    });

    $("#playerOneSwap3").click(function () {
        socket.emit("playerOneSwap3");
    });

    //swap menu for player two

    $("#playerTwoSwap1").click(function () {
        socket.emit("playerTwoSwap1");
    });

    $("#playerTwoSwap2").click(function () {
        socket.emit("playerTwoSwap2");
    });

    $("#playerTwoSwap3").click(function () {
        socket.emit("playerTwoSwap3");
    });

    socket.on("nonAttack", function () {
        $(".splitMenu").hide();
        $("#playerOneWaitText").show();
    });

    /**************************end of addition*******************************/

    $("#firstAttack1").click(function () {
        socket.emit("firstAttack1");
        $("#playerOneFightMenu").hide();
        $("#playerOneWaitText").show();
    });
    $("#firstAttack2").click(function () {
        socket.emit("firstAttack2");
        $("#playerTwoFightMenu").hide();
        $("#playerTwoWaitText").show();
    });

    $("#secondAttack1").click(function () {
        socket.emit("secondAttack1");
        $("#playerOneFightMenu").hide();
        $("#playerOneWaitText").show();
    });
    $("#secondAttack2").click(function () {
        socket.emit("secondAttack2");
        $("#playerTwoFightMenu").hide();
        $("#playerTwoWaitText").show();
    });

    $("#thirdAttack1").click(function () {
        socket.emit("thirdAttack1");
        $("#playerOneFightMenu").hide();
        $("#playerOneWaitText").show();
    });
    $("#thirdAttack2").click(function () {
        socket.emit("thirdAttack2");
        $("#playerTwoFightMenu").hide();
        $("#playerTwoWaitText").show();
    });

    $("#fourthAttack1").click(function () {
        socket.emit("fourthAttack1");
        $("#playerOneFightMenu").hide();
        $("#playerOneWaitText").show();
    });
    $("#fourthAttack2").click(function () {
        socket.emit("fourthAttack2");
        $("#playerTwoFightMenu").hide();
        $("#playerTwoWaitText").show();
    });

    socket.on("effectPlayerOneHealth", function (getHealth) {
        playerOneHealth = getHealth;
        if (playerOneHealth <= 0) {
            //alert('player two has won, PlayerOne has ' + getHealth + ' health');
        }
        $(document.getElementById("oppenetHealth")).width(playerTwoHealth);
        $(document.getElementById("playerHealth")).width(playerOneHealth);
    });
    socket.on("effectPlayerTwoHealth", function (getHealth) {
        playerTwoHealth = getHealth;
        if (playerTwoHealth <= 0) {
            //alert('player one has won, PlayerTwo has ' + getHealth + ' health');
        }
        $(document.getElementById("oppenetHealth")).width(playerTwoHealth);
        $(document.getElementById("playerHealth")).width(playerOneHealth);
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // GET POKEMON INFO FROM SERVER

    socket.on("getAllBasicInfoOfPlayerOnePokemon", function (pokemonName, imageName, getHealth, attack1, attack2, attack3, attack4) {
        $("#player").attr("src", imageName);
        playerOnesCurrentPokemonName = pokemonName;
        $("#playerOnePokemonName").text(pokemonName);
        playerOneHealth = getHealth;

        $("#firstAttack1").text(arguments[3]);
        $("#secondAttack1").text(arguments[4]);
        $("#thirdAttack1").text(arguments[5]);
        $("#fourthAttack1").text(arguments[6]);
    });

    socket.on("getAllBasicInfoOfPlayerTwoPokemon", function (pokemonName, imageName, getHealth, attack1, attack2, attack3, attack4) {
        $("#oppenet").attr("src", imageName);
        playerTwosCurrentPokemonName = pokemonName;
        $("#playerTwoPokemonName").text(pokemonName);
        playerTwoHealth = getHealth;

        $("#firstAttack2").text(arguments[3]);
        $("#secondAttack2").text(arguments[4]);
        $("#thirdAttack2").text(arguments[5]);
        $("#fourthAttack2").text(arguments[6]);
    });

    // Update queue for beginning
    socket.on("updateQueue", function (queue) {
        $("#playing").html("Trainers playing in next round:");
        $("#upNext").html("Trainers waiting in queue:");
        $("#playing").append("<br>" + queue[0]);
        if (queue.length >= 2) {
            $("#playing").append("<br>" + queue[1]);
        }
        for (var i = 2; i < queue.length; i++) {
            $("#upNext").append("<br>" + queue[i]);
        }
        // write special queue spot for 1 and 2
        localQueue = queue;
        // write rest in other
    });

    socket.on("showPKMN", function (queue) {
        if (trainerLocal == queue[0] || trainerLocal == queue[1]) {
            localQueue = queue;
            socket.emit("sendPKMN");
            $("#pkmnTable").show();
            $(".pick").show();

        }
    });

    socket.on("grabID", function (status, battleText) {
        // get ID and then server Update GUI
        console.log("grabID");
        socket.emit("grabIDtoServerGUI", status, battleText);
    });

    socket.on("serverUpdateGUI", function (status, battleText, t) {
        console.log("Called with status " + status);
        // console.log(t + " " + typeof (t));
        if (status == 0) { // normal, resume battle
            $("#battleText").html(battleText + ""); // set text to data from server
            showTextField(); // show text field for all
            setTimeout(function () { // make it hang out on screen for three seconds
                $("#textField").hide();
                if (t == localQueue[0]) { // if youre P1 or P2, show your menu
                    showMainBattleMenu("One");
                }
                else if (t == localQueue[1]) {
                    showMainBattleMenu("Two");
                } // \/\/\/ ELSE show spectator menu
                else showWaitText("One"); // !!!
            }, 3000);
        }
        if (status == 1) { // force swap for fainted p1 PKMN
            $("#battleText").html(battleText + ""); // set text to data from server
            showTextField(); // show text field for all
            setTimeout(function () { // make it hang out on screen for three seconds
                $("#textField").hide();
                if (t == localQueue[0]) { // if youre P1 or P2, show your menu
                    showSwapMenu("One", true);
                }
                else if (t == localQueue[1]) {
                    showWaitText("Two");
                } // \/\/\/ ELSE show spectator menu
                else showTextField(); // !!!
            }, 3000);
        }
        if (status == 2) { // force swap for fainted P2 PKMN
            $("#battleText").html(battleText + ""); // set text to data from server
            showTextField(); // show text field for all
            setTimeout(function () { // make it hang out on screen for three seconds
                $("#textField").hide();
                if (t == localQueue[0]) { // if youre P1 or P2, show your menu
                    showWaitText("One");
                }
                else if (t == localQueue[1]) {
                    showSwapMenu("Two", true);
                } // \/\/\/ ELSE show spectator menu
                else showWaitText("One"); // !!!
            }, 3000);
        }
        if (status == 11) { // W1
            $("#battleText").html(battleText + "<br>Player One won!"); // set text to data from server
            showTextField(); // show text field for all
            setTimeout(function () { // make it hang out on screen for three seconds
                $("#textField").hide();
                socket.emit("gameOver"); // kick out loser
                // send back to queue
                // !!! RESET GAME FUNCTION, send loser name out
            }, 6000);
        }
        if (status == 22) { // W2
            $("#battleText").html(battleText + "<br>Player Two won!"); // set text to data from server
            showTextField(); // show text field for all
            setTimeout(function () { // make it hang out on screen for three seconds
                $("#textField").hide();
                socket.emit("gameOver"); // kick out loser
                // !!! RESET GAME FUNCTION, send loser name out
            }, 6000);
        }
        if (status == -1) { // swap refresh GUI
            $("#battleText").html(""); // set text to data from server
            $(".splitMenu").hide();
            if (t == localQueue[0]) { // if youre P1 or P2, show your menu
                showMainBattleMenu("One");
            }
            else if (t == localQueue[1]) {
                showMainBattleMenu("Two");
            } // \/\/\/ ELSE show spectator menu
            else showTextField(); // !!!
        }
        if (status == 100) {
            console.log("Status 100");
            gameReady = false;
            $(".splitMenu").hide();
            $("#imageField").hide();
            socket.emit("sendPKMN");
            $("#pkmnTable").show();
            $(".pick").show();
            console.log(trainerLocal + " " + localQueue[0]);
            //socket.emit("grabQ");
            $("#playing").show();
            $("#upNext").show();

            if (trainerLocal == localQueue[0] || trainerLocal == localQueue[1]) {
                //localQueue = queue;
                // update Queue?
                socket.emit("sendPKMN");
                $("#pkmnTable").show();
                $(".pick").show();
            }
        }
        else { // error, revert to battle menu

        }
    });

    socket.on("reset", function () {
        gameReady = false;
        $(".splitMenu").hide();
        $("#imageField").hide();
        $("#pickPage").show();
        $("#playing").show();
        $("#upNext").show();
        socket.emit("sendPKMN");
        $(".pick").hide();
        $("#pkmnTable").hide();
        console.log(localQueue[0] + " " + localQueue[1]);
        if (trainerLocal == localQueue[0] || trainerLocal == localQueue[1]) {
            //localQueue = queue;
            // update Queue?
            socket.emit("sendPKMN");
            $("#pkmnTable").show();
            $(".pick").show();
        }
    });

    socket.on("gameCheck", function () { // sets you to gameReady
        gameReady = true;
    });

    socket.on("setupItemAndSwap", function (p11, p12, p13, p21, p22, p23) {
        $("#playerOneSwap1").text(p11);
        $("#playerOneItem1").text(p11);
        $("#playerOneSwap2").text(p12);
        $("#playerOneItem2").text(p12);
        $("#playerOneSwap3").text(p13);
        $("#playerOneItem3").text(p13);
        $("#playerTwoSwap1").text(p21);
        $("#playerTwoItem1").text(p21);
        $("#playerTwoSwap2").text(p22);
        $("#playerTwoItem2").text(p22);
        $("#playerTwoSwap3").text(p23);
        $("#playerTwoItem3").text(p23);
    });

    socket.on("gameReady", function () { // first time setup
        $("#imageField").show();
        if (gameReady) {
            $("#pickPage").hide();
        }
        if (trainerLocal == localQueue[0]) {
            $("#playerOneMenu").show();
        }
        else if (trainerLocal == localQueue[1]) {
            $("#playerTwoMenu").show();
        }
        else {
            $("#battleText").html("Players are making moves.");
            $("#textField").show();
        }
        $(document.getElementById("oppenetHealth")).width(playerTwoHealth);
        $(document.getElementById("playerHealth")).width(playerOneHealth);

    });

} // END SET THINGS UP

$(setThingsUp);

