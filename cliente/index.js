const app = require('express')();

const e = require('cors');
const { disconnect } = require('process');
const { start } = require('repl');
// Game Vars
const {userJoin, getCurrentUser, userLeaves, getRoomUsers, cleanUsers, getGameUsers} = require('./utlis/users')
const suits = ['H', 'D', 'C', 'S'];
const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
var game_data;
var n_round = 0, dealer_points = 0, round_started = false, interval =  setTimeout(()=>{}, 0);
//

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://localhost:8080']
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});


io.on('connection', (socket) => {
  //
  function draw_card() {
    let card;
    if(game_data.deck.length > 0) {
      let rand_index = Math.floor(Math.random() * game_data.deck.length );
      card = game_data.deck.splice(rand_index, 1)[0];
    }
    return card;
  }

  function finish_round() {
    console.log('Finish round: ' + n_round);
    io.to(game_data.room_id).emit('message', JSON.stringify({
      Tipo: 5,
      Valor: n_round,
      Turn: false
    }));

    // Automatic dealer win
    let valid_user = false;
    game_data.users.map((user) => {
      if (user.total <= 21) {
        valid_user = true;
      }
    });

    io.to(game_data.room_id).emit('message', JSON.stringify({
      Tipo: 10,
      Valor: game_data.dealer.total,
    }));

    if (valid_user) {
      io.to(game_data.room_id).emit('message', JSON.stringify({
        Tipo: 7,
        Valor: false,
      }));
    } else {
      io.to(game_data.room_id).emit('message', JSON.stringify({
        Tipo: 7,
        Valor: true,
      }));
    }
  }


  function get_cards_value ( cards ) {
    let total = 0;
    for (let card of cards) {
      if (card.rank != 'A') {
        switch (card.rank) {
          case 'J':
          case 'Q':
          case 'K':
            total += 10;
          break;
          default:
            total += card.rank;
            break;
        }
      }
    }

    let a_qty = 0;
    for (let card of cards) {
      if (card.rank == 'A') {
        a_qty++;
      }
    }

    if (a_qty > 0) {
      if (a_qty == 1) {
        total += ( total < 11 ) ? 11 : 1;
      }
      else if (a_qty == 2) {
        if ((total + 12) <= 21) total += 12;
        else total += 2;
      }
      else if (a_qty == 3) {
        if ((total + 13) <= 21) total += 13;
        else total += 3;
      } 
      else if (a_qty == 4) {
        if ((total + 14) <= 21) total += 14;
        else total += 4;
      }
    }

    return total;
  }
  //


  //   
  socket.on('message', (json) => {
    let data = JSON.parse(json);

    switch (parseInt(data.Tipo)) {
      case 2: // start
        game_start();
        break;
      case 6:
        hit_card();  
        break;
      case 7:
        stant_user();
        break;
      case 9: // deal:dealer  
        deal_dealer();
        break;  
      case 10: // deal:dealer  
        dealer_end();
        break;  
    }
  })

  //Start Game
  function game_start () {
    if (n_round < 5) {
      round_started = true;
      n_round++;

      game_data = {
        room_id: 'game_room',
        users: [],
        dealer: {'total': 0, 'points': dealer_points, 'cards': []},
        index: 0,
        deck: []
      };

      // Deck
      game_data.deck = [];
      for( let i = 0; i < suits.length; i++ ) {
        for( let j = 0; j < ranks.length; j++ ) {
          let card = {};
          card.suit = suits[i];
          card.rank = ranks[j];
          game_data.deck.push(card);
        }
      }

      // Two cards for dealer
      let _card = draw_card();
      io.to(game_data.room_id).emit('message', JSON.stringify({
        Tipo: 3,
        Valor: `${n_round}##crepier##${_card.rank}##${_card.suit}`
      }));
      game_data.dealer.cards.push(_card);
      game_data.dealer.total = get_cards_value(game_data.dealer.cards);

      _card = draw_card();
      io.to(game_data.room_id).emit('message', JSON.stringify({
        Tipo: 3,
        Valor: `${n_round}##crepier##${_card.rank}##${_card.suit}`
      }));
      game_data.dealer.cards.push(_card);
      game_data.dealer.total = get_cards_value(game_data.dealer.cards);

      // Users
      for(let user of getGameUsers()) {
        // Two cards for User
        let total = 0;

        _card = draw_card(); // tipo 4
        let aux_card = draw_card();

        io.to(user.socket).emit('message', JSON.stringify({
          Tipo: 4,
          Valor: `${n_round}##${_card.rank}##${aux_card.rank}##${_card.suit}##${aux_card.suit}`
        }));

        total = get_cards_value([_card, aux_card]);

        game_data.users.push({
          'user_id': user.user_id,
          'socket': user.socket,
          'total': total,
          'turn': false,
          'points': user.points,
          'cards': [_card, aux_card]
        });

        // score
        io.to(user.socket).emit('message', JSON.stringify({
          Tipo: 9,
          Valor: `${total}##true`
        }));
      }

      // Disable turns for all room 5
      io.to(game_data.room_id).emit('message', JSON.stringify({
        Tipo: 5,
        Valor: n_round,
        Turn: false
      }));
    
      // First turn 
      io.to(game_data.users[0].socket).emit('message', JSON.stringify({
        Tipo: 5,
        Valor: n_round,
        Turn: true
      }));
      //

      game_data.users[0].turn = true;
      io.to(game_data.room_id).emit('game:users', game_data.users);
    }
    else if (game_data !== undefined && game_data.users.length > 0) {
      let max = {'points': 0};
      for (let user of getGameUsers()) {
        if (max.points < user.points) max = user;
      }

      let winners = []
      if ( max.points < dealer_points ) {
        winners.push({'user_id': 'crepier', 'points': dealer_points});
      } else {
        for (let user of getGameUsers()) {
          if ( user.points == max.points ) {
            winners.push(user);
          }
        }
        if (max.points == dealer_points) winners.push({'user_id': 'crepier', 'points': dealer_points});
      }


      io.to(game_data.room_id).emit('message', JSON.stringify({
        Tipo: 8,
        Valor: winners
      }));

      cleanUsers();
      n_round = 0;
      dealer_points = 0;
      game_data = undefined;
    } else {
      console.log('insuficientes');
    }
  }

  // Hit Card
  function hit_card() {
    var card = draw_card();
    if(card) {
      io.to(game_data.users[game_data.index].socket).emit('message', JSON.stringify({
        Tipo: 6,
        Valor: `${n_round}##${card.rank}##${card.suit}`
      }));
      
      game_data.users[game_data.index].cards.push(card);
      game_data.users[game_data.index].total = get_cards_value(game_data.users[game_data.index].cards);

      //emit Score to User
      io.to(game_data.users[game_data.index].socket).emit('message', JSON.stringify({
        Tipo: 9,
        Valor: `${game_data.users[game_data.index].total}##false`
      }));
    }
    else {
      // Empty deck
    }
  }

  // Stand
  function stant_user() {
    //last User show New Game
    if (game_data.users[game_data.index + 1] === undefined) {
      finish_round();
    }
    else {
      game_data.users[game_data.index].turn = false;
      io.to(game_data.users[game_data.index].socket).emit('message', JSON.stringify({
        Tipo: 5,
        Valor: n_round,
        Turn: false
      }));

      // Next player
      game_data.index++;

      game_data.users[game_data.index].turn = true;
      io.to(game_data.users[game_data.index].socket).emit('message', JSON.stringify({
        Tipo: 5,
        Valor: n_round,
        Turn: true
      }));
    }

    // Update user list
    io.to(game_data.room_id).emit('game:users', game_data.users);
  }

  // Dealer Cards
  function deal_dealer() {
    if (game_data.dealer.total < 17) {
      let card = draw_card();
      if(card) {
        io.to(game_data.room_id).emit('message', JSON.stringify({
          Tipo: 3,
          Valor: `${n_round}##crepier##${card.rank}##${card.suit}`
        }));

        game_data.dealer.cards.push(card);
        game_data.dealer.total = get_cards_value(game_data.dealer.cards);
      }
    }

    io.to(game_data.room_id).emit('message', JSON.stringify({
      Tipo: 10,
      Valor: game_data.dealer.total
    }));
  }


  // Dealer end turn
  function dealer_end() {
    let user_winners = []; let max = 0;

    // Users lower or equal than 21
    for(let user of game_data.users) {
      if ( user.total <= 21 ) {
        if(user.total > max) {
          max = user.total;
        }
      }
    }

    // Users with the highest value
    for(let user of game_data.users) {
      if (user.total == max) {
        user_winners.push(user);
      } else if ( user.total < max ) { // Users below max lose
        io.to(user.socket).emit('message', JSON.stringify({Tipo: 13}));
      }
    }

    // if dealer is greather than max and lower or equal than 21 - dealer win
    if (max < game_data.dealer.total && game_data.dealer.total <= 21) {
      if (round_started) dealer_points++;
      io.to(game_data.room_id).emit('message', JSON.stringify({Tipo: 11}));
      for (let user of user_winners) io.to(user.socket).emit('message', JSON.stringify({Tipo: 13}));
    }
    // if dealer total is equal the max - both win
    else if (max == game_data.dealer.total) {
      if (round_started) dealer_points++;
      io.to(game_data.room_id).emit('message', JSON.stringify({Tipo: 11}));
      for (let user of user_winners) {
        io.to(user.socket).emit('message', JSON.stringify({Tipo: 14}));

        if (round_started) {
          let index = getGameUsers().findIndex(_user => _user.socket === user.socket);
          getGameUsers()[index].points++;
        }
      }
    }
    // users win
    else {
      io.to(game_data.room_id).emit('message', JSON.stringify({Tipo: 12}));
      for (let user of user_winners) {
        io.to(user.socket).emit('message', JSON.stringify({Tipo: 14}))

        if (round_started) {
          let index = getGameUsers().findIndex(_user => _user.socket === user.socket);
          getGameUsers()[index].points++;
        }
      }
    }
    
    round_started = false;
    setTimeout(() => {
      io.to(game_data.room_id).emit('message', JSON.stringify({Tipo: 2}));
      if (socket.id == game_data.users[game_data.users.length - 1].socket) {
        io.to(game_data.users[game_data.users.length - 1].socket).emit('message', JSON.stringify({Tipo: 2, Valor: n_round}));
      }
    }, 5000)
  }



  socket.on('join:game', () => {
    if (getGameUsers().length < 5 && game_data === undefined) {
      //New User Creation
      let user;
      if ( getGameUsers().length > 0 ) {
        user = userJoin(socket.id, getGameUsers()[getGameUsers().length - 1].user_id + 1, 'game_room');
      } else {
        user = userJoin(socket.id, 1, 'game_room');
      }
      
      socket.join(user.room_id);
      console.log('Connected:', user.socket);

      //Send Users and Room Info
      io.to(user.room_id).emit('game:users', getGameUsers());

      io.to(socket.id).emit('message', JSON.stringify({
        Tipo: 1, 
        Valor: null
      }));

    } else {
      io.to(socket.id).emit('message', JSON.stringify({
        Tipo: -1, 
        Valor: null
      }));
    }


    if (getGameUsers().length > 1 && getGameUsers().length < 6 && game_data === undefined) {
      clearTimeout(interval);
      interval = setTimeout(() => {
        game_start();
      }, 5000);
    }

  })  
  
  // Reset users
  socket.on('game:clean:users', () => { 
    cleanUsers();
    n_round = 0;
    dealer_points = 0;
    game_data = undefined;
  })

  socket.on('disconnect', () => {
    console.log('disconected: ' + socket.id);
    let _user = userLeaves(socket.id);

    if (_user && game_data && game_data.users.length > 0) {
      let index_game = game_data.users.findIndex(user => user.socket === _user.socket);
      
      if (index_game !== -1) {
        if (game_data.users[index_game + 1] === undefined) {
          if (game_data.users[game_data.index].user_id == game_data.users[index_game].user_id) {
            finish_round();
          }
        } else {
          game_data.users[index_game].turn = false;
          io.to(game_data.users[index_game].socket).emit('message', JSON.stringify({
            Tipo: 5,
            Valor: n_round,
            Turn: false
          }));
          
          if (game_data.users[game_data.index].user_id == game_data.users[index_game].user_id) {
            game_data.users[index_game + 1].turn = true;
            io.to(game_data.users[index_game + 1].socket).emit('message', JSON.stringify({
              Tipo: 5,
              Valor: n_round,
              Turn: true
            }));
          } 
          else if (game_data.users[index_game].user_id < game_data.users[game_data.index].user_id) {
            game_data.index--;
          }
        }

        game_data.users.splice(index_game, 1);
      }

      io.to(_user.room_id).emit('game:users', getGameUsers());
    } else {
      if (_user && _user.room_id !== undefined) io.to(_user.room_id).emit('game:users', getGameUsers());
    }
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});