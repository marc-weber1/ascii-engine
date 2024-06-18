import * as THREE from 'three';
import * as CANNON from 'cannon'
import { GLTF } from 'three/examples/jsm/Addons.js';


function posConvert(pos: THREE.Vector3): CANNON.Vec3 {
    return new CANNON.Vec3(pos.x, pos.y, pos.z);
}

function quatConvert(q: THREE.Quaternion): CANNON.Quaternion{
    return new CANNON.Quaternion(q.x, q.y, q.z, q.w);
}

function loadOMICollidersRecursive(object: THREE.Object3D, shapes) : CANNON.Body[]{
    let bodies: CANNON.Body[] = [];

    if(object.userData.gltfExtensions?.OMI_physics_body){
        const omi_body = object.userData.gltfExtensions?.OMI_physics_body;
        
        let body = new CANNON.Body({
            position: posConvert(object.getWorldPosition(object.position)),
            quaternion: quatConvert(object.getWorldQuaternion(object.quaternion)),
            mass: omi_body.motion?.mass,
            velocity: omi_body.motion?.linearVelocity,
            angularVelocity: omi_body.motion?.angularVelocity
        });

        let shape_index = omi_body.collider?.shape;
        if(!shape_index){
            shape_index = object.children[0]?.userData.gltfExtensions?.OMI_physics_body?.collider?.shape;
        }
        const omi_shape = shapes[shape_index];

        let shape: CANNON.Shape;
        switch(omi_shape.type){
            case "box":
                let scale = object.getWorldScale(object.scale);
                shape = new CANNON.Box(new CANNON.Vec3(
                    omi_shape.box.size[0] * scale.x,
                    omi_shape.box.size[1] * scale.y,
                    omi_shape.box.size[2] * scale.z
                ));
                break;
            case "sphere":
                throw new Error("OMI shape is not implemented.");
            case "capsule":
                throw new Error("OMI shape is not implemented.");
            case "cylinder":
                throw new Error("OMI shape is not implemented.");
            case "convex":
                throw new Error("OMI shape is not implemented.");
            case "trimesh":
                throw new Error("OMI shape is not implemented.");
            default:
                throw new Error("Unknown OMI shape.");
        }
        body.addShape(shape);

        if(omi_body.motion?.type == "static"){
            body.type = CANNON.Body.STATIC;
        }
    }
    else{
        for(let child of object.children){
            bodies.concat(loadOMICollidersRecursive(child, shapes));
        }
    }

    return bodies;
}

function loadGLTFOMIColliders(gltf: GLTF) : CANNON.World{
    const bodies = loadOMICollidersRecursive(gltf.scene, gltf.userData?.gltfExtensions?.OMI_physics_shape.shapes);
    const world = new CANNON.World();

    for(const body of bodies){
        world.addBody(body);
    }

    return world;
}

export { loadGLTFOMIColliders }