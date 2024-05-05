import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js'
import * as ascii from './ascii-engine.js';

const width = 80;
const height = 35;

window.onload = function() {
    const ascii_canvas = document.getElementById("ascii-canvas");

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    
    init(renderer);

    function DrawScene(time)
    {
        draw(renderer, time);
        ascii.renderAsText(renderer, ascii_canvas, width, height);
    
        requestAnimationFrame(DrawScene);
    }

    requestAnimationFrame(DrawScene);
}


let scene, camera, cube;

function init(renderer){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF
    });

    material.userData.brightnessTextMap = { type: "t", value: ascii.characterTexture("`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@") };

    material.onBeforeCompile = function(shader){
        shader.uniforms.brightnessTextMap = material.userData.brightnessTextMap;

        shader.fragmentShader = 'uniform sampler2D brightnessTextMap;\n' + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(/gl_FragColor = ([^;]*);/, `
            vec4 final_colour = $1;
            gl_FragColor = texture(brightnessTextMap, vec2(final_colour.r, 0));
        `);

        console.log(shader.fragmentShader);
    }

    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    const light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( 10, 10, 10 );
    scene.add( light );

    camera.position.z = 2;

    renderer.setClearColor(0x2E0000);
}

function draw(renderer, time){
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
}