const gameState = { MENU: 0, GAME: 1, END: 2 };
let state = gameState.MENU;
let comboPulse = 0;   
let comboBump = 0;    
let song, fft, img;
let notes = [];
let particles = [];
let lastNoteTime = 0;
let gameStartTime = 0;

let score = 0;

let teamCombo = 0;


let revealTarget = 0;
let revealAlpha = 0;

const REVEAL_STEP = 51;
const REVEAL_MISS_PENALTY = 25;
const REVEAL_SMOOTH = 0.08;

let activeP1 = [false, false, false, false];
let activeP2 = [false, false, false, false];
const marginSide = 100;
const arrowSpacing = 80;

function preload() {
    song = loadSound("kemadj.mp3");
    img = loadImage("Design sem nome (1).png");
}

function setup() {
    createCanvas(1280, 800);
    rectMode(CENTER);
    fft = new p5.FFT(0.8, 64);
}

function draw() {
    background(0);


    revealAlpha = lerp(revealAlpha, revealTarget, REVEAL_SMOOTH);

   
    if (img) {
        push();
        tint(255, revealAlpha);
        image(img, 0, 0, width, height);
        pop();
    }

    switch (state) {
        case gameState.MENU: drawMenu(); break;
        case gameState.GAME: drawGame(); break;
        case gameState.END: drawEndSequence(); break;
    }
}

function drawMenu() {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);

    textSize(42);
    text("RITMO DO MEDO: EQUIPA", width / 2, height / 2 - 80);

    textSize(22);
    text("JOGADOR 1 (Esquerda): W, A, S, D", width / 2, height / 2);
    text("JOGADOR 2 (Direita): SETAS", width / 2, height / 2 + 30);

    textSize(32);
    text("Clica ENTER para começar", width / 2, height / 2 + 90);

    textSize(13);
    text("Clica ESC para voltar ao menu", width / 2, height / 2 + 130);
}

function drawGame() {

  
    const wantPulse = teamCombo > 50 ? 1 : 0;
    comboPulse = lerp(comboPulse, wantPulse, 0.12);
    comboBump = max(0, comboBump - 0.06);

    drawTeamComboSide();

    drawTargetZone(marginSide, activeP1, ["A", "W", "S", "D"]);
    drawTargetZone(width - marginSide - (3 * arrowSpacing), activeP2, ["←", "↑", "↓", "→"]);

    drawScore();

    fft.analyze();
    generateNotes();

    for (let i = notes.length - 1; i >= 0; i--) {
        notes[i].update();
        notes[i].display();

      
        if (notes[i].missed()) {
            score -= 50;
            applyTeamMiss();
            notes.splice(i, 1);
        } else if (notes[i].pressed) {
            notes.splice(i, 1);
        }
    }

    updateParticles();

    if (song.isLoaded() && !song.isPlaying() && millis() - gameStartTime > 5000) {
        state = gameState.END;
    }
}

function generateNotes() {
    let currentTime = millis() - gameStartTime;

    if (currentTime - lastNoteTime >= 200) {
        if (fft.getEnergy("bass") > 130 || fft.getEnergy("mid") > 130) {
            let side = random() > 0.5 ? "LEFT" : "RIGHT";
            notes.push(new Arrow(floor(random(0, 4)), side));
            lastNoteTime = currentTime;
        }
    }
}

function drawTargetZone(startX, activeArray, labels) {
    const yPos = height - 100;

    for (let i = 0; i < 4; i++) {
        let x = startX + i * arrowSpacing;
        let opacity = activeArray[i] ? 255 : 80;

        noFill();
        stroke(255, opacity);
        strokeWeight(2);
        rect(x, yPos, 70, 70, 10);

        drawArrow(x, yPos, i);

        push();
        noStroke();
        fill(255, 150);
        textSize(18);
        textAlign(CENTER);
        text(labels[i], x, yPos + 60);
        pop();
    }
}

function drawArrow(x, y, type, alpha = 255) {
    push();
    translate(x, y);
    fill(255, alpha);
    noStroke();

    if (type === 1) rotate(HALF_PI);
    if (type === 2) rotate(-HALF_PI);
    if (type === 3) rotate(PI);

    rect(8, 0, 30, 15);
    triangle(-20, 0, 8, -20, 8, 20);
    pop();
}

function drawScore() {
    push();
    fill(255);
    noStroke();
    textAlign(CENTER);

    textSize(40);
    text(`TEAM SCORE: ${score}`, width / 2, 60);


}


function applyTeamHit() {
    teamCombo++;


    comboBump = min(1, comboBump + (teamCombo > 50 ? 0.45 : 0.25));

    if (teamCombo % 10 === 0) {
        revealTarget = min(revealTarget + REVEAL_STEP, 255);
    }
}

function applyTeamMiss() {
    teamCombo = 0;
    revealTarget = max(revealTarget - REVEAL_MISS_PENALTY, 0);

    comboBump = 0;
}


function keyPressed() {
    if (keyCode === ENTER) {
        if (state === gameState.MENU) {
            userStartAudio();
            resetGame();

            state = gameState.GAME;
            song.play();
            gameStartTime = millis();
        } else if (state === gameState.END) {
            state = gameState.MENU;
        }
    }

    if (keyCode === ESCAPE) {
        window.location.href = "index.html";
    }

    if (state === gameState.GAME) {
      
        if (keyCode === 65) handleHit(0, "LEFT", activeP1);
        if (keyCode === 87) handleHit(1, "LEFT", activeP1);
        if (keyCode === 83) handleHit(2, "LEFT", activeP1);
        if (keyCode === 68) handleHit(3, "LEFT", activeP1);

       
        if (keyCode === LEFT_ARROW) handleHit(0, "RIGHT", activeP2);
        if (keyCode === UP_ARROW) handleHit(1, "RIGHT", activeP2);
        if (keyCode === DOWN_ARROW) handleHit(2, "RIGHT", activeP2);
        if (keyCode === RIGHT_ARROW) handleHit(3, "RIGHT", activeP2);
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

            applyTeamHit();

            for (let i = 0; i < 8; i++) particles.push(new Particle(note.x, note.y));
            break;
        }
    }

    
    if (!hit) {
        score -= 50;
        applyTeamMiss();
    }
}

function keyReleased() {
    if (keyCode === 65) activeP1[0] = false;
    if (keyCode === 87) activeP1[1] = false;
    if (keyCode === 83) activeP1[2] = false;
    if (keyCode === 68) activeP1[3] = false;

    if (keyCode === LEFT_ARROW) activeP2[0] = false;
    if (keyCode === UP_ARROW) activeP2[1] = false;
    if (keyCode === DOWN_ARROW) activeP2[2] = false;
    if (keyCode === RIGHT_ARROW) activeP2[3] = false;
}


class Arrow {
    constructor(index, side) {
        this.arrowIndex = index;
        this.side = side;

        let startX = (side === "LEFT") ? marginSide : width - marginSide - (3 * arrowSpacing);
        this.x = startX + index * arrowSpacing;

        this.y = -50;
        this.speed = 6;
        this.pressed = false;
    }
    update() { this.y += this.speed; }
    display() { drawArrow(this.x, this.y, this.arrowIndex, 255); }
    missed() { return this.y > height - 40 && !this.pressed; }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].display();
        if (particles[i].alpha <= 0) particles.splice(i, 1);
    }
}

class Particle {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.vx = random(-4, 4);
        this.vy = random(-4, 4);
        this.alpha = 255;
    }
    update() { this.x += this.vx; this.y += this.vy; this.alpha -= 15; }
    display() { noStroke(); fill(255, this.alpha); ellipse(this.x, this.y, 6); }
}


function drawEndSequence() {
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);

    textSize(42);
    text("FIM DE JOGO", width / 2, height / 2 - 50);

    textSize(32);
    text("Score da Equipa: " + score, width / 2, height / 2 + 20);

    textSize(20);
    text("ENTER para recomeçar", width / 2, height / 2 + 100);
}

function resetGame() {
    score = 0;
    teamCombo = 0;

    notes = [];
    particles = [];
    lastNoteTime = 0;

    revealTarget = 0;
    revealAlpha = 0;

    activeP1 = [false, false, false, false];
    activeP2 = [false, false, false, false];
}


function drawTeamComboSide() {

  const leftStartX  = marginSide;
  const rightStartX = width - marginSide - (3 * arrowSpacing);

  const leftEndX = leftStartX + (3 * arrowSpacing);


  const baseX = (leftEndX + rightStartX) / 2;
  const baseY = height - 100;

  const isHype = teamCombo > 50;

  const pulse = isHype ? (0.10 * sin(frameCount * 0.25)) : 0;
  const bumpScale = comboBump * 0.25;
  const scaleAmt = 1 + pulse + bumpScale;

  const shake = isHype ? (2.5 * comboPulse) : 0;
  const jx = isHype ? random(-shake, shake) : 0;
  const jy = isHype ? random(-shake, shake) : 0;

  push();
  translate(baseX + jx, baseY + jy);
  scale(scaleAmt);

  textAlign(CENTER, CENTER);
  noStroke();

  if (isHype) {
    fill(255, 35 + 70 * comboPulse);
    textSize(56);
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (dx === 0 && dy === 0) continue;
        text(`${teamCombo}`, dx, dy + 18);
      }
    }
  }


  fill(255, 170);
  textSize(18);
  text("TEAM COMBO", 0, -18);


  fill(255);
  textSize(isHype ? 58 : 46);
  text(`${teamCombo}`, 0, 18);

  pop();
}