const gameState = { MENU: 0, GAME: 1, END: 2 };
let state = gameState.MENU;
let song, fft, img;
let notes = [];
let particles = [];
let lastNoteTime = 0;
let gameStartTime;
let score = 0;
let activeArrows = [false, false, false, false];
let combo = 0;
let imgAlpha = 0;
let minhaImagem;


const gameLeftMargin = 150;
const arrowSpacing = 90;

function preload() {

  song = loadSound("kemadj.mp3");
  minhaImagem = loadImage("Design sem nome.png");
}

function setup() {
  createCanvas(1280, 800);
  rectMode(CENTER);
  fft = new p5.FFT(0.8, 64);

}

function draw() {
  background(0);

  push();
  tint(255, imgAlpha);
  loadImage(minhaImagem, width / 2 - 50, height / 2 - 50, 1000, 1000);
  pop();



  switch (state) {
    case gameState.MENU:
      drawMenu();
      break;
    case gameState.GAME:
      drawGame();

      if (song.isLoaded() && !song.isPlaying() && millis() - gameStartTime > 5000) {
        state = gameState.END;
      }
      break;
    case gameState.END:
      drawEndSequence();
      break;
  }
}

//tela ini
function drawMenu() {
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(60);
  text("RITMO DO MEDO", width / 2, height / 2 - 50);
  textSize(35);
  text("Clica ENTER para começar", width / 2, height / 2 + 50);
  textSize(13);
  text("Clica ESC para voltar ao menu", width / 2, height / 2 + 100);
}

function drawGame() {

  drawTargetZone();
  drawScore();

  fft.analyze();
  generateNotes();


  //-pont
  for (let i = notes.length - 1; i >= 0; i--) {
    notes[i].update();
    notes[i].display();

    if (notes[i].missed()) {
      score -= 50;
      notes.splice(i, 1);
    } else if (notes[i].pressed) {
      notes.splice(i, 1);
    }
  }
}

//partic
for (let i = particles.length - 1; i >= 0; i--) {
  particles[i].update();
  particles[i].display();
  if (particles[i].alpha <= 0) particles.splice(i, 1);
}


//gerar nots
function generateNotes() {
  let currentTime = millis() - gameStartTime;
  if (currentTime - lastNoteTime >= 250) {
    if (fft.getEnergy("bass") > 140 || fft.getEnergy("mid") > 140) {
      notes.push(new Arrow(floor(random(0, 4))));
      lastNoteTime = currentTime;
    }
  }
}

//setas
function drawArrow(x, y, type = 255) {
  push();
  translate(x, y);
  fill(255);
  noStroke();
  if (type === 1) rotate(HALF_PI);
  if (type === 2) rotate(-HALF_PI);
  if (type === 3) rotate(PI);
  rect(10, 0, 40, 20);
  triangle(-30, 0, 10, -30, 10, 30);
  pop();
}

function drawTargetZone() {
  const yPos = height - 100;
  for (let i = 0; i < 4; i++) {
    let x = gameLeftMargin + i * arrowSpacing;
    let opacity = activeArrows[i] ? 255 : 80;
    noFill();
    stroke(255, opacity);
    strokeWeight(2);
    rect(x, yPos, 80, 80, 10);
    drawArrow(x, yPos, i, opacity);
  }
}

//score
function drawScore() {
  push();
  fill(255);
  noStroke();
  textAlign(LEFT);
  textSize(32);
  text(`Score: ${score}`, gameLeftMargin - 40, 50);
  pop();
}

//tela fin
function drawEndSequence() {
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(42);
  text("FIM DE JOGO", width / 2, height / 2 - 50);
  textSize(32);
  text("Score Final: " + score, width / 2, height / 2 + 20);
  textSize(20);
  text("Clica ENTER para voltar ao menu", width / 2, height / 2 + 100);
}

//tecs
function keyPressed() {
  if (keyCode === ENTER) {
    if (state === gameState.MENU) {
      state = gameState.GAME;
      score = 0;
      notes = [];
      song.play();
      gameStartTime = millis();
    } else if (state === gameState.END) {
      window.location.href = "index.html";
    }
  }

  if (keyCode === ESCAPE) {
    window.location.href = "index.html";
  }






  if (state === gameState.GAME) {
    let idx = -1;
    if (keyCode === LEFT_ARROW) idx = 0;
    if (keyCode === UP_ARROW) idx = 1;
    if (keyCode === DOWN_ARROW) idx = 2;
    if (keyCode === RIGHT_ARROW) idx = 3;

    if (idx !== -1) {
      activeArrows[idx] = true;
      checkHit(idx);
    }
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW) activeArrows[0] = false;
  if (keyCode === UP_ARROW) activeArrows[1] = false;
  if (keyCode === DOWN_ARROW) activeArrows[2] = false;
  if (keyCode === RIGHT_ARROW) activeArrows[3] = false;
}


function checkHit(index) {
  let hit = false;
  for (let note of notes) {
    if (note.arrowIndex === index && note.y > height - 160 && note.y < height - 40) {
      score += 100;
      combo++;
      note.pressed = true;
      hit = true;


      if (combo % 10 === 0 && combo > 0) {
        imgAlpha = min(imgAlpha + 51, 255);
      }

      for (let i = 0; i < 8; i++) particles.push(new Particle(note.x, note.y));
      break;
    }
  }
  if (!hit) {
    score -= 50;
    combo = 0;
    imgAlpha = 0;
  }
}

function handleHit(idx, side, activeArray) {
  activeArray[idx] = true;
  let hit = false;
  for (let note of notes) {
    if (note.side === side && note.arrowIndex === idx && note.y > height - 160 && note.y < height - 40) {
      score += 100;
      note.pressed = true;
      hit = true;
      for (let i = 0; i < 8; i++) particles.push(new Particle(note.x, note.y));
      break;
    }
  }
  if (!hit) score -= 50;
}

class Arrow {
  constructor(index) {
    this.arrowIndex = index;
    this.x = gameLeftMargin + index * arrowSpacing;
    this.y = -50;
    this.speed = 6;
    this.pressed = false;
  }
  update() { this.y += this.speed; }
  display() { drawArrow(this.x, this.y, this.arrowIndex, 255); }
  missed() { return this.y > height - 40 && !this.pressed; }
}



class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = random(-4, 4);
    this.vy = random(-4, 4);
    this.alpha = 255;
  }
  update() { this.x += this.vx; this.y += this.vy; this.alpha -= 15; }
  display() {
    noStroke();
    fill(255, this.alpha);
    ellipse(this.x, this.y, 6);
  }
}

function drawEndSequence() {
  background(0);
  fill(255); textAlign(CENTER, CENTER);
  textSize(42); text("FIM DE JOGO", width / 2, height / 2 - 50);
  textSize(32); text("Equipa: " + score, width / 2, height / 2 + 20);
  textSize(20); text("ENTER para Menu", width / 2, height / 2 + 100);


}
