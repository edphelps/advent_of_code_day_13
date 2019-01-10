
/*
   This code solves day 13 of 2018 Advent of Code:

   --- Day 13: Mine Cart Madness ---
   A crop of this size requires significant logistics to transport produce,
   soil, fertilizer, and so on. The Elves are very busy pushing things around
   in carts on some kind of rudimentary system of tracks they've come up with.

   Seeing as how cart-and-track systems don't appear in recorded history for
   another 1000 years, the Elves seem to be making this up as they go along.
   They haven't even figured out how to avoid collisions yet.

   You map out the tracks (your puzzle input) and see where you can help.

   Tracks consist of straight paths (| and -), curves (/ and \), and
   intersections (+). Curves connect exactly two perpendicular pieces of
   track; for example, this is a closed loop:

   /----\
   |    |
   |    |
   \----/
   Intersections occur when two perpendicular paths cross. At an intersection,
   a cart is capable of turning left, turning right, or continuing straight.
   Here are two loops connected by two intersections:

   /-----\
   |     |
   |  /--+--\
   |  |  |  |
   \--+--/  |
      |     |
      \-----/
   Several carts are also on the tracks. Carts always face either up (^),
   down (v), left (<), or right (>). (On your initial map, the track under
   each cart is a straight path matching the direction the cart is facing.)

   Each time a cart has the option to turn (by arriving at any intersection),
   it turns left the first time, goes straight the second time, turns right the
   third time, and then repeats those directions starting again with left the
   fourth time, straight the fifth time, and so on. This process is independent
   of the particular intersection at which the cart has arrived - that is, the
   cart has no per-intersection memory.

   Carts all move at the same speed; they take turns moving a single step at
   a time. They do this based on their current location: carts on the top row
   move first (acting from left to right), then carts on the second row move
   (again from left to right), then carts on the third row, and so on. Once
   each cart has moved one step, the process repeats; each of these loops is
   called a tick.

   For example, suppose there are two carts on a straight track:

   |  |  |  |  |
   v  |  |  |  |
   |  v  v  |  |
   |  |  |  v  X
   |  |  ^  ^  |
   ^  ^  |  |  |
   |  |  |  |  |
   First, the top cart moves. It is facing down (v), so it moves down one
   square. Second, the bottom cart moves. It is facing up (^), so it moves
   up one square. Because all carts have moved, the first tick ends. Then,
   the process repeats, starting with the first cart. The first cart moves down,
   then the second cart moves up - right into the first cart, colliding with it!
   (The location of the crash is marked with an X.) This ends the second and
   last tick.

   Here is a longer example:

   /->-\
   |   |  /----\
   | /-+--+-\  |
   | | |  | v  |
   \-+-/  \-+--/
     \------/

   /-->\
   |   |  /----\
   | /-+--+-\  |
   | | |  | |  |
   \-+-/  \->--/
     \------/

   /---v
   |   |  /----\
   | /-+--+-\  |
   | | |  | |  |
   \-+-/  \-+>-/
     \------/

   /---\
   |   v  /----\
   | /-+--+-\  |
   | | |  | |  |
   \-+-/  \-+->/
     \------/

   /---\
   |   |  /----\
   | /->--+-\  |
   | | |  | |  |
   \-+-/  \-+--^
     \------/

   /---\
   |   |  /----\
   | /-+>-+-\  |
   | | |  | |  ^
   \-+-/  \-+--/
     \------/

   /---\
   |   |  /----\
   | /-+->+-\  ^
   | | |  | |  |
   \-+-/  \-+--/
     \------/

   /---\
   |   |  /----<
   | /-+-->-\  |
   | | |  | |  |
   \-+-/  \-+--/
     \------/

   /---\
   |   |  /---<\
   | /-+--+>\  |
   | | |  | |  |
   \-+-/  \-+--/
     \------/

   /---\
   |   |  /--<-\
   | /-+--+-v  |
   | | |  | |  |
   \-+-/  \-+--/
     \------/

   /---\
   |   |  /-<--\
   | /-+--+-\  |
   | | |  | v  |
   \-+-/  \-+--/
     \------/

   /---\
   |   |  /<---\
   | /-+--+-\  |
   | | |  | |  |
   \-+-/  \-<--/
     \------/

   /---\
   |   |  v----\
   | /-+--+-\  |
   | | |  | |  |
   \-+-/  \<+--/
     \------/

   /---\
   |   |  /----\
   | /-+--v-\  |
   | | |  | |  |
   \-+-/  ^-+--/
     \------/

   /---\
   |   |  /----\
   | /-+--+-\  |
   | | |  X |  |
   \-+-/  \-+--/
     \------/
   After following their respective paths for a while, the carts eventually
   crash. To help prevent crashes, you'd like to know the location of the
   first crash. Locations are given in X,Y coordinates, where the furthest
   left column is X=0 and the furthest top row is Y=0:

              111
    0123456789012
   0/---\
   1|   |  /----\
   2| /-+--+-\  |
   3| | |  X |  |
   4\-+-/  \-+--/
   5  \------/
   In this example, the location of the first crash is 7,3.

*/

const fs = require('fs');

// enumerations
// Must be 0 based b/c turns are handled by incrementing/decrimenting direction
const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

const LEFT = 4;
const STRAIGHT = 5;
const RIGHT = 6;

// globals
let gCrash = false; // was there a crash
let gCrashRowCol = { row: -1, col: -1 }; // location of crash
let gError = false; // was there an error

// const FILENAME = 'dataTest.txt'
const FILENAME = 'data.txt'

/* ********************************* */
// Model a Cart
// Cart knows where it is, its orientation, and
// keeps track of the rules for how it's suppossed to behave
// at intersections of when encountering turns (represented as
// '/' or '\' in the track data).
class Cart {
  constructor(rowCol, initDir) {
    this.rowCol = rowCol; // current location
    this.dir = initDir; // current direction, see enumerated cardinal directions
    this.nextTurn = LEFT;
  }

  /* ********************************* */
  turnLeft() {
    this.dir = (--this.dir < NORTH) ? WEST : this.dir;
  }

  /* ********************************* */
  turnRight() {
    this.dir = (WEST < ++this.dir) ? NORTH : this.dir;
  }

  /* ********************************* */
  intersection() {
    switch (this.nextTurn) {
      case LEFT: this.turnLeft(); break;
      case RIGHT: this.turnRight(); break;
      case STRAIGHT: break;
      default:
    }
    this.nextTurn = (RIGHT < ++this.nextTurn) ? LEFT : this.nextTurn;
  }

  /* ********************************* */
  // Encountered a turn represented as '/' in track data
  forwardSlash() {
    switch (this.dir) {
      case NORTH:
      case SOUTH: this.turnRight(); break;
      case EAST:
      case WEST: this.turnLeft(); break;
      default:
    }
  }

  /* ********************************* */
  // Encountered a turn represented as '\' in track data
  backSlash() {
    switch (this.dir) {
      case NORTH:
      case SOUTH: this.turnLeft(); break;
      case EAST:
      case WEST: this.turnRight(); break;
      default:
    }
  }

  /* ********************************* */
  // Move forward based on orientation
  move() {
    switch (this.dir) {
      case NORTH: this.rowCol.row--; break;
      case SOUTH: this.rowCol.row++; break;
      case EAST: this.rowCol.col++; break;
      case WEST: this.rowCol.col--; break;
      default:
    }
    if (this.rowCol.row < 0 || this.rowCol.col < 0) {
      console.log('ERROR, move less than zero for cart', this);
      gError = true; // something went wrong
    }
  }
}
Cart.prototype.toString = function mytostring() {
  return `${this.rowCol.row}, ${this.rowCol.col}`
}

/* ********************************* */
/* ********************************* */
// Load the playing board (the track layout and current cart locations)
function loadBoard() {
  const buffer = fs.readFileSync(FILENAME, "utf8");
  const data = buffer.split('\n');
  const board = [];
  for (const line of data) {
    if (!line) break; // skip, last line is blank
    board.push(line);
  }
  return board;
}

/* ********************************* */
// The board contains the track layout and cart locations.
// Seperate these two into 'tracks' and 'carts' 2D arrays.
function getInitialState(origBoardStrings) {
  const tracks = [];
  const carts = [];
  for (let row = 0; row < origBoardStrings.length; row++) {
    tracks[row] = [];

    const rowWithCarts = origBoardStrings[row].split('');
    for (let col = 0; col < rowWithCarts.length; col++) {

      // is this a cart?
      const c = rowWithCarts[col];
      if ('^>v<'.includes(c)) {
        carts.push(new Cart({row, col}, '^>v<'.indexOf(c)));
        tracks[row][col] = (c === '^' || c === 'v') ? '|' : '-';

      // not a cart, part of the track layout
      } else {
        tracks[row][col] = c;
      }
    }
  }
  return { tracks, carts };
}

/* ********************************* */
// Sort the array of carts.
// Detect a crash if two carts are in the same location.
function compareCarts(cart1, cart2) {
  if (cart1.rowCol.row < cart2.rowCol.row)
    return -1;
  if (cart2.rowCol.row < cart1.rowCol.row)
    return 1;

  if (cart1.rowCol.col < cart2.rowCol.col)
    return -1;
  if (cart2.rowCol.col < cart1.rowCol.col)
    return 1;

  // CRASH!! carts occupy same location
  gCrash = true;
  gCrashRowCol = cart1.rowCol;
  console.log("CRASH");
  console.log('cart1: ', cart1);
  console.log('cart2: ', cart2);
  return 0;
}
/* ********************************* */
// Move all carts on the board one space, check if there was a crash
function tick(state) {
  // carts must be moved starting with cart in upper left first.
  // sort carts by their location (and detect crash if two carts
  // occupy same location)
  state.carts.sort(compareCarts);

  // crash occured on last tick and was detected when sorting them by location
  if (gCrash) {
    console.log("CRASH at: ", gCrashRowCol);
    return state;
  }

  // move the carts
  for (let cart of state.carts) {
    cart.move();
    const c = state.tracks[cart.rowCol.row][cart.rowCol.col];
    switch (c) {
      case '-': break;
      case '|': break;
      case '+': cart.intersection(); break;
      case '/': cart.forwardSlash(); break;
      case '`': cart.backSlash(); break;
      default:
        console.log("ERROR2: unk track char for cart", cart);
        gError = true;
    }
  }
  return state;
}
/* ********************************* */
// Console log the state so we can see what's happening
function logState(state) {
  console.log(' ');
  console.log('-------------------------------');

  const board = [];
  for (let row = 0; row < state.tracks.length; row++)
    board[row] = [...state.tracks[row]];

  for (cart of state.carts) {
    board[cart.rowCol.row][cart.rowCol.col] = '^>v<'.charAt(cart.dir);
  }

  let sHeader = '';
  for (let i = 0; i < board[0].length; i++)
    sHeader += i % 10;
  console.log(sHeader);
  for (let i = 0; i < board.length; i++) {
    let num = '' + i;
    num = (i < 10) ? (' ' + num) : num;
    num = (i < 100) ? (' ' + num) : num;
    console.log(num, ': ', board[i].join(''));
  }
  for (let cart of state.carts) {
    console.log(cart);
  }
}
/* ********************************* */
/* ********************************* */
/* Run the carts on the tracks until there is a crash
   and report the time and location of the crash.
*/
const origBoardStrings = loadBoard();

let state = getInitialState(origBoardStrings);
logState(state);

let done = false;
let cnt = 1000; // make sure we don't head into infinite loop
while (cnt-- && !gCrash && !gError) {
  state = tick(state);
  logState(state);
}
