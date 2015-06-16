var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var wordToGuess = null;
var currentDrawerID = null;
var clientSocketIDs = [];

var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];

var getRandomWord = function(){
  var index = Math.floor(Math.random()*100);
  wordToGuess = WORDS[index]
  return wordToGuess;
}

io.on('connection', function (socket) {
    clientSocketIDs.push(socket.id);
    var numClients = clientSocketIDs.length;     
    
    if (numClients === 1){                
        currentDrawerID = socket.id;  
        console.log("Drawer will be " + socket.id);
        socket.emit("setIsDrawer",  getRandomWord());
    } else if (numClients == 2){
        io.sockets.emit('startGame');
        console.log("Guesser 1 will be " + socket.id);
    } else {
        socket.emit("startGame");
        console.log("Guesser " + (numClients-1)+  " will be " + socket.id);
    }
    
    socket.on('draw', function(position) {
      socket.broadcast.emit("draw", position);
    });
  
    socket.on('guess', function(guess){
      if (guess === wordToGuess){
        //Current client becomes the new guesser
        socket.emit('setIsDrawer', getRandomWord());
        currentDrawerID = socket.id;  
          
        //Let everyone know the correct word was guessed.
        //The previous drawer becomes a guesser
        io.sockets.emit('resetGame', {guess: guess, newDrawerID: currentDrawerID});  //sent to all, including guesser               
      }      
      else{
        //Let everyone know of the incorrect guess
        socket.broadcast.emit("guess", guess);
      }
    });
    
    socket.on('disconnect', function(){   
        var indexToRemove = clientSocketIDs.indexOf(socket.id);
        if (indexToRemove != -1)
            clientSocketIDs.splice(indexToRemove, 1);
        var numClients = clientSocketIDs.length;  
        var newDrawerSocket;
        if (socket.id === currentDrawerID){
            console.log('The drawer has disconnected');  
            //select a new drawer
            if (numClients > 0){
                var oldWord = wordToGuess;
                newDrawerSocket = io.sockets.connected[clientSocketIDs[0]];
                currentDrawerID = newDrawerSocket.id;   
                newDrawerSocket.emit('setIsDrawer', getRandomWord());
                            
                if (numClients >= 2){   
                    //reset all the clients  (sent to all)
                    io.sockets.emit('resetGame', {guess: oldWord, newDrawerID: currentDrawerID});                                      
                }                
            }                                                
        }            
        else{
            console.log("A guesser has disconnected");
            if (numClients === 1){
                //set the remaining client as a drawer and put in the wait state
                newDrawerSocket = io.sockets.connected[clientSocketIDs[0]];
                currentDrawerID = newDrawerSocket.id;   
                newDrawerSocket.emit('setIsDrawer', getRandomWord());
            }
        }
            
    })
});

server.listen(8888);