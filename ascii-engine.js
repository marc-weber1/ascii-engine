const width = 140;
const height = 35;

let decoder = new TextDecoder("utf-8");

window.onload = function() {
    const canvas = document.createElement('canvas');
    const ascii_canvas = document.getElementById("ascii-canvas");
    
    // Initialize the GL context
    const gl = canvas.getContext("webgl");
  
    // Only continue if WebGL is available and working
    if (gl === null) {
      alert(
        "Unable to initialize WebGL. Your browser or machine may not support it.",
      );
      return;
    }
  
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

    {
        // define size and format of level 0
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    width, height, border,
                    format, type, data);
    }

    // Create and bind the framebuffer
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    
    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0;
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

    init(gl);

    function DrawScene(time)
    {
        draw(gl, time);

        let pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    
        // Convert e.g. 0x60 0x00 0x00 0x00 into just 0x60
        let pixels_depadded = new Uint8Array(width * height * 4 + height); // + height for newlines
        let write_index = 0;
        for(p = 0; p < width * height; p++){
            if(p != 0 && p % width == 0){
                pixels_depadded[write_index] = 0xA; write_index++; //newline
            }

            pixels_depadded[write_index] = pixels[4*p]; write_index++;
            if(pixels[4*p+1] == 0x0) continue;
            pixels_depadded[write_index] = pixels[4*p+1]; write_index++;
            if(pixels[4*p+2] == 0x0) continue;
            pixels_depadded[write_index] = pixels[4*p+2]; write_index++;
            if(pixels[4*p+3] == 0x0) continue;
            pixels_depadded[write_index] = pixels[4*p+3]; write_index++;
        }

        pixels_depadded = pixels_depadded.slice(0, write_index);

        ascii_canvas.innerText = decoder.decode(pixels_depadded);
    
        requestAnimationFrame(DrawScene);
    }

    requestAnimationFrame(DrawScene);
}


function degToRad(d) {
    return d * Math.PI / 180;
}

var fieldOfViewRadians = degToRad(60);
var modelXRotationRadians = degToRad(0);
var modelYRotationRadians = degToRad(0);

var program, positionBuffer, positionLocation, matrixLocation;

// Get the starting time.
var then = 0;

function init(gl){
    // setup GLSL program
    program = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "b-shader"]);

    // look up where the vertex data needs to go.
    positionLocation = gl.getAttribLocation(program, "a_position");

    // lookup uniforms
    matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // Create a buffer for positions
    positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Put the positions in the buffer
    setGeometry(gl);
}

function draw(gl, time){
    // convert to seconds
    time *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, width, height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Animate the rotation
    modelYRotationRadians += -0.7 * deltaTime;
    modelXRotationRadians += -0.4 * deltaTime;

    // Clear the canvas AND the depth buffer.
    gl.clearColor(0.38, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // Compute the projection matrix
    var aspect = width / height;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    var cameraPosition = [0, 0, 2];
    var up = [0, 1, 0];
    var target = [0, 0, 0];

    // Compute the camera's matrix using look at.
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    var matrix = m4.xRotate(viewProjectionMatrix, modelXRotationRadians);
    matrix = m4.yRotate(matrix, modelYRotationRadians);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
}

// Fill the buffer with the values that define a cube.
function setGeometry(gl) {
    var positions = new Float32Array(
      [
      -0.5, -0.5,  -0.5,
      -0.5,  0.5,  -0.5,
       0.5, -0.5,  -0.5,
      -0.5,  0.5,  -0.5,
       0.5,  0.5,  -0.5,
       0.5, -0.5,  -0.5,
  
      -0.5, -0.5,   0.5,
       0.5, -0.5,   0.5,
      -0.5,  0.5,   0.5,
      -0.5,  0.5,   0.5,
       0.5, -0.5,   0.5,
       0.5,  0.5,   0.5,
  
      -0.5,   0.5, -0.5,
      -0.5,   0.5,  0.5,
       0.5,   0.5, -0.5,
      -0.5,   0.5,  0.5,
       0.5,   0.5,  0.5,
       0.5,   0.5, -0.5,
  
      -0.5,  -0.5, -0.5,
       0.5,  -0.5, -0.5,
      -0.5,  -0.5,  0.5,
      -0.5,  -0.5,  0.5,
       0.5,  -0.5, -0.5,
       0.5,  -0.5,  0.5,
  
      -0.5,  -0.5, -0.5,
      -0.5,  -0.5,  0.5,
      -0.5,   0.5, -0.5,
      -0.5,  -0.5,  0.5,
      -0.5,   0.5,  0.5,
      -0.5,   0.5, -0.5,
  
       0.5,  -0.5, -0.5,
       0.5,   0.5, -0.5,
       0.5,  -0.5,  0.5,
       0.5,  -0.5,  0.5,
       0.5,   0.5, -0.5,
       0.5,   0.5,  0.5,
  
      ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  }