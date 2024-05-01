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

        ascii_canvas.value = decoder.decode(pixels_depadded);
    
        requestAnimationFrame(DrawScene);
    }

    requestAnimationFrame(DrawScene);
}


function init(gl){

}

function draw(gl, time){
    // Test by drawing lowercase a
    gl.clearColor(0.38, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}