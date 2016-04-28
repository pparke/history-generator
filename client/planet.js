'use strict';

const Grid = require('../lib/world/Grid');
const Display = require('../lib/ui/Display');

// setup renderer
let renderer    = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMapEnabled = true;
document.body.appendChild( renderer.domElement );

let scene       = new THREE.Scene();

// setup camera
let camera      = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 100 );
camera.position.z = 5;

// setup lights
let light = new THREE.AmbientLight( 0xaaaaaa );
scene.add(light);
let dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5,5,5);
scene.add(dirLight);
dirLight.castShadow = true;
dirLight.shadowCameraNear = 0.01;
dirLight.shadowCameraFar = 15;
dirLight.shadowCameraFov = 45;

dirLight.shadowCameraLeft = -1;
dirLight.shadowCameraRight = 1;
dirLight.shadowCameraTop = 1;
dirLight.shadowCameraBottom = -1;

dirLight.shadowBias = 0.001;
dirLight.shadowDarkness = 0.2;

dirLight.shadowMapWidth = 1024;
dirLight.shadowMapHeight = 1024;


/*
var cubeGeom = new THREE.BoxGeometry( 1, 1, 1 );
var cubeMat = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( cubeGeom, cubeMat );
scene.add( cube );
*/

// create texture
let height = 256;
let width = 512;
let grid = setupGrid(width, height);
grid.generate();
let display = new Display();

// create the image that will be used for the texture
let textureCanvas = document.createElement('canvas');
textureCanvas.width = width;
textureCanvas.height = height;
display.render(textureCanvas, grid.heightmap, width, height, {
  renderStyle: 'palette',
  renderKey: 'terrain'
});
document.body.appendChild(textureCanvas);

// create the image that will be used for the bump map
let bumpCanvas = document.createElement('canvas');
bumpCanvas.width = width;
bumpCanvas.height = height;
let terrainMap = grid.heightmap.map((val, i) => {
  if (val > grid.atmo.sealevel) {
    return val;
  }
  return grid.atmo.sealevel;
});
display.render(bumpCanvas, terrainMap, width, height, {
  renderStyle: 'monochrome'
});
document.body.appendChild(bumpCanvas);

// create the texture
let planetTex = new THREE.Texture(textureCanvas);
planetTex.needsUpdate = true;

// create the bumpmap
let bumpTex = new THREE.Texture(bumpCanvas);
bumpTex.needsUpdate = true;

// add sphere
let planetGeom    = new THREE.SphereGeometry(0.5, 32, 32);
let planetMat     = new THREE.MeshPhongMaterial({
  map: planetTex,
  bumpMap: bumpTex,
  bumpScale: 0.05
});
let planetMesh    = new THREE.Mesh(planetGeom, planetMat);
scene.add(planetMesh);


// add starfield
let starGeom = new THREE.SphereGeometry(90, 32, 32);
let starMat = new THREE.MeshBasicMaterial();
starMat.map = THREE.ImageUtils.loadTexture('./assets/img/stars.jpg');
starMat.side = THREE.BackSide;
let starMesh = new THREE.Mesh(starGeom, starMat);
scene.add(starMesh);

let theta = 0;
let radius = 5;

function render() {
	requestAnimationFrame( render );

  // move camera
  theta += 0.1;
  if (theta >= 365) {
    theta = 0;
  }
  camera.position.x = radius * Math.cos( THREE.Math.degToRad( theta ) );
	camera.position.z = radius * Math.sin( THREE.Math.degToRad( theta ) );
  camera.lookAt(scene.position);
  camera.updateMatrixWorld();

	renderer.render( scene, camera );
}
render();

function setupGrid (width, height) {
  let persistance = 0.3;
  let octaves     = 8;
  let xfreq       = 2/width;
  let yfreq       = 2/height;
  let lacun       = 4;
  console.log(`\nCreating new grid with persistance=${persistance} octaves=${octaves} xFreq=${xfreq} yFreq=${yfreq} lacunarity=${lacun} noiseFn='simplex'`);
  let g = new Grid(width, height);
  g.terra.randomizePerm();
  g.terra.setParams(persistance, octaves, xfreq, yfreq, lacun);
  return g;
}
