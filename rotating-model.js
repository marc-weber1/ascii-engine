import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js'
import * as ascii from './ascii-engine.js';
import { FBXLoader } from './loaders/FBXLoader.js'

const width = 60;
const height = 25;

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


let scene, camera, model;

function init(renderer){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    camera.position.z = 30;
    camera.position.y = -165;

    renderer.setClearColor(0x2E0000);

    const loader = new FBXLoader();
    loader.load('snowy/Snowy Final.fbx', (object) => {
        model = object;
        model.rotation.x = 3.14;

        scene.add(model);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
        console.log(error);
    });
}

function draw(renderer, time){
    if(model)
        model.rotation.y += 0.01;

    renderer.render( scene, camera );
}