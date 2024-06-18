import * as THREE from 'three';
import * as CANNON from 'cannon'
import { GLTF } from 'three/examples/jsm/Addons.js';

const decoder = new TextDecoder();

function renderAsText(renderer: THREE.WebGLRenderer, htmlElement: HTMLElement, width: number, height: number){
    const glContext = renderer.getContext();

    let pixels = new Uint8Array(width * height * 4);
    glContext.readPixels(0, 0, width, height, glContext.RGBA, glContext.UNSIGNED_BYTE, pixels);

    // Convert e.g. 0x60 0x00 0x00 into just 0x60 (alpha ignored)
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

    htmlElement.innerText = decoder.decode(pixels_depadded);
}

function characterTexture(text: string) : THREE.Texture{
    const data = new Uint8Array(4 * text.length);
    for (let i = 0; i < text.length; i++) {
        const charBytes = text.charCodeAt(i);
        data[4*i] = charBytes & 0xFF;
        data[4*i + 1] = (charBytes >> 8) & 0xFF;
        data[4*i + 2] = (charBytes >> 16) & 0xFF;
    }

    const texture = new THREE.DataTexture(data, text.length, 1);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
}

function patchMaterialWithBrightnessMap(material : THREE.Material, map: string){
    material.userData.brightnessTextMap = {
        type: "t",
        value: characterTexture(map)
    }

    material.onBeforeCompile = function(shader){
        shader.uniforms.brightnessTextMap = material.userData.brightnessTextMap;

        shader.fragmentShader = 'uniform sampler2D brightnessTextMap;\n' + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(/}\s*$/, `
            gl_FragColor = texture(brightnessTextMap, vec2(gl_FragColor.r, 0));
        }
        `);

        console.log(shader.fragmentShader);
    }
}

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
            quaternion: quatConvert(object.getWorldQuaternion(object.quaternion))
        });

        let shape_index = omi_body.collider?.shape;
        if(!shape_index){
            shape_index = object.children[0]?.userData.gltfExtensions?.OMI_physics_body?.collider?.shape;
        }
        body.addShape(shapes[shape_index]);

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

    let shapes = [];
    for(const s of gltf.userData?.gltfExtensions?.OMI_physics_shape.shapes){
        switch(s.type){
            case "box":
                shapes.push(new CANNON.Box(new CANNON.Vec3(s.box.size[0], s.box.size[1], s.box.size[2])));
                break;
        }
    }

    const bodies = loadOMICollidersRecursive(gltf.scene, shapes);
    const world = new CANNON.World();

    for(const body of bodies){
        world.addBody(body);
    }

    return world;
}

export { renderAsText, characterTexture, patchMaterialWithBrightnessMap, loadGLTFOMIColliders }