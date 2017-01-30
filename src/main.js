
// Skybox texture from: https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/skybox

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

// called after the scene loads
function onLoad(framework) {
    var scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;

    // Basic Lambert white
    var lambertWhite = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });

    // Set light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);

    // set skybox
    var loader = new THREE.CubeTextureLoader();
    var urlPrefix = '/images/skymap/';

    var skymap = new THREE.CubeTextureLoader().load([
        urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
        urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
        urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ] );

    scene.background = skymap;


    // Settings, Parameters 
    var curveParams = {

    }

    var featherParams = {
        distribution: 1.0,
        size: 1.0,
        color: [ 0, 128, 255 ],
        orientation: 50,
        points: 1000
    };

    var flappingParams = {
        speed: 1.0,
        motion: 1.0
    }

    var box = new THREE.BoxGeometry( 1, 1, 1 );
    var mesh = new THREE.Mesh(box, lambertWhite);
    mesh.position.set(5, 0, 0);
    scene.add(mesh);

    var curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3( -10, 0, 0 ),
        new THREE.Vector3( -5, 15, 10 ),
        new THREE.Vector3( 20, 15, 0 ),
        new THREE.Vector3( 50, -20, 20 )
    );

    var geometry = new THREE.Geometry();
    var points = curve.getPoints (featherParams.points);
    geometry.vertices = points;

    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

    // Create the final object to add to the scene
    var curveObject = new THREE.Line( geometry, material );
    scene.add(curveObject);

    var feather_items = [];


    // load a simple obj mesh
    var objLoader = new THREE.OBJLoader();
    objLoader.load('/geo/feather.obj', function(obj) {

        // LOOK: This function runs after the obj has finished loading
        var featherGeo = obj.children[0].geometry;
        var featherMesh = new THREE.Mesh(featherGeo, lambertWhite);
        featherMesh.rotateZ(-Math.PI / 2.0);
        featherMesh.rotateX(Math.PI / 2.0);

        for (var i = 0.0; i < featherParams.points; i++) {


            var featherInstance = featherMesh.clone()
            featherInstance.position.set(points[i].x, points[i].y, points[i].z);
            var s = 2.0 * i / featherParams.points + 0.2;
            featherInstance.scale.set(s, s, s);
            scene.add(featherInstance);
        }

        // featherMesh.name = "feather";
        // scene.add(featherMesh);
    });


    // set camera position
    camera.position.set(0, 1, 50);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // scene.add(lambertCube);
    scene.add(directionalLight);



    // edit params and listen to changes like this
    // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
    gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
        camera.updateProjectionMatrix();
    });

    // Curve Controls
    // var f0 = gui.addFolder('Curve');

    // Feather Controls
    var f1 = gui.addFolder('Feather');
    f1.add(featherParams, 'distribution', 0, 10).onChange(function(newVal) {

    });
    f1.add(featherParams, 'size', 0, 10).onChange(function(newVal) {

    });
    f1.addColor(featherParams, 'color').onChange(function(newVal) {

    });
    //f1.open();

    // Flapping Controls
    var f2 = gui.addFolder('Flapping');
    f2.add(flappingParams, 'speed', 0.0, 5.0).onChange(function(newVal) {

    });
    f2.add(flappingParams, 'motion', 0.0, 5.0).onChange(function(newVal) {

    });
    //f2.open();
}

function updateCurve() {

}

// called on frame updates
function onUpdate(framework) {
    // var feather = framework.scene.getObjectByName("feather");    
    // if (feather !== undefined) {
    //     // Simply flap wing
    //     var date = new Date();
    //     feather.rotateZ(Math.sin(date.getTime() / 100) * 2 * Math.PI / 180);        
    // }
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);