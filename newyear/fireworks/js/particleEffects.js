(function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var particles = [];
    var texts = ["禾云信创","2025", "我们祝您","新春快乐", "心想事成", "特效过后","点击屏幕","放烟花!", "❤"];
    var currentTextIndex = 0;
    var text = texts[currentTextIndex];
    var textWidth;
    var centerX, centerY;
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;
    var baseParticleCount = Math.min(canvasWidth, canvasHeight) * 2;
    var maxTextLength = Math.max(...texts.map(t => t.length));
    var particleCount = Math.max(2000, baseParticleCount * (maxTextLength / 4));
    var hue = 0;
    var targetTextParticles = [];
    var transitioning = false;
    var transitionStartTime = 0;
    var transitionDuration = 3000;
    var scatterDuration = 1000;
    var fadeOutDuration = 1000; // 淡出动画持续时间
    var allParticlesCreated = false;
    var gradientSpeed = 2; // 加快颜色流动速度
    var isFadingOut = false;
    var fadeStartTime = 0;

    function init() {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '9999';
        canvas.style.opacity = '1';
        canvas.style.transition = 'opacity 1s ease-out';
        document.body.appendChild(canvas);
        centerX = canvasWidth / 2;
        centerY = canvasHeight / 2;
        createInitialParticles();
        requestAnimationFrame(animate);
    }

    function createInitialParticles() {
        for (var i = 0; i < particleCount; i++) {
            var particle = {
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                alpha: 1 // 添加透明度属性
            };
            particles.push(particle);
        }
        allParticlesCreated = true;
    }

    function animate(timestamp) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 更新全局色相
        hue = (hue + gradientSpeed) % 360;

        // 创建线性渐变
        var gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 100%, 50%, 0.8)`);
        gradient.addColorStop(1, `hsla(${(hue + 120) % 360}, 100%, 50%, 0.8)`);

        particles.forEach(function(particle) {
            var alpha = isFadingOut ? 
                particle.alpha * (1 - (timestamp - fadeStartTime) / fadeOutDuration) : 
                particle.alpha;
            
            if (alpha > 0) {
                ctx.fillStyle = gradient;
                ctx.globalAlpha = alpha;
                ctx.fillRect(particle.x, particle.y, 2, 2);
            }
        });
        ctx.globalAlpha = 1;

        if (isFadingOut) {
            if (timestamp - fadeStartTime >= fadeOutDuration) {
                document.body.removeChild(canvas);
                return;
            }
        } else if (transitioning) {
            transitionParticles(timestamp);
        } else if (allParticlesCreated) {
            transitioning = true;
            transitionStartTime = timestamp;
            targetTextParticles = createTargetParticles();
        }

        requestAnimationFrame(animate);
    }

    function createTargetParticles() {
        var offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvasWidth;
        offscreenCanvas.height = canvasHeight;
        var offscreenCtx = offscreenCanvas.getContext('2d');

        var fontSize = text.length <= 4 ? 120 : 80;
        offscreenCtx.font = `bold ${fontSize}px Arial`;
        offscreenCtx.fillStyle = 'white';
        offscreenCtx.textAlign = 'center';
        offscreenCtx.textBaseline = 'middle';
        
        var textMetrics = offscreenCtx.measureText(text);
        var textWidth = textMetrics.width;
        
        offscreenCtx.fillText(text, centerX, centerY);
        
        var imageData = offscreenCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        var points = [];
        var threshold = 128;
        var density = 4;

        for (var y = 0; y < canvasHeight; y += density) {
            for (var x = 0; x < canvasWidth; x += density) {
                var index = (y * canvasWidth + x) * 4;
                if (imageData.data[index + 3] > threshold) {
                    points.push({
                        x: x,
                        y: y
                    });
                }
            }
        }

        while (points.length < particles.length) {
            points.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight
            });
        }
        
        if (points.length > particles.length) {
            points = points.sort(() => Math.random() - 0.5).slice(0, particles.length);
        }

        return points;
    }

    function transitionParticles(timestamp) {
        var elapsed = timestamp - transitionStartTime;
        
        if (elapsed < transitionDuration) {
            var progress = elapsed / transitionDuration;
            particles.forEach((particle, i) => {
                if (targetTextParticles[i]) {
                    particle.x += (targetTextParticles[i].x - particle.x) * 0.05;
                    particle.y += (targetTextParticles[i].y - particle.y) * 0.05;
                }
            });
        } else if (elapsed < transitionDuration + scatterDuration) {
            particles.forEach(particle => {
                particle.vx = (Math.random() - 0.5) * 10;
                particle.vy = (Math.random() - 0.5) * 10;
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0) particle.x = canvasWidth;
                if (particle.x > canvasWidth) particle.x = 0;
                if (particle.y < 0) particle.y = canvasHeight;
                if (particle.y > canvasHeight) particle.y = 0;
            });
        } else {
            transitioning = false;
            currentTextIndex = (currentTextIndex + 1) % texts.length;
            text = texts[currentTextIndex];
            
            if (currentTextIndex === 0) {
                // 开始淡出动画
                isFadingOut = true;
                fadeStartTime = timestamp;
            } else {
                transitionStartTime = timestamp;
            }
        }
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();