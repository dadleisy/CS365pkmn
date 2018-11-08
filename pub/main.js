//var whatMenu = 0;//0 is main battle menu. 1 is the fight menu, 2 is battle text
// I'm guessing this got manually hard-coded. Searched the file and this is its only instance
// In that case Im going to use it to see if the game is alive or not.
var gameReady = false;

playerOne = 1;
playerTwo = 1;
var socket = io();

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

function setThingsUp() {
    $("#playerOneMenu").hide();
    $("#playerTwoMenu").hide();
    $("#playerOneFightMenu").hide();
    $("#playerTwoFightMenu").hide();
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
        socket.emit("setTrainer", $("#trainer").val(), function (loginSuccessful) {
            if (loginSuccessful === true) {
                $(".playerPick").hide(); // change for trainer
                $(".queue").show();
            }

            $("#userText").val("");
        });
        event.preventDefault(); //preventing the browser's default behavior of "submitting" the form.
    });

    function updateGUI() { // may have to mess with this for base case
        if (gameReady) {
            $(document.getElementById("oppenetHealth")).width(playerTwoHealth);
            $(document.getElementById("playerHealth")).width(playerOneHealth);

            if (playerOne == 0 && playerTwo == 0 && (attackOrder == 1 || attackOrder == 2)) {
                $("#playerOneFightMenu").hide();
                $("#playerTwoFightMenu").hide();
                $("#playerOneWaitText").hide();
                $("#playerTwoWaitText").hide();

                if (attackOrder == 1) {
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
                }, 2000);
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
    }
    // updateGUI();

    $("#fight1").click(function () {
        playerOne = 2;
        updateGUI();
    });
    $("#fight2").click(function () {
        playerTwo = 2;
        updateGUI();
    });
    $("#item1").click(function () {
        alert('Item has been clicked');
    });
    $("#item2").click(function () {
        alert('Item has been clicked');
    });
    $("#swap1").click(function () {
        alert('Swap Pokémon has been clicked');
    });
    $("#swap2").click(function () {
        alert('Swap Pokémon has been clicked');
    });
    $("#run1").click(function () {
        alert('Run has been clicked');
    });
    $("#run1").click(function () {
        alert('Run has been clicked');
    });


    $("#firstAttack1").click(function () {
        socket.emit("firstAttack1");
        playerOne = 3;
        updateGUI();
    });
    $("#firstAttack2").click(function () {
        socket.emit("firstAttack2");
        playerTwo = 3;
        updateGUI();
    });


    $("#secondAttack1").click(function () {
        socket.emit("secondAttack1");
        playerOne = 3;
        updateGUI();
    });
    $("#secondAttack2").click(function () {
        socket.emit("secondAttack2");
        playerTwo = 3;
        updateGUI();
    });


    $("#thirdAttack1").click(function () {
        socket.emit("thirdAttack1");
        playerOne = 3;
        updateGUI();
    });
    $("#thirdAttack2").click(function () {
        socket.emit("thirdAttack2");
        playerTwo = 3;
        updateGUI();
    });


    $("#fourthAttack1").click(function () {
        socket.emit("fourthAttack1");
        playerOne = 3;
        updateGUI();
    });
    $("#fourthAttack2").click(function () {
        socket.emit("fourthAttack2");
        playerTwo = 3;
        updateGUI();
    });

    socket.on("effectPlayerOneHealth", function (getHealth) {
        playerOneHealth = getHealth;
        if (playerOneHealth <= 0) {
            alert('player two has won, PlayerOne has ' + getHealth + ' health');
        }
        updateGUI();
    });
    socket.on("effectPlayerTwoHealth", function (getHealth) {
        playerTwoHealth = getHealth;
        if (playerTwoHealth <= 0) {
            alert('player one has won, PlayerTwo has ' + getHealth + ' health');
        }
        updateGUI();
    });


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
    })

    socket.on("whoAttackedFirst", function (order) {
        attackOrder = order;
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
        // write rest in other
    });

    socket.on("showPKMN", function() {
        $("#pkmnTable").show();
    });
}

$(setThingsUp);

