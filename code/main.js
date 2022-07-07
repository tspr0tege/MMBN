import kaboom from "kaboom"

// initialize context
const TILE_HEIGHT = 24;
const TILE_WIDTH = 40

kaboom({
  width: TILE_WIDTH*6,
  height: TILE_HEIGHT*7,
  scale: 3,
  logMax: 1
})

loadRoot('sprites/')
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

const config = {
  width: TILE_WIDTH,
  height: TILE_HEIGHT,
  '=': () => [
    sprite('floor-panel', {frame: 0}),
    origin('left')
  ],
  '-': () => [
    sprite('floor-panel', {frame: 8}),
    origin('left')
  ],
  '_': () => [
    sprite('floor-panel', {frame: 16}),
    origin('left')
  ],
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

const floor = [[],[],[]];

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
  //   // if (isMouseReleased('right')) {
  //     tile.changeColor();
  //   // }
  // });
  
  const player = add([
    'player',
    sprite('rockman', {frame: 0}),
    pos((TILE_WIDTH/2)+5, (TILE_HEIGHT*3)+20),
    origin('bot'),
    mega(),
    layer('game')
  ]);

  onKeyPress('w' ,() => {
    const { x, y } = player.coords;
    if (y > 0 && floor[y-1][x].traversable) {
    // if (player.pos.y-TILE_HEIGHT >= (TILE_HEIGHT*3)+5) {
      player.play('move');
      player.pos.y -= TILE_HEIGHT;
      player.coords.y -= 1;
    }
  });

  onKeyPress('a' ,() => {
    const { x, y } = player.coords;
    // if (player.pos.x-TILE_WIDTH > 0) {
    if (x > 0 && floor[y][x-1].traversable) {
      player.play('move');
      player.pos.x -= TILE_WIDTH;
      player.coords.x -= 1;
    }
  });

  onKeyPress('s' ,() => {
    const { x, y } = player.coords;
    // if (player.pos.y+TILE_HEIGHT <= (TILE_HEIGHT*5)+5) {
    if (y < 2 && floor[y+1][x].traversable) {
      player.play('move');
      player.pos.y += TILE_HEIGHT;
      player.coords.y += 1;
    }
  });

  onKeyPress('d' ,() => {
    const { x, y } = player.coords;
    // if (player.pos.x+TILE_WIDTH < width()) {
    if (x < 6 && floor[y][x+1].traversable) {
      player.play('move');
      player.pos.x += TILE_WIDTH;
      player.coords.x += 1;
    }
  });

  onKeyPress('space' ,() => {
    player.play('hurt');
  });

  onMousePress('left', () => {
    player.play('fire');
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
    changeColor() {
      if (([0,8,16]).includes(this.frame)) {
        this.frame += 4;
      } else {
        this.frame -= 4;
      }
      this.traversable = !this.traversable;
    }
  }
}

function mega() {
  return {
    id: 'player',
    coords: {
      x: 0,
      y: 0
    },
  }
}