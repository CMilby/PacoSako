var game = new Chess(),
board,
statusEl = $('#status'),
fenEl = $('#fen'),
pgnEl = $('#pgn');
// "rnbqkbnr/pppppppp/8/8/8/3P4/PPP1PPPP/RNBQKBNR w KQkq - 0 1"
// setup my socket client
// var socket = io();
// msgButton.onclick = function(e) {
//     // someone clicked send a message
//     socket.emit('message', 'hello world!');
// }
//NEW CODE ABOVE

//this version does not allow for move in draw, checkmate, or if the move 
//from the black player


  var onDragStart = function (source, piece, position, orientation) {
    if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(/^b/) !== -1) {
        return false;
    }
  }; 


//to pick the position of the move.

var makeRandomMove = function()
{
  if (game.turn()==='b')
{
  var newMove = game.moves();
  
   var random = [Math.floor(Math.random() * newMove.length)];
   game.move(newMove[random]);

   
   board.position(game.fen);
   game.turn()='w';
}
  updateStatus();
};

if (game.turn() ==='w')
{
var onDrop = function(source, target) {
// see if the move is legal
var move = game.move({
  from: source,
  to: target,
  promotion: 'q' // NOTE: always promote to a queen for example simplicity
});

// illegal move
if (move === null) {
  return 'snapback';
}

//make a random legal move for black player

  window.setInterval(makeRandomMove,250);


updateStatus();
}
}
// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  //if this is commented out, those 3 ^ dont work, but unions do
//board.position(game.fen());
};

var updateStatus = function() {
var status = '';

var moveColor = 'White';
if (game.turn() === 'b') {
  moveColor = 'Black';
    
}

// checkmate?
if (game.in_checkmate() === true) {
  status = 'Game over, ' + moveColor + ' is in checkmate.';
}

// draw?
else if (game.in_draw() === true) {
  status = 'Game over, drawn position';
}

// game still on
else {
  status = moveColor + ' to move';

  // check?
  if (game.in_check() === true) {
    status += ', ' + moveColor + ' is in check';
  }
}


statusEl.html(status);
fenEl.html(game.fen());
pgnEl.html(game.pgn());

};


var cfg = {
draggable: true,
position: 'start',
onDragStart: onDragStart,
onDrop: onDrop,
onSnapEnd: onSnapEnd
};
board = ChessBoard('board', cfg);
board.position(game.fen());
updateStatus();




//BEGINNING OF NEW CODE
/*
(function () {
  
  WinJS.UI.processAll().then(function () {
    
    var socket, serverGame;
    var username, playerColor;
    var game, board;
    var usersOnline = [];
    var myGames = [];
    socket = io();
         
    //////////////////////////////
    // Socket.io handlers
    ////////////////////////////// 
    
    socket.on('login', function(msg) {
          usersOnline = msg.users;
          updateUserList();
          
          myGames = msg.games;
          updateGamesList();
    });
    
    socket.on('joinlobby', function (msg) {
      addUser(msg);
    });
    
     socket.on('leavelobby', function (msg) {
      removeUser(msg);
    });
    
    socket.on('gameadd', function(msg) {
    });
    
    socket.on('resign', function(msg) {
          if (msg.gameId == serverGame.id) {

            socket.emit('login', username);

            $('#page-lobby').show();
            $('#page-game').hide();
          }            
    });
                
    socket.on('joingame', function(msg) {
      console.log("joined as game id: " + msg.game.id );   
      playerColor = msg.color;
      initGame(msg.game);
      
      $('#page-lobby').hide();
      $('#page-game').show();
      
    });
      
    socket.on('move', function (msg) {
      if (serverGame && msg.gameId === serverGame.id) {
         game.move(msg.move);
         board.position(game.fen());
      }
    });
   
    
    socket.on('logout', function (msg) {
      removeUser(msg.username);
    });
    

    
    //////////////////////////////
    // Menus
    ////////////////////////////// 
    $('#login').on('click', function() {
      username = $('#username').val();
      
      if (username.length > 0) {
          $('#userLabel').text(username);
          socket.emit('login', username);
          
          $('#page-login').hide();
          $('#page-lobby').show();
      } 
    });
    
    $('#game-back').on('click', function() {
      socket.emit('login', username);
      
      $('#page-game').hide();
      $('#page-lobby').show();
    });
    
    $('#game-resign').on('click', function() {
      socket.emit('resign', {userId: username, gameId: serverGame.id});
      
      socket.emit('login', username);
      $('#page-game').hide();
      $('#page-lobby').show();
    });
    
    var addUser = function(userId) {
      usersOnline.push(userId);
      updateUserList();
    };
  
   var removeUser = function(userId) {
        for (var i=0; i<usersOnline.length; i++) {
          if (usersOnline[i] === userId) {
              usersOnline.splice(i, 1);
          }
       }
       
       updateUserList();
    };
    
    var updateGamesList = function() {
      document.getElementById('gamesList').innerHTML = '';
      myGames.forEach(function(game) {
        $('#gamesList').append($('<button>')
                      .text('#'+ game)
                      .on('click', function() {
                        socket.emit('resumegame',  game);
                      }));
      });
    };
    
    var updateUserList = function() {
      document.getElementById('userList').innerHTML = '';
      usersOnline.forEach(function(user) {
        $('#userList').append($('<button>')
                      .text(user)
                      .on('click', function() {
                        socket.emit('invite',  user);
                      }));
      });
    };
         
    //////////////////////////////
    // Chess Game
    ////////////////////////////// 
    
    var initGame = function (serverGameState) {
      serverGame = serverGameState; 
      
        var cfg = {
          draggable: true,
          showNotation: false,
          orientation: playerColor,
          position: serverGame.board ? serverGame.board : 'start',
          onDragStart: onDragStart,
          onDrop: onDrop,
          onSnapEnd: onSnapEnd
        };
             
        game = serverGame.board ? new Chess(serverGame.board) : new Chess();
        board = new ChessBoard('game-board', cfg);
    }
     
    // do not pick up pieces if the game is over
    // only pick up pieces for the side to move
    var onDragStart = function(source, piece, position, orientation) {
      if (game.game_over() === true ||
          (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
          (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
          (game.turn() !== playerColor[0])) {
        return false;
      }
    };  
    
  
    
    var onDrop = function(source, target) {
      // see if the move is legal
      var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
      });
    
      // illegal move
      if (move === null) { 
        return 'snapback';
      } else {
         socket.emit('move', {move: move, gameId: serverGame.id, board: game.fen()});
      }
    
    };
    
    // update the board position after the piece snap 
    // for castling, en passant, pawn promotion
    var onSnapEnd = function() {
      board.position(game.fen());
    };
  });
  */
//})
//();