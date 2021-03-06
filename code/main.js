import kaboom from "kaboom"

// initialize context
const TILE_HEIGHT = 24;
const TILE_WIDTH = 40

kaboom({
  width: TILE_WIDTH*6,
  height: TILE_HEIGHT*7,
  scale: 3,
  logMax: 1
});

loadRoot('sounds/');
loadSound('sweep', 'sfx-sweep.wav');
loadSound('crack', 'sfx-crack.wav');
loadSound('zap', 'sfx-zap.wav');
loadRoot('sprites/');
loadSprite('rockman', 'rockexe.png', {
  sliceX: 4,
  sliceY: 4,
  anims: {
    idle: {
      from: 0,
      to: 3,
      speed: 10
    },
    move: {
      from: 4,
      to: 6,
      speed: 15
    },
    fire: {
      from: 7,
      to: 10,
      speed: 15
    },
    hurt: {
      from: 11,
      to: 14,
      speed: 12
    }
  }
});
loadSprite('floor-panel', 'floors.png', {
  sliceX: 8,
  sliceY: 3
});
loadSprite('mettaur', 'mettaur.png', {
  sliceX: 4,
  sliceY: 4,
  anims: {
    attack: {
      from: 1,
      to: 10,
      speed: 12
    },
    hide: {
      from: 11,
      to: 15,
      speed: 14
    }
  }
});
loadSprite('mAtk', 'mettaur-atk.png', {
  sliceX: 3,
  sliceY: 3,
  anims: {
    swipe: {
      from: 0,
      to: 6,
      speed: 12
    }
  }
});

const config = {
  width: TILE_WIDTH,
  height: TILE_HEIGHT
}

const map = [
  '      ',
  '      ',
  '      ',
  '      ',
  '      ',
  '      ',
  '      '
]

function initFloorFrame(x,y) {
  let num = y * 8;
  return x > 2 ? num+4 : num; 
}

scene('game', () => {
  // const level = addLevel(map, config);
  layers([
    'bg',
    'game',
    'ui'
  ], 'game');
  
  const floor = [[],[],[]];

  for (let y=0; y < 3; y++) {
    for (let x=0; x < 6; x++) {
      floor[y][x] = add([
        'tile',
        sprite('floor-panel', {frame: initFloorFrame(x,y)}),
        origin('top'),
        pos((x*TILE_WIDTH) + 20, (3+y)*TILE_HEIGHT),
        floorP(x < 3),
        area({height: 24}),
        layer('bg')
      ]);
    }
  }

  // onClick('tile', (tile) => {
  //   tile.changeColor();
  // });

  // onClick('tile', (tile) => {
  //   if (!tile.isCracked) {
  //     tile.crack();
  //     play('crack', {detune: rand(-1500, -1000)});
  //   }
  // });
  
  function breakCracked({ x, y }) {
    if (floor[y][x].isCracked) {
      floor[y][x].break();
      play('crack', {detune: rand(-200, 200)});
    }
  }
  
  const player = add([
    'player',
    sprite('rockman', {frame: 0}),
    pos((TILE_WIDTH/2)+5, (TILE_HEIGHT*3)+20),
    origin('bot'),
    mega(),
    layer('game')
  ]);

  add([
    'mettaur',
    sprite('mettaur', {frame: 0}),
    origin('bot'),
    pos((TILE_WIDTH*6) -25, (TILE_HEIGHT*3) +20),
    layer('game')
  ]);

  onKeyPress('w' ,() => {
    if (player.canMove) {
      const { x, y } = player.coords;
      if (y > 0 && floor[y-1][x].traversable) {
      // if (player.pos.y-TILE_HEIGHT >= (TILE_HEIGHT*3)+5) {
        player.play('move');
        player.pos.y -= TILE_HEIGHT;
        breakCracked(player.coords);
        player.coords.y -= 1;
        player.canMove = false;
        setTimeout(() => {player.canMove = true}, player.moveLimit);
      }
    }
  });

  onKeyPress('a' ,() => {
    if (player.canMove) {  
      const { x, y } = player.coords;
      // if (player.pos.x-TILE_WIDTH > 0) {
      if (x > 0 && floor[y][x-1].traversable) {
        player.play('move');
        player.pos.x -= TILE_WIDTH;
        breakCracked(player.coords);
        player.coords.x -= 1;
        player.canMove = false;
        setTimeout(() => {player.canMove = true}, player.moveLimit);
      }
    }
  });

  onKeyPress('s' ,() => {
    if (player.canMove) {
      const { x, y } = player.coords;
      // if (player.pos.y+TILE_HEIGHT <= (TILE_HEIGHT*5)+5) {
      if (y < 2 && floor[y+1][x].traversable) {
        player.play('move');
        player.pos.y += TILE_HEIGHT;
        breakCracked(player.coords);
        player.coords.y += 1;
        player.canMove = false;
        setTimeout(() => {player.canMove = true}, player.moveLimit);
      }
    }
  });

  onKeyPress('d' ,() => {
    if (player.canMove) {
      const { x, y } = player.coords;
      // if (player.pos.x+TILE_WIDTH < width()) {
      if (x < 6 && floor[y][x+1].traversable) {
        player.play('move');
        player.pos.x += TILE_WIDTH;
        breakCracked(player.coords);
        player.coords.x += 1;
        player.canMove = false;
        setTimeout(() => {player.canMove = true}, player.moveLimit);
      }
    }
  });

  onKeyPress('space' ,() => {
    player.play('hurt');
  });

  onMousePress('right', () => {
    if (player.canShoot) {
      player.play('fire', {volume: 0.4});
      play('zap');
      player.canShoot = false
      setTimeout(() => {player.canShoot = true}, player.shootLimit)
    }
  });

  player.onUpdate(() => {
    // debug.log(player.curAnim())
    if(!player.curAnim()) {
      // player.stop();
      player.frame = 0;
    }
  });
  
});

go('game');
// player.play('fire');

function floorP(value = true) {
  return {
    id: 'floorP',
    traversable: value,
    isCracked: false,
    changeColor() {
      if (([0,8,16]).includes(this.frame)) {
        this.frame += 4;
      } else {
        this.frame -= 4;
      }
      this.traversable = !this.traversable;
    },
    crack() {
      this.frame += 1;
      this.isCracked = true;
    },
    break() {
      if (this.isCracked) {
        this.frame += 1;
      } else {
        this.frame += 2;
      }
      this.traversable = false;
      setTimeout(this.repair, 5000);
    },
    repair() {
      this.traversable = true;
      this.isCracked = false;
      this.frame = Math.floor(this.frame / 8) * 8;
    }
  }
}

function mega() {
  return {
    id: 'mega',
    coords: {
      x: 0,
      y: 0
    },
    canMove: true,
    moveLimit: 250,
    canShoot: true,
    shootLimit: 250,
  }
}
