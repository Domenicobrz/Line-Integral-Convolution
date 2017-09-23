window.addEventListener('load', pageInit);

var gl;
var step = 1 / 100000;
function pageInit() {
    var canvas = document.getElementById("canvas");
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;

	gl = canvas.getContext("webgl");
	if(!gl) alert("Could Not Initialize WebGL");


    window.addEventListener('keydown', function(e) {
    
        if(e.key == 'k') {
             step *= 1.2;
        }
        if(e.key == 'l') {
             step /= 1.2;
        }
    
    });

    createProgram();
    initGUI();


    draw();
}

function createProgram() {
    window.Program = getShader("vertex", "fragment");

    Program.a1 = gl.getAttribLocation(Program, "position");

    Program.imageTexture = gl.getUniformLocation(Program, "imageTexture");
    Program.flowTexture  = gl.getUniformLocation(Program, "flowTexture");

    Program.time  = gl.getUniformLocation(Program, "time");
    Program.step  = gl.getUniformLocation(Program, "step");

    var vertices = [
        -1, -1,
        -1, +1,
        +1, -1,

        +1, -1,
        -1, +1,
        +1, +1
    ];

    Program.vbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Program.vbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    Program.imgTexture = getTexture("image1.jpg");
    Program.flwTexture = getTexture("noise7.jpg");
}

function draw(now) {
    requestAnimationFrame(draw);

    if(texturesLoaded < 2) return;

    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(Program);
    gl.bindBuffer(gl.ARRAY_BUFFER, Program.vbuffer);
    gl.enableVertexAttribArray(Program.a1);
    gl.vertexAttribPointer(Program.a1, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Program.imgTexture);
    gl.uniform1i(Program.imageTexture, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, Program.flwTexture);
    gl.uniform1i(Program.flowTexture, 1);

    gl.uniform1f(Program.step, 1 / (Math.pow(2, 16 - effectController.convolutionStrenght)));
    gl.uniform1f(Program.time, now);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}


var texturesLoaded = 0;
function getTexture(path) {
    var image = new Image();
    var texture = gl.createTexture();

    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);     
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        texturesLoaded++;
    };

    image.src = path;
    return texture;
}

function initGUI() {
    window.effectController = {
        convolutionStrenght: 0
    };

    var gui = new dat.GUI();
    gui.add(effectController, 'convolutionStrenght', 0, 6);
}