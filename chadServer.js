var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;
var client = new MongoClient("mongodb://localhost:27017", { useNewUrlParser: true });
var db;

var p1 = [];
var p2 = [];

var pkmn = {name: name, hp: hp, atk: atk, def: def, spd: spd, m1: m1, m2: m2, m3: m3, m4: m4}
var move = {moveName: name, power: power, acr: acr}
db.pokemon.insert(new pkmn("Charizard", 153, 93, 98, 120, new move("tackle", 40, 100), new move("tackle", 40, 100), new move("tackle", 40, 100), new move("tackle", 40, 100)));
db.pokemon.insert(new pkmn("Blastoise", 154, 92, 120, 98, new move("tackle", 40, 100), new move("tackle", 40, 100), new move("tackle", 40, 100), new move("tackle", 40, 100)));
db.pokemon.insert(new pkmn("Venasaur", 155, 91, 103, 100, new move("tackle", 40, 100), new move("tackle", 40, 100), new move("tackle", 40, 100), new move("tackle", 40, 100)));