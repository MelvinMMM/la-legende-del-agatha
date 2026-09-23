/* ==========================================================================
   ENEMIES & PROJECTILES - LA LÉGENDE D'EL AGATHA
   ========================================================================== */

class EnemyStylo {
    constructor(x, y, canvasWidth) {
        this.x = x;
        this.y = y;
        this.canvasWidth = canvasWidth;
        this.width = 44;
        this.height = 44;
        this.vx = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 80);
        this.shootTimer = 1.0 + Math.random() * 1.2;
    }

    update(dt, slowMo, projectiles, player) {
        const timeFactor = slowMo ? 0.4 : 1.0;
        this.x += this.vx * dt * timeFactor;

        if (this.x < 40 || this.x > this.canvasWidth - 80) {
            this.vx *= -1;
        }

        this.shootTimer -= dt * timeFactor;
        if (this.shootTimer <= 0) {
            this.shootTimer = 1.2 + Math.random() * 1.2;
            projectiles.push(new ProjectileEncre(this.x + 18, this.y + 38, player.x + 30, player.y + 35, this.canvasWidth));
        }
    }

    draw(ctx, assets) {
        const sprite = assets.images.stylo;
        if (sprite) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class EnemyEquere {
    constructor(x, y, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.width = 52;
        this.height = 52;
        this.vx = (Math.random() > 0.5 ? 1 : -1) * (170 + Math.random() * 70);
        this.laserTimer = 1.5 + Math.random() * 1.5;
        this.isChargingLaser = false;
        this.laserActive = false;
        this.laserDuration = 0.7;
    }

    update(dt, slowMo, projectiles, player) {
        const timeFactor = slowMo ? 0.4 : 1.0;
        this.x += this.vx * dt * timeFactor;

        if (this.x < 40 || this.x > this.canvasWidth - 80) {
            this.vx *= -1;
        }

        this.laserTimer -= dt * timeFactor;

        if (this.laserTimer <= 0.6 && !this.isChargingLaser) {
            this.isChargingLaser = true;
        }

        if (this.laserTimer <= 0) {
            this.laserActive = true;
            this.laserDuration -= dt * timeFactor;

            if (this.laserDuration > 0 && 
                player.x + player.width > this.x + 18 && 
                player.x < this.x + 38) {
                player.takeDamage(15);
            }

            if (this.laserDuration <= 0) {
                this.laserTimer = 1.8 + Math.random() * 1.5;
                this.isChargingLaser = false;
                this.laserActive = false;
                this.laserDuration = 0.7;
            }
        }
    }

    draw(ctx, assets) {
        const sprite = assets.images.equere;
        if (sprite) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        if (this.isChargingLaser && !this.laserActive) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(this.x + 26, this.y + 52);
            ctx.lineTo(this.x + 26, this.canvasHeight);
            ctx.stroke();
        }

        if (this.laserActive) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 16;
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.moveTo(this.x + 26, this.y + 52);
            ctx.lineTo(this.x + 26, this.canvasHeight);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
}

class EnemyCasier {
    constructor(x, y, canvasWidth, direction = 1, isTargeter = false) {
        this.x = x;
        this.y = y;
        this.canvasWidth = canvasWidth || window.innerWidth;
        this.width = 65;
        this.height = 110;
        this.vx = direction * (240 + Math.random() * 80);
        this.isOpen = false;
        this.openTimer = 0.4 + Math.random() * 0.7;
        this.openDuration = 0.5;
        this.shotsFired = false;
        this.isTargeter = isTargeter;
    }

    update(dt, slowMo, projectiles, player) {
        const timeFactor = slowMo ? 0.4 : 1.0;

        this.x += this.vx * dt * timeFactor;
        if (this.x < 30) {
            this.x = 30;
            this.vx *= -1;
        } else if (this.x > this.canvasWidth - this.width - 30) {
            this.x = this.canvasWidth - this.width - 30;
            this.vx *= -1;
        }

        this.openTimer -= dt * timeFactor;

        if (this.openTimer <= 0) {
            this.isOpen = true;
            this.openDuration -= dt * timeFactor;

            if (!this.shotsFired && this.openDuration < 0.4) {
                this.shotsFired = true;

                if (this.isTargeter && player) {
                    const targetX = player.x + 30;
                    const targetY = player.y + 35;
                    projectiles.push(new ProjectilePiqueCible(this.x + 10, this.y + 90, targetX, targetY));
                    projectiles.push(new ProjectilePiqueCible(this.x + 28, this.y + 90, targetX, targetY));
                    projectiles.push(new ProjectilePiqueCible(this.x + 46, this.y + 90, targetX, targetY));
                } else {
                    projectiles.push(new ProjectilePique(this.x + 10, this.y + 90));
                    projectiles.push(new ProjectilePique(this.x + 28, this.y + 90));
                    projectiles.push(new ProjectilePique(this.x + 46, this.y + 90));
                }
            }

            if (this.openDuration <= 0) {
                this.isOpen = false;
                this.shotsFired = false;
                this.openTimer = 0.4 + Math.random() * 0.8;
                this.openDuration = 0.5;
            }
        }
    }

    draw(ctx, assets) {
        const sprite = this.isOpen ? assets.images.casierOpen : assets.images.casierClosed;
        if (sprite) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.isOpen ? '#ef4444' : '#475569';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        if (this.isTargeter) {
            ctx.save();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
            ctx.fillStyle = '#ef4444';
            ctx.font = '14px sans-serif';
            ctx.fillText('🎯', this.x + 23, this.y - 6);
            ctx.restore();
        }
    }
}

// --- MINI-BOSS ZBRUSH NIVEAU 4 (AVEC 8 VAGUES D'ATTAQUES ÉVOLUTIVES) ---
class BossZBrush {
    constructor(canvasWidth, canvasHeight) {
        this.width = 130;
        this.height = 130;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight / 2 - 140;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.hp = 100;
        this.maxHp = 100;
        this.rotationAngle = 0;
        this.shootTimer = 1.0;
        this.hitFlashTimer = 0;
        this.isBoss = true;

        this.burstQueue = [];
    }

    update(dt, slowMo, projectiles, player) {
        const timeFactor = slowMo ? 0.4 : 1.0;

        this.rotationAngle += dt * 1.8 * timeFactor;
        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;

        // Traitement de la file d'attente des rafales séquentielles
        if (this.burstQueue.length > 0) {
            const nextBurst = this.burstQueue[0];
            nextBurst.delay -= dt * timeFactor;
            if (nextBurst.delay <= 0) {
                nextBurst.action(projectiles, player);
                this.burstQueue.shift();
            }
        }

        // Déclenchement de la vague d'attaque suivante
        this.shootTimer -= dt * timeFactor;
        if (this.shootTimer <= 0) {
            this.executeRandomAttackWave(projectiles, player);
        }
    }

    executeRandomAttackWave(projectiles, player) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Tirage aléatoire parmi 8 VAGUES D'ATTAQUES UNIQUES !
        const waveType = Math.floor(Math.random() * 8) + 1;

        switch (waveType) {
            case 1:
                // Vague 1 : Étoile Octogonale (8 directions classique)
                this.shootTimer = 1.5;
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI / 4) * i + (this.rotationAngle * 0.2);
                    projectiles.push(new ProjectileClay8(centerX, centerY, angle, this.canvasWidth, this.canvasHeight));
                }
                break;

            case 2:
                // Vague 2 : Rafale Spirale (3 Salves Rapides découlantes)
                this.shootTimer = 2.0;
                for (let step = 0; step < 3; step++) {
                    this.burstQueue.push({
                        delay: step * 0.15,
                        action: (projs) => {
                            for (let i = 0; i < 6; i++) {
                                const angle = (Math.PI / 3) * i + (step * 0.25) + this.rotationAngle;
                                projs.push(new ProjectileClay8(centerX, centerY, angle, this.canvasWidth, this.canvasHeight));
                            }
                        }
                    });
                }
                break;

            case 3:
                // Vague 3 : Alternance Croix & Diagonales
                this.shootTimer = 1.8;
                for (let i = 0; i < 4; i++) {
                    const angle = (Math.PI / 2) * i;
                    projectiles.push(new ProjectileClay8(centerX, centerY, angle, this.canvasWidth, this.canvasHeight));
                }
                this.burstQueue.push({
                    delay: 0.25,
                    action: (projs) => {
                        for (let i = 0; i < 4; i++) {
                            const angle = (Math.PI / 2) * i + (Math.PI / 4);
                            projs.push(new ProjectileClay8(centerX, centerY, angle, this.canvasWidth, this.canvasHeight));
                        }
                    }
                });
                break;

            case 4:
                // Vague 4 : Triple Tir Ciblé Direct sur Agatha !
                this.shootTimer = 1.4;
                if (player) {
                    const targetAngle = Math.atan2(player.y + 35 - centerY, player.x + 30 - centerX);
                    projectiles.push(new ProjectileClay8(centerX, centerY, targetAngle, this.canvasWidth, this.canvasHeight));
                    projectiles.push(new ProjectileClay8(centerX, centerY, targetAngle + 0.18, this.canvasWidth, this.canvasHeight));
                    projectiles.push(new ProjectileClay8(centerX, centerY, targetAngle - 0.18, this.canvasWidth, this.canvasHeight));
                }
                break;

            case 5:
                // Vague 5 : Anneau Dense 12 Directions
                this.shootTimer = 2.2;
                for (let i = 0; i < 12; i++) {
                    const angle = (Math.PI / 6) * i;
                    projectiles.push(new ProjectileClay8(centerX, centerY, angle, this.canvasWidth, this.canvasHeight));
                }
                break;

            case 6:
                // Vague 6 : Super Rafale Express (5 Vagues ultra rapides)
                this.shootTimer = 2.4;
                for (let step = 0; step < 5; step++) {
                    this.burstQueue.push({
                        delay: step * 0.12,
                        action: (projs) => {
                            const angle1 = (step * 0.3) + Math.PI / 2;
                            const angle2 = -(step * 0.3) + Math.PI / 2;
                            projs.push(new ProjectileClay8(centerX, centerY, angle1, this.canvasWidth, this.canvasHeight));
                            projs.push(new ProjectileClay8(centerX, centerY, angle2, this.canvasWidth, this.canvasHeight));
                        }
                    });
                }
                break;

            case 7:
                // Vague 7 : Croisement X-Pattern (4 coins)
                this.shootTimer = 1.6;
                for (let i = 0; i < 4; i++) {
                    const angle = (Math.PI / 2) * i + (Math.PI / 4);
                    projectiles.push(new ProjectileClay8(centerX, centerY, angle, this.canvasWidth, this.canvasHeight));
                }
                break;

            case 8:
                // Vague 8 : Nova Déferlante (16 Projectiles 360°)
                this.shootTimer = 2.6;
                for (let i = 0; i < 16; i++) {
                    const angle = (Math.PI / 8) * i;
                    projectiles.push(new ProjectileClay8(centerX, centerY, angle, this.canvasWidth, this.canvasHeight));
                }
                break;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hp = Math.max(0, this.hp);
        this.hitFlashTimer = 0.25;

        if (this.hp <= 0) {
            GameEngine.getInstance().triggerVictory();
        }
    }

    draw(ctx, assets) {
        ctx.save();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 25;

        ctx.translate(centerX, centerY);

        if (this.hitFlashTimer > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, 70, 0, Math.PI * 2);
            ctx.fill();
        }

        const sprite = assets.images.zbrushLogo;
        if (sprite) {
            ctx.drawImage(sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, 0, 60, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Barre de vie du Boss ZBrush
        ctx.save();
        const barWidth = 160;
        const barHeight = 14;
        const barX = centerX - barWidth / 2;
        const barY = this.y - 25;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

        const hpRatio = this.hp / this.maxHp;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`ZBRUSH CORE: ${Math.round(this.hp)}/100`, centerX, barY + 11);
        ctx.restore();
    }
}

class ProjectileEncre {
    constructor(x, y, targetX, targetY, canvasWidth) {
        this.x = x;
        this.y = y;
        this.canvasWidth = canvasWidth;
        this.radius = 9;
        this.speed = 340;

        const angle = Math.atan2(targetY - y, targetX - x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    update(dt, slowMo, player) {
        const timeFactor = slowMo ? 0.4 : 1.0;
        this.x += this.vx * dt * timeFactor;
        this.y += this.vy * dt * timeFactor;

        const dist = Math.hypot(this.x - (player.x + 30), this.y - (player.y + 35));
        if (dist < this.radius + 24) {
            player.takeDamage(10);
            return true;
        }

        return (this.x < 0 || this.x > this.canvasWidth || this.y < 0 || this.y > window.innerHeight);
    }

    draw(ctx) {
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class ProjectilePique {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 32;
        this.speed = 680;
    }

    update(dt, slowMo, player) {
        const timeFactor = slowMo ? 0.4 : 1.0;
        this.y += this.speed * dt * timeFactor;

        const dist = Math.hypot((this.x + 6) - (player.x + 30), (this.y + 15) - (player.y + 35));
        if (dist < 28) {
            player.takeDamage(15);
            return true;
        }

        return (this.y > window.innerHeight + 50);
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(this.x + 6, this.y + 32);
        ctx.lineTo(this.x, this.y);
        ctx.lineTo(this.x + 12, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.x + 6, this.y);
        ctx.lineTo(this.x + 6, this.y - 22);
        ctx.stroke();
        ctx.restore();
    }
}

class ProjectilePiqueCible {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 32;
        this.speed = 650;

        const angle = Math.atan2(targetY - y, targetX - x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.angle = angle;
    }

    update(dt, slowMo, player) {
        const timeFactor = slowMo ? 0.4 : 1.0;
        this.x += this.vx * dt * timeFactor;
        this.y += this.vy * dt * timeFactor;

        const dist = Math.hypot((this.x + 6) - (player.x + 30), (this.y + 16) - (player.y + 35));
        if (dist < 28) {
            player.takeDamage(15);
            return true;
        }

        return (this.x < -50 || this.x > window.innerWidth + 50 || this.y < -50 || this.y > window.innerHeight + 50);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle - Math.PI / 2);

        ctx.fillStyle = '#f87171';
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(6, 32);
        ctx.lineTo(0, 0);
        ctx.lineTo(12, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(6, -22);
        ctx.stroke();

        ctx.restore();
    }
}

class ProjectileClay8 {
    constructor(x, y, angle, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.speed = 370;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    update(dt, slowMo, player) {
        const timeFactor = slowMo ? 0.4 : 1.0;
        this.x += this.vx * dt * timeFactor;
        this.y += this.vy * dt * timeFactor;

        const dist = Math.hypot(this.x - (player.x + 30), this.y - (player.y + 35));
        if (dist < this.radius + 24) {
            player.takeDamage(12);
            return true;
        }

        return (this.x < -40 || this.x > this.canvasWidth + 40 || this.y < -40 || this.y > this.canvasHeight + 40);
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#f87171';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}
