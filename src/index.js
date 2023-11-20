import * as THREE from 'three';
import css from './index.css';
import { generateUUID } from 'three/src/math/MathUtils';
import { initFetch } from './comm.js';

// setting up player data and what not

const playerId = generateUUID();

const initialServerData = initFetch();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight, false );
document.body.appendChild( renderer.domElement );

function gameFrame () {
    renderer.render( scene, camera );
}

setInterval(gameFrame,16);