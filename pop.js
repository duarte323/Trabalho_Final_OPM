const gameState = {
  MENU: 0,
  GAME: 1,
  END: 2,
};

let state = gameState.MENU;
let song;
let notes = [];
let fft;
let lastNoteTime = 0;
let gameStartTime;
let score = 0;
let activeArrows = [false, false, false, false];
let noteTravelTime;
let songDuration;

function preload() {
  song = loadSound("593910__szegvari__fish-cinematic-soundtrack-background-music.mp3", () => {
    songDuration = song.duration();
    song.onended(songEnded)
  });
  img = loadImage("Design sem nome.png");
}

function setup() {
  createCanvas(1280, 800);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  textSize(32);
  fft = new p5.FFT(0.8, 32);
  noteTravelTime = (height - 100) / 5;
}

function draw() {
  switch (state) {
    case gameState.MENU:
      drawMenu();
      break;
    case gameState.GAME:
      drawGame();
      break;
    case gameState.END:
      drawEndSequence();
      break;
  }
}

function drawMenu() {
  background(0);
  textSize(32);
  fill(255);
  text("Clica ENTER para começar", width / 2, height / 2);
}

function drawEndSequence() {
  background(0);
  fill(255);
  textSize(32);
  textStyle(BOLD);
  text("RITMO DO MEDO", width / 2, height / 2 - 300);
  image(img, width / 2 - 125, height / 2 - 280, 250, 250);
  textStyle(NORMAL);
  text("", width / 2, height / 2 - 10);
  text("Score: " + score, width / 2, height / 2 + 45);
  textSize(24);
  text("Clica ENTER para voltar ao menu", width / 2, height / 2 + 100);
}

function songEnded() {
  state = gameState.END;
}

function keyPressed() {
  let arrowIndex;

  if (keyCode === ESCAPE) {
    window.location.href = "index.html";
  }

  if (keyCode === LEFT_ARROW) {
    arrowIndex = 0;
  } else if (keyCode === UP_ARROW) {
    arrowIndex = 1;
  } else if (keyCode === DOWN_ARROW) {
    arrowIndex = 2;
  } else if (keyCode === RIGHT_ARROW) {
    arrowIndex = 3;
  }

  if (arrowIndex !== undefined) {
    activeArrows[arrowIndex] = true;
  }

  if (keyCode === 13) {
    if (state === gameState.MENU) {
      state = gameState.GAME;
      song.play();
      gameStartTime = millis();
    } else if (state === gameState.GAME) {
      song.stop();
      state = gameState.MENU;
    } else if (state === gameState.END) {
      window.location.href = '../index.html';
    }
  } else if (state === gameState.GAME) {
    const hitNoteIndex = notes.findIndex(note => {
      return note.arrowIndex === arrowIndex && note.y >= height - 150 && note.y <= height - 50;
    });

    if (hitNoteIndex !== -1 && !notes[hitNoteIndex].pressed) {
      score += 100;
      notes[hitNoteIndex].pressed = true;
      notes.splice(hitNoteIndex, 1);
    } else if (arrowIndex !== undefined && (hitNoteIndex === -1 || (hitNoteIndex !== -1 && notes[hitNoteIndex].pressed))) {
      score -= 50;
    }
  }
}


function drawScore() {
  fill(255);
  textSize(32);
  text(`Score: ${score}`, width / 2, 40);
}



function drawGame() {
  background(0);
  drawArrows();
  drawScore();

  fft.analyze();

  generateNotes();

  for (let i = notes.length - 1; i >= 0; i--) {
    const note = notes[i];
    note.update();
    note.display();

    if (note.missed()) {
      score -= 50;
      note.pressed = true;
    }

    if (note.offScreen() || note.pressed) {
      notes.splice(i, 1);
    }
  }
}

function generateNotes() {
  let currentTime = millis() - gameStartTime - noteTravelTime;

  if (currentTime - lastNoteTime >= 200) {
    let bass = fft.getEnergy("bass");
    let mid = fft.getEnergy("mid");
    let treble = fft.getEnergy("treble");
    let lowMid = fft.getEnergy("lowMid");
    let highMid = fft.getEnergy("highMid");

    let direction = round(random(0, 3));

    switch (direction) {
      case 0:
        if (bass > 230) {
          notes.push(new Arrow("LEFT"));
        }
        break;
      case 1:
        if (mid > 225) {
          notes.push(new Arrow("UP"));
        }
        break;
      case 2:
        if (lowMid > 100 && treble > 110) {
          notes.push(new Arrow("DOWN"));
        }
        break;
      case 3:
        if (highMid > 120 && bass > 100) {
          notes.push(new Arrow("RIGHT"));
        }
        break;
    }

    lastNoteTime = currentTime;
  }
}

function drawArrow(x, y, rotation, colorVal) {
  // left
  if (rotation == 0) {
    fill(255)
    rect(x, y, 55, 25);
    triangle(x - 55, y, x - 20, y - 34, x - 20, y + 34);
    rectMode(CENTER);
    noStroke();
    fill(255);
    rect(x, y, 50, 20);
    triangle(x - 52, y, x - 22, y - 29, x - 22, y + 29);
    // creates inner black arrow
    fill(255);
    rect(x - 5, y, 50, 8)
    triangle(x - 42, y, x - 28, y + 15, x - 28, y - 15);
  }
  // up
  else if (rotation == 1) {
    fill(255)
    rect(x, y, 25, 55);
    triangle(x - 35, y - 18, x, y - 53, x + 35, y - 18);
    rectMode(CENTER);
    noStroke();
    fill(255);
    rect(x, y, 20, 50);
    triangle(x - 30, y - 20, x, y - 50, x + 30, y - 20);
    fill(255);
    rect(x, y - 5, 8, 50);
    triangle(x - 15, y - 25, x, y - 40, x + 15, y - 25);
  }
  // down
  else if (rotation == 2) {
    fill(255)
    rect(x, y, 25, 55);
    triangle(x - 35, y + 18, x, y + 53, x + 35, y + 18);
    rectMode(CENTER);
    noStroke();
    fill(255);
    rect(x, y, 20, 50);
    triangle(x - 30, y + 20, x, y + 50, x + 30, y + 20);
    fill(255);
    rect(x, y + 5, 8, 50);
    triangle(x - 15, y + 25, x, y + 40, x + 15, y + 25);
  }
  // right
  else if (rotation == 3) {
    fill(255)
    rect(x, y, 55, 25);
    triangle(x + 55, y, x + 20, y - 34, x + 20, y + 34);
    rectMode(CENTER);
    noStroke();
    fill(255);
    rect(x, y, 50, 20);
    triangle(x + 52, y, x + 22, y - 29, x + 22, y + 29);
    fill(255);
    rect(x + 5, y, 50, 8)
    triangle(x + 42, y, x + 28, y + 15, x + 28, y - 15);
  }
}

function drawArrows() {
  const arrowSize = 60;
  const yPos = height - 100;
  const xOffset = width / 2 - 1.5 * arrowSize;

  for (let i = 0; i < 4; i++) {
    let x = xOffset + i * arrowSize;
    let colorVal = activeArrows[i] ? color(255, 255, 255) : color(0, 0, 0);
    drawArrow(x, yPos, i, colorVal);
  }
}

class Arrow {
  constructor(direction) {
    this.direction = direction;
    this.y = 0;
    this.speed = 5;
    this.pressed = false;
    const arrowSize = 60;
    const xOffset = width / 2 - 1.5 * arrowSize;

    switch (this.direction) {
      case "LEFT":
        this.x = xOffset;
        this.arrowIndex = 0;
        break;
      case "UP":
        this.x = xOffset + arrowSize;
        this.arrowIndex = 1;
        break;
      case "DOWN":
        this.x = xOffset + 2 * arrowSize;
        this.arrowIndex = 2;
        break;
      case "RIGHT":
        this.x = xOffset + 3 * arrowSize;
        this.arrowIndex = 3;
        break;
    }
  }

  update() {
    this.y += this.speed;
  }

  display() {
    let rotation;
    let colorVal = color(0);

    switch (this.direction) {
      case "LEFT":
        rotation = 0;
        colorVal = color(255, 0, 0);
        break;
      case "UP":
        rotation = 1;
        colorVal = color(0, 255, 0);
        break;
      case "DOWN":
        rotation = 2;
        colorVal = color(0, 0, 255);
        break;
      case "RIGHT":
        rotation = 3;
        colorVal = color(255, 255, 0);
        break;
    }

    push();
    translate(this.x, this.y);
    drawArrow(0, 0, rotation, colorVal);
    pop();
  }

  offScreen() {
    return this.y > height;
  }

  removeIfHit() {
    if (this.y >= height - 150 && this.y <= height - 50 && activeArrows[this.arrowIndex] && !this.pressed) {
      this.pressed = true;
      return true;
    }
    return false;
  }

  missed() {
    return this.y > height - 50 && !this.pressed;
  }
}


function keyReleased() {
  let arrowIndex;

  if (keyCode === LEFT_ARROW) {
    arrowIndex = 0;
  } else if (keyCode === UP_ARROW) {
    arrowIndex = 1;
  } else if (keyCode === DOWN_ARROW) {
    arrowIndex = 2;
  } else if (keyCode === RIGHT_ARROW) {
    arrowIndex = 3;
  }

  if (arrowIndex !== undefined) {
    activeArrows[arrowIndex] = false;
  }
}

