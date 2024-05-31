import * as THREE from 'three'
import * as ascii from './ascii-engine.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const width = 60;
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


let scene, camera, gltf_scene;

function init(renderer){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    camera.position.z = 30;
    camera.position.y = -165;

    renderer.setClearColor(0x2E0000);

    const loader = new GLTFLoader();
}

function draw(renderer, time){
    renderer.render( scene, camera );
}