let originalImage;
let recognition;
let finalTranscript = '';
let interimTranscript = ''; 
let currentGeneratedImage = null;
let scene = 1;
let button;
let Karrik;
let VG5000;
let DINMittelschriftStd;
let DINEngschriftStd;
let Compacta;
let Eurostile;
let showTimer = false;
let startTimer = false;
let recordingStartTime = 0;
let numGeneratedImages = 0;
let generatedImages = [];
let serial;
let startButtonPressed = 0;
let startButtonSwitchToSceneTwo = 0;
let stopButtonPressed = 0;
let whiteButtonStartRecording = false; 
let recordingStarted = false; // Flag variable to track if recording has started
let sceneSwitchedTo2 = false;
let redButtonPressCount = 0;
const imageSize = 700;


//add music (with preLoad??) (brown noise)
//add instructions

// if button pressed = 2 and 30 seconds have gone up

//text lower, scene 5 timer

function preload() {
  Karrik = loadFont('fonts/Karrik.ttf');
  VG5000 = loadFont('fonts/VG5000.ttf');
  Compacta = loadFont('fonts/Compacta.ttf')
  Eurostile = loadFont('fonts/eurostile.ttf')
  DINMittelschriftStd = loadFont('fonts/DINMittelschriftStd.otf');
  DINEngschriftStd = loadFont('fonts/DINEngschriftStd.otf');
}

function preload() {
  totalImages = 22;
  randomImageIndex = Math.floor(random(1, totalImages + 1));
  imagePath = `images/originalImage${randomImageIndex}.jpg`;
  originalImage = loadImage(imagePath);
}

function setup() {

  serial = new p5.SerialPort();
  serial.list();
  serial.open("/dev/tty.usbmodem1413301");
  serial.on('connected', serverConnected);
  serial.on('list', gotList);
  serial.on('data', gotData);
  serial.on('error', gotError);
  serial.on('open', gotOpen);
  serial.on('close', gotClose);


  createCanvas(1920, 1080);
  textFont('Compacta');
  const click_to_record = select('#click_to_record');
  const stop_recording = select('#stop_recording');

  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (window.SpeechRecognition) {
    setupSpeechRecognition();
  } else {
    console.error('Speech Recognition not supported in this browser.');
  }

  click_to_record.mousePressed(startRecording);
  stop_recording.mousePressed(stopAndResetRecording);

  // Create the button in scene 1
  button = createButton('Click me');
  button.position(width / 2, height / 2 + 100);
  button.mousePressed(switchToScene2); 

  angleMode (DEGREES);
  strokeCap(SQUARE);  // Set stroke cap 

}

function draw() {
  background(255); 


  if (scene === 1) {
    drawScene1();
  } else if (scene === 2) {
    drawScene2();
  } else if (scene === 3) {
    drawScene3();
  } else if (scene === 4) {
    drawScene4();
  } else if (scene === 5) {
    drawScene5();
  } else if (scene === 'loading') {
    drawLoadingScreen();
  }

  if (showTimer) {
    drawTimer();
  } 

  if (startTimer) {
    drawStartTimer();
  } 
  
  if (startButtonPressed === 1 && !sceneSwitchedTo2) {
    console.log("startbuttonPressed is 1")
    console.log("whileButtonStartRecording",whiteButtonStartRecording);
    switchToScene2();
    sceneSwitchedTo2 = true;
  }


   if (startButtonPressed === 2  && !recordingStarted) {

    console.log("recordingStarted", recordingStarted);
    whiteButtonStartRecording = true;
  }

  if (whiteButtonStartRecording){
    console.log("startButtonPressed is two and starting recording")
    // Check if button press count is 2 and recognition is not running
    startRecording();
    whiteButtonStartRecording = false;
    recordingStarted = true;
    console.log("recordingStarted", recordingStarted);
    startButtonPressed = 2;
  }
}



function serverConnected() {
  print("Connected to Server");
}

function gotList(thelist) {
  print("List of Serial Ports:");
  // theList is an array of their names
  for (let i = 0; i < thelist.length; i++) {
    // Display in the console
    print(i + " " + thelist[i]);
  }
}

function gotOpen() {
  print("Serial Port is Open");
}

function gotClose(){
  print("Serial Port is Closed");
  latestData = "Serial Port is Closed";
}

function gotError(theerror) {
  print(theerror);
}

function gotData() {
  let currentString = serial.readLine();  // read the incoming string
  trim(currentString);                    // remove any trailing whitespace
  if (!currentString) return;             // if the string is empty, do no more
  console.log(currentString);             // print the string
  latestData = currentString;             // save it for the draw method

  if (latestData === "Start Button Pressed") {
    startButtonPressed++; // Increment the variable
    console.log("Start Button Pressed! Count:", startButtonPressed);
  }
  if (latestData === "Stop Button Pressed") {
    redButtonPressCount++; // Increment the variable
    stopButtonPressed++;
    console.log("Stop Button Pressed! Count:", stopButtonPressed);
  }

  if(stopButtonPressed === 1) {
    stopAndResetRecording();
    redButtonPressCount = 0;
    stopButtonPressed = 0;
    console.log("redButtonPressCount:", redButtonPressCount);
  }
  
}

function gotRawData(thedata) {
  print("gotRawData" + thedata);
}

function drawTimer() {
  let currentTime = int((millis() - recordingStartTime) / 1000);
  let remainingTime = max(30 - currentTime, 0); 
  textSize(40);
  fill(0);
  textAlign(LEFT);
  textWrap(WORD);
  text("00:" + remainingTime, width / 2 + 800, 300, 200);
  startTimer = false;
}

function drawStartTimer() {
  textSize(40);
  textAlign(LEFT);
  textWrap(WORD);
  fill(0);
  text("00:30", width / 2 + 800, 300, 200);
}


function drawScene1() {
  fill(0);
  textSize(140);
  textAlign(CENTER);
  text("PRESS THE WHITE BUTTON TO START", width / 2, height / 2);
  textSize(30)
  fill(75);
  push();
  textFont('Eurostile');
  text("Playable by up to 4 people", width / 2, height / 2 + 60)
  pop();
  select('#click_to_record').hide();
  select('#stop_recording').hide();
  select('#convert_text').hide();
}


function drawScene2() {
  startTimer = true;
  //let scaleFactor = 0.7;
  //let scaledWidth = originalImage.width * scaleFactor;
  //let scaledHeight = originalImage.height * scaleFactor;
  //let x = 40;
  //let y = height / 2 - scaledHeight / 2 + 80;
  imageMode(CORNER);
  //image(originalImage, x, y, scaledWidth, scaledHeight);
  let scaleFactor = min(imageSize / originalImage.width, imageSize / originalImage.height);
  let scaledWidth = originalImage.width * scaleFactor;
  let scaledHeight = originalImage.height * scaleFactor;
  image(originalImage, 40, (height - scaledHeight) / 2 + 100, scaledWidth, scaledHeight);
  fill(0);
  textSize(100);
  textAlign(CENTER);
  text("DESCRIBE THIS IMAGE WITH AS MUCH DETAIL AS POSSIBLE", width / 2, 120);
  textAlign(CENTER);
  textWrap(WORD);
  fill(75);
  textSize(40);
  push();
  textFont('Eurostile');
  text("Press the white button when you are ready to speak your response into the microphone.", width/12, 150,  5 * width / 6, width/2);
  text("Press the red button to stop recording.", width/12, 190,  5 * width / 6, width/2);
  select('#click_to_record').show();
  select('#stop_recording').show();
  select('#convert_text').show();


  textAlign(LEFT);
  textWrap(WORD);
  textSize(30);
  text(finalTranscript + interimTranscript, width/2 + 200, 500, 400);
  console.log('scene2')
  pop();

  /*if (showTimer == false) {
    textSize(30);
    fill(0);
    text("TIME: 30", width / 2 + 800, 300);
  }*/

}

let imageSaved = false;

function drawScene3() {
  startTimer = false;
  background(69, 69, 69);
  if (currentGeneratedImage) {
    imageMode(CENTER);
    let scaleFactor = 0.5;
    let scaledWidth = currentGeneratedImage.width * scaleFactor;
    let scaledHeight = currentGeneratedImage.height * scaleFactor;
    let x = 40;
    let y = height / 2 - scaledHeight / 2 + 100;
    imageMode(CORNER);
    image(currentGeneratedImage, x, y, scaledWidth, scaledHeight);
    textSize(40);
    textAlign(CENTER);
  }
  textAlign(CENTER);
  text("YOUR DESCRIPTION", width/2 + 200, 400, 400);
  textWrap(WORD);
  fill(255);
  rectMode(CORNER);
  push();
  textFont('Eurostile');
  text(finalTranscript, width/2 + 200, 500, 400);
  pop();

  if (!imageSaved) {
    currentGeneratedImage.save();
    imageSaved = true;

  }

  setTimeout(switchToScene4, 5000);
  console.log('scene3')
}

function drawScene4() {
  imageSaved = false;
  startTimer = true;
    imageMode(CORNER);
    let scaleFactor = 0.5;
    let scaledWidth = currentGeneratedImage.width * scaleFactor;
    let scaledHeight = currentGeneratedImage.height * scaleFactor;
    let x = 40;
    let y = height / 2 - scaledHeight / 2 + 100;
    image(currentGeneratedImage, x, y, scaledWidth, scaledHeight);
    fill(0);
    textSize(100);
    textAlign(CENTER);
    text("DESCRIBE THIS IMAGE WITH AS MUCH DETAIL AS POSSIBLE", width / 2, 120);
    textAlign(CENTER);
    textWrap(WORD);
    textSize(40);
    push();
    textFont('Eurostile');
    text("Press the white button when you are ready to speak your response into the microphone.", width/12, 150,  5 * width / 6, width/2);
    text("Press the red button to stop recording.", width/12, 190,  5 * width / 6, width/2);
    textAlign(LEFT);
    textWrap(WORD);
    textSize(30);
    text(finalTranscript + interimTranscript, width/2 + 200, 500, 400);
    pop();
    console.log('scene4', redButtonPressCount);
    if (numGeneratedImages == 4) {
    switchToScene5();
    }
 
}

function drawScene5() {
  // Display all four generated images
  startTimer = false;
  showTimer = false;
  let xOffset = width / 4 + 380;
  let yOffset = 40;
  

  // Define the max width constraint
//let maxImageWidth = width / 2; // Ensures the image won't go past half the screen width

  let imageWidth = 500;
  let imageHeight = 500;

  // Calculate the scale factor while ensuring the image fits within the max width
  let scaleFactor = min(imageSize / originalImage.width, imageSize / originalImage.height);
  let scaledWidth = originalImage.width * scaleFactor;
  let scaledHeight = originalImage.height * scaleFactor;

  imageMode(CORNER);
  image(originalImage, 40, (height - scaledHeight) / 2 + 100, scaledWidth, scaledHeight);
  textSize(50);
  textAlign(CENTER); // Center the text horizontally
  text("ORIGINAL IMAGE", 40 + scaledWidth / 2, height / 4); // Center text based on image position

  // Display generated images
  for (let i = 0; i < generatedImages.length; i++) {
    imageMode(CORNER);
    image(generatedImages[i], xOffset, yOffset, imageWidth, imageHeight);
    xOffset += imageWidth + 10;
    if ((i + 1) % 2 === 0) {
      xOffset = width / 4 + 380;
      yOffset += imageHeight + 10;
    }
  }

  setTimeout(() => {
    scene = 1;
  }, 30000);
}




function drawLoadingScreen(){
  textAlign(CENTER);
  textSize(60);
  text("LOADING", width/2, height/2);
  
  push ();
    translate (width/2, height/2 + 80);
    rotate (frameCount * 3);
    noFill ();
    strokeWeight (20);
    stroke ("white");
    //ellipse (0, 0, 100, 100);
  
    noFill ();

    stroke ("black");
    strokeWeight (20);
    arc (0, 0, 100, 100, 0, 90);
  pop ();
  
}
 /*if ((i + 1) % 2 === 0) {
      xOffset = 40;
      yOffset += imageHeight + 20;
    } previous code that was displaying images in grid, figure out how to fit them all in on one line*/


function switchToScene2() {
  button.hide();
  scene = 2; 
}

function switchToScene4() {
  scene = 4;
  finalTranscript = '';
  interimTranscript = '';
}

function switchToScene5() {
  scene = 5;
}

function startRecording() {
  if (!recognition.running) { // Check if recognition is not already running
    showTimer = true;
    startTimer = false;
    recognition.start();
    recordingStartTime = millis(); 
    console.log("Speech recognition started!");

    setTimeout(() => {
      console.log("30 seconds passed, stopping and resetting recording.");
      stopAndResetRecording();
      startButtonPressed = 0;
      redButtonPressCount = 0;
      stopButtonPressed = 0;
    }, 30000); 
  }
}


function stopAndResetRecording() {
  recordingStarted = false;
  console.log("recordingStarted", recordingStarted);
  startButtonPressed = 1;
  showTimer = false;
  recognition.stop();
  console.log("Speech recognition stopped by user.");
  console.log("Final transcript for this session:", finalTranscript + interimTranscript);
}

function setupSpeechRecognition() {
  startTimer = false;
  recognition = new SpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onresult = (event) => {
    interimTranscript = ''; 
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' '; 
      } else {
        interimTranscript += event.results[i][0].transcript + ' '; 
      }
    }
  };

  recognition.onend = () => {
    console.log("Recognition ended");
    scene = 'loading';
    getImage(finalTranscript + interimTranscript);
    startTimer = false;
  };
}

function resetTranscription() {
  finalTranscript = ''; 
}

let savedDescriptions = [];  // Array to store descriptions

async function getImage(transcript) {
  const formData = new FormData();
  formData.append('prompt', transcript);
  formData.append('output_format', 'webp');

  try {
    const response = await axios.post(
      `https://api.stability.ai/v2beta/stable-image/generate/core`,
      formData,
      {
        headers: {
          Authorization: `Bearer sk-2yXYGDUMvDo9rL6TtR41vc6BLgiw5iCKH6DSJa8kAUXMcxxF`,
          Accept: "image/*"
        },
        responseType: "blob"
      }
    );

    if (response.status === 200) {
      console.log("Image saved successfully.");

      loadImage(URL.createObjectURL(response.data), img => {
        currentGeneratedImage = img;
        numGeneratedImages++;
        generatedImages.push(currentGeneratedImage);
        console.log(numGeneratedImages);

        // Save the transcription as a .txt file
        savedDescriptions.push(transcript);  // Append the description
        saveTextFile(transcript);  // Call the function to save the transcript
        scene = 3;
      });
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

function saveTextFile(transcript) {
  let fileName = `description_${numGeneratedImages}.txt`; // Name the file uniquely based on the image number
  saveStrings([transcript], fileName);  // Save the transcript as a .txt file
}
