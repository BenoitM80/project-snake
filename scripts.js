window.onload = function()
{
    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var widthInBlocks = canvasWidth / blockSize;
    var heightInBlocks = canvasHeight / blockSize;
    var canvas;
    var ctx;
    var delay = 100;
    var snakee;
    var applee;
    var score;
    var timeout;

    init();

    // INIT PROCEDURE //
    function init()
    {
        // dessin du canvas:
        canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid gray"; 
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";

        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');

        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = "5";

        var centreX = canvasWidth /2;
        var centreY = canvasHeight /2;

        ctx.strokeText("Jeu du Serpent", centreX, centreY-180);
        ctx.fillText("Jeu du Serpent", centreX, centreY-180);

        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyez sur la touche Espace pour commencer.", centreX, centreY-120);
        ctx.fillText("Appuyez sur la touche Espace pour commencer .", centreX, centreY-120);
   
    }

    // RAFRAICHISSEMENT DE L'AFFICHAGE // 
    function refreshCanvas() {
        snakee.go();

        if(snakee.checkCollision()) {
            gameOver();
        } else {
            if(snakee.isEatingApple(applee)) {
                score++;
                snakee.ateApple = true;

                // on vérifie que la nouvelle pomme n'arrive pas sur le serpent
               do {
                applee.setNewPosition();
               }
               while(applee.isOnSnake(snakee));
            }
            
            ctx.clearRect(0,0,canvasWidth, canvasHeight);                
            drawScore();                
            snakee.draw();                
            applee.draw();

            timeout = setTimeout(refreshCanvas, delay);  
        }
    }

    // Génère un x ou un y aléatoire;
    function setRandomRange(valRange) {
        return Math.round(Math.random() * valRange) ;
    }

    // AFFICHAGE DU GAME OVER //
    function gameOver() {
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = "5";

        var centreX = canvasWidth /2;
        var centreY = canvasHeight /2;

        ctx.strokeText("Game over", centreX, centreY-180);
        ctx.fillText("Game over", centreX, centreY-180);

        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyez sur la touche Espace pour rejouer.", centreX, centreY-120);
        ctx.fillText("Appuyez sur la touche Espace pour rejouer.", centreX, centreY-120);

        ctx.restore();
    }

    // AFFICHAGE DU SERPENT ET DE LA POMME //
    function start() {
        score = 0;

        // chargement du serpent:
        snakee = new Snake([[6,4], [5,4], [4,4]], "right");

        // chargement de la pomme:
        var startX = setRandomRange(widthInBlocks-1);
        var startY = setRandomRange(heightInBlocks-1);

        applee = new Apple([startX,startY]);

        clearTimeout(timeout);
        refreshCanvas();
    }

    // DESSINE LE SCORE // 
    function drawScore() {
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var centreX = canvasWidth /2;
        var centreY = canvasHeight /2;

        ctx.fillText(score.toString(),centreX, centreY);       
        ctx.restore();
    }

    // DESSINE UN BLOC //
    function drawBlock(ctx, position) {
        var xPos = position[0] * blockSize;
        var yPos = position[1] * blockSize;

        ctx.fillRect(xPos,yPos,blockSize,blockSize);
    }
 
    // CLASSE DU SERPENT //
    function Snake(body,direction) {     
        this.body = body;
        this.direction = direction;
        this.ateApple = false;

        // dessine le corps du serpent :
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "#ff0000";

            for (var i = 0; i < this.body.length; i++) {
                drawBlock(ctx, this.body[i]);
            }

            ctx.restore();
        }; 
        
        // déplace le serpent:
        this.go = function() {
            var nextPos = this.body[0].slice();
            
            switch(this.direction) {
                case "left" :
                    nextPos[0] -= 1;
                    break;

                case "right":
                    nextPos[0] += 1;
                    break;

                case "down":
                    nextPos[1] += 1;
                    break;

                case "up":
                    nextPos[1] -= 1;
                    break;

                default:
                    throw("invalid Direction");
            }

            this.body.unshift(nextPos);

            // on rajoute un morceau au serpent s'il a mangé une pomme:
            if(!this.ateApple)         
                this.body.pop();
            else
                this.ateApple=false;
        };

        // gestion des directions autorisées lors du déplacement du serpent:
        this.setDirection = function(newDirection) {
            var allowedDirections;

            switch(this.direction) {
                case "left": 
                case "right":
                    allowedDirections = ["up", "down"];                     
                    break;

                case "up":                   
                case "down": 
                    allowedDirections = ["left", "right" ];                    
                    break; 

                default:
                    throw("invalid Direction");
            }

            if(allowedDirections.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };

        // test des collisions (murs et corps):
        this.checkCollision = function() {
            var wallCollision = false;
            var snakeCollision = false;

            var snakeHead = this.body[0]; /* 1er élément du serpent */
            var snakeBody = this.body.slice(1); /** tous les élément du serpent sauf le 1er */

            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;

            /** collision avec un mur (horizontal ou vertical) */
            isNotBtwHorizontalWalls = snakeHead[0] < minX || snakeHead[0] > maxX;
            isNotBtwVerticalWalls = snakeHead[1] < minY || snakeHead[1] > maxY;

            if(isNotBtwHorizontalWalls || isNotBtwVerticalWalls) {
                wallCollision = true;
            }

            /** collision avec le reste du corps du serpent */
            for(var i=0;i < snakeBody.length;i++) {
                if(snakeHead[0] == snakeBody[i][0] && snakeHead[1] == snakeBody[i][1]) {
                    snakeCollision = true;
                }
            }

            return wallCollision || snakeCollision;
        };

        // test de collision avec la pomme:
        this.isEatingApple = function(appleToEat) {
            var snakeHead = this.body[0];
            
            if(snakeHead[0] == appleToEat.position[0] && snakeHead[1] === appleToEat.position[1])            
                return true;
            else
                return false;
        }
    }
    
    // CLASSE DE LA POMME //
    function Apple(position) {
        this.position = position;

        // dessin de la pomme:
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();

            var radius = blockSize/2 ;
            var x = this.position[0]*blockSize + radius;
            var y = this.position[1]*blockSize + radius;

            ctx.arc(x,y,radius,0,Math.PI*2,true);
            ctx.fill();

            ctx.restore();
        };

        // définit une nouvelle position aléatoire à la pomme:
        this.setNewPosition = function() {
            var newX = setRandomRange(widthInBlocks-1);
            var newY = setRandomRange(heightInBlocks-1);

            this.position = [newX,newY];
        };

        // test pour savoir si la nouvelle pomme n'apparaît pas sur le serpent:
        this.isOnSnake = function(snakeToCheck) {
            var isOnSnake=false;

            for(var i=0;i<snakeToCheck.body.length;i++)
            {
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1])
                {
                   isOnSnake=true; 
                   break;
                }                
            }

            return isOnSnake;
        };
    } 
  
    // GESTION DU CLAVIER //
    document.onkeydown = function handleKeyDown(e) {
        var key = e.keyCode;

        console.log('key', key);

        var newDirection;

        switch(key) {
            case 37:    // flèche gauche
                newDirection = "left";
                break;
            
            case 38:    // flèche haut
                newDirection = "up";
                break;
            
            case 39:    // flèche droit
                newDirection = "right";
                break;
            
            case 40:    // flèche bas
                newDirection = "down";
                break;

            case 32:    // espace
                start();
                return;

            default:
            return;
        }

        snakee.setDirection(newDirection)
    }
}