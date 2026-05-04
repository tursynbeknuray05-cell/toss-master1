let img1, img2;

let score = 0;
let streak = 0;
let misses = 0;
let maxMisses = 5;

let paper;
let bin;
let powerSlider;
let animating = false;
let gameOver = false;

let message = "";
let messageColor;
let messageTimer = 0;

function preload() {
  img1 = loadImage("img1.png");
  img2 = loadImage("img2.png");
}

function setup() {
  createCanvas(600, 550);
  imageMode(CENTER);

  let paperWidth = 60;
  let paperHeight = paperWidth * (img1.height / img1.width);

  paper = {
    x: width / 2,
    y: height - 80,
    baseW: paperWidth,
    baseH: paperHeight,
    w: paperWidth,
    h: paperHeight,
    opacity: 255,
    rot: 0
  };

  let binWidth = random(100, 200);
  let binHeight = binWidth * (img2.height / img2.width);

  bin = {
    x: width / 2,
    y: random(120, height * 0.55),
    w: binWidth,
    h: binHeight,
    speed: random(1.5, 4),
    direction: random([1, -1])
  };

  powerSlider = createSlider(20, 100, 60, 1);
  powerSlider.position(width / 2 - 60, height + 20);
  powerSlider.style("width", "120px");

  messageColor = color(0);
}

function draw() {
  background(232);

  moveBin();

  drawScoreBar();
  drawAim();
  drawBin();

  if (!gameOver) {
    drawPaper();
  }

  drawPowerText();
  drawMessage();

  if (gameOver) {
    drawGameOver();
  }
}

function moveBin() {
  if (gameOver) return;

  bin.x += bin.speed * bin.direction;

  if (bin.x > width - bin.w / 2) {
    bin.x = width - bin.w / 2;
    bin.direction = -1;
    bin.speed = random(1.5, 4);
  }

  if (bin.x < bin.w / 2) {
    bin.x = bin.w / 2;
    bin.direction = 1;
    bin.speed = random(1.5, 4);
  }
}

function drawScoreBar() {
  fill(255);
  noStroke();
  rect(0, 0, width, 50);

  fill(40);
  textSize(15);
  textAlign(LEFT, CENTER);
  text("Score: " + score, 20, 25);

  textAlign(CENTER, CENTER);
  text("Streak: " + streak, width / 2, 25);

  textAlign(RIGHT, CENTER);
  text("Misses: " + misses + " / " + maxMisses, width - 20, 25);
}

function drawPowerText() {
  fill(80);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("Power: " + powerSlider.value(), width / 2, height - 18);
}

function drawBin() {
  image(img2, bin.x, bin.y, bin.w, bin.h);
}

function drawPaper() {
  push();
  translate(paper.x, paper.y);
  rotate(radians(paper.rot));
  tint(255, paper.opacity);
  image(img1, 0, 0, paper.w, paper.h);
  noTint();
  pop();
}

function drawAim() {
  if (animating || gameOver) return;
  if (mouseY < 50 || mouseY > height) return;

  stroke(0);
  strokeWeight(2);
  drawingContext.setLineDash([6, 6]);
  line(paper.x, paper.y, mouseX, mouseY);
  drawingContext.setLineDash([]);

  noFill();
  stroke(0);
  strokeWeight(2);
  circle(mouseX, mouseY, 16);
}

function mousePressed() {
  if (gameOver) {
    restartGame();
    return;
  }

  if (!animating && mouseY > 50) {
    shoot(mouseX, mouseY);
  }
}

function shoot(tx, ty) {
  animating = true;

  let startX = paper.x;
  let startY = paper.y;

  let dx = tx - startX;
  let dy = ty - startY;
  let distToTarget = dist(startX, startY, tx, ty);

  let power = powerSlider.value() / 100;
  let duration = constrain(distToTarget / power * 2.5, 400, 900);
  let startTime = millis();
  let arcHeight = -min(180, distToTarget * 0.6) * power;

  function animateShot() {
    let t = constrain((millis() - startTime) / duration, 0, 1);
    let ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    paper.x = startX + dx * ease;

    let rawY = startY + dy * ease;
    let arc = arcHeight * sin(PI * t);
    paper.y = rawY + arc;

    let scale = 1 - 0.3 * ease;
    paper.w = paper.baseW * scale;
    paper.h = paper.baseH * scale;

    paper.rot = t * 360 * (power > 0.5 ? 2 : 1);

    if (t < 1) {
      requestAnimationFrame(animateShot);
    } else {
      checkHit();
    }
  }

  requestAnimationFrame(animateShot);
}

function checkHit() {
  let targetX = bin.x;
  let targetY = bin.y - bin.h * 0.28;

  let dx = paper.x - targetX;
  let dy = paper.y - targetY;

  let hitW = bin.w * 1.05;
  let hitH = bin.h * 0.45;

  let inside =
    (dx * dx) / ((hitW / 2) ** 2) +
    (dy * dy) / ((hitH / 2) ** 2) <= 1;

  if (inside) {
    streak++;

    let points = 1;
    if (streak >= 3) points = 3;
    else if (streak >= 2) points = 2;

    score += points;

    if (streak >= 3) {
      showMessage("0n f1re +" + points, color(0, 0, 0));
    } else if (streak >= 2) {
      showMessage("combo +" + points, color(0, 0, 0));
    } else {
      showMessage("1n +" + points, color(0));
    }

    setTimeout(() => {
      resetPaper();
      randomizeBinSpeed();
      randomizeBinSize();
      animating = false;
    }, 600);
  } else {
    streak = 0;
    misses++;

    showMessage("miss...", color(170, 50, 50));

    setTimeout(() => {
      if (misses >= maxMisses) {
        gameOver = true;
      }

      resetPaper();
      randomizeBinSpeed();
      randomizeBinSize();
      animating = false;
    }, 600);
  }

  paper.opacity = 0;
}

function randomizeBinSpeed() {
  bin.speed = random(1.5, 4);
  bin.direction = random([1, -1]);
}

function randomizeBinSize() {
  let newWidth = random(100, 200);
  let newHeight = newWidth * (img2.height / img2.width);

  bin.w = newWidth;
  bin.h = newHeight;

  bin.x = constrain(bin.x, bin.w / 2, width - bin.w / 2);
}

function resetPaper() {
  paper.x = width / 2;
  paper.y = height - 80;
  paper.w = paper.baseW;
  paper.h = paper.baseH;
  paper.opacity = 255;
  paper.rot = 0;
}

function showMessage(txt, col) {
  message = txt;
  messageColor = col;
  messageTimer = 60;
}

function drawMessage() {
  if (messageTimer > 0) {
    fill(messageColor);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text(message, width / 2, height * 0.35);
    messageTimer--;
  }
}

function drawGameOver() {
  fill(40);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("gam3 0ver... unlucky", width / 2, height / 2 - 30);

  textSize(16);
  text("click anywhere to play again", width / 2, height / 2 + 15);
}

function restartGame() {
  score = 0;
  streak = 0;
  misses = 0;
  gameOver = false;
  animating = false;

  resetPaper();
  randomizeBinSpeed();
  randomizeBinSize();
}