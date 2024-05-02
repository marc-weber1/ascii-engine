import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js'

const width = 80;
const height = 35;

window.onload = function() {
    const decoder = new TextDecoder();
    const ascii_canvas = document.getElementById("ascii-canvas");

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );

    const gl = renderer.getContext();
    
    init(renderer);

    function DrawScene(time)
    {
        draw(renderer, time);

        let pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    
        // Convert e.g. 0x60 0x00 0x00 0x00 into just 0x60
        let pixels_depadded = new Uint8Array(width * height * 4 + height); // + height for newlines
        let write_index = 0;
        for(let p = 0; p < width * height; p++){
            if(p != 0 && p % width == 0){
                pixels_depadded[write_index] = 0xA; write_index++; //newline
            }

            pixels_depadded[write_index] = pixels[4*p]; write_index++;
            if(pixels[4*p+1] == 0x0) continue;
            pixels_depadded[write_index] = pixels[4*p+1]; write_index++;
            if(pixels[4*p+2] == 0x0) continue;
            pixels_depadded[write_index] = pixels[4*p+2]; write_index++;
        }

        pixels_depadded = pixels_depadded.slice(0, write_index);

        ascii_canvas.innerText = decoder.decode(pixels_depadded);
    
        requestAnimationFrame(DrawScene);
    }

    requestAnimationFrame(DrawScene);
}


let scene, camera, cube;

function init(renderer){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x610000 } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 2;

    renderer.setClearColor(0x630000);
}

function draw(renderer, time){
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
}