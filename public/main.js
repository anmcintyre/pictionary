var pictionary = function() {
    var canvas, context;
    var socket = io();
    var isDrawing = false;


    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        context.fill();
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
        if (isDrawing){
          var offset = canvas.offset();
          var position = {x: event.pageX - offset.left,
                          y: event.pageY - offset.top};
          draw(position);
        }
    });
  
    socket.on("draw", draw);
};

$(document).ready(function() {
    pictionary();
});