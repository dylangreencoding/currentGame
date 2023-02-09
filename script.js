`use strict`;

class Point {
  constructor ( x, y ) {
    this.x = x;
    this.y = y;
  }
}

// Given three collinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
function onSegment ( p, q, r ) {
  if ( q.x <= Math.max ( p.x, r.x ) && q.x >= Math.min ( p.x, r.x ) && q.y <= Math.max ( p.y, r.y ) && q.y >= Math.min ( p.y, r.y ) ) {
    return true;
  } else {
    return false;
  }   
}
  
// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation_ ( p, q, r ) {
  const val = ( q.y - p.y ) * ( r.x - q.x ) - ( q.x - p.x ) * ( r.y - q.y );
    
  if ( val === 0 ) {
    return 0; // collinear
  } else { 
    return ( val > 0 )? 1: 2; // clock or counterclock wise
  }
}
  
// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect ( p1, q1, p2, q2 ) {

  // Find the four orientations needed for general and
  // special cases
  const o1 = orientation_ ( p1, q1, p2 );
  const o2 = orientation_ ( p1, q1, q2 );
  const o3 = orientation_ ( p2, q2, p1 );
  const o4 = orientation_ ( p2, q2, q1 );
    
  // General case
  if ( o1 != o2 && o3 != o4 ) {
    return true;
  }
    
  // Special Cases
  // p1, q1 and p2 are collinear and p2 lies on segment p1q1
  if (  o1 === 0 && onSegment ( p1, p2, q1 ) ) {
    return true;
  }
  
  // p1, q1 and q2 are collinear and q2 lies on segment p1q1
  if ( o2 === 0 && onSegment ( p1, q2, q1 ) ) {
    return true;
  }

  // p2, q2 and p1 are collinear and p1 lies on segment p2q2
  if ( o3 === 0 && onSegment ( p2, p1, q2 ) ) {
    return true;
  }

  // p2, q2 and q1 are collinear and q1 lies on segment p2q2
  if ( o4 === 0 && onSegment ( p2, q1, q2 ) ) {
    return true;
  }

  return false; // Doesn't fall in any of the above cases
}



// ***CLASS ZOMBIE*** \\
class Zombie {
  constructor ( id, x, y, speed ) {
    this.id = id;
    this.color = 'green';
    this.x = x;
    this.y = y;
    this.speed = speed;

    this.type = 'zombie';
    this.selected = false; 
    this.hovered = false; 
    this.actions = [ 'none', 'move' ] ; 
    this.currentAction = 'none'; 
  }

  // wander () {
  //   let turn = false;
  //   let counter = 0;
  //   if ( turn === false ) {

    // }
}

class Player {
  constructor ( id, x, y, speed, color ) {
    this.id = id;
    this.color = color;
    this.x = x;
    this.y = y;
    this.speed = speed;

    this.type = 'player';
    this.selected = false; 
    this.hovered = false; 
    this.actions = [ 'none', 'move', 'shoot' ]; 
    this.currentAction = 'none'; 
  }
}

class Wall {
  constructor ( startX, startY, endX, endY ) {
    this.start = { x: startX, y: startY };
    this.end = { x: endX, y: endY };
    
    this.id = 'wall 1';
    this.type = 'wall';
  }
}





// ***VARIABLES FOR ACCESSING HTML*** \\
// for canvas
const canvas = document.getElementById ( 'canvas' );
const ctx = canvas.getContext ( '2d' );
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// for tools window, shows possible actions when an object is selected
const tools = document.getElementById ( 'tools' );
function mapTools ( mapScale ) {
  let html = `<p>Map Tools</p>
  <div>
  <button id="btn-zoom-out"> - </button>
  <span>${mapScale}</span>
  <button id="btn-zoom-in"> + </button>
  </div>
  <div>
  <input type="radio" name="tool" value="resize" id="resize">
  <label for="resize">resize</label>
  </div>`;
  return html;
}
// renders html to go in tools window
function getTools ( featureID, featureActions ) {
  let html = `<p>${featureID}</p>`;
  for ( let action = 0; action < featureActions.length; action++ ) {
    html += `<div>
    <input type="radio" name="tool" value="${featureActions[action]}" id="${featureActions[action]}">
    <label for="${featureActions[action]}">${featureActions[action]}</label>
    </div>`;
  }
  return html;
}


// arena template to be passed to arena class
class ArenaTemplate {
  constructor () {
    this.width = 60;
    this.height = 30;
    this.scale = 50;

    // iterate through to draw features
    // TODO:
    // need two actions lists
    // hostActions
    // guestActions
    // which list you see in the tools window depends on if the piece is yours or not
    this.walls = [
      new Wall (500, 100, 500, 450 )
    ]
    this.features = [ 
      new Zombie ( 'no legs', 0, 0, 100 ),
      new Zombie( 'no face', 350, 300, 300 ),
      new Player( 'Lucy', 700, 150, 500, 'red' )
    ]
    // easier to iterate through one list than have a separate list for players
    // player.type should take care of selection issues
    // this.players = [
    // ]
  }
}

class Arena {
  constructor (ArenaTemplate) {
    this.scale = ArenaTemplate.scale;

    this.width = ArenaTemplate.width * this.scale < window.innerWidth ? Math.floor(window.innerWidth/this.scale) * this.scale : ArenaTemplate.width * this.scale;

    this.height = ArenaTemplate.height * this.scale < window.innerHeight ? Math.floor(window.innerHeight/this.scale) * this.scale : ArenaTemplate.height * this.scale;
    
    // for moving map
    this.origin = { x: 0, y: 0 };
    this.apogee = { x: this.width, y: this.height };

    // for movement and shooting selectors
    this.goHere = { x: 0, y: 0 };
    this.canGoHere = true;
    
    // iterate through to draw features
    this.features = ArenaTemplate.features; 
    this.walls = ArenaTemplate.walls;

    // selector coordinates
    this.selector = {}

    // for interpreting mouse events
    this.locations = { x: [], y: [] };
    this.hashX = {};
    this.hashY = {};

    // this.turn = 0;******************
    // this.order = 0;******************
    // this will require waiting.. async?
    // there has to be a counter, the ORDER in which features take TURNS based on counter/# of features
    // each turn zombie 'wanders' its speed
    // zombie sprint is what kills when it moves into your square (per k)

  }

  // draws map and resets hashes
  // TODO: only reset hashes if map was moved
  draw () {
    ctx.save();
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = "#bbb";
    this.locations = { x: [], y: [] };
    this.hashX = {};
    this.hashY = {};
    
    // draws vertical lines
    let hashCounter = 0;
    let currentSquare = 0;
    for (let x = this.origin.x; x <= this.origin.x + this.width; x++ ) {
      if (x === this.origin.x) {
        this.locations.x.push(x);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.apogee.y);
        ctx.moveTo(x, 0);
        ctx.closePath();
        ctx.stroke();
      }

      if (hashCounter === this.scale) {
        this.locations.x.push(x);
        hashCounter = 0;
        currentSquare += 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.apogee.y);
        ctx.moveTo(x, 0);
        ctx.closePath();
        ctx.stroke();
      }

      hashCounter += 1;
      this.hashX[x] = this.locations.x[currentSquare]

    }

    // draws horizontal lines
    hashCounter = 0;
    currentSquare = 0;

    for (let y = this.origin.y; y <= this.origin.y + this.height; y++) {
      if (y === this.origin.y) {
        this.locations.y.push(y);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.apogee.x, y);
        ctx.moveTo(0, y);
        ctx.closePath();
        ctx.stroke();
      }

      if (hashCounter === this.scale) {
        this.locations.y.push(y);
        hashCounter = 0;
        currentSquare += 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.apogee.x, y);
        ctx.moveTo(0, y);
        ctx.closePath();
        ctx.stroke();
      }

      hashCounter += 1;
      this.hashY[y] = this.locations.y [currentSquare]
    }

    ctx.restore();

    // draws walls
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;

    for (const wall of this.walls) {

      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
      ctx.closePath();

    }

    ctx.lineWidth = 1;

    // draws features
    for (const feature of this.features) {

      ctx.beginPath();
      // if (feature.hovered === true) {
      //   ctx.fillStyle = 'lightgreen';
      // } else {
      //   ctx.fillStyle = 'green';        
      // }
      ctx.fillStyle = feature.color;
      // ctx.fillRect(this.features[f].x + 4, this.features[f].y + 4, this.scale - 8, this.scale - 8);
      ctx.arc(feature.x + (this.scale/2), feature.y + (this.scale/2), (this.scale/2)/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      // draws movement selector
      if (feature.currentAction === 'move') {

        // let distance = Math.sqrt((feature.x - this.goHere.x)*(feature.x - this.goHere.x) + (feature.y - this.goHere.y)*(feature.y - this.goHere.y));

        // if (distance <= feature.speed) {
        if (this.canGoHere === true) {
          ctx.strokeStyle = 'gold';
          // if mouse selection is undefined (off map) then this will not work
          ctx.beginPath();
          ctx.moveTo(feature.x + (this.scale/2), feature.y + (this.scale/2));
          ctx.lineTo(this.goHere.x + (this.scale/2), this.goHere.y + (this.scale/2));
          ctx.stroke();
          ctx.closePath();

          ctx.beginPath();
          ctx.arc(this.goHere.x + (this.scale/2), this.goHere.y + (this.scale/2), this.scale/4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.closePath();

        // } else if (distance > feature.speed) {
        } else if (this.canGoHere === false) {
          ctx.strokeStyle = '#bbb';
          ctx.lineWidth = 0.3;
          ctx.beginPath();
          ctx.moveTo(feature.x + (this.scale/2), feature.y + (this.scale/2));
          ctx.lineTo(this.goHere.x + (this.scale/2), this.goHere.y + (this.scale/2));
          ctx.stroke();
          ctx.closePath();
          
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.arc(this.goHere.x + (this.scale/2), this.goHere.y + (this.scale/2), this.scale/4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.closePath();

          ctx.beginPath();
          ctx.moveTo(this.goHere.x + (this.scale * 0.25), this.goHere.y + (this.scale * 0.5));
          ctx.lineTo(this.goHere.x + (this.scale * 0.75), this.goHere.y + (this.scale * 0.5));
          ctx.stroke();
          ctx.closePath();
        }
      }

      if (feature.currentAction === 'shoot') {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(feature.x + (this.scale/2), feature.y + (this.scale/2));
        ctx.lineTo(this.goHere.x + (this.scale/2), this.goHere.y + (this.scale/2));
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(this.goHere.x + (this.scale/2), this.goHere.y + (this.scale/2), this.scale/6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(this.goHere.x + (this.scale/2), this.goHere.y + (this.scale/2), this.scale/4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      }

    }

    // draws selector
    ctx.strokeStyle = 'gold';
    ctx.strokeRect(this.selector.x + 2, this.selector.y + 2, this.scale - 4, this.scale - 4);
  }
}

// ***INITIALIZE GAME*** \\

const myArena = new ArenaTemplate();

const runGame = new Arena(myArena);

runGame.draw();

// ***GET MOUSE POSITION*** \\

function mouseHashXY(e) {

  let hashX = runGame.hashX[e.clientX];
  let hashY = runGame.hashY[e.clientY];

  return {
    x: hashX,
    y: hashY
  }

}

function mouseMovementXY(e) {

  return {
    x: e.movementX,
    y: e.movementY
  }

}

// ***EVENT HANDLER VARIABLES*** \\

let mouse = { pressed: false, movedMap: false, movementXY: {x: 0, y: 0}, hover: {}, selection: {} };

// used to move selected item to back of array for easy access

let selected = { featureIndex: 0, feature: {} };

let currentFeature = runGame.features[runGame.features.length - 1];

// initialize canMoveHere
// prevents features from moving into the same square
// or moving further than their speed
let canMoveHere = true;

let canShootHere = true;

// initialize anySelected, to be a list of booleans
// if all are false, no feature is selected
let anySelected = [];

// initialize tools window html
let html = mapTools();
tools.innerHTML = mapTools();

// initializes radioButtons variable, === empty nodelist
let radioButtons = document.querySelectorAll('input[name="tool"]');

// initialize action variable
// currently selected radio button of the currently selected feature
// defaults to 'none'
let action = 'none';

// for moving
let speed = 0;
let distance = 0;

// ***RESIZE*** \\
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  runGame.draw();
})

// ***MOUSEDOWN*** \\
canvas.addEventListener('mousedown', (e) => {
  mouse.pressed = true;
})

// ***MOUSEUP*** \\
canvas.addEventListener('mouseup', (e) => {
  mouse.pressed = false;
  mouse.selection = mouseHashXY(e);

  // reset anySelected and tools window html
  anySelected = [];
  html = mapTools();

  console.log(runGame.selector.x);
  console.log(runGame.selector.y);

  // the selector disappears if you select already selected square or move the map 
  // action cannot equal 'move' or disappearing the selector also disappears the feature
  if (action === 'none' && mouse.selection.x === runGame.selector.x && mouse.selection.y === runGame.selector.y || mouse.movedMap === true) {
    runGame.selector = {};
  } else {
    runGame.selector = mouse.selection;
  }

  // moves features if action === 'move'
  // mouse.movedMap cannot equal true because the selector will disappear making the feature disappear
  // TODO: prevent pieces from moving through walls
  if (action === 'move' && mouse.movedMap === false) {

    // iterates over features except last feature
    for (let i = 0; i < runGame.features.length - 1; i++) {
      // prevents pieces from moving into the same square
      if (mouse.selection.x === runGame.features[i].x && mouse.selection.y === runGame.features[i].y) {
        canMoveHere = false;
      }
    }

    if (canMoveHere === true) {
      // moves feature
      runGame.features[runGame.features.length - 1].x = runGame.selector.x;
      runGame.features[runGame.features.length - 1].y = runGame.selector.y;

      // resets action, selector, and tools
      action = 'none';
      runGame.features[runGame.features.length - 1].currentAction = 'none';
      // runGame.selector = mouse.selection;
      tools.innerHTML = mapTools(runGame.scale);
    } else {
      action = 'none';
      runGame.features[runGame.features.length - 1].currentAction = 'none';
      // runGame.selector = mouse.selection;
      tools.innerHTML = mapTools(runGame.scale);
    }
  }

  console.log(runGame.selector.x);
  console.log(runGame.selector.y);

  // shoots
  if (action === 'shoot' && mouse.movedMap === false) {
    if (mouse.selection.x != undefined && mouse.selection.y != undefined && canShootHere === true) {
      // moves feature - put rules for shooting here
      // probably have to select the feature getting shot at and then perform a function on it (i.e. HP reduced)
      // runGame.features[runGame.features.length - 1].x = runGame.selector.x;
      // runGame.features[runGame.features.length - 1].y = runGame.selector.y;

      // resets action, selector, and tools
      action = 'none';
      runGame.features[runGame.features.length - 1].currentAction = 'none';
      runGame.selector = mouse.selection;
      tools.innerHTML = mapTools(runGame.scale);
    } else {
      action = 'none';
      runGame.features[runGame.features.length - 1].currentAction = 'none';
      runGame.selector = mouse.selection;
      tools.innerHTML = mapTools(runGame.scale);
    }
  }

  // selects features
  if (action = 'none') {

    for (const feature of runGame.features) {

      // if selector is on a feature
      if (feature.currentAction === 'none' && runGame.selector.x === feature.x && runGame.selector.y === feature.y) {
        // select feature 
        feature.selected = true;
        // update anySelected
        anySelected.push(feature.selected)

        // get index of selected feature
        selected.featureIndex = runGame.features.findIndex((e) => e === feature);

        // set tools window html for selected feature
        html = getTools(feature.id, feature.actions);
        tools.innerHTML = html;

      } else {
        // deselect feature
        feature.selected = false;
        // update anySelected
        anySelected.push(feature.selected)
      }
    }
  }

  // if no features are selected
  // reset tools window html
  if (anySelected.every(e => e === false)) {
    tools.innerHTML = mapTools(runGame.scale);
  }
  // resets radio buttons variable according to current tools window 
  radioButtons = document.querySelectorAll('input[name="tool"]');
    
  // moves currently selected item to back of array
  // prevents weird glitches during iteration
  // makes the selected item easily accessible
  selected.feature = runGame.features[selected.featureIndex];
  runGame.features.splice(selected.featureIndex, 1);
  runGame.features.push(selected.feature);

  // only for viewing info, not setting info
  // to set info use runGame.features[runGame.features.length - 1]
  currentFeature = runGame.features[runGame.features.length - 1];

  // if ( mouse.selection.x != undefined && mouse.selection.y != undefined ) {
  //   runGame.canGoHere = false;
  // }

  mouse.movedMap = false;
})

// ***MOUSEMOVE*** \\
canvas.addEventListener('mousemove', (e) => {
  mouse.movementXY = mouseMovementXY (e) ;
  mouse.hover = mouseHashXY (e) ;

  if ( action === 'move' ) {
    runGame.goHere = mouseHashXY (e) ;
    speed = currentFeature.speed;
    distance = Math.sqrt ( ( currentFeature.x - runGame.goHere.x ) * ( currentFeature.x - runGame.goHere.x ) + ( currentFeature.y - runGame.goHere.y ) * ( currentFeature.y - runGame.goHere.y ) );

    if ( distance <= speed ) {
      canMoveHere = true;
      runGame.canGoHere = true;
    } else {
      canMoveHere = false;
      runGame.canGoHere = false;
    }

    for ( const wall of runGame.walls ) {
      if ( doIntersect ( { x: currentFeature.x + ( runGame.scale / 2 ), y: currentFeature.y + ( runGame.scale / 2 ) }, { x: runGame.goHere.x + ( runGame.scale / 2 ), y: runGame.goHere.y + ( runGame.scale / 2 ) }, wall.start, wall.end ) === true ) {
        canMoveHere = false;
        runGame.canGoHere = false;
      }
    }

    // if (mouse.hover.x === undefined || mouse.hover.y === undefined) {
    //   canMoveHere = false;
    //   runGame.canGoHere = false;
    //   console.log('hello');
    // }

  }

  if (action === 'shoot') {
    runGame.goHere = mouseHashXY(e);
  }

  // moves map
  if (mouse.pressed === true) {
    mouse.movedMap = true;
    runGame.selector = {};
    runGame.origin.x += mouse.movementXY.x;
    runGame.origin.y += mouse.movementXY.y;
    runGame.apogee.x += mouse.movementXY.x;
    runGame.apogee.y += mouse.movementXY.y;

    // gets rid of movement selector if map is moved
    action = 'none';
    runGame.features[runGame.features.length - 1].currentAction = 'none';
  }

  // if mouse pressed, moves features with map
  // else hovers on features
  for (feature of runGame.features) {
    if (mouse.pressed === true) {
      feature.x += mouse.movementXY.x;
      feature.y += mouse.movementXY.y;
    } else {
      if (mouse.hover.x === feature.x && mouse.hover.y === feature.y) {
        feature.hovered = true;
      } else {
        feature.hovered = false;
      }
    }
  }

  // moves walls with map
  for (let wall of runGame.walls) {
    if (mouse.pressed === true) {
      wall.start.x += mouse.movementXY.x;
      wall.start.y += mouse.movementXY.y;
      wall.end.x += mouse.movementXY.x;
      wall.end.y += mouse.movementXY.y;
    }
  }
  
})

// sets action when radio button is clicked
tools.addEventListener('click', (e) => {
  for (const radioButton of radioButtons) {
    if (radioButton.checked) {
      action = radioButton.value;
      runGame.features[runGame.features.length - 1].currentAction = radioButton.value;
      break;
    }   
  }
})


// document.getElementById('btn-zoom-out').addEventListener('click', (e) => {
//   runGame.scale -= 10;
//   console.log ( 'minus' );
// })

// document.getElementById('btn-zoom-in').addEventListener('click', (e) => {
//   runGame.scale += 10;
//   console.log ( 'minus' );
// })

// ***MAIN LOOP*** \\
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  runGame.draw();
  requestAnimationFrame(draw);
}
draw();

