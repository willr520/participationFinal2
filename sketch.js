
//right now using saved.js 

let originalImage;
let recognition;
let finalTranscript = '';
let interimTranscript = ''; 
let currentGeneratedImage = null;
let scene = 1;
let button;
let Karrik;
let VG5000;
let showTimer = false;
let generatedImageCount = 0;

//add music (with preLoad??)

function preload() {
  Karrik = loadFont('Karrik.ttf');
  VG5000 = loadFont('VG5000.ttf');
  originalImage = loadImage('images/originalImage.jpeg');
}

function setup() {
  createCanvas(1920, 1080);
  textFont(VG5000);
  const click_to_record = select('#click_to_record');
  const stop_recording = select('#stop_recording');

  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (window.SpeechRecognition) {
    setupSpeechRecognition();
  } else {
    console.error('Speech Recognition not supported in this browser.');
  }

  click_to_record.mousePressed(startRecording);
  //stop_recording.mousePressed(stopAndResetRecording);

  // Create the button in scene 1
  button = createButton('Click me');
  button.position(width / 2, height / 2 + 100);
  button.mousePressed(switchToScene2); // Call switchToScene2 function when the button is pressed
}

function draw() {
  background(240); // Clear the background

  if (scene === 1) {
    drawScene1();
  } else if (scene === 2) {
    drawScene2();
  } else if (scene === 3) {
    drawScene3();
  } else if (scene === 4) {
    drawScene4();
  }


  if (showTimer) {
    drawTimer();
  }
}

function drawTimer() {
  let currentTime = int((millis() - recordingStartTime) / 1000);
  let remainingTime = max(30 - currentTime, 0); // Calculate remaining time
  textSize(30);
  fill(0);
  text("TIME: " + remainingTime, width / 2 + 800, 300);
}

function drawScene1() {
  textSize(60);
  textAlign(CENTER);
  text("Press the button to start", width / 2, height / 2);
  select('#click_to_record').hide();
  select('#stop_recording').hide();
  select('#convert_text').hide();
}

function drawScene2() {
  let scaleFactor = 1.4;
  let scaledWidth = originalImage.width * scaleFactor;
  let scaledHeight = originalImage.height * scaleFactor;
  let x = 40;
  let y = height / 2 - scaledHeight / 2 + 80;
  imageMode(CORNER);
  image(originalImage, x, y, scaledWidth, scaledHeight);
  fill(0);
  textSize(40);
  textAlign(CENTER);
  text("Describe this image with as much detail as possible", width / 2, 100);
  select('#click_to_record').show();
  select('#stop_recording').show();
  select('#convert_text').show();

  // Display the generated text on the canvas
  textAlign(LEFT);
  textWrap(WORD);
  textSize(30);
  text(finalTranscript + interimTranscript, width / 2, 200, 800);
  console.log('scene2')
}

function drawScene3() {
  if (currentGeneratedImage) {
    background(0, 255, 0);
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
  text(finalTranscript, width / 2, 200, 800);
  setTimeout(switchToScene4, 5000);
  console.log('scene3')
}

function drawScene4() {
  imageMode(CORNER);
  let scaleFactor = 0.5;
  let scaledWidth = currentGeneratedImage.width * scaleFactor;
  let scaledHeight = currentGeneratedImage.height * scaleFactor;
  let x = 40;
  let y = height / 2 - scaledHeight / 2 + 40;
  image(currentGeneratedImage, x, y, scaledWidth, scaledHeight);
  fill(0);
  textSize(40);
  textAlign(CENTER);
  text("Describe this image with as much detail as possible", width / 2, 100);
  textAlign(LEFT);
  textWrap(WORD);
  textSize(30);
  text(finalTranscript + interimTranscript, width / 2, 200, 800);
  console.log('scene4');
  //give instructions on what button to press, timer in the upper right corner that is static at 30 seconds but starts counting down when button pressed
}

//draw scene 5

//scene 4 - have to call the generated image again ?? then reset the transcript (basically repeat scene 2 and 3)
function resetTranscription() {
  finalTranscript = '';
  interimTranscript = '';
}

function switchToScene2() {
  scene = 2; // Switch to scene 2
  button.remove(); // Remove the button from scene 1
}

function switchToScene4() {
  scene = 4;
  resetTranscription();
}


function startRecording() {
  resetTranscription();
  recognition.start();
  recordingStartTime = millis();
  console.log("Speech recognition started!");
  console.log(interimTranscript + finalTranscript);
  showTimer = true;
  setTimeout(() => {
    console.log("30 seconds passed, stopping and resetting recording.");
    stopAndResetRecording();
  }, 30000); // Stop and reset after 30 seconds
}


function stopAndResetRecording() {
  recognition.stop();
  console.log(finalTranscript + interimTranscript);
  console.log("Speech recognition stopped by user.");
  console.log("Final transcript for this session:", finalTranscript);
  showTimer = false;
}

function setupSpeechRecognition() {
  recognition = new SpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onstart = () => {
    setTimeout(() => {
      console.log("30 seconds passed, stopping and resetting recording.");
      stopAndResetRecording();
    }, 30000); // Stop and reset after 30 seconds
  };

  recognition.onresult = (event) => {

    interimTranscript = ''; // Reset interim transcript
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' '; // Append only finalized text to final transcript
      } else {
        interimTranscript += event.results[i][0].transcript + ' '; // Append interim text
      }
    }

  };
  setTimeout(() => {
  recognition.onend = () => {
    console.log("Recognition ended");
  };
  getImage(finalTranscript);
}, 30000)
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

      // Load the generated image
      loadImage(URL.createObjectURL(response.data), img => {
        currentGeneratedImage = img;
        scene = 3;
      });
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
