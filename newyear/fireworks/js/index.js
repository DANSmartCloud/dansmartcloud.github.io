var Fireworks = function(){
	/*=============================================================================*/	
	/* Utility
	/*=============================================================================*/
	var self = this;
	var rand = function(rMi, rMa){return ~~((Math.random()*(rMa-rMi+1))+rMi);}
	var hitTest = function(x1, y1, w1, h1, x2, y2, w2, h2){return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);};
	window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)}}();
	
	/*=============================================================================*/	
	/* Initialize
	/*=============================================================================*/
	self.init = function(){	
    self.dt = 0;
		self.oldTime = Date.now();
		self.canvas = document.createElement('canvas');				
		self.canvasContainer = $('#canvas-container');
		
		var canvasContainerDisabled = document.getElementById('canvas-container');
		self.canvas.onselectstart = function() {
			return false;
		};
		
		self.canvas.width = self.cw = 1920;
		self.canvas.height = self.ch =1080;	
		
		self.particles = [];	
		self.烟花散开数量 = 30;
		self.fireworks = [];	
		self.mx = self.cw/2;
		self.my = self.ch/2;
		self.currentHue = 170;
		self.速度 = 5;
		self.烟花散开速度差 = 10;
		self.部件风速 = 50;
		self.烟花散开阻力 = 5;
		self.重力方向 = 1;
		self.色调最小值 = 150;
		self.色调最大值 = 200;
		self.发射速度 = 2;
		self.发射速率 = 4;
		self.色调差值 = 30;
		self.烟花密度 = 20;
		self.冲击波 = false;
		self.目标圆环 = true;
		self.消失时长 = 25;

		self.canvasContainer.append(self.canvas);
		self.ctx = self.canvas.getContext('2d');
		self.ctx.lineCap = 'round';
		self.ctx.lineJoin = 'round';
		self.烟花粗细 = 1;
		self.bindEvents();			
		self.canvasLoop();
		
		self.canvas.onselectstart = function() {
			return false;
		};
    
		
	};		
	
	/*=============================================================================*/	
	/* Particle Constructor
	/*=============================================================================*/
	var Particle = function(x, y, hue){
		this.x = x;
		this.y = y;
		this.coordLast = [
			{x: x, y: y},
			{x: x, y: y},
			{x: x, y: y}
		];
		this.angle = rand(0, 360);
		this.speed = rand(((self.速度 - self.烟花散开速度差) <= 0) ? 1 : self.速度 - self.烟花散开速度差, (self.速度 + self.烟花散开速度差));
		this.friction = 1 - self.烟花散开阻力/100;
		this.gravity = self.重力方向/2;
		this.hue = rand(hue-self.色调差值, hue+self.色调差值);
		this.brightness = rand(50, 80);
		this.alpha = rand(40,100)/100;
		this.decay = rand(10, 50)/1000;
		this.wind = (rand(0, self.部件风速) - (self.部件风速/2))/25;
		this.烟花粗细 = self.烟花粗细;
	};
	
	Particle.prototype.update = function(index){
		var radians = this.angle * Math.PI / 180;
		var vx = Math.cos(radians) * this.speed;
		var vy = Math.sin(radians) * this.speed + this.gravity;
		this.speed *= this.friction;
						
		this.coordLast[2].x = this.coordLast[1].x;
		this.coordLast[2].y = this.coordLast[1].y;
		this.coordLast[1].x = this.coordLast[0].x;
		this.coordLast[1].y = this.coordLast[0].y;
		this.coordLast[0].x = this.x;
		this.coordLast[0].y = this.y;
		
		this.x += vx * self.dt;
		this.y += vy * self.dt;
		
		this.angle += this.wind;				
		this.alpha -= this.decay;
		
		if(!hitTest(0,0,self.cw,self.ch,this.x-this.radius, this.y-this.radius, this.radius*2, this.radius*2) || this.alpha < .05){					
			self.particles.splice(index, 1);	
		}			
	};
	
	Particle.prototype.draw = function(){
		var coordRand = (rand(1,3)-1);
		self.ctx.beginPath();								
		self.ctx.moveTo(Math.round(this.coordLast[coordRand].x), Math.round(this.coordLast[coordRand].y));
		self.ctx.lineTo(Math.round(this.x), Math.round(this.y));
		self.ctx.closePath();				
		self.ctx.strokeStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+this.alpha+')';
		self.ctx.stroke();				
		
		if(self.烟花密度 > 0){
			var inverseDensity = 50 - self.烟花密度;					
			if(rand(0, inverseDensity) === inverseDensity){
				self.ctx.beginPath();
				self.ctx.arc(Math.round(this.x), Math.round(this.y), rand(this.烟花粗细,this.烟花粗细+3)/2, 0, Math.PI*2, false)
				self.ctx.closePath();
				var randAlpha = rand(50,100)/100;
				self.ctx.fillStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+randAlpha+')';
				self.ctx.fill();
			}	
		}
	};
	
	/*=============================================================================*/	
	/* Create Particles
	/*=============================================================================*/
	self.createParticles = function(x,y, hue){
		var countdown = self.烟花散开数量;
		while(countdown--){						
			self.particles.push(new Particle(x, y, hue));
		}
	};
	
	/*=============================================================================*/	
	/* Update Particles
	/*=============================================================================*/		
	self.updateParticles = function(){
		var i = self.particles.length;
		while(i--){
			var p = self.particles[i];
			p.update(i);
		};
	};
	
	/*=============================================================================*/	
	/* Draw Particles
	/*=============================================================================*/
	self.drawParticles = function(){
		var i = self.particles.length;
		while(i--){
			var p = self.particles[i];				
			p.draw();				
		};
	};
	
	/*=============================================================================*/	
	/* Firework Constructor
	/*=============================================================================*/
	var Firework = function(startX, startY, targetX, targetY){
		this.x = startX;
		this.y = startY;
		this.startX = startX;
		this.startY = startY;
		this.hitX = false;
		this.hitY = false;
		this.coordLast = [
			{x: startX, y: startY},
			{x: startX, y: startY},
			{x: startX, y: startY}
		];
		this.targetX = targetX;
		this.targetY = targetY;
		this.speed = self.发射速度;
		this.angle = Math.atan2(targetY - startY, targetX - startX);
		this.shockwaveAngle = Math.atan2(targetY - startY, targetX - startX)+(90*(Math.PI/180));
		this.acceleration = self.发射速率/100;
		this.hue = self.currentHue;
		this.brightness = rand(50, 80);
		this.alpha = rand(50,100)/100;
		this.烟花粗细 = self.烟花粗细;
		this.targetRadius = 1;
	};
	
	Firework.prototype.update = function(index){
		self.ctx.烟花粗细 = this.烟花粗细;
			
		vx = Math.cos(this.angle) * this.speed,
		vy = Math.sin(this.angle) * this.speed;
		this.speed *= 1 + this.acceleration;				
		this.coordLast[2].x = this.coordLast[1].x;
		this.coordLast[2].y = this.coordLast[1].y;
		this.coordLast[1].x = this.coordLast[0].x;
		this.coordLast[1].y = this.coordLast[0].y;
		this.coordLast[0].x = this.x;
		this.coordLast[0].y = this.y;
		
		if(self.目标圆环){
			if(this.targetRadius < 8){
				this.targetRadius += .25 * self.dt;
			} else {
				this.targetRadius = 1 * self.dt;	
			}
		}
		
		if(this.startX >= this.targetX){
			if(this.x + vx <= this.targetX){
				this.x = this.targetX;
				this.hitX = true;
			} else {
				this.x += vx * self.dt;
			}
		} else {
			if(this.x + vx >= this.targetX){
				this.x = this.targetX;
				this.hitX = true;
			} else {
				this.x += vx * self.dt;
			}
		}
		
		if(this.startY >= this.targetY){
			if(this.y + vy <= this.targetY){
				this.y = this.targetY;
				this.hitY = true;
			} else {
				this.y += vy * self.dt;
			}
		} else {
			if(this.y + vy >= this.targetY){
				this.y = this.targetY;
				this.hitY = true;
			} else {
				this.y += vy * self.dt;
			}
		}				
		
		if(this.hitX && this.hitY){
			var randExplosion = rand(0, 9);
			self.createParticles(this.targetX, this.targetY, this.hue);
			self.fireworks.splice(index, 1);					
		}
	};
	
	Firework.prototype.draw = function(){
		self.ctx.烟花粗细 = this.烟花粗细;
			
		var coordRand = (rand(1,3)-1);					
		self.ctx.beginPath();							
		self.ctx.moveTo(Math.round(this.coordLast[coordRand].x), Math.round(this.coordLast[coordRand].y));
		self.ctx.lineTo(Math.round(this.x), Math.round(this.y));
		self.ctx.closePath();
		self.ctx.strokeStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+this.alpha+')';
		self.ctx.stroke();	
		
		if(self.目标圆环){
			self.ctx.save();
			self.ctx.beginPath();
			self.ctx.arc(Math.round(this.targetX), Math.round(this.targetY), this.targetRadius, 0, Math.PI*2, false)
			self.ctx.closePath();
			self.ctx.烟花粗细 = 1;
			self.ctx.stroke();
			self.ctx.restore();
		}
			
		if(self.冲击波){
			self.ctx.save();
			self.ctx.translate(Math.round(this.x), Math.round(this.y));
			self.ctx.rotate(this.shockwaveAngle);
			self.ctx.beginPath();
			self.ctx.arc(0, 0, 1*(this.speed/5), 0, Math.PI, true);
			self.ctx.strokeStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+rand(25, 60)/100+')';
			self.ctx.烟花粗细 = this.烟花粗细;
			self.ctx.stroke();
			self.ctx.restore();
		}								 
	};
	
	/*=============================================================================*/	
	/* Create Fireworks
	/*=============================================================================*/
	self.createFireworks = function(startX, startY, targetX, targetY){			
		self.fireworks.push(new Firework(startX, startY, targetX, targetY));
	};
	
	/*=============================================================================*/	
	/* Update Fireworks
	/*=============================================================================*/		
	self.updateFireworks = function(){
		var i = self.fireworks.length;
		while(i--){
			var f = self.fireworks[i];
			f.update(i);
		};
	};
	
	/*=============================================================================*/	
	/* Draw Fireworks
	/*=============================================================================*/
	self.drawFireworks = function(){
		var i = self.fireworks.length;			
		while(i--){
			var f = self.fireworks[i];		
			f.draw();
		};
	};
	
	/*=============================================================================*/	
	/* Events
	/*=============================================================================*/
	self.bindEvents = function(){
		$(window).on('resize', function(){			
			clearTimeout(self.timeout);
			self.timeout = setTimeout(function() {
				self.ctx.lineCap = 'round';
				self.ctx.lineJoin = 'round';
			}, 100);
		});
		
		$(self.canvas).on('mousedown', function(e){
			var randLaunch = rand(0, 5);
			self.mx = e.pageX - self.canvasContainer.offset().left;
			self.my = e.pageY - self.canvasContainer.offset().top;
			self.currentHue = rand(self.色调最小值, self.色调最大值);
			self.createFireworks(self.cw/2, self.ch, self.mx, self.my);	
			
			$(self.canvas).on('mousemove.fireworks', function(e){
				var randLaunch = rand(0, 5);
				self.mx = e.pageX - self.canvasContainer.offset().left;
				self.my = e.pageY - self.canvasContainer.offset().top;
				self.currentHue = rand(self.色调最小值, self.色调最大值);
				self.createFireworks(self.cw/2, self.ch, self.mx, self.my);									
			});	
			
		});
		
		$(self.canvas).on('mouseup', function(e){
			$(self.canvas).off('mousemove.fireworks');									
		});
					
	}
	
	/*=============================================================================*/	
	/* Clear Canvas
	/*=============================================================================*/
	self.clear = function(){
		self.particles = [];
		self.fireworks = [];
		self.ctx.clearRect(0, 0, self.cw, self.ch);
	};
  
  /*=============================================================================*/	
	/* Delta
	/*=============================================================================*/
  self.updateDelta = function(){
		var newTime = Date.now();
		self.dt = (newTime - self.oldTime)/16;
		self.dt = (self.dt > 5) ? 5 : self.dt;
		self.oldTime = newTime;	
	}
	
	/*=============================================================================*/	
	/* Main Loop
	/*=============================================================================*/
	self.canvasLoop = function(){
		requestAnimFrame(self.canvasLoop, self.canvas);
    self.updateDelta();
		self.ctx.globalCompositeOperation = 'destination-out';
		self.ctx.fillStyle = 'rgba(0,0,0,'+self.消失时长/100+')';
		self.ctx.fillRect(0,0,self.cw,self.ch);
		self.ctx.globalCompositeOperation = 'lighter';
		self.updateFireworks();
		self.updateParticles();
		self.drawFireworks();			
		self.drawParticles();			
	};
	
	self.init();
  
  var initialLaunchCount = 10;
  while(initialLaunchCount--){
    setTimeout(function(){
 		self.fireworks.push(new Firework(self.cw/2, self.ch, rand(50, self.cw-50), rand(50, self.ch/2)-50));
    }, initialLaunchCount*200);
  }
	
}

/*=============================================================================*/	
/* GUI
/*=============================================================================*/	
var guiPresets = {
			  "preset": "Default",
			  "remembered": {
				"默认方案": {
				  "0": {
					"发射速度": 2,
					"发射速率": 4,
					"冲击波": false,
					"目标圆环": true,
					"烟花散开数量": 30,
					"速度": 5,
					"烟花散开速度差": 10,
					"部件风速": 50,
					"烟花散开阻力": 5,
					"重力方向": 1,
					"烟花密度": 20,
					"色调最小值": 150,
					"色调最大值": 200,
					"色调差值": 30,
					"烟花粗细": 1,
					"消失时长": 25
				  }
				},
				"反重力": {
				  "0": {
					"发射速度": 4,
					"发射速率": 10,
					"冲击波": true,
					"目标圆环": false,
					"烟花散开数量": 150,
					"速度": 5,
					"烟花散开速度差": 10,
					"部件风速": 10,
					"烟花散开阻力": 10,
					"重力方向": -10,
					"烟花密度": 30,
					"色调最小值": 0,
					"色调最大值": 360,
					"色调差值": 30,
					"烟花粗细": 1,
					"消失时长": 50
				  }
				},
				"大金闪花": {
				  "0": {
					"发射速度": 10,
					"发射速率": 20,
					"冲击波": true,
					"目标圆环": true,
					"烟花散开数量": 200,
					"速度": 30,
					"烟花散开速度差": 5,
					"部件风速": 0,
					"烟花散开阻力": 5,
					"重力方向": 0,
					"烟花密度": 0,
					"色调最小值": 20,
					"色调最大值": 30,
					"色调差值": 10,
					"烟花粗细": 1,
					"消失时长": 40
				  }
				},
				"圆头照明烟花": {
				  "0": {
					"发射速度": 3,
					"发射速率": 3,
					"冲击波": true,
					"目标圆环": true,
					"烟花散开数量": 500,
					"速度": 50,
					"烟花散开速度差": 5,
					"部件风速": 0,
					"烟花散开阻力": 0,
					"重力方向": 0,
					"烟花密度": 0,
					"色调最小值": 0,
					"色调最大值": 360,
					"色调差值": 30,
					"烟花粗细": 20,
					"消失时长": 20
				  }
				},
				"彩珠筒": {
				  "0": {
					"发射速度": 10,
					"发射速率": 50,
					"冲击波": false,
					"目标圆环": false,
					"烟花散开数量": 120,
					"速度": 10,
					"烟花散开速度差": 10,
					"部件风速": 100,
					"烟花散开阻力": 50,
					"重力方向": 0,
					"烟花密度": 20,
					"色调最小值": 0,
					"色调最大值": 360,
					"色调差值": 30,
					"烟花粗细": 1,
					"消失时长": 80
				  }
				},
				"树枝式": {
				  "0": {
					"发射速度": 2,
					"发射速率": 2,
					"冲击波": false,
					"目标圆环": false,
					"烟花散开数量": 200,
					"速度": 10,
					"烟花散开速度差": 0,
					"部件风速": 100,
					"烟花散开阻力": 0,
					"重力方向": 2,
					"烟花密度": 50,
					"色调最小值": 0,
					"色调最大值": 360,
					"色调差值": 20,
					"烟花粗细": 4,
					"消失时长": 10
				  }
				},
				"定格": {
				  "0": {
					"发射速度": 4,
					"发射速率": 10,
					"冲击波": false,
					"目标圆环": false,
					"烟花散开数量": 150,
					"速度": 10,
					"烟花散开速度差": 10,
					"部件风速": 100,
					"烟花散开阻力": 3,
					"重力方向": 0,
					"烟花密度": 0,
					"色调最小值": 0,
					"色调最大值": 360,
					"色调差值": 20,
					"烟花粗细": 1,
					"消失时长": 0
				  }
				}
			  },
			  "closed": true,
			  "folders": {
				"Fireworks": {
				  "preset": "Default",
				  "closed": false,
				  "folders": {}
				},
				"Particles": {
				  "preset": "Default",
				  "closed": true,
				  "folders": {}
				},
				"Color": {
				  "preset": "Default",
				  "closed": true,
				  "folders": {}
				},
				"Other": {
				  "preset": "Default",
				  "closed": true,
				  "folders": {}
				}
			  }
			};


var fworks = new Fireworks();
var gui = new dat.GUI({
	autoPlace: false,
	load: guiPresets,
	preset: 'Default'
});
var customContainer = document.getElementById('gui');
customContainer.appendChild(gui.domElement);

var guiFireworks = gui.addFolder('烟花');
guiFireworks.add(fworks, '发射速度').min(1).max(10).step(1);
guiFireworks.add(fworks, '发射速率').min(0).max(50).step(1);
guiFireworks.add(fworks, '冲击波');
guiFireworks.add(fworks, '目标圆环');

var guiParticles = gui.addFolder('尺寸');
guiParticles.add(fworks, '烟花散开数量').min(0).max(500).step(1);	
guiParticles.add(fworks, '速度').min(1).max(100).step(1);
guiParticles.add(fworks, '烟花散开速度差').min(0).max(50).step(1);
guiParticles.add(fworks, '部件风速').min(0).max(100).step(1);
guiParticles.add(fworks, '烟花散开阻力').min(0).max(50).step(1);
guiParticles.add(fworks, '重力方向').min(-20).max(20).step(1);
guiParticles.add(fworks, '烟花密度').min(0).max(50).step(1);

var guiColor = gui.addFolder('颜色');
guiColor.add(fworks, '色调最小值').min(0).max(360).step(1);
guiColor.add(fworks, '色调最大值').min(0).max(360).step(1);
guiColor.add(fworks, '色调差值').min(0).max(180).step(1);

var guiOther = gui.addFolder('更多设置');
guiOther.add(fworks, '烟花粗细').min(1).max(20).step(1);
guiOther.add(fworks, '消失时长').min(0).max(100).step(1);
guiOther.add(fworks, 'clear').name('清空天空');

gui.remember(fworks);