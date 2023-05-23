var opt = {
    count: 5,
    range: {
        x: 20,
        y: 120,
    },
    duration: {
        min: 80,
        max: 100,
    },
    thickness: 2,
    strokeColor: "#fff",
    level: 0.2,
    curved: true,
};

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function ease(t, b, c, d) {
    if ((t /= d / 2) < 1) return (c / 2) * t * t + b;
    return (-c / 2) * (--t * (t - 2) - 1) + b;
}

class Point {
    constructor({ x, y }) {
        this.anchorX = x;
        this.anchorY = y;
        this.x = x;
        this.y = y;
        this.setTarget();
    }

    setTarget() {
        this.initialX = this.x;
        this.initialY = this.y;
        this.targetX = this.anchorX + rand(0, opt.range.x * 2) - opt.range.x;
        this.targetY = this.anchorY + rand(0, opt.range.y * 2) - opt.range.y;
        this.tick = 0;
        this.duration = rand(opt.duration.min, opt.duration.max);
    }

    update() {
        if (this.tick > this.duration) {
            this.setTarget();
        } else {
            var t = this.tick;
            var b = this.initialY;
            var c = this.targetY - this.initialY;
            var d = this.duration;
            this.y = ease(t, b, c, d);

            b = this.initialX;
            c = this.targetX - this.initialX;
            d = this.duration;
            this.x = ease(t, b, c, d);

            this.tick++;
        }
    }

    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
        ctx.fillStyle = "#000";
        ctx.fill();
    }
}

class Wave {
    constructor(ctx, numberPoints, heightOffset, color) {
        this.points = [];
        this.tick = rand(0, 1024);
        this.ctx = ctx;
        this.color = color;
        this._initPoints(numberPoints, heightOffset);
    }

    _initPoints(numberPoints, heightOffset) {
        const spacing = (window.innerWidth + opt.range.x * 2) / (opt.count - 1);
        for (let i = 0; i < numberPoints + 2; i++) {
            this.points.push(
                new Point({
                    x: spacing * (i - 1) - opt.range.x,
                    y: window.innerHeight - window.innerHeight * opt.level - heightOffset,
                })
            );
        }
    }

    updatePoints() {
        this.tick++;
        this.points.map((p) => p.update());
    }

    renderShape() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 0; i < this.points.length - 1; i++) {
            const c = (this.points[i].x + this.points[i + 1].x) / 2;
            const d = (this.points[i].y + this.points[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, c, d);
            // this.ctx.lineTo(this.points[i].x, this.points[i].y, c, d);
        }
        this.ctx.lineTo(window.innerWidth + opt.range.x + opt.thickness, window.innerHeight + opt.thickness);
        this.ctx.lineTo(-opt.range.x - opt.thickness, window.innerHeight + opt.thickness);
        this.ctx.closePath();
        this.ctx.fillStyle = "hsl(" + this.tick / 4 + ", 80%, 60%)";
        // this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.stroke();
    }

    renderPoints() {
        this.points.map((p) => p.render(this.ctx));
    }
}

export function createWaves(howMany) {
    const c = document.createElement("canvas");
    document.body.appendChild(c);
    const ctx = c.getContext("2d");
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    ctx.lineJoin = "round";
    ctx.lineWidth = opt.thickness;
    ctx.strokeStyle = opt.strokeColor;

    // const colors = [
    //     "rgba(255, 0, 0, 0.4)",
    //     "rgba(255, 255, 0, 0.4)",
    //     "rgba(0, 255, 0, 0.4)",
    // ];
    const colors = ["rgba(240, 215, 34, 0.4)", "rgba(240, 215, 34, 0.4)", "#fff"];

    const waves = [];
    for (let i = 0; i < howMany; i++) {
        waves.push(new Wave(ctx, opt.count, (howMany - i) * 100, colors[i]));
    }

    function loop() {
        window.requestAnimFrame(loop, c);
        ctx.clearRect(0, 0, c.width, c.height);
        waves.map((w) => w.updatePoints());
        waves.map((w) => w.renderShape());
        // waves.map((w) => w.renderPoints());
        // console.log(waves);
        // console.log(waves.map((w) => w.points));
        // renderPoints();
    }

    window.requestAnimFrame = (function () {
        return (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (a) {
                window.setTimeout(a, 1e3 / 60);
            }
        );
    })();

    loop();
}
