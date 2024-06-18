import * as THREE from 'three'
import * as ascii from './library/ascii-engine.ts';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const width = 60;
const height = 25;

window.onload = async function() {
    const ascii_canvas = document.getElementById("ascii-canvas");

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    
    await init(renderer);

    function DrawScene(time)
    {
        draw(renderer, time);
        ascii.renderAsText(renderer, ascii_canvas, width, height);
    
        requestAnimationFrame(DrawScene);
    }

    requestAnimationFrame(DrawScene);
}


let scene, camera, model;

async function init(renderer){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    camera.position.z = 30;
    camera.position.y = -165;

    renderer.setClearColor(0x2E0000);

    const loader = new FBXLoader();
    model = await loader.loadAsync('snowy/Snowy Final.fbx', (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    });
    model.rotation.x = 3.14;

    scene.add(model);
}

function draw(renderer, time){
    if(model)
        model.rotation.y += 0.01;

    renderer.render( scene, camera );
}