var socket = io();
var p1Pick = false;
var p2Pick = false;

function setup() {

    $("pickPKMN").click( function() {
        if (!p1Pick) {
            socket.emit("setPKMN", $("#train").val(), $("pkmn1").val(), $("pkmn2").val(), $("pkmn3").val());
            //$("#pickPage").hide();
            //$("#playerOneMenu").show();
            //$("#playerTwoMenu").show();
        }
        else {
            
        }

    });


}

$(setup);