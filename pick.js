var socket = io();
var p1Pick = false;

function setup() {

    $("pickPKMN").click( function() {
        socket.emit("setPKMN", $("#train").val(), $("pkmn1").val(), $("pkmn2").val(), $("pkmn3").val());
        $("#pickPage").hide();
        $("#playerOneMenu").show();
        $("#playerTwoMenu").show();
    });


}

$(setup);