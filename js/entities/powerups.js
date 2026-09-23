/* ==========================================================================
   POWERUPS & COLLECTIBLES - LA LÉGENDE D'EL AGATHA
   ========================================================================== */

class NoteCollectible {
    constructor(canvasWidth, canvasHeight) {
        this.x = 80 + Math.random() * (canvasWidth - 160);
        this.y = 200 + Math.random() * (canvasHeight - 300);
        this.width = 36;
        this.height = 36;
        this.floatTimer = Math.random() * 5;
    }

    update(dt) {
        this.floatTimer += dt * 3;
    }

    draw(ctx, assets) {
        const offsetY = Math.sin(this.floatTimer) * 6;
        const sprite = assets.images.note;
        if (sprite) {
            ctx.drawImage(sprite, this.x, this.y + offsetY, this.width, this.height);
        } else {
            ctx.fillStyle = '#fde047';
            ctx.fillRect(this.x, this.y + offsetY, this.width, this.height);
        }
    }
}

class PowerUp {
    constructor(type, x, y) {
        this.type = type; // 'shield', 'lucie', or 'weapon'
        this.x = x;
        this.y = y;
        this.width = 44;
        this.height = 44;
        this.timer = 8.0;
        this.floatTimer = Math.random() * 5;
    }

    update(dt) {
        this.floatTimer += dt * 3;
        this.timer -= dt;
        return (this.timer <= 0);
    }

    draw(ctx) {
        const offsetY = Math.sin(this.floatTimer) * 6;
        const centerX = this.x + 22;
        const centerY = this.y + 22 + offsetY;

        ctx.save();

        let mainColor = '#fbbf24';
        let glowColor = '#f59e0b';
        let icon = '🎁';

        if (this.type === 'shield') {
            mainColor = '#fbbf24';
            glowColor = '#f59e0b';
            icon = '🥊';
        } else if (this.type === 'lucie') {
            mainColor = '#ec4899';
            glowColor = '#f43f5e';
            icon = '📣';
        } else if (this.type === 'weapon') {
            mainColor = '#38bdf8';
            glowColor = '#0284c7';
            icon = '⚡';
        }

        // Lueur néon intense et très visible
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 22;

        // Badge de fond sombre et hautement contrasté
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
        ctx.fill();

        // Contour extérieur néon épais
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Icône au centre
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, centerX, centerY + 2);

        ctx.restore();
    }
}

class PlayerAttackProjectile {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.speed = 720;

        const angle = Math.atan2(targetY - y, targetX - x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.angle = angle;
    }

    update(dt, bossZBrush) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (bossZBrush) {
            const bossCenterX = bossZBrush.x + bossZBrush.width / 2;
            const bossCenterY = bossZBrush.y + bossZBrush.height / 2;
            const dist = Math.hypot(this.x - bossCenterX, this.y - bossCenterY);

            if (dist < 65) {
                bossZBrush.takeDamage(15);
                uiManager.showToast("💥 ATTAQUE RÉUSSIE !", "Tir direct sur le Logo ZBrush ! (-15 PV au Boss)");
                return true;
            }
        }

        return (this.x < -50 || this.x > window.innerWidth + 50 || this.y < -50 || this.y > window.innerHeight + 50);
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}
