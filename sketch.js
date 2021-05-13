/***********************************************************************************
  MoodyMaze
  by Scott Kildall

  Uses the p5.2DAdventure.js class 
  
------------------------------------------------------------------------------------
	To use:
	Add this line to the index.html

  <script src="p5.2DAdventure.js"></script>
***********************************************************************************/

// adventure manager global  
var adventureManager;

// p5.play
var playerSprite;
var playerAnimation;

// Clickables: the manager class
var clickablesManager;    // the manager class
var clickables;           // an array of clickable objects


// indexes into the clickable array (constants) 
const cl_startScenario = 0;
const cl_Start_GoomazonPays = 1;
const cl_Start_CityPays = 2;
const cl_Start_RaiseTaxes = 3;
const cl_GoomazonMoves_CityPays = 4;
const cl_GoomazonMoves_RaiseTaxes = 5;
const cl_GoomazonMoves_BuildRival = 6;
const cl_GoomazonMoves_IgnoreThem = 7;
const cl_CityPays_CutTheArts = 8;
const cl_CityPays_CutTransportation = 9;
const cl_CityPays_CutCityWages = 10;
const cl_CityPays_CutParks = 11;


// anger emojis
var angerImage;   // anger emoji
var maxAnger = 5;
var allEndings = [];

// character arrays
var characterImages = [];   // array of character images, keep global for future expansion
var characters = [];        // array of charactes

// characters
const shareHold = 0;
const govern = 1;
const developers = 2;
const upperStudents = 3;
const lowerStudents = 4;
const moms = 5;

// my variables
let budget = 50000;
let helpedEdu = 0;


// room indices - look at adventureManager
const startScreen = 3;
const governScreen = 4;
const secureScreen = 5;
const endOneScreen = 6;
const endTwoScreen = 7;
const eduScreen = 8;
const eduUpperScreen = 9;
const eduLowerScreen = 10;
const eduLowerAddScreen = 11;
const budgetScreen = 12;
const sellScreen = 13;
const adScreen = 14;
const keepScreen = 15;
const salaryScreen = 16;
const productScreen = 17;
const rumorScreen = 18;
const ignoreScreen = 19;
const sellAltScreen = 20;

let headlineFont;
let bodyFont;
let endFont;


// Allocate Adventure Manager with states table and interaction tables
function preload() {

  // headlineFont = loadFont('fonts/AstroSpace-0Wl3o.otf');
  headlineFont = loadFont('fonts/continuum/contm.ttf');
  bodyFont = loadFont('fonts/Ubuntu-Regular.ttf');
  endFont = loadFont('fonts/continuum/contb.ttf');

  // load all images
  angerImage = loadImage("assets/anger_emoji.png");
  
  //allocateCharacters();

  clickablesManager = new ClickableManager('data/clickableLayout.csv');
  adventureManager = new AdventureManager('data/adventureStates.csv', 'data/interactionTable.csv', 'data/clickableLayout.csv');
}

// Setup the adventure manager
function setup() {
  createCanvas(1280, 720);

  // setup the clickables = this will allocate the array
  clickables = clickablesManager.setup();

  // this is optional but will manage turning visibility of buttons on/off
  // based on the state name in the clickableLayout
  adventureManager.setClickableManager(clickablesManager);

  // This will load the images, go through state and interation tables, etc
  adventureManager.setup();

  // load all text screens
  loadAllText();

  // call OUR function to setup additional information about the p5.clickables
  // that are not in the array 
  setupClickables();

  setupEndings();

  fs = fullscreen();
  console.log("finished setup")
}

// Adventure manager handles it all!
function draw() {
  // draws background rooms and handles movement from one to another
  adventureManager.draw();

 // drawCharacters();

  // don't draw them on first few screens
  if( adventureManager.getStateName() === "Splash" ||
      adventureManager.getStateName() === "Instructions" ||
      adventureManager.getStateName() === "Characters" ) {
    ;
  }
  else {
    //drawCharacters();
  }
  
  // draw the p5.clickables, in front of the mazes but behind the sprites
  clickablesManager.draw();
}

// pass to adventure manager, this do the draw / undraw events
function keyPressed() {
  // toggle fullscreen mode
  if( key === 'f') {
    fs = fullscreen();
    fullscreen(!fs);
    return;
  }

  // dispatch all keys to adventure manager
  adventureManager.keyPressed(key); 
}

function mouseReleased() {
  // dispatch all mouse events to adventure manager
  adventureManager.mouseReleased();
}

function drawCharacters() {
  for( let i = 0; i < characters.length; i++ ) {
    characters[i].draw();
  }
}

//-------------- CLICKABLE CODE  ---------------//

function setupClickables() {
  // All clickables to have same effects
  for( let i = 0; i < clickables.length; i++ ) {
    clickables[i].width = 1000;
    clickables[i].height = 60;
    clickables[i].textSize = 20;
    clickables[i].strokeWeight = 0;
    clickables[i].cornerRadius = 30;
    clickables[i].textFont = bodyFont;

    clickables[i].onHover = clickableButtonHover;
    clickables[i].onOutside = clickableButtonOnOutside;
    clickables[i].onPress = clickableButtonPressed;
  }

  clickables[0].width = 250;
  clickables[0].height = 40;


  // we do specific callbacks for each clickable
  clickables[6].onPress = clAddSecurity;
  clickables[3].onPress = clRestart;
  clickables[10].onPress = clAddFeatureUD;
  clickables[12].onPress = clAddFeatureLD;
  clickables[14].onPress = clAddFeatureLD2;
  clickables[16].onPress = clEndEdu;
  clickables[24].onPress = clEndEdu;


}

// tint when mouse is over
clickableButtonHover = function () {
  if (this.name === "Start_Over"){
    this.color = "#904eed"
    this.stroke= "#7122ba"
  } else {
    this.color = "#00b3d6";
    this.stroke = "#007c9e"
  }
  this.noTint = false;
  this.tint = "#FF0000";
  this.textColor = "#FFFFFF";
  this.strokeWeight = 2;
}

// color a light gray if off
clickableButtonOnOutside = function () {
  // backto our gray color
  this.color = "#E8E8E8";
  this.textColor = "#4E4E4E";
  this.strokeWeight = 0;

}

clickableButtonPressed = function() {
  adventureManager.clickablePressed(this.name);
} 

//-- specific button callbacks: these will add or subtrack anger, then
//-- pass the clickable pressed to the adventure manager, which changes the
//-- state. A more elegant solution would be to use a table for all of these values

clEnding = function() {
  console.log("ending")
  adventureManager.clickablePressed(this.name);
}

clRestart = function() {
  console.log("restarting")
  budget = 50000
  helpedEdu = 0;
  adventureManager.clickablePressed(this.name);
}

clAddSecurity = function() {
  console.log("security")
  budget -= 25000;
  adventureManager.clickablePressed(this.name);
}

clAddFeatureUD = function() {
  console.log("security")
  budget -= 35000;
  helpedEdu += 1;
  adventureManager.clickablePressed(this.name);
}

clAddFeatureLD = function() {
  console.log("security")
  budget -= 30000;
  helpedEdu += 1;
  adventureManager.clickablePressed(this.name);
}

clAddFeatureLD2 = function() {
  console.log("security")
  budget -= 10000;
  helpedEdu += 1;
  adventureManager.clickablePressed(this.name);
}

clEndEdu = function () {
  if(helpedEdu > 0) {
    adventureManager.clickablePressed("Sell_Edu");
  } else {
    adventureManager.clickablePressed("Sell");
  }
}



//-------------- CHARACTERS -------------//
function allocateCharacters() {
  // load the images first
  characterImages[shareHold] = loadImage("assets/consumer.jpg");
  characterImages[govern] = loadImage("assets/consumer.jpg");
  characterImages[developers] = loadImage("assets/consumer.jpg");
  characterImages[upperStudents] = loadImage("assets/consumer.jpg");
  characterImages[lowerStudents] = loadImage("assets/consumer.jpg");
  characterImages[moms] = loadImage("assets/consumer.jpg");

  for( let i = 0; i < characterImages.length; i++ ) {
    characters[i] = new Character();
    characters[i].setup( characterImages[i], 50 + (400 * parseInt(i/2)), 120 + (i%2 * 120));
  }

  // default anger is zero, set up some anger values
  characters[developers].addAnger(1);
  characters[upperStudents].addAnger(2);
  characters[lowerStudents].addAnger(1);
  characters[moms].subAnger(2); // test
}

class Character {
  constructor() {
    this.image = null;
    this.x = width/2;
    this.y = width/2;
  }

  setup(img, x, y) {
    this.image = img;
    this.x = x;
    this.y = y;
    this.anger = 0;
  }

  draw() {
    if( this.image ) {
      push();
      // draw the character icon
      imageMode(CENTER);
      image( this.image, this.x, this.y );

      // draw anger emojis
      for( let i = 0; i < this.anger; i++ ) {
        image(angerImage, this.x + 70 + (i*40), this.y +10 );
      }

      pop();
    }
  }

  getAnger() {
    return this.anger;
  }

  // add, check for max overflow
  addAnger(amt) {
    this.anger += amt;
    if( this.anger > maxAnger ) {
      this.anger = maxAnger;
    }

  }

  // sub, check for below zero
  subAnger(amt) {
    this.anger -= amt;
    if( this.anger < 0 ) {
      this.anger = 0;
    }
  }
}

//-------------- ROOMS --------------//

// hard-coded text for all the rooms
// the elegant way would be to load from an array
function loadAllText() {
  // go through all states and setup text
  // ONLY call if these are ScenarioRoom
  
// copy the array reference from adventure manager so that code is cleajer
  scenarioRooms = adventureManager.states;

  scenarioRooms[startScreen].setText("Who's the primary Market?", "This is a new device you created that is able to project a person’s thoughts as a visual interpretation to others. It offers a new way of communicating to others. You’re about to launch this new technology, but you must choose the primary market, who do you choose?");
  scenarioRooms[governScreen].setText("Where to start?", "The local government wants to test out your product. They’re asking you which session ");
  scenarioRooms[secureScreen].setText("Good News", "The local government does a test run on the Thoughtfull and it does well in the trial run. Now they offer to expand out towards international government relations. They want to start using it as a device to help aid in meetings between nations inorder to propose new ideas. However; the team you're in contact with is concerned that there are flaws in the security protocol within your system. ");
  scenarioRooms[endOneScreen].setText("Ending One", "By ignoring the request, something goes wrong during the meeting. The head set gets hacked and you are seen as a potential threat to the country. The nations at the meeting are now on bad terms and the US has now lost trading relations with some countries.");
  scenarioRooms[endTwoScreen].setText("Ending Two", "By hiring the team of security experts, you not only met the needs of their request, but you also protect against any possible means of sabotage that could occur during the meeting. You are well conpensated for your product and sell it to the government to use now");
  scenarioRooms[eduScreen].setText("Pick an Age Group","Which age group would you like to invest into?");
  scenarioRooms[eduUpperScreen].setText("Extended Features","Device is being mainly used and tested within a group dynamic. More students feel more encouraged to participate in group projects and feel more productive. However; they express how they would like for more features geared towards group related tasks to be included. For example, a way to download previous thought projections and save them to a local computer.");
  scenarioRooms[eduLowerScreen].setText("Extended Features", "Device is being used within the classroom as a way to develop better understandings on certain topics discussed in class and as a way to stimulate creativity. The kids are enjoying it, but they express that the headset itself is a little bit restrictive and want the head set to be more free moving.")
  scenarioRooms[eduLowerAddScreen].setText("Additional Extended Features", "Additionally primary schools are saying that the UI is a little bit hard for the younger kids to understand. They're asking for there to be a friendlier UI for the kids to interact with");
  scenarioRooms[budgetScreen].setText("Budget Problems", "Sponsors are complaining that you’re not making enough money with the headset devices. They suggest to move over to a paid model service that limits functionality and uses curated user ads.");
  scenarioRooms[sellScreen].setText("Ending Three", "You sell to a randomly selected company. Because there was no other features added to the base model, the unreliable company you chose uses it to perform illegal activities. When they eventually get caught they put all the fall on you.");
  scenarioRooms[adScreen].setText("Ending Four", "Target market no longer can afford your device, now it’s marketed as a tech toy by the upper elite class that stops being relevant by the time another new gadget is introduced.");
  scenarioRooms[keepScreen].setText("Keep the Current Model", "By leaving the current model as it is, the budget has become tighter than before. By not implementing a paid model you have to make budget cuts elsewhere.");
  scenarioRooms[salaryScreen].setText("Ending Five", "Staff is starting to leave, unpaid interns are not motivated in putting countless hours into working for barely any benefits. As a result the quality of the code drops and version deployments are constantly delayed with bugs.");
  scenarioRooms[productScreen].setText("Cut Production Costs", "You went with cutting production costs, as a result the device keeps breaking and becomes a potential hazard to wearers. Malfunctioning hardware is stirring up concern in the mothers anonymous forum especially. In the next week a rumor starts circulating that your company is intentionally causing harm to their children's brains. They demand you recall the product");
  scenarioRooms[rumorScreen].setText("Ending Six", "You make a statement about the rumors and take full responsibility for the drop in performance. You personally start putting hours to fix the technology. You release the newer safer model under a different name and sell it to a respectable organization where it is a hit. You get no money compensation for the work and have to remain off the grid the rest of your life after your controversy.");
  scenarioRooms[ignoreScreen].setText("Ending Seven", "You ignore the rumors and don’t address them. The mother’s association sues your product for potentially harming their children. You lose the case and are bared from ever working in the industry again.");
  scenarioRooms[sellAltScreen].setText("Ending Eight", "You sell the device to another company, but because of the attention you added for the educational features, the technology is able to be reused in a similar area of impact. They get an award and you are credited for the base model, earning a small sum in prize money.")
}

//-------------- SUBCLASSES / YOUR DRAW CODE CAN GO HERE ---------------//

// Instructions screen has a backgrounnd image, loaded from the adventureStates table
// It is sublcassed from PNGRoom, which means all the loading, unloading and drawing of that
// class can be used. We call super() to call the super class's function as needed
class ScenarioRoom extends PNGRoom {
  // Constructor gets calle with the new keyword, when upon constructor for the adventure manager in preload()
  constructor() {
    super();    // call super-class constructor to initialize variables in PNGRoom

    this.titleText = "";
    this.bodyText = "";
  }

  // should be called for each room, after adventureManager allocates
  setText( titleText, bodyText ) {
    this.titleText = titleText;
    this.bodyText = bodyText;
    this.offset = 200;
    this.drawY = 360 - this.offset;
    this.drawX = 52;
  }

  // call the PNGRoom superclass's draw function to draw the background image
  // and draw our instructions on top of this
    draw() {
      // this calls PNGRoom.draw()
      super.draw();
      
      push();

      fill(248, 248, 248, 180)
      stroke(146, 161, 161);
      rect(this.drawX - 15, this.drawY - 60, width - ((this.drawX - 15) * 2),height - (this.drawY + 250), 30)

      // title text
      fill("#8D8D8D");
      textAlign(LEFT);
      textFont(headlineFont);
      textSize(36);
      noStroke();


      text("$ " + budget, this.drawX + 200 , 60);

      fill("#484848");
      text("Budget: ",this.drawX , 60)
      // title text
      textSize(30);

      text("- " + this.titleText, this.drawX , this.drawY);
     
      // Draw text in a box
      //text(this.titleText, width/6, height/6, this.textBoxWidth, this.textBoxHeight );
    
      textFont(bodyFont);
      textSize(24);
      fill("#8D8D8D");

      text(this.bodyText, this.drawX , this.drawY + 60, width - (this.drawX*2),height - (this.drawY+100) );
      pop();


    }
}

class Callibration extends PNGRoom {
  constructor() {
    super();    // call super-class constructor to initialize variables in PNGRoom

    this.titleText = "";
    this.bodyText = "";
  }

  draw() {
    // this calls PNGRoom.draw()
    super.draw();
    push();
      line(0, mouseY, width, mouseY);
      line(mouseX, 0, mouseX, height);
      rectMode(CENTER);
      rect(mouseX, mouseY, 25,25)
    pop();

  }
}

class EndingRoom extends PNGRoom {
  constructor() {
    super();    // call super-class constructor to initialize variables in PNGRoom

    this.titleText = "";
    this.bodyText = "";
  }

  setText( titleText, bodyText ) {
    this.titleText = titleText;
    this.bodyText = bodyText;
    this.offset = 200;
    this.drawY = 360 - this.offset;
    this.drawX = 52;
  }

  draw() {
    // this calls PNGRoom.draw()
    super.draw();
    console.log(adventureManager.getCurrentStateNum());
    push();

    fill(248, 248, 248, 180)
    stroke(146, 161, 161);
    rect(this.drawX - 15, this.drawY - 60, width - ((this.drawX - 15) * 2),height - (this.drawY +100), 30)

    // title text
    fill("#8D8D8D");
    textAlign(LEFT);
    textFont(headlineFont);
    textSize(36);
    noStroke();


    text("$ " + budget, this.drawX + 200 , 60);

    fill("#484848");
    text("Budget: ",this.drawX , 60)
    // title text
    textSize(30);

    text("- " + this.titleText, this.drawX , this.drawY);

    textSize(30)
    textFont(endFont);
    fill("#5c5c5c");

    text("Overall Budget Score: " + checkScore(), this.drawX, height/2 + 5);
    text("Ending Score: " + allEndings[adventureManager.getCurrentStateNum()], this.drawX, height/2 + 55);
    fill("#484848");

    textSize(45)
    text("Total Score: " + overallScore(), this.drawX, height/2 + 145);

    textFont(bodyFont);
    textSize(24);
    fill("#8D8D8D");

    text(this.bodyText, this.drawX , this.drawY + 60, width - (this.drawX*2),height - (this.drawY+100) );
    pop();

    clickables[3].visible = true;
  }
}

function checkScore(){
  if(budget >= 50000){
    return "A"
  } else if (budget >= 25000) {
    return "B"
  } else {
    return "C"
  }
}

function overallScore() {
  var score1 = allEndings[adventureManager.getCurrentStateNum()];
  var score2 = checkScore();
  if(score1 === score2) {
    return checkScore();
  } else if ( score1 === "C" || score2 === "C") {
    return "B-";
  } else if ( score1 === "B" || score2 ==="B") {
    return "B";
  } else {
    return "A";
  }
}

function setupEndings(){
  allEndings[endOneScreen] = "C";
  allEndings[endTwoScreen] = "A";
  allEndings[13] = "C";
  allEndings[14] = "C";
  allEndings[16] = "B";
  allEndings[18] = "A";
  allEndings[19] = "C";
  allEndings[20] = "A";
}


