import * as THREE from 'three';
import * as CANNON from 'cannon';
import * as ascii from './library/ascii-engine.ts';
import * as omi from './library/omi-loader.ts';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControlsCannon } from './library/PointerLockControlsCannon.js';

const width = 100;
const height = 40;

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


let scene, camera, world, player;

async function init(renderer){
    const ascii_canvas = document.getElementById("ascii-canvas");

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    camera.position.z = 30;
    camera.position.y = -165;

    renderer.setClearColor(0x2E0000);

    const loader = new GLTFLoader();
    const gltf_scene = await loader.loadAsync('test_colliders.gltf');
    world = new CANNON.World();
    let bodies = omi.loadGLTFOMIColliders(gltf_scene);
    console.log(bodies);
    for(const body of bodies){
        world.addBody(body);
    }

    let spawn_point = omi.loadGLTFOMISpawnPoints(gltf_scene)[0];
    console.log(spawn_point);
    let player_shape = new CANNON.Sphere(1);
    player = new CANNON.Body({shape: player_shape, mass: 5, linearDamping: 0.9, position: spawn_point});
    world.addBody(player);
    
    let controls = new PointerLockControlsCannon(camera, player);
}

function draw(renderer, time){
    renderer.render( scene, camera );
}