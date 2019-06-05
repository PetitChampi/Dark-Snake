class Snake{

    constructor(direction, ...body){
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
    }

    advance(){
        const nextPosition = this.body[0].slice();
        switch(this.direction){
            case "left":
                nextPosition[0]--;//[index de x]-1
                break;
            case "right":
                nextPosition[0]++;
                break;
            case "down":
                nextPosition[1]++;
                break;
            case "up":
                nextPosition[1]--;
                break;
            default:
                throw("Invalid Directoin");
        }
        this.body.unshift(nextPosition);
        if(!this.ateApple)
            this.body.pop();
        else
            this.ateApple = false;
    }
    setDirection(newDirection){
        let allowedDirections;
        switch(this.direction){
                case "left":
                case "right":
                    allowedDirections = ["up", "down"];
                    break;
                case "down":
                case "up":
                    allowedDirections = ["left", "right"];
                    break;
                default:
                    throw("Invalid Direction");
            }
        if(allowedDirections.indexOf(newDirection) > -1)//si l'index de la nouvelle direction est > -1, alors elle est permise. Quand la direction n'est pas dans l'array des allowed directions ci-dessus, alors la valeur retournée est -1
            {
                this.direction = newDirection;
            }
    }
    checkCollision(widthInBlocks, heightInBlocks){
        let wallCollision = false;
        let snakeCollision = false;
        const [head, ...rest] = this.body;
        const [snakeX, snakeY] = head;
        const minX = 0;
        const minY = 0;
        const maxX = widthInBlocks - 1;
        const maxY = heightInBlocks - 1;
        const isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
        const isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
        
        if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls){
                wallCollision = true;
            }
        
        for(let block of rest){
                if(snakeX === block[0] && snakeY === block[1]){
                    snakeCollision = true;
                }
            }
        return wallCollision || snakeCollision;
    }
    isEatingApple(appleToEat){
        const head = this.body[0];
        if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
                return true;
        else
            return false;
    }

}

class Drawing{

    static gameOver(ctx, centreX, centreY) {
        ctx.save();
        ctx.fillStyle = "#aaa";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 5;
        ctx.font = "70px 'press start 2p'";
        ctx.strokeText("Game Over", centreX, centreY - 180);
        ctx.fillText("Game Over", centreX, centreY - 180);//texte à écrire, coordonnées du txt
        ctx.font = " 50px 'vt323'";
        ctx.strokeText("Press Space to play again", centreX, centreY - 120);
        ctx.fillText("Press Space to play again", centreX, centreY - 120);
        ctx.restore();
    }

    static drawScore(ctx, centreX, centreY, score) {
        ctx.save();
        ctx.font = "200px 'press start 2p'";
        ctx.fillStyle = "#454545";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();
    }

    static drawSnake(ctx, blockSize, snake){
        ctx.save();
        ctx.fillStyle = "#33cc33";
        for(let block of snake.body){
            this.drawBlock(ctx, block, blockSize);
        }
        ctx.restore();
    }

    static drawApple(ctx, blockSize, apple){
        const radius = blockSize/2;//rayon du cercle (pomme) = taille d'un bloc/2
        const x = apple.position[0]*blockSize + radius;
        const y = apple.position[1]*blockSize + radius;
        ctx.save();
        ctx.fillStyle = "#ff2c31";
        ctx.beginPath();
        ctx.arc(x,y, radius, 0, Math.PI*2, true);//fonction permettant de dessiner des cercles ou des arcs
        ctx.fill();
        ctx.restore();//si le restore est absent, tout autre dessin sur le canvas sera de la couleur ci-dessus. Fonctionne couplé avec save
    }

    static drawBlock(ctx, position, blockSize) {
        const [x,y] = position;
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize); //(coordonnées, largeur, longueur)
    }
}

class Apple{
    constructor(position = [10,10]){
        this.position = position;
    }
    setNewPosition(widthInBlocks, heightInBlocks){
        const newX = Math.round(Math.random() * (widthInBlocks - 1)); //Math.round = créer un nb entier; Math.random = créer un nb aléatoire
        const newY = Math.round(Math.random() * (heightInBlocks - 1));
        this.position = [newX, newY];
    }
    isOnSnake(snakeToCheck){
        let isOnSnake = false;
        for(let block of snakeToCheck.body){
            if((this.position[0] == block[0]) && (this.position[1] === block[1])){
                isOnSnake = true;
            }
        }
        return isOnSnake;
    }
}

class Game{

    constructor(canvasWidth = 900, canvasHeight = 600){
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.blockSize = 30;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.centreX = this.canvasWidth/2;
        this.centreY = this.canvasHeight/2;
        this.delay = 100; //100 millisecondes
        this.snakey;
        this.appley;
        this.widthInBlocks = this.canvasWidth/this.blockSize;
        this.heightInBlocks = this.canvasHeight/this.blockSize;
        this.score;
        this.timeout;
    }

    init(){
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.canvas.style.border = "30px solid #454545";
        this.canvas.style.margin = "50px auto";
        this.canvas.style.display = "block";
        this.canvas.style.backgroundColor = "#222";
        document.body.appendChild(this.canvas);
        this.launch();
    }

    launch(){
        this.snakey = new Snake("right", [6,4], [5,4], [4,4]);
        this.appley = new Apple();
        this.score = 0;
        this.delay = 100;
        clearTimeout(this.timeout);
        this.refreshCanvas();
    }
    
    doubleSpeed(){
        this.delay /= 1.2;
    }
    
    refreshCanvas(){
        this.snakey.advance();
        if(this.snakey.checkCollision(this.widthInBlocks, this.heightInBlocks)){
                Drawing.gameOver(this.ctx, this.centreX, this.centreY);
        } else{
            if(this.snakey.isEatingApple(this.appley)){
                    this.score++;
                    this.snakey.ateApple = true;
                    do{
                        this.appley.setNewPosition(this.widthInBlocks, this.heightInBlocks);
                    } while(this.appley.isOnSnake(this.snakey));
                if(this.score %5 == 0){
                    this.doubleSpeed();
                }
            }
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            Drawing.drawScore(this.ctx, this.centreX, this.centreY, this.score);
            Drawing.drawSnake(this.ctx, this.blockSize, this.snakey);
            Drawing.drawApple(this.ctx, this.blockSize, this.appley);
            this.timeout = setTimeout(this.refreshCanvas.bind(this), this.delay); // on utilise bind ici pour que le this de refreshCanvas soit l'objet dans lequel on se trouve, sinon ce serait l'objet global puisque setTimeout est une méthode de celui-ci
        }
    }

}

window.onload = () => {

    let myGame = new Game();
    myGame.init();
    
    document.onkeydown = (e) => {
        const key = e.keyCode;
        let newDirection;
        switch(key){
                case 37:
                    newDirection = "left";
                    break;
                case 38:
                    newDirection = "up";
                    break;
                case 39:
                    newDirection = "right";
                    break;
                case 40:
                    newDirection = "down";
                    break;
                case 32:
                    myGame.launch();
                    return; // arrête l'exécution de la fonction
                default:
                    return;
        }
        myGame.snakey.setDirection(newDirection);
    }
    
}
