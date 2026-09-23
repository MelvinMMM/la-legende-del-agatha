/* ==========================================================================
   ENEMY FACTORY (FACTORY PATTERN) - LA LÉGENDE D'EL AGATHA
   ========================================================================== */

class EnemyFactory {
    static createEnemy(type, x, y, canvasWidth, canvasHeight, isTargeter = false) {
        switch (type) {
            case 'stylo':
                return new EnemyStylo(x, y, canvasWidth);
            case 'equere':
                return new EnemyEquere(x, y, canvasWidth, canvasHeight);
            case 'casier':
                const dir = Math.random() > 0.5 ? 1 : -1;
                return new EnemyCasier(x, y, canvasWidth, dir, isTargeter);
            default:
                console.warn(`Unknown enemy type: ${type}`);
                return new EnemyStylo(x, y, canvasWidth);
        }
    }
}
