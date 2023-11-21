import * as THREE from 'three';
import css from './index.css';
import { generateUUID } from 'three/src/math/MathUtils';
import { initFetch } from './comm.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// basic scene set up

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xA9FFFF);
const camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(2,0,2);
camera.lookAt(0,0,0);
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight, false);
document.body.appendChild( renderer.domElement );

const light = new THREE.AmbientLight( 0xF0F0F0 ); // soft white light
light.position.set(10,10,10);
scene.add( light );

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

const geometry = new THREE.PlaneGeometry( 10, 10 );
const material = new THREE.MeshBasicMaterial( {color: 0xFFFFFF, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( geometry, material );
plane.rotateX(Math.PI/2);
scene.add( plane );

// player set up

const loader = new GLTFLoader();
let playerModel;

loader.load( './blender/player.glb', function ( gltf ) {
    scene.add( gltf.scene );
    playerModel = gltf;
}, undefined, function ( error ) {
    console.error( error );
} );

const playerObj = {dir:{theta:0,delta:0},pos:{x:0,y:0.33,z:0},keys:{W:false,A:false,S:false,D:false}};

const playerId = generateUUID();

//Event listeners

let mouseToggle = false;
let initX;
let initY;
window.addEventListener('mousedown', (e) => {
    if (mouseToggle === false) {
        initX = e.clientX;
        initY = e.clientY;
        mouseToggle = true;
    }
});

window.addEventListener('mouseup', (e) => {
    mouseToggle = false;
});

window.addEventListener('mousemove',(e) => {
    if (mouseToggle === true) {
        const deltaX = (e.clientX - initX)/window.innerWidth;
        const deltaY = (e.clientY - initY)/window.innerHeight;

        playerObj.dir.theta -= Math.PI*deltaX;
        if ((Math.abs(playerObj.dir.delta) < (9*Math.PI)/20)||(playerObj.dir.delta <= -(9*Math.PI)/20 && deltaY < 0)||(playerObj.dir.delta >= (9*Math.PI)/20 && deltaY > 0)) {
            playerObj.dir.delta -= (Math.PI/2)*deltaY;
        }

        initX = e.clientX;
        initY = e.clientY;
    }
});

window.addEventListener('keydown', (e) => {
    if (e.code === "KeyW") {
        playerObj.keys.W = true;
    }
    if (e.code === "KeyA") {
        playerObj.keys.A = true;
    }
    if (e.code === "KeyS") {
        playerObj.keys.S = true;
    }
    if (e.code === "KeyD") {
        playerObj.keys.D = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === "KeyW") {
        playerObj.keys.W = false;
    }
    if (e.code === "KeyA") {
        playerObj.keys.A = false;
    }
    if (e.code === "KeyS") {
        playerObj.keys.S = false;
    }
    if (e.code === "KeyD") {
        playerObj.keys.D = false;
    }
});

function getVecFromKeys () {
    const rightVector = new THREE.Vector3(1,0,0);
    const backVector = new THREE.Vector3(0,0,1);
    const forwardVector = new THREE.Vector3(0,0,-1);
    const leftVector = new THREE.Vector3(-1,0,0);

    let initial = new THREE.Vector3(0,0,0);
    if (playerObj.keys.W === true) {
        initial = initial.add(forwardVector);
    }
    if (playerObj.keys.A === true) {
        initial = initial.add(leftVector);
    }
    if (playerObj.keys.S === true) {
        initial = initial.add(backVector);
    }
    if (playerObj.keys.D === true) {
        initial = initial.add(rightVector);
    }

    return initial.applyEuler(new THREE.Euler(0,playerObj.dir.theta,0));
}
//Initial data fetching

const initialServerData = initFetch();

// Game Loop Things

const modelEuler = new THREE.Euler(0,0,0);
const cameraEuler = new THREE.Euler(0,0,0);
function gameFrame () {
    if (playerModel.scene) {
        const currPos = new THREE.Vector3(playerObj.pos.x,playerObj.pos.y,playerObj.pos.z);
        const newPos = currPos.add(getVecFromKeys().multiplyScalar(0.02))
        playerObj.pos.x = newPos.x;
        playerObj.pos.y = newPos.y;
        playerObj.pos.z = newPos.z;
        playerModel.scene.position.set(newPos.x,newPos.y,newPos.z);

        modelEuler.set(0,playerObj.dir.theta+Math.PI/2,0);
        playerModel.scene.setRotationFromEuler(modelEuler);

        cameraEuler.set(playerObj.dir.delta,playerObj.dir.theta,0,'ZYX');
        camera.setRotationFromEuler(cameraEuler);
        const cameraOffset = new THREE.Vector3(2/3,7/12,1);
        const rotatedCameraOffset = cameraOffset.applyEuler(cameraEuler);

        camera.position.set(playerObj.pos.x+rotatedCameraOffset.x,
                            playerObj.pos.y+0.33+rotatedCameraOffset.y,
                            playerObj.pos.z+rotatedCameraOffset.z);
    }
    renderer.render( scene, camera );
}

setInterval( () => {
    gameFrame();
} ,16);