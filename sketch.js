let pg;
let points = [];
let dotImages = []; 
let customFont; 
let customFontSub;
let video;
let handpose;
let hands = []; 
let currentSubtitle = "Lambaikan tanganmu ke kamera...";
let marqueeX = 0;

//varia pict
let gestureImages = {
  wave: [],
  thumbs: [],
  love: [],
  typing: []
};
let currentGesture = "wave";

function preload() {
  customFontSub = loadFont('assets/fonts/RemoraCorp.otf');
  customFont = loadFont('assets/fonts/amFont.ttf');
  for (let i = 0; i < 6; i++) {
    dotImages[i] = loadImage('assets/images/dot' + i + '.png');
  }
  // load foto ayang
  gestureImages.love[0] = loadImage('pict/love0.jpg');
  gestureImages.love[1] = loadImage('pict/love1.jpg');
  gestureImages.love[2] = loadImage('pict/love2.jpg');
  gestureImages.love[3] = loadImage('pict/love3.jpg');

  gestureImages.thumbs[0] = loadImage('pict/thumbs0.jpg');
  gestureImages.thumbs[1] = loadImage('pict/thumbs1.jpg');
  gestureImages.thumbs[2] = loadImage('pict/thumbs2.jpg');
  gestureImages.thumbs[3] = loadImage('pict/thumbs3.jpg');

  gestureImages.typing[0] = loadImage('pict/typing0.jpg');
  gestureImages.typing[1] = loadImage('pict/typing1.jpg');
  gestureImages.typing[2] = loadImage('pict/typing2.jpg');
  gestureImages.typing[3] = loadImage('pict/typing3.jpg');

  gestureImages.wave[0] = loadImage('pict/wave0.jpg');
  gestureImages.wave[1] = loadImage('pict/wave1.jpg');
  gestureImages.wave[2] = loadImage('pict/wave2.jpg');
  gestureImages.wave[3] = loadImage('pict/wave3.jpg');
}

function setup() {
  // Set webgl incase gastabil
  ml5.setBackend('webgl');  
  
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(320, 240); 
  video.hide(); 
  
  //model handpose
  let handposeOptions = {
    maxHands: 2,
    flipped: false
  };
  handpose = ml5.handPose(handposeOptions, modelLoaded);
  
  pg = createGraphics(800, 300);
  pg.fill(255);
  pg.textSize(300); 
  pg.textFont(customFont); 
  pg.textAlign(CENTER, CENTER);
  
  let gridSpacing = 12; //polkawars
  let letterSpacing = 160;
  
  let letters = [
    { char: 'a', offsetX: -letterSpacing, imgRange: [0, 1] }, 
    { char: 'r', offsetX: 15,             imgRange: [2, 3] }, 
    { char: 'i', offsetX: 160,            imgRange: [4, 5] }  
  ];

  points = [];

  for (let l of letters) {
    pg.background(0);
    pg.text(l.char, pg.width / 2 + l.offsetX, pg.height / 2);
    for (let x = 0; x < pg.width; x += gridSpacing) {
      for (let y = 0; y < pg.height; y += gridSpacing) {
        let c = pg.get(x, y);
        if (red(c) === 255) {
          let imgIndex = floor(random(l.imgRange[0], l.imgRange[1] + 1));
          let targetX = map(x, 0, pg.width, width / 2 - 400, width / 2 + 400);
          let targetY = map(y, 0, pg.height, height / 7 - 150, height / 7 + 150);
          let startX = random(-100, width + 100);
          let startY = random(-100, height + 100);
          points.push({ targetX: targetX, targetY: targetY, currentX: startX, currentY: startY, id: imgIndex });
        }
      }
    }
  }
  console.log("Scanning polkadot:", points.length);
}
function modelLoaded() {
  console.log("Handpose berhasil dimuat mereunn...");
  handpose.detectStart(video, gotHands);
}

function draw() {
   if (currentGesture === "wave") {
    background('#FFAFB0'); //pink
  } else if (currentGesture === "typing") {
    background('#4B2323'); //brown
  } else if (currentGesture === "love") {
    background('#6E1527'); //red
  } else if (currentGesture === "thumbs") {
    background('#E1E946'); //yellow
  }
  
  // ceki handgesture
  checkGestures(); 

  let mx = mouseX;
  let my = mouseY;

  let isScattered = false;
  let easeSpeed = 0.05;
  
//   let cycleTime = millis() % 4000;
//   let isScattered = (cycleTime < 1500); 
//   let easeSpeed = isScattered ? 0.02 : 0.05; 

  //gerak gambar polka
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    
    let finalTargetX = p.targetX;
    let finalTargetY = p.targetY;
    
    if (isScattered) {
      finalTargetX = p.targetX + sin(i * 0.5) * 150;
      finalTargetY = p.targetY + cos(i * 0.3) * 15;
    }
    
    let offsetX = sin(frameCount * 0.02 + i) * 5.5;
    let offsetY = cos(frameCount * 0.01 + i) * 5.5;
    
    let tX = finalTargetX + offsetX;
    let tY = finalTargetY + offsetY;
    
    if (!isScattered) {
      let d = dist(mx, my, tX, tY);
      if (d < 60) {
        let angle = atan2(tY - my, tX - mx);
        tX += cos(angle) * (60 - d);
        tY += sin(angle) * (60 - d);
      }
    }
    
    p.currentX = lerp(p.currentX, tX, easeSpeed);
    p.currentY = lerp(p.currentY, tY, easeSpeed);
    
    let dotSize = 20; 
    image(dotImages[p.id], p.currentX - dotSize/2, p.currentY - dotSize/2, dotSize, dotSize);
  }

  //subs
  fill(0); 
  noStroke();
  textSize(50); 
  if (currentGesture === "typing" || currentGesture === "love") {
    fill(255); //cobaan hideung
  } else {
    fill(0); 
  }
  textFont(customFontSub); 
  textAlign(CENTER, CENTER);
  text(currentSubtitle, width / 2, height / 3 + 50);

  //webcam
  let camW = 300; 
  let camH = 250; 
  let camX = width / 2 - camW / 2; 
  let camY = height * 0.50;        

  push();
  translate(camX + camW, camY); 
  scale(-1, 1);                
  image(video, 4, 4, camW - 8, camH - 8); 
  pop();

  noFill();
  // stroke(2);
  strokeWeight(5);
  rect(camX, camY, camW, camH, 10); 

  //handpoints
  // drawHandPoints(camX, camY, camW, camH);
  

  //logic img
  // let imgW = 180; // Lebar foto estetik
  // let imgH = 260; // Tinggi foto potret (portrait)

  let activePhotos = gestureImages[currentGesture]; 
  if (activePhotos && activePhotos.length === 4 && activePhotos[0]) {
   
    let w1 = 200; //img 1 (left out)
    let w2 = 180; //img 2 (left in)
    let w3 = 180; //img 3 (right in)
    let w4 = 150; //img 4 (right out)

    //img 1
    let h1 = (activePhotos[0].height / activePhotos[0].width) * w1;
    image(activePhotos[0], camX - 550, camY - 85, w1, h1);
    
    //img 2
    let h2 = (activePhotos[1].height / activePhotos[1].width) * w2;
    image(activePhotos[1], camX - 250, camY, w2, h2);
    
    //img 3
    let h3 = (activePhotos[2].height / activePhotos[2].width) * w3;
    image(activePhotos[2], camX + camW + 90, camY + -30, w3, h3);
    
    //img 4
    let h4 = (activePhotos[3].height / activePhotos[3].width) * w4;
    image(activePhotos[3], camX + camW + 350, camY - 20, w4, h4);
  }
  push();
    if (currentGesture === "typing" || currentGesture === "love") {
    fill(255); 
  } else {
    fill(0);   
  }
  
  noStroke();
  textSize(30);
  textFont(customFontSub);
  textAlign(LEFT, CENTER);
  
  let marqueeText = "Final round, final laugh. BIIRU - Not A Sushibar, July 13 – Ari’s farewell bash!";
  text(marqueeText, marqueeX, height - 50);
  marqueeX -= 3.5;
  // textWidth()
  if (marqueeX < -textWidth(marqueeText)) {
    marqueeX = width; 
  }
  pop();
}

function checkGestures() {
  if (hands.length === 2) {
    let hand1 = hands[0].keypoints;
    let hand2 = hands[1].keypoints;

    let wrist1 = hand1[0];
    let wrist2 = hand2[0];

    let tTip1 = hand1[4];  let iTip1 = hand1[8];  let mTip1 = hand1[12]; let rTip1 = hand1[16]; let pTip1 = hand1[20];
    let tTip2 = hand2[4];  let iTip2 = hand2[8];  let mTip2 = hand2[12]; let rTip2 = hand2[16]; let pTip2 = hand2[20];

    let fingersOpen1 = 0;
    if (iTip1.y < hand1[6].y)  fingersOpen1++; 
    if (mTip1.y < hand1[10].y) fingersOpen1++; 
    if (rTip1.y < hand1[14].y) fingersOpen1++; 
    if (pTip1.y < hand1[18].y) fingersOpen1++; 

    let fingersOpen2 = 0;
    if (iTip2.y < hand2[6].y)  fingersOpen2++; 
    if (mTip2.y < hand2[10].y) fingersOpen2++; 
    if (rTip2.y < hand2[14].y) fingersOpen2++; 
    if (pTip2.y < hand2[18].y) fingersOpen2++; 

    //thumbsup
    let isThumbUp1 = (tTip1.y < hand1[3].y) && (fingersOpen1 === 0);
    let isThumbUp2 = (tTip2.y < hand2[3].y) && (fingersOpen2 === 0);

    if (isThumbUp1 && isThumbUp2) {
      currentSubtitle = "Good Luck on Your Next Adventure!";
      currentGesture = "thumbs";
      return; 
    }

    //wave
    if (fingersOpen1 >= 3 && fingersOpen2 >= 3) {
      currentSubtitle = "Happy Last Dayyy";
      currentGesture = "wave";
      return;
    }

    //love
    let dIndex = dist(iTip1.x, iTip1.y, iTip2.x, iTip2.y);
    let dThumb = dist(tTip1.x, tTip1.y, tTip2.x, tTip2.y);
    if (dIndex < 45 && dThumb < 55) {
      currentSubtitle = "Thank You for Being Awesome";
      currentGesture = "love";
      return;
    }

    //typing
    let dWrists = dist(wrist1.x, wrist1.y, wrist2.x, wrist2.y);
    let wristYDiff = abs(wrist1.y - wrist2.y);
    if (dWrists < 180 && wristYDiff < 50 && iTip1.y > hand1[6].y && iTip2.y > hand2[6].y) {
      currentSubtitle = "Our Graphic Designer";
      currentGesture = "typing"; 
      return;
    }
  } 
  
  // else if (hands.length === 1) {
  //   let hand = hands[0].keypoints;
    
  //   let tTip = hand[4];  //jempol
  //   let iTip = hand[8];  //telunjuk
  //   let mTip = hand[12]; //tengah
  //   let rTip = hand[16]; //manis
  //   let pTip = hand[20]; //kelingking

  //   //jumlah jari terbuka
  //   let fingersOpen = 0;
  //   if (iTip.y < hand[6].y)  fingersOpen++;
  //   if (mTip.y < hand[10].y) fingersOpen++;
  //   if (rTip.y < hand[14].y) fingersOpen++;
  //   if (pTip.y < hand[18].y) fingersOpen++;

  //   //(4) side byside (8)
  //   let dLove = dist(tTip.x, tTip.y, iTip.x, iTip.y);
  //   if (dLove < 35 && fingersOpen <= 1) {
  //     currentSubtitle = "thank you for being awesome";
  //     currentGesture = "love";
  //     return;
  //   }

  //   //if semua jari terbuka lebar ke atas
  //   if (fingersOpen >= 3) {
  //     currentSubtitle = "Happy Last Dayyy!";
  //     currentGesture = "wave";
  //     return;
  //   }

  //   // currentSubtitle = "Hiduff arii lambaikan tangan";
  // } 
  else {
    currentSubtitle = "Happy Last Dayyy"; 
    currentGesture = "wave";
  }
}

//gambar sendi
function drawHandPoints(camX, camY, camW, camH) {
  for (let h = 0; h < hands.length; h++) {
    let landmarks = hands[h].keypoints; 
    for (let i = 0; i < landmarks.length; i++) {
      let pt = landmarks[i];
      
      let mappedX = map(pt.x, 0, 320, camX + camW - 4, camX + 4);
      let mappedY = map(pt.y, 0, 240, camY + 4, camY + camH - 4);

      if (h === 0) fill(255, 0, 0); 
      else fill(0, 0, 255);          
      
      noStroke();
      ellipse(mappedX, mappedY, 6, 6);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotHands(results) {
  hands = results;
}
