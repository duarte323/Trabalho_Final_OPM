let ecra = 0;

function setup() {
  createCanvas(1280, 800);

}

function draw() {
  background(255, 255, 255);

  if (ecra === 0) {
    desenharMenu();
  } else if (ecra === 1) {
    desenharJogo(1);
  } else if (ecra === 2) {
    desenharJogo(2);
  }
}

function desenharMenu() {

//fundo2
fill(0, 0, 0)
rect(width / 2 - 560, height / 2 - 320, 1120, 640);

//rect linha
fill(255)
rect(width / 2 - 200, height / 2 - 212, 400, 424);

//rect int
fill(0)
rect(width / 2 - 195, height / 2 - 207, 390, 414);

//1 jogador
fill(255)
rect(width / 2 - 125, height / 2 - 15, 250, 50);
//Text 1
fill(0)
textFont('Verdana');
textSize(20);
text('1 Jogador', width / 2 - 50, height / 2 + 18);

//2 jogador
fill(255)
rect(width / 2 - 125, height / 2 + 65, 250, 50);
//Text 2
fill(0)
textFont('Verdana');
textSize(20);
text('2 Jogadores', width / 2 - 65, height / 2 + 98);

//Tit
fill(255)
textFont('Verdana');
textSize(35);
text('RITMO DO MEDO', width / 2 - 148, height / 2 - 100);

}

function desenharJogo(jogadores) {
  background(255);
  fill(0, 0, 0)

}

function mousePressed() {
  if (ecra === 0) {
    if (mouseX > width / 2 - 125 && mouseX < width / 2 + 125 &&
      mouseY > height / 2 - 15 && mouseY < height / 2 + 35) {
      ecra = 1;
    }

    if (mouseX > width / 2 - 125 && mouseX < width / 2 + 125 &&
      mouseY > height / 2 + 65 && mouseY < height / 2 + 115) {
      ecra = 2;
    }
  }
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    ecra = 0;
  }
}
