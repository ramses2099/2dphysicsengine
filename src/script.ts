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

class Vect2d {
    x: number
    y: number

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    add(v: Vect2d): Vect2d {
        return new Vect2d(this.x + v.x, this.y + v.y)
    }

    sub(v: Vect2d): Vect2d {
        return new Vect2d(this.x - v.x, this.y - v.y)
    }

    mult(n: number): Vect2d {
        return new Vect2d(this.x * n, this.y * n)
    }

    mag(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2)
    }

    unit(): Vect2d {
        if (this.mag() === 0) {
            return new Vect2d()
        } else {
            return new Vect2d(this.x / this.mag(), this.y / this.mag())
        }
    }

    normal(): Vect2d {
        return new Vect2d(-this.y, this.x)
    }
}

class Player implements IObject {
    pos: Vect2d
    vec: Vect2d
    acc: Vect2d
    speed: number
    friction: number
    r: number

    constructor(pos: Vect2d, r: number) {
        this.pos = pos;
        this.vec = new Vect2d(0, 0)
        this.acc = new Vect2d(0, 0)
        this.speed = 4
        this.friction = 0.1
        this.r = r
    }

    update(dt: number): void {
        if (LEFT) {
            this.acc.x -= this.speed;
        }
        if (RIGHT) {
            this.acc.x += this.speed;
        }
        if (UP) {
            this.acc.y -= this.speed;
        }
        if (DOWN) {
            this.acc.y += this.speed;
        }

        if (!DOWN && !UP) {
            this.acc.y = 0;
        }
        //
        if (!RIGHT && !LEFT) {
            this.acc.x = 0;
        }

        this.vec = this.vec.add(this.acc)
        this.vec = this.vec.mult(1 - this.friction)
        this.pos.x += this.vec.x * dt;
        this.pos.y += this.vec.y * dt;

    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#2d889c';
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
        ctx.fill()
        ctx.stroke()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 3;
        ctx.stroke()
    }

    displayDirection(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y)
        ctx.lineTo(this.pos.x + this.acc.x * 2, this.pos.y + this.acc.y * 2)
        ctx.strokeStyle = '#0508a8';
        ctx.stroke()

        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y)
        ctx.lineTo(this.pos.x + this.vec.x * 2, this.pos.y + this.vec.y * 2)
        ctx.strokeStyle = '#eb1e24';
        ctx.stroke()
    }

}

class Ball implements IObject {
    x: number;
    y: number;
    r: number;

    constructor(x: number, y: number, r: number) {
        this.x = x;
        this.y = y;
        this.r = r;

    }
    update(dt: number): void {

    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#ec2f0e';
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

const objectArray: Array<IObject> = new Array<IObject>();
const player = new Player(new Vect2d(250, 50), 25)
const other = new Ball(150, 50, 25)

objectArray.push(player, other);

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
    for (const o of objectArray) {
        o.draw(ctx)
    }
    //direction player
    player.displayDirection(ctx)

}

const updateObject = (deltatime: number): void => {
    for (const o of objectArray) {
        o.update(deltatime)
    }
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