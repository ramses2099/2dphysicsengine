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

abstract class IObject {
    pos: Vect2d
    vec: Vect2d
    acc: Vect2d
    r: number;

    constructor(pos: Vect2d,
        vec: Vect2d,
        acc: Vect2d,
        r: number = 25) {
        this.pos = pos;
        this.vec = vec;
        this.acc = acc;
        this.r = r;
    }

    abstract update(deltatime: number): void
    abstract draw(ctx: CanvasRenderingContext2D): void
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
        return new Vect2d(-this.y, this.x).unit()
    }

    show(): string {
        return `{x:${this.x},y:${this.y}}`
    }

    static dot(v1: Vect2d, v2: Vect2d): number {
        return v1.x * v2.x + v1.y * v2.y
    }

}

class Player extends IObject {
    speed: number
    friction: number
    r: number

    constructor(pos: Vect2d, r: number) {
        super(pos, new Vect2d(0, 0), new Vect2d(0, 0), r)
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

class Ball extends IObject {

    constructor(pos: Vect2d, r: number) {
        super(pos, new Vect2d(0, 0), new Vect2d(0, 0), r)
    }

    update(dt: number): void {

    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#ec2f0e';
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
        ctx.fill()
        ctx.stroke()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 3;
        ctx.stroke()
    }
}

class CollisionDetect {

    static distanceVector(pos1: Vect2d, pos2: Vect2d): number {
        return pos1.sub(pos2).mag()
    }

    static collision_det_bb(b1: IObject, b2: IObject): boolean {
        let dist = b2.pos.sub(b1.pos).mag()
        let rsum = b2.r + b2.r
        
        if (rsum >= dist) {
            return true
        }

        return false
    }

}

//=========================================================

const objectArray: Array<IObject> = new Array<IObject>();
const player = new Player(new Vect2d(250, 50), 25)
const other = new Ball(new Vect2d(150, 50), 25)
let distanceVec = new Vect2d(0, 0);

objectArray.push(other);

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

        let dv = CollisionDetect.distanceVector(o.pos, player.pos)
        let text = `Distances vec ${dv.toFixed(2)}`
        //drawText(text, new Vect2d(510, 50))

    }
    //direction player
    player.draw(ctx)
    player.displayDirection(ctx)

}

const updateObject = (deltatime: number): void => {
    for (const o of objectArray) {
        o.update(deltatime)

        //collision
        if (CollisionDetect.collision_det_bb(o, player)) {
            let msg = 'collision true'
            drawText(msg, new Vect2d(10, 100))
            log<string>("true")
        }
    }
    player.update(deltatime)
}

const drawText = (msg: string, pos: Vect2d): void => {

    log<string>(`msg: ${msg}, pos ${pos.show()}`)
    ctx.fillStyle = '#fff'
    ctx.fillText(msg, pos.x, pos.y)
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