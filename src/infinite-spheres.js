import * as THREE from 'three'
import * as ascii from './ascii-engine.ts';

const width = 150;
const height = 100;

const frag_shader = `
#define MAXSTEPS 100
#define MINDIST .01

uniform vec2 u_resolution;
uniform float u_time;

float DistanceEstimator(vec3 pos) {
    
    // translate
    pos = pos + 1. * vec3(0,-0.5*u_time,u_time);

    float d1 = distance(mod(pos, 2.), vec3(1,1,1))-.54321;
    
    return d1;
}

float trace(vec3 from, vec3 direction) {
	float totalDistance = 0.0;
	int steps;
	for (steps=0; steps < MAXSTEPS; steps++) {
		vec3 p = from + totalDistance * direction;
		float dist = DistanceEstimator(p);
		totalDistance += dist;
		if (dist < MINDIST) break;
	}
	return 1.0-float(steps)/float(MAXSTEPS);
}

void main() {
    
    vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution) / u_resolution.y;
    //vec2 uv = (gl_FragCoord.xy - 0.5);
    
    vec3 camPos = vec3(0, 2, 0);
	vec3 camViewDir = normalize(vec3(uv.xy, 1));
    
	float dist = trace(camPos, camViewDir);
    
    gl_FragColor = vec4(dist, dist, dist, 1.0);
}
`

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


let scene, camera, material;

function init(renderer){
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1);

    const geometry = new THREE.PlaneGeometry( 2, 2 );
    material = new THREE.ShaderMaterial({
        uniforms: {
            "u_time": { value: 0.0 },
            "u_resolution": { value: new THREE.Vector2(0,0) }
        },
        fragmentShader: frag_shader
    });

    material.uniforms.u_resolution.value = new THREE.Vector2(width, height);

    ascii.patchMaterialWithBrightnessMap(material, "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@");

    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    const light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( 10, 10, 10 );
    scene.add( light );

    camera.position.z = 2;

    renderer.setClearColor(0x2E0000);
}

function draw(renderer, time){
    material.uniforms.u_time.value = time / 1000;

    renderer.render( scene, camera );
}