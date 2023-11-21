import * as THREE from 'three';
import css from './index.css';
import { generateUUID } from 'three/src/math/MathUtils';
import { initFetch } from './comm.js';

// setting up player data and what not

const playerId = generateUUID();

const initialServerData = initFetch();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xA9FFFF);
const camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(5,5,5);
camera.lookAt(0,0,0);
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight, false);
document.body.appendChild( renderer.domElement );

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
light.position.set(10,10,10);
scene.add( light );

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

const geometry = new THREE.PlaneGeometry( 10, 10 );
const material = new THREE.MeshBasicMaterial( {color: 0xFFFFFF, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( geometry, material );
plane.rotateX(Math.PI/2);
scene.add( plane );

function gameFrame () {
    renderer.render( scene, camera );
}

setInterval( () => {
    gameFrame();
} ,16);