var pictionary = function() {
    var canvas, context;
    var socket = io();
    var isDrawing = false;
    socket.isDrawer = false;

    var setIsDrawer = function(newWord){
        console.log("in isDrawer");
        socket.isDrawer = true;
        context.clearRect(0, 0, canvas[0].width, canvas[0].height);        
        $("#word").text(newWord);
        $("#waiting").show();
        $("#wordBox").hide();
        $("#guess").hide();
        $("#guesses").hide();
    }
    
    var startGame = function(){
        console.log("in startGame");
        if (socket.isDrawer){
            $("#guess").hide();  
            $("#waiting").hide();              
            $("#wordBox").show(); 
            $("#guess").hide();
            $("#guesses").show();          
        } else {
            $("#waiting").hide(); 
            $("#wordBox").hide();
            $("#guess").show();
            $("#guesses").show();            
        }
     }
    
    var displayGuess = function(guess){
       $("#guesses").text(guess);
    }
        
    var resetGame = function(info){      
      $("#guesses").text("The correct answer was '" + info.guess + "'.  New game started.");
      socket.isDrawer = info.newDrawerID === socket.id;
      context.clearRect(0, 0, canvas[0].width, canvas[0].height);
      startGame();         
    }
    
    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        context.fill();
        context.closePath();      
        if (socket.isDrawer)
            socket.emit('draw', position);
    };

    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
  
    canvas.on("mousedown", function(){
      isDrawing = true;
    });
  
    canvas.on("mouseup", function(){
      isDrawing = false;
    })
  
    canvas.on('mousemove', function(event) {
        if (isDrawing && socket.isDrawer){
          var offset = canvas.offset();
          var position = {x: event.pageX - offset.left,
                          y: event.pageY - offset.top};
          draw(position);
        }
    });
  
    var guessBox;

    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }

        console.log(guessBox.val());
        socket.emit("guess", guessBox.val());
        displayGuess(guessBox.val());
        guessBox.val('');
    };

    guessBox = $('#guess input');
    guessBox.on('keydown', onKeyDown);  
  
    socket.on("draw", draw);
    socket.on("guess", displayGuess);
    socket.on('setIsDrawer', setIsDrawer);
    socket.on('resetGame', resetGame);
    socket.on('startGame', startGame);
};

$(document).ready(function() {
    pictionary();
});