/* ==========================================================================
   PLAYER ENTITY - LA LÉGENDE D'EL AGATHA
   ========================================================================== */

class Player {
    constructor(canvasWidth, canvasHeight, assets) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.assets = assets;

        this.x = canvasWidth / 2 - 30;
        this.y = canvasHeight - 140;
        this.width = 60;
        this.height = 70;
        this.speed = 260;
        this.hp = 100;
        this.invulnerableTimer = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.isMoving = false;
        this.shieldHits = 0;
        this.speedBuffTimer = 0;
    }

    update(dt, keys) {
        let dx = 0;
        let dy = 0;

        if (keys.ArrowLeft || keys.KeyA) dx -= 1;
        if (keys.ArrowRight || keys.KeyD) dx += 1;
        if (keys.ArrowUp || keys.KeyW) dy -= 1;
        if (keys.ArrowDown || keys.KeyS) dy += 1;

        this.isMoving = (dx !== 0 || dy !== 0);

        if (this.isMoving) {
            const len = Math.hypot(dx, dy);
            dx /= len;
            dy /= len;

            const currentSpeed = (this.speedBuffTimer > 0) ? this.speed * 1.5 : this.speed;
            this.x += dx * currentSpeed * dt;
            this.y += dy * currentSpeed * dt;

            this.x = Math.max(30, Math.min(this.canvasWidth - this.width - 30, this.x));
            this.y = Math.max(180, Math.min(this.canvasHeight - this.height - 30, this.y));

            this.animTimer += dt;
            if (this.animTimer > 0.12) {
                this.animFrame = (this.animFrame + 1) % 4;
                this.animTimer = 0;
            }
        } else {
            this.animFrame = 0;
        }

        if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
        if (this.speedBuffTimer > 0) this.speedBuffTimer -= dt;
    }

    takeDamage(amount, onGameOverCallback, onToastCallback) {
        if (this.invulnerableTimer > 0) return;

        if (this.shieldHits > 0) {
            this.shieldHits--;
            if (onToastCallback) onToastCallback("🥊 Melvin", "Bouclier de Melvin a absorbé le choc !");
            this.invulnerableTimer = 0.8;
            return;
        }

        this.hp -= amount;
        this.hp = Math.round(this.hp * 10) / 10;

        if (this.hp <= 0.9) {
            this.hp = 0;
        }

        this.invulnerableTimer = 1.0;

        if (this.hp <= 0) {
            GameEngine.getInstance().triggerGameOver();
        }
    }

    draw(ctx) {
        if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
            return;
        }

        const spriteName = 'agatha' + this.animFrame;
        const sprite = this.assets.images[spriteName] || this.assets.images.agatha0;

        if (sprite) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#ec4899';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        if (this.shieldHits > 0) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 42, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
            ctx.fill();
        }
    }
}
