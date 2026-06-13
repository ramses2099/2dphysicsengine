const canvas: HTMLCanvasElement = document.getElementById('canvas1') as HTMLCanvasElement
const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

const CANVAS_SIZE = { w: 640, h: 480 } as const

const log = <T>(msg: T): void => {
    console.log(`[DEBUG] - ${msg}`)
}

//=====================VARIABLE CONST======================
let lastTime: number = 0
let LEFT: boolean = false
let RIGHT: boolean = false
let UP: boolean = false
let DOWN: boolean = false



//=========================================================

interface IObject {
    update(deltatime: number): void
    draw(ctx: CanvasRenderingContext2D): void
}

class Ball implements IObject {
    x: number;
    y: number;
    r: number;
    isPlayer: boolean

    constructor(x: number, y: number, r: number, isPlayer: boolean = false) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.isPlayer = isPlayer
    }
    update(dt: number): void {
        if (this.isPlayer) {
            if (LEFT) {
                this.x -= this.x * dt;
            }
            if (RIGHT) {
                this.x += this.x * dt;
            }
            if (UP) {
                this.y -= this.y * dt;
            }
            if (DOWN) {
                this.y += this.y * dt;
            }
        }
    }
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#2d889c';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill()
        ctx.stroke()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 3;
        ctx.stroke()
    }
}
//=========================================================

const player = new Ball(250, 50, 25, true)
const other = new Ball(150, 50, 25)

//======================Input Event========================
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        LEFT = true
    } else if (e.key === 'ArrowRight') {
        RIGHT = true
    }
    else if (e.key === 'ArrowUp') {
        UP = true
    }
    else if (e.key === 'ArrowDown') {
        DOWN = true
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        LEFT = false
    } else if (e.key === 'ArrowRight') {
        RIGHT = false
    }
    else if (e.key === 'ArrowUp') {
        UP = false
    }
    else if (e.key === 'ArrowDown') {
        DOWN = false
    }
});
//======================Input Event========================

const drawObject = (): void => {
    //clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE.w, CANVAS_SIZE.h);
    // draw object 
    player.draw(ctx);
    other.draw(ctx);

}

const updateObject = (deltatime: number): void => {
    player.update(deltatime);
}

// animation frame loop
const animateloop = (timeStamp: number) => {
    // calculate the delta time
    const dt = (timeStamp - lastTime) / 1000
    lastTime = timeStamp
    const cappeDt = Math.min(dt, 0.16)

    // Update
    updateObject(cappeDt);
    // Render
    drawObject();

    requestAnimationFrame(animateloop)
}
requestAnimationFrame(animateloop);