//class Scene1 extends Phaser.scene{
  // private keys: Phaser.Input.Keyboard.createCursorKeys;
//}
var config = {
    type: Phaser.WEBGL,
    parent: 'thegame',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    width: 1920,
    height: 1080,

};

var game = new Phaser.Game(config);
var waitForClick = false;
var origX = 0;
var origY = 0;
var dumbCount = 100;

var txt = null;

var state = 's';
/*
            s = sun
            r = rocket
            c = earth
*/
var nameDict = {'s': "Sun", 'r': "Rocket", 'z': "Mercury", 'x': "Venus", 'c': "Earth", 'v': "Mars", 'b': "Jupiter", 'n': "Saturn", 'm': "Uranus", 'k': "Neptune"}
// state to name

var massState = 1.989 * 10 ** 30;
//current mass of object

var massDict = {'s': 1.989 * 10 ** 30, 'r':10 ** 3, 'z': 3.29 * 10 ** 23, 'x': 4.87 * 10 ** 24, 'c': 5.972 * 10 ** 24, 'v': 6.39 * 10 ** 23, 'b': 1.898 * 10 ** 27, 'n': 5.683 * 10 ** 26, 'm': 8.681 * 10 ** 25, 'k': 1.024 * 10 ** 26}
// all masses are currently set to 0 Kg

var imageDict = {'s': "art/sun.png", 'r': "art/rocket.png", 'z': "art/mercury.png", 'x': "art/venus.png", 'c': "art/earth.png", 'v': "art/mars.png", 'b': "art/jupiter.png", 'n': "art/saturn.png", 'm': "art/uranus.png", 'k': "art/nepu"}

function preload() {
  this.load.image("Sun", "art/sun.png")
  this.load.image("Rocket", "art/rotrocket.png")
  this.load.image("Mercury", "art/mercury.png")
  this.load.image("Venus", "art/venus.png")
  this.load.image("Earth", "art/earth.png")
  this.load.image("Mars", "art/mars.png")
  this.load.image("Jupiter", "art/jupiter.png")
  this.load.image("Saturn", "art/saturn.png")
  this.load.image("Uranus", "art/uranus.png")
  this.load.image("Neptune", "art/neptune.png")
}

function create() {
  planets = this.add.group();
  txt = this.add.text(0, 0, "Currently selected: " + nameDict[state]);
  let txt2 = this.add.text(0, 20, "Click once to place a celestial body, click again to make it move")

  this.keys = this.input.keyboard.createCursorKeys();
}

// Note: "planet" refers to everything, including the sun and rocket

function update() {
  // Accepts input to place planet
  if (game.input.activePointer.isDown && !waitForClick && dumbCount > 10) {
    let x = game.input.mousePointer.x;
    let y = game.input.mousePointer.y;
    let planet = this.add.image(0, 0, nameDict[state]);
    planets.add(planet);
    planet.setScale(0.15);
    if (state === 'r') {
      planet.rocket = true
    } else {
      planet.rocket = false
    }
    // planet.fillStyle(0xFaa23, 1);
    // planet.fillCircle(0, 0, 10);
    planet.speed = new Phaser.Math.Vector2(0, 0);
    planet.mass = massState;
    planet.x = x;
    planet.y = y;
    origY = y;
    origX = x;
    waitForClick = true;
    dumbCount = 0;
  // Accepts input to move planet
  } else if (game.input.activePointer.isDown && waitForClick && dumbCount > 10) {
    let x = game.input.mousePointer.x;
    let y = game.input.mousePointer.y;
    let allPlanets = planets.getChildren();
    allPlanets[allPlanets.length - 1].speed.x = 10**12*(x - origX);
    allPlanets[allPlanets.length - 1].speed.y = 10**12*(y - origY);
    waitForClick = false;
    dumbCount = 0;
  }

  if (!waitForClick) {
    let allPlanets = planets.getChildren();
    var accXplanets = []
    var accYplanets = []
    for (let ind = 0; ind < allPlanets.length; ind += 1) {
      // Adjusts position based on current velocity
      x = allPlanets[ind].x;
      y = allPlanets[ind].y;
      accX = 0;
      accY = 0;
      // Calculates acceleration due to gravity
      for (let ind2 = 0; ind2 < allPlanets.length; ind2 += 1) {
        mass = allPlanets[ind2].mass;
        x2 = allPlanets[ind2].x;
        y2 = allPlanets[ind2].y;
        if (!(x == x2 && y == y2)) {
          accTot = (6.67*10**-11*mass)/Math.sqrt(((x-x2))**2 + ((y-y2))**2);
          angle = Math.atan(Math.abs(x-x2)/Math.abs(y-y2));
          if (x2 < x) {
            accX -= Math.cos(angle)*accTot;
          } else if (x2 > x) {
            accX += Math.cos(angle)*accTot;
          }

          if (y2 < y) {
            accY -= Math.sin(angle)*accTot;
          } else if (y2 > y) {
            accY += Math.sin(angle)*accTot;
          }
        }
      }
      accXplanets.push(accX*10**(-5.7))
      accYplanets.push(accY*10**(-5.7))

    }

    if (accXplanets.length != 0) {
    console.log("--")
    console.log(accXplanets)
    console.log(accYplanets)}

    // Adjusts Velocity
    for (let ind = 0; ind < accXplanets.length; ind += 1) {
      allPlanets[ind].speed.x += accXplanets[ind]
      allPlanets[ind].speed.y += accYplanets[ind]
    }

    // Adjusts Position
    for (let ind = 0; ind < accXplanets.length; ind += 1) {
      allPlanets[ind].x += allPlanets[ind].speed.x/10**13
      allPlanets[ind].y += allPlanets[ind].speed.y/10**13
    }
    
    // Adjust Rocket Rotation
    for (let ind = 0; ind < allPlanets.length; ind += 1) {
      if (allPlanets[ind].rocket) {
        x = allPlanets[ind].speed.x; y = allPlanets[ind].speed.y;
        allPlanets[ind].angle = Math.atan2(allPlanets[ind].speed.y,allPlanets[ind].speed.x)*180/Math.PI
        if (allPlanets[ind].angle < 0) {
          allPlanets[ind].angle += 360
        }
        allPlanets[ind].angle += 45
      }
    }
  }

  dumbCount += 1;


  // change keyboard state (aka the object/planet)
  for (var key in massDict){
    var currKeyPressed = this.input.keyboard.addKey(key);
    if (currKeyPressed.isDown){
      console.log(key);
      massState = massDict[key];
      if (txt != null) {
        txt.destroy();
      }
      state = key
      console.log("State: " + state)
      txt = this.add.text(0, 0, "Currently selected: " + nameDict[key]);
    }
  }
}
