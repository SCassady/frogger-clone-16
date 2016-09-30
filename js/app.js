/*
 * File: The application for the Front-End Nanodegree Project 7;
 * Description: A frogger-style game with 2 game modes.
 * Author: Steven Cassady;
 * Version: 1.0.0;
 * Date: Sept. 26, 2016;
 */
var MENU_START_X = 101;
var MENU_START_Y = 126;
var PLAYER_START_X = 202;
var PLAYER_START_Y = 380;
var CHOICE_1 = 'images/char-cat-girl.png';
var CHOICE_2 = 'images/char-horn-girl.png';
var CHOICE_3 = 'images/char-pink-girl.png';
var CHOICE_4 = 'images/char-princess-girl.png';
var CHOICE_5 = 'images/char-boy.png';
var VICTORY_CONDITION = 5;
var TIMED_LENGTH = 60;
var GameStateEnum = {
  MODEMENU: 1,
  CHARMENU : 2,
  GAME: 3,
  VICTORY: 4,
  LOSS: 5,
  TIMEDOVER: 6,
  PAUSED: 7
};
var timedMode;
var startingLanesY = [48, 131, 214, 297];

/*
 * Generates a random integer on the closed interval defined.
 * @param {number} min
 * @param {number} max
 * @returns {number} - The randomly produced integer.
 */
var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


/*
 * Enemies our player must avoid. Orange and normal speed by default.
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {Player} player - Reference to player object.
 */
var Enemy = function(x, y, player) {
  this.sprite = 'images/enemy-bug.png';
  this.x = x;
  this.y = y;
  this.speed = 350;
  this.player = player;
  // this.direction = 1;
};


/*
 * Perform update logic.
 * @param {number} dt - Deltatime
 */
Enemy.prototype.update = function(dt) {
  if (gameState === GameStateEnum.GAME) {
    this.x = this.x + this.speed*dt;
    if (this.x > 505) {
      this.x = getRandomInt(-this.speed-400, -100);
      this.y = startingLanesY[getRandomInt(0, startingLanesY.length-1)];
    }
    // this.player.checkCollideEnemy(this.x, this.y);
    this.player.checkCollideEntity(this.x, this.y);
  }
};

// Draw the enemy on the screen.
Enemy.prototype.render = function() {
  if (gameState === GameStateEnum.GAME || gameState === GameStateEnum.PAUSED) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  };
};


/*
 * A slower, yellow enemy.
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {Player} player - Reference to player object.
 */
var YellowLady = function(x, y, player) {
  Enemy.call(this, x, y, player);
  this.sprite = 'images/yellow-bug.png';
  this.speed = 200;
};
YellowLady.prototype = Object.create(Enemy.prototype);


/*
 * A faster, purple enemy which moves from right to left.
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {Player} player - Reference to player object.
 */
var Beetle = function(x, y, player) {
  Enemy.call(this, x, y, player);
  this.sprite = 'images/beetle-bug.png';
  this.speed = 450;
  // this.direction = -1;
};
Beetle.prototype = Object.create(Enemy.prototype);

/*
 * Perform update logic.
 * @param {number} dt - Deltatime
 */
Beetle.prototype.update = function(dt) {
  if (gameState === GameStateEnum.GAME) {
    this.x = this.x - this.speed*dt;
    if (this.x < -80) {
      this.x = getRandomInt(1000, this.speed+1600);
      this.y = startingLanesY[getRandomInt(0, startingLanesY.length-1)];
    }
    this.player.checkCollideEntity(this.x, this.y);
    // this.player.checkCollideEnemy(this.x, this.y);
  }
};


/*
 * The player's avatar, controlled by the keyboard.
 * @constructor
 * @param {number} x
 * @param {number} y
 */
var Player = function(x, y) {
  this.sprite = 'images/selector.png';
  this.x = x;
  this.y = y;
  this.time = TIMED_LENGTH; //CHANGE TO 60! For test only.
  this.score = 0; //CHANGE TO 0! For test only.
  this.gemController;
  // TODO: add health, health system.
};

/*
 * Reference gemController instance.
 * @param {GemController} gemController - Reference to instance.
 */
Player.prototype.setGemController = function(gemController) {
  this.gemController = gemController;
};

/*
 * Perform update logic.
 * @param {number} dt - Deltatime
 */
Player.prototype.update = function(dt) {
  if (gameState === GameStateEnum.GAME) {
    if (timedMode) {
      this.time -= 1*dt;
      if (this.time <= 0) {
        gameState = GameStateEnum.TIMEDOVER;
        console.log(gameState);
        this.gemController.clearGems();
      }
    } else {
      this.time += 1*dt;
    }
  }
};

// Draw player model, HUD, and menus.
Player.prototype.render = function() {
  if (gameState === GameStateEnum.CHARMENU) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    ctx.drawImage(Resources.get(CHOICE_1), 0, 380);
    ctx.drawImage(Resources.get(CHOICE_2), 101, 380);
    ctx.drawImage(Resources.get(CHOICE_3), 202, 380);
    ctx.drawImage(Resources.get(CHOICE_4), 303, 380);
    ctx.drawImage(Resources.get(CHOICE_5), 404, 380);
    this.displayStrokedText('white', 'Select your character!', '48px Arial', 250, 120);
    this.displayPressPrompt('Enter', 'begin', 250, 165);
    this.displayPressPrompt('Escape', 'go back', 250, 200);
    this.displayStrokedText('white', 'Instructions:', '36px Arial', 250, 255);
    if (timedMode) {
      ctx.font = '24px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText('Collect gems or cross to gain points!', 250, 285);
      ctx.fillText('Blue gems: 5 points', 250, 310);
      ctx.fillText('Green gems: 10 points', 250, 335);
      ctx.fillText('Orange gems: 25 points', 250, 360);
      ctx.fillText('Cross road: 15 points', 250, 385);
      ctx.fillText('Touch enemy: -10 points', 250, 410);
    } else {
      ctx.font = '24px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText('Cross the road 5 times to win!', 250, 285);
    }
  } else if (gameState === GameStateEnum.MODEMENU) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    ctx.lineWidth = 2;
    this.displayStrokedText('orange', "Frogger '16", '72px Cambria', 250, 195)
    this.displayPressPrompt('Enter', 'select game mode', 250, 515);
    ctx.font = '18px Arial';
    ctx.fillText('Created by Steven Cassady.', 250, 570);
    ctx.font = '40px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Classic', 210, 275);
    ctx.fillText('Timed', 210, 358);
  } else if (gameState === GameStateEnum.GAME) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    ctx.font = '40px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    if (timedMode) {
      ctx.fillText('Score: ' + this.score, 15, 100);
    } else {
      ctx.fillText('Crosses: ' + this.score, 15, 100);
    }
    ctx.textAlign = 'left';
    ctx.fillText('Time: ' + Math.round(this.time), 300, 100);
  } else if (gameState === GameStateEnum.VICTORY) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    this.displayStrokedText('white', 'Congrats! You won!', '55px Arial', 250, 263);
    this.displayStrokedText('white', 'Completed in: ' + Math.round(this.time) + 's', '44px Arial', 250, 340);
    this.displayPressPrompt('Enter', 'continue', 250, 412);
  } else if (gameState === GameStateEnum.LOSS) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    this.displayStrokedText('white', 'Sorry! You lost...', '55px Arial', 250, 263);
    this.displayPressPrompt('Enter', 'continue', 250, 412);
  } else if (gameState === GameStateEnum.TIMEDOVER) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    this.displayStrokedText('white', 'Game complete!', '55px Arial', 250, 263);
    this.displayStrokedText('white', 'Total score: ' + this.score + ' pts', '44px Arial', 250, 340);
    this.displayPressPrompt('Enter', 'continue', 250, 412);
  } else if (gameState === GameStateEnum.PAUSED) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    this.displayStrokedText('white', 'Game Paused', '48px Arial', 250, 290);
    this.displayPressPrompt('Escape', 'continue', 250, 330);
  };
};

/*
 * Display a (filled text) prompt to press a button.
 * @param {string} button - Button to press.
 * @param {string} action - Result of button press.
 * @param {number} x
 * @param {number} y
 */
Player.prototype.displayPressPrompt = function(button, action, x, y) {
  ctx.font = '30px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText('(Press ' + button + ' to ' + action + '.)', x, y);
};

/*
 * Display filled white text with black stroke.
 * @param {string} color
 * @param {string} message - Message to display.
 * @param {string} font
 * @param {number} x
 * @param {number} y
 */
Player.prototype.displayStrokedText = function(color, message, font, x, y) {
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(message, x, y);
  ctx.strokeText(message, x, y);
};

// Teleport player model to bottom center.
Player.prototype.returnToStart = function() {
  this.x = PLAYER_START_X;
  this.y = PLAYER_START_Y;
};

// Teleport player model to menu first position.
Player.prototype.returnToMenuStart = function() {
  this.x = MENU_START_X;
  this.y = MENU_START_Y;
};

/*
 * Check for collision with enemy or gem.
 * @param {number} entityX
 * @param {number} entityY
 * @param {number} entityValue - Score value of Gem.
 * @returns {boolean} - true if a gem collision has taken place.
 */
Player.prototype.checkCollideEntity = function(entityX, entityY, entityValue) {
  if (entityValue === undefined) {
    // Collision with enemy.
    if (entityX < this.x + 65 && entityX> this.x - 65 && entityY < this.y + 35 && entityY > this.y - 35) {
      // Has collided with player
      if (timedMode) {
        this.score -= 10;
      }
      this.returnToStart();
      // TODO: Create lose condition for health.
      // if (this.score < -9 && !timedMode) {
      //   gameState = GameStateEnum.LOSS;
      //   this.x = 202;
      //   this.y = 214;
      //   this.score = 0;
      // } else {
      //   this.returnToStart();
      // }
    }
  } else {
    // Collision with gem.
    if (entityX < this.x + 65 && entityX> this.x - 65 && entityY < this.y + 35 && entityY > this.y - 35) {
      // Has collided with player
      this.score += entityValue;
      return true;
    }
  }
};

/*
 * Take action based on keyboard presses.
 * @param {string} keyPressed -
 */
Player.prototype.handleInput = function(keyPressed) {
  if (keyPressed === 'left') {
    if (gameState === GameStateEnum.GAME || gameState === GameStateEnum.CHARMENU) {
      if (this.x > 50) {
        this.x -= 101;
      }
    }
  } else if (keyPressed === 'right') {
    if (gameState === GameStateEnum.GAME || gameState === GameStateEnum.CHARMENU) {
      if (this.x < 400) {
        this.x += 101;
      }
    }
  } else if (keyPressed === 'up') {
    if (gameState === GameStateEnum.GAME) {
      if (this.y > 50) {
        this.y -= 83;
      } else {
        // Player has walked into water, restart.
        if (timedMode) {
          this.score += 15;
        } else {
          this.score ++;
        }
        // if 10, win!
        if (this.score === VICTORY_CONDITION && !timedMode) {
          gameState = GameStateEnum.VICTORY;
          this.score = 0;
        }
        this.returnToStart();
      }
    } else if (gameState === GameStateEnum.MODEMENU) {
      if (this.y > MENU_START_Y) {
        this.y -= 83;
      }
    }
  } else if (keyPressed === 'down') {
    if (gameState === GameStateEnum.GAME) {
      if (this.y < PLAYER_START_Y) {
        this.y += 83;
      }
    } else if (gameState === GameStateEnum.MODEMENU) {
      if (this.y < MENU_START_Y+83) {
        this.y += 83;
      }
    }
  } else if (keyPressed === 'enter') {
    if (gameState === GameStateEnum.CHARMENU) {
      // Choose character model.
      if (this.x === 0) {
        this.sprite = CHOICE_1;
      } else if (this.x === 101) {
        this.sprite = CHOICE_2;
      } else if (this.x === 202) {
        this.sprite = CHOICE_3;
      } else if (this.x === 303) {
        this.sprite = CHOICE_4;
      } else if (this.x === 404) {
        this.sprite = CHOICE_5;
      }
      gameState = GameStateEnum.GAME;
      this.returnToStart();
    } else if (gameState === GameStateEnum.MODEMENU) {
      // Choose game mode.
      if (this.y === MENU_START_Y) {
        // Choose Classic mode.
        timedMode = false;
        this.time = 0;
        console.log('classic chosen');
      } else if (this.y === MENU_START_Y+83) {
        // Choose Timed mode.
        timedMode = true;
        this.time = TIMED_LENGTH;
        console.log('timed chosen');
      }
      console.log('mode chosen');
      console.log(this.y);
      gameState = GameStateEnum.CHARMENU;
      this.returnToStart();
    } else if (gameState === GameStateEnum.VICTORY || gameState === GameStateEnum.LOSS || gameState === GameStateEnum.TIMEDOVER) {
      gameState = GameStateEnum.MODEMENU;
      this.returnToMenuStart();
      this.sprite = 'images/selector.png';
      this.score = 0;
    }
    console.log(timedMode);
    console.log(gameState);
  } else if (keyPressed === 'escape') {
    if (gameState === GameStateEnum.GAME) {
      gameState = GameStateEnum.PAUSED;
    } else if (gameState === GameStateEnum.PAUSED) {
      gameState = GameStateEnum.GAME;
    } else if (gameState === GameStateEnum.CHARMENU) {
      this.returnToMenuStart();
      gameState = GameStateEnum.MODEMENU;
    }
  }
};


/*
 * Collectible gem for use in Timed mode.
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {Player} player - Reference to player object.
 */
var Gem = function(x, y, player) {
  this.sprite = 'images/gem-blue.png';
  this.x = x;
  this.y = y;
  this.value = 5;
  this.player = player;
};

// Draw the gem on the screen.
Gem.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/*
 * Check for collision.
 * @returns {boolean}
 */
Gem.prototype.checkCollidePlayer = function() {
  return this.player.checkCollideEntity(this.x, this.y, this.value);
};


/*
 * Collectible gem for use in Timed mode.
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {Player} player - Reference to player object.
 */
var Emerald = function(x, y, player) {
  Gem.call(this, x, y, player);
  this.sprite = 'images/gem-green.png';
  this.value = 10;
};
Emerald.prototype = Object.create(Gem.prototype);


/*
 * Collectible gem for use in Timed mode.
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {Player} player - Reference to player object.
 */
var Topaz = function(x, y, player) {
  Gem.call(this, x, y, player);
  this.sprite = 'images/gem-orange.png';
  this.value = 25;
};
Topaz.prototype = Object.create(Gem.prototype);


/*
 * Creates and controls Gem instances.
 * @constructor
 * @param {Player} player - Reference to player object.
 */
var GemController = function(player) {
  this.gems = [];
  this.player = player;
};

/*
 * Perform update logic.
 * @param {number} dt - Deltatime
 */
GemController.prototype.update = function(dt) {
  if (timedMode && gameState === GameStateEnum.GAME) {
    // Ensure that 3 gems are on the board at all times.
    if (this.gems.length < 3) {
      num = getRandomInt(1, 10);
      if (num <=5) {
        this.gems.push(new Gem(this.getValidX(), this.getValidY(), this.player));
      } else if (num <= 8) {
        this.gems.push(new Emerald(this.getValidX(), this.getValidY(), this.player));
      } else {
        this.gems.push(new Topaz(this.getValidX(), this.getValidY(), this.player));
      }
    }
    // console.log(this.gems);
    // Check each gem for collisions with player.
    for (index = 0; index < this.gems.length; index++) {
      if (this.gems[index].checkCollidePlayer() === true) { // Check for collision
        this.gems.splice(index, 1);
      }
    }
  }
};

// Draw all gems on the screen.
GemController.prototype.render = function(){
  if ((gameState === GameStateEnum.GAME || gameState === GameStateEnum.PAUSED) && timedMode) {
    for (index = 0; index < this.gems.length; index++) {
      this.gems[index].render();
    }
  }
};

/*
 * Returns an x which does not conflict with other gems or player.
 * @returns {number} x
 */
GemController.prototype.getValidX = function() {
  while (true) {
    var x = getRandomInt(0,4)*101;
    var conflict = false;

    for (index = 0; index < this.gems.length; index++) {
      if (x === this.gems[index].x) {
        conflict = true;
      }
    }
    if (x === this.player.x) {
      conflict = true;
    }
    if (!conflict) {
      return x;
    }
  }
};

/*
 * Returns a y which does not conflict with other gems or player.
 * @returns {number} y
 */
GemController.prototype.getValidY = function() {
  while (true) {
    var y = 380 - getRandomInt(1,4)*83;
    var conflict = false;

    for (index = 0; index < this.gems.length; index++) {
      if (y === this.gems[index].y) {
        conflict = true;
      }
    }
    if (y === this.player.y) {
      conflict = true;
    }
    if (!conflict) {
      return y;
    }
  }
};

// Empty the array of all gems.
GemController.prototype.clearGems = function() {
  this.gems = [];
};


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    13: 'enter',
    27: 'escape',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});


// The game application logic.
var timedMode = false;
var gameState = GameStateEnum.MODEMENU;
var player = new Player(MENU_START_X, MENU_START_Y);
var allEnemies = [];
var gemController = new GemController(player);

player.setGemController(gemController);

var enemy1 = new YellowLady(-1200, startingLanesY[getRandomInt(0,2)], player);
var enemy2 = new YellowLady(-70, startingLanesY[getRandomInt(0,2)], player);
var enemy3 = new Enemy(-300, startingLanesY[getRandomInt(0,2)], player);
var enemy4 = new Enemy(-900, startingLanesY[getRandomInt(0,2)], player);
var enemy5 = new Enemy(-1200, startingLanesY[getRandomInt(0,2)], player);
var enemy6 = new Beetle(1600, startingLanesY[getRandomInt(0,2)], player);
var enemy7 = new YellowLady(-600, startingLanesY[getRandomInt(0,2)], player);

allEnemies.push(enemy1);
allEnemies.push(enemy2);
allEnemies.push(enemy3);
allEnemies.push(enemy4);
allEnemies.push(enemy5);
allEnemies.push(enemy6);
allEnemies.push(enemy7);
