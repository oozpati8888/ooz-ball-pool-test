import { Controller } from "./Controller.js";
import { openDialog, closeDialog } from "./dialog.js";
import { COLORS } from "./setupBalls.js";
import { SOUND } from "./sound.js";
import { drawCloth, drawWood } from "./table.js";

export class Game {
    constructor({ balls, bumpers, pockets }) {
        this.balls = balls;
        this.bumpers = bumpers;
        this.pockets = pockets;
        this.won = null;
        this.playing = true;
        this.idle = true;
        // Lokaler 2-Spieler-Modus
this.players = ["Spieler 1", "Spieler 2"];
this.currentPlayer = 0;
this.pocketedThisTurn = false;
this.turnMessage = "Spieler 1 ist am Zug";
this.previousPocketedBalls = new Set();
        this.whiteBall = this.balls.find(
            (b) => b.color == COLORS.WHITE
        );
        this.blackBall = this.balls.find(
            (b) => b.color == COLORS.BLACK
        );
        this.controller = new Controller(this.whiteBall);
        this.controller.game = this;
        // Verbindung für die Kollisions- und Spielregeln
this.balls.forEach((ball) => {
    ball.game = this;
});
this.firstContactBall = null;
this.foulThisTurn = false;
this.shotInProgress = false;
this.ballInHand = false;
this.playerGroups = [null, null];
    }

    draw() {
        this.balls.forEach((b) => b.draw());
        this.controller.draw();
    }

    drawTable() {
        drawCloth();
        drawWood();
        this.pockets.forEach((pocket) => pocket.draw());
        this.bumpers.forEach((bumper) => bumper.draw());
        this.pockets.forEach((pocket) => pocket.drawMounting());
    }

    update() {
if (!this.playing) return;

// Vor dem Stoß merken, welche Kugeln bereits versenkt waren.
if (!this.shotInProgress) {
this.previousPocketedBalls = new Set(
this.balls.filter((b) => b.inPocket)
);
}

this.balls.forEach((b) => b.update(this));

this.idle = this.balls.every((b) => b.idle || b.inPocket);

if (this.idle) {
this.controller.active = true;
this.controller.update();

if (this.blackBall.inPocket) {
this.finish();
return;
}

if (this.whiteBall.inPocket) {
SOUND.WHIP.play();
this.whiteBall.reset(this);
this.currentPlayer = 1 - this.currentPlayer;
this.turnMessage =
this.players[this.currentPlayer] + " ist am Zug";
this.shotInProgress = false;
return;
}

const newlyPocketed = this.balls.some(
(b) =>
b !== this.whiteBall &&
b !== this.blackBall &&
b.inPocket &&
!this.previousPocketedBalls.has(b)
);

if (!newlyPocketed && this.shotInProgress) {
this.currentPlayer = 1 - this.currentPlayer;
this.turnMessage =
this.players[this.currentPlayer] + " ist am Zug";
}

this.shotInProgress = false;
} else {
this.shotInProgress = true;
}
}



    
finish() {
    if (!this.blackBall || !this.blackBall.inPocket) {
        return;
    }

    this.playing = false;
    this.controller.active = false;

    const group = this.playerGroups?.[this.currentPlayer];

    const ownBallsLeft = group
        ? this.balls.filter((ball) => {
            if (
                ball === this.whiteBall ||
                ball === this.blackBall ||
                ball.inPocket
            ) {
                return false;
            }

            return group === "solid"
                ? ball.number >= 1 && ball.number <= 7
                : ball.number >= 9 && ball.number <= 15;
        })
        : [];

    this.won =
        !this.whiteBall.inPocket &&
        group != null &&
        ownBallsLeft.length === 0;

    if (this.won) {
        SOUND.WIN.play();
        openDialog("You won!");
    } else {
        SOUND.LOSE.play();
        openDialog("You lost!");
    }
        }
}