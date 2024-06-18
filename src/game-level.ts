import * as THREE from 'three'
import * as ascii from './ascii-engine.ts';
import * as omi from './omi-loader.ts';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTF } from 'three/examples/jsm/Addons.js';

const width = 100;
const height = 40;

window.onload = async function() {
    const ascii_canvas = document.getElementById("ascii-canvas")!;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    
    await init(renderer);

    function DrawScene(time: number)
    {
        draw(renderer, time);
        ascii.renderAsText(renderer, ascii_canvas, width, height);
    
        requestAnimationFrame(DrawScene);
    }

    requestAnimationFrame(DrawScene);
}


let scene: THREE.Scene, camera: THREE.Camera, gltf_scene: GLTF;

async function init(renderer: THREE.WebGLRenderer){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    camera.position.z = 30;
    camera.position.y = -165;

    renderer.setClearColor(0x2E0000);

    const loader = new GLTFLoader();
    gltf_scene = await loader.loadAsync('test_colliders.gltf');
    const cannon_world = omi.loadGLTFOMIColliders(gltf_scene);
}

function draw(renderer: THREE.WebGLRenderer, time: number){
    renderer.render( scene, camera );
}