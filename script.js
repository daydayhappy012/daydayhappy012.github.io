// Particle Lib

function Particle(x, y, speed, angle) {
    this.x = x;
    this.y = y;
  
    this.vx = Math.cos(angle || 0) * (speed || 0);
    this.vy = Math.sin(angle || 0) * (speed || 0);
  }
  
  Particle.prototype.updatePosition = function () {
    this.x += this.vx;
    this.y += this.vy;
  };
  
  Particle.prototype.draw = function (ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
  };
  
  // Snowing
  
  var numOfSnowParticles = 100;
  var snowParticles = [];
  var windFromLeft = false;
  var windFromRight = false;
  
  function createSnowParticles() {
    let particle = new Particle(Math.random() * screenWidth, -10, 1, 2 * Math.PI / 2 * Math.random());
    particle.originalX = particle.x;
    particle.originalY = particle.y;
    particle.radius = 1 + Math.random() * 2;
    particle.angle = 0;
    particle.speed = .07;
    particle.isDead = false;
    particle.color = "white";
    snowParticles.push(particle);
  }
  
  
  function drawSnowFrame() {
    for (var i = 0; i < snowParticles.length; i++) {
      let particle = snowParticles[i];
  
      if (!particle.isDead) {
  
        particle.updatePosition();
  
        if (!windFromLeft && !windFromRight) {
          particle.x = particle.originalX + Math.sin(particle.angle) * 10;
        } else if (windFromLeft) {
          particle.x += 2;
          particle.originalX = particle.x;
        } else if (windFromRight) {
          particle.x -= 2;
          particle.originalX = particle.x;
        }
  
        particle.y += .1;
        particle.angle += particle.speed;
  
        checkIfParticleTouchesADeadParticle(i);
        checkIfParticleHitsGround(particle);
      }
      particle.draw(context);
    }
  }
  
  function checkIfParticleHitsGround(particle) {
    if (particle.y + particle.radius > screenHeight) {
      particle.y = screenHeight - particle.radius;
      particle.isDead = true;
    }
  }
  
  function checkIfParticleTouchesADeadParticle(index) {
  
    for (var i = index + 1; i < snowParticles.length; i++) {
  
      if (snowParticles[i].isDead) {
        let dx = snowParticles[index].x - snowParticles[i].x;
        let dy = snowParticles[index].y - snowParticles[i].y;
  
        let distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  
        if (distance <= snowParticles[index].radius + snowParticles[i].radius) {
          snowParticles[index].isDead = true;
        }
      }
    }
  }
  
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  
  var xDown = null;
  var yDown = null;
  
  function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
  };
  
  function handleTouchMove(evt) {
    if (!xDown || !yDown) {
      return;
    }
  
    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;
  
    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
  
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        windFromRight = true;
        windFromLeft = false;
      } else {
        windFromLeft = true;
        windFromRight = false;
      }
    } else {
      windFromLeft = windFromRight = false;
    }
  
    xDown = null;
    yDown = null;
  };
  
  // Tree 
  
  var treeParticles = [];
  var treeColors = ['#199642', '#E44822', '#40B8E2', '#F7D231'];
  
  function drawTreeFrame() {
    for (var i = 0; i < treeParticles.length; i++) {
      treeParticles[i].draw(context);
      treeParticles[i].radius = 1 + Math.random() * 3;
    }
  
    if (treeParticles.length > 0) {
      drawStar(centerX, screenHeight * .2, 5, 20, 10);
    }
  }
  
  function getPixelData(imageData, x, y) {
    let basePosition = (screenWidth * y + x) * 4;
    return {
      r: imageData.data[basePosition],
      g: imageData.data[basePosition + 1],
      b: imageData.data[basePosition + 2],
      a: imageData.data[basePosition + 3] };
  
  }
  
  function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    var rot = Math.PI / 2 * 3;
    var x = cx;
    var y = cy;
    var step = Math.PI / spikes;
  
    context.beginPath();
    context.moveTo(cx, cy - outerRadius);
    for (i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      context.lineTo(x, y);
      rot += step;
  
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      context.lineTo(x, y);
      rot += step;
    }
    context.lineTo(cx, cy - outerRadius);
    context.closePath();
    context.lineWidth = 5;
    context.strokeStyle = 'yellow';
    context.stroke();
    context.fillStyle = 'lightyellow';
    context.fill();
  }
  
  function initTree(text) {
    context.clearRect(0, 0, screenWidth, screenHeight);
  
    context.moveTo(centerX, screenHeight * .2);
    context.lineTo(centerX - 100, centerY + 100);
    context.lineTo(centerX + 100, centerY + 100);
    context.fill();
  
    var imageData = context.getImageData(0, 0, screenWidth, screenHeight);
  
    context.clearRect(0, 0, screenWidth, screenHeight);
  
    treeParticles.length = 0;
  
    for (var i = 0; i < screenWidth; i += 10) {
      for (j = 0; j < screenHeight; j += 10) {
  
        let pixelData = getPixelData(imageData, i, j);
  
        if (pixelData.a > 0) {
          let particle = new Particle(i, j);
          particle.color = treeColors[Math.floor(Math.random() * 5)];
          particle.radius = 1 + Math.random() * 3;
          treeParticles.push(particle);
        }
      }
    }
  }
  
  
  //let canvas = document.querySelector('#canvas');
  let context = canvas.getContext('2d');
  let screenWidth = canvas.width = window.innerWidth;
  let screenHeight = canvas.height = window.innerHeight;
  
  var centerX = screenWidth * .5;
  var centerY = screenHeight * .5;
  
  drawFrame();
  function drawFrame() {
    context.clearRect(0, 0, screenWidth, screenHeight);
  
    context.fillStyle = "black";
    context.fillRect(0, 0, screenWidth, screenHeight);
  
    context.fillStyle = "white";
    context.font = "bold 50px Kaushan Script";
    context.textAlign = "center";
    context.fillText("Merry Christmas", centerX, screenHeight * .8);
  
    drawTreeFrame();
    drawSnowFrame();
    requestAnimationFrame(drawFrame);
  }
  
  initTree('hello world');
  setInterval(() => {
    createSnowParticles();
  }, 100);

var text=document.title
var timerId
function newtext() {
    clearTimeout(timerId)                  
    document.title=text.substring(1,text.length)+text.substring(0,1)
    text=document.title.substring(0,text.length)
    timerId = setTimeout("newtext()", 400)
}
newtext();
  
