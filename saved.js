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
let showTimer = false;
let startTimer = false;
let recordingStartTime = 0;
let numGeneratedImages = 0;
let generatedImages = [];
let serial;
let startButtonPressed = 0;

//add music (with preLoad??) (brown noise)
//add instructions

// if button pressed = 2 and 30 seconds have gone up

function preload() {
  Karrik = loadFont('Karrik.ttf');
  VG5000 = loadFont('VG5000.ttf');
  DINMittelschriftStd = loadFont('DINMittelschriftStd.otf');
  DINEngschriftStd = loadFont('DINEngschriftStd.otf');
}

function preload() {
  originalImage = loadImage('images/originalImage.jpeg'); //randomly take an image from the images folder of the colors that we collected

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
  textFont('DINMittelschriftStd');
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

}

function draw() {
  background(240); 

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
  }

  if (showTimer) {
    drawTimer();
  } 

  if (startTimer) {
    drawStartTimer();
  } 
  
  if (startButtonPressed === 1) {
    switchToScene2();
  } if (startButtonPressed === 2 && !recognition.running) {
     // Check if button press count is 2 and recognition is not running
    startRecording();
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
  latestData = currentString;            // save it for the draw method

  if (latestData === "Start Button Pressed") {
    startButtonPressed++; // Increment the variable
    console.log("Start Button Pressed! Count:", startButtonPressed);
  }
}

function gotRawData(thedata) {
  print("gotRawData" + thedata);
}

function drawTimer() {
  let currentTime = int((millis() - recordingStartTime) / 1000);
  let remainingTime = max(30 - currentTime, 0); 
  textSize(30);
  fill(0);
  text("TIME: " + remainingTime, width / 2 + 800, 300);
  startTimer = false;
}

function drawStartTimer() {
  textSize(30);
  fill(0);
  text("TIME: 30", width / 2 + 800, 300);
}


startButton();

function drawScene1() {
  fill(0);
  textSize(60);
  textAlign(CENTER);
  text("Press the white button to start", width / 2, height / 2);
  textSize(30)
  fill(75);
  text("* Ensure both you and your partner are wearing the noise-cancelling headphones *", width / 2, height / 2 + 60)
  select('#click_to_record').hide();
  select('#stop_recording').hide();
  select('#convert_text').hide();
}


function drawScene2() {
  startTimer = true;
  let scaleFactor = 0.7;
  let scaledWidth = originalImage.width * scaleFactor;
  let scaledHeight = originalImage.height * scaleFactor;
  let x = 40;
  let y = height / 2 - scaledHeight / 2 + 80;
  imageMode(CORNER);
  image(originalImage, x, y, scaledWidth, scaledHeight);
  fill(0);
  textSize(60);
  textAlign(CENTER);
  text("Describe this image with as much detail as possible", width / 2, 80);
  textAlign(CENTER);
  textWrap(WORD);
  fill(75);
  textSize(40);
  text("Press the white button when you are ready to speak your response into the microphone ⚪", width/12, 110,  5 * width / 6, width/2);
  text("Press the red button to stop recording 🔴", width/12, 150,  5 * width / 6, width/2);
  select('#click_to_record').show();
  select('#stop_recording').show();
  select('#convert_text').show();


  textAlign(LEFT);
  textWrap(WORD);
  textSize(30);
  text(finalTranscript + interimTranscript, width/2, 300, 800);
  console.log('scene2')

  /*if (showTimer == false) {
    textSize(30);
    fill(0);
    text("TIME: 30", width / 2 + 800, 300);
  }*/

}

function drawScene3() {
  startTimer = false;
  background(0, 255, 0);
  if (currentGeneratedImage) {
    imageMode(CENTER);
    let scaleFactor = 0.5;
    let scaledWidth = currentGeneratedImage.width * scaleFactor;
    let scaledHeight = currentGeneratedImage.height * scaleFactor;
    let x = 40;
    let y = height / 2 - scaledHeight / 2 + 40;
    imageMode(CORNER);
    image(currentGeneratedImage, x, y, scaledWidth, scaledHeight);
    textSize(40);
    textAlign(CENTER);
  }
  textWrap(WORD);
  text(finalTranscript, width/2, 200, 800);
  setTimeout(switchToScene4, 5000);
  console.log('scene3')
}

function drawScene4() {
  startTimer = true;
    imageMode(CORNER);
    let scaleFactor = 0.5;
    let scaledWidth = currentGeneratedImage.width * scaleFactor;
    let scaledHeight = currentGeneratedImage.height * scaleFactor;
    let x = 40;
    let y = height / 2 - scaledHeight / 2 + 40;
    image(currentGeneratedImage, x, y, scaledWidth, scaledHeight);
    fill(0);
    textSize(60);
    textAlign(CENTER);
    text("Describe this image with as much detail as possible", width / 2, 80);
    textAlign(CENTER);
    textWrap(WORD);
    fill(75);
    textSize(40);
    text("Press the white button when you are ready to speak your response into the microphone ⚪", width/12, 110,  5 * width / 6, width/2);
    text("Press the red button to stop recording 🔴", width/12, 150,  5 * width / 6, width/2);
    textAlign(LEFT);
    textWrap(WORD);
    textSize(30);
    text(finalTranscript + interimTranscript, width/2, 300, 800);
    console.log('scene4');
    if (numGeneratedImages == 4) {
    switchToScene5();
    }
}

function drawScene5() {
  // Display all four generated images
  let xOffset = 40;
  let yOffset = 40;
  let imageWidth = 500;
  let imageHeight = 500;
  //these are the four images that are generated (include the original image)
  for (let i = 0; i < generatedImages.length; i++) {
    image(generatedImages[i], xOffset, yOffset, imageWidth, imageHeight);
    xOffset += imageWidth + 20;
    if ((i + 1) % 2 === 0) {
      xOffset = 40;
      yOffset += imageHeight + 20;
    }
  }
  setTimeout(() => {
    scene = 1;
  }, 30000); 
}


 /*if ((i + 1) % 2 === 0) {
      xOffset = 40;
      yOffset += imageHeight + 20;
    } previous code that was displaying images in grid, figure out how to fit them all in on one line*/


function switchToScene2() {
  scene = 2; 
  button.remove(); 
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
    }, 30000); 
  }
}


function stopAndResetRecording() {
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
    getImage(finalTranscript + interimTranscript);
  };
}

function resetTranscription() {
  finalTranscript = ''; 
}

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
        scene = 3;
      });
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

