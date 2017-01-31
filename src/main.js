
// Skybox texture from: https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/skybox

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

// Array of feathers on their corresponding curves;
var featherGeo;
var curve;
var curve2;
var curve3;
var points;
var points2;
var points3;
var lambertWhite;

// Settings, Parameters 
var curveParams = {

}

var featherParams = {
    distribution: 1.0,
    size: 5.0,
    color: [ 0, 128, 255 ],
    orientation: 50,
    points: 1000
};

var flappingParams = {
    speed: 1.0,
    motion: 1.0
}



// called after the scene loads
function onLoad(framework) {
    var scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;

    // Basic Lambert white
    lambertWhite = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });

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

    var geometry = new THREE.Geometry();
    curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3( -10, -5, 0.4 ),
        new THREE.Vector3( 15, 5, 10.4 ),
        new THREE.Vector3( 30, -5, 5.4 ),
        new THREE.Vector3( 50, -5, 15 )
    );
    points = curve.getPoints (featherParams.points);
    geometry.vertices = points;

    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

    // Create the final object to add to the scene
    //var curveObject = new THREE.Line( geometry, material );
    //scene.add(curveObject);
    // END TOP CURVE

    // SECOND CURVE
    curve2 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( -10, -5, 0.2 ),
        new THREE.Vector3( 15, 5, 10.2 ),
        new THREE.Vector3( 40, -20, 0.2 ),
        new THREE.Vector3( 80, 10, 27 )
    );
    
    var geometry2 = new THREE.Geometry();
    points2 = curve2.getPoints (featherParams.points);
    geometry2.vertices = points2;

    //var material2 = new THREE.LineBasicMaterial( { color : 0x00ff00 } );
    //var curveObject2 = new THREE.Line( geometry2, material2 );
    //scene.add(curveObject2);
    // END SECOND CURVE

    // THIRD CURVE
    curve3 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( -10, -5, 0 ),
        new THREE.Vector3( 20, 10, 10 ),
        new THREE.Vector3( 40, -30, 0 ),
        new THREE.Vector3( 100, 20, 27 )
    );
    
    var geometry3 = new THREE.Geometry();
    points3 = curve3.getPoints (featherParams.points);
    geometry3.vertices = points3;

    //var material3 = new THREE.LineBasicMaterial( { color : 0x0000ff } );
    //var curveObject3 = new THREE.Line( geometry3, material3 );
    //scene.add(curveObject3);
    // END THIRD CURVE

    // TODO: CLEAN UP THIS MESSY REPEATING CODE, WHO ARE YOU ELLEN.
    // load a simple obj mesh
    var objLoader = new THREE.OBJLoader();
    objLoader.load('/geo/feather.obj', function(obj) {
        // LOOK: This function runs after the obj has finished loading
        featherGeo = obj.children[0].geometry;
        createWing(featherGeo, scene);
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
        featherParams.size = newVal;
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

function createWing(featherGeo, scene) {
    var featherMesh = new THREE.Mesh(featherGeo, lambertWhite);

    var axis = new THREE.Vector3();
    var up = new THREE.Vector3( 0, 1, 0 );

    var threshold = 4.0;
    var add = 0.0;
    for (var i = 0.0; i < featherParams.points; i++) {
        if (i > threshold) {      
            threshold *= 1.5;
            add++;
        }

        // FIRST
        var featherInstance = featherMesh.clone();
        featherInstance.position.set(points[i].x, points[i].y, points[i].z);
        var s = featherParams.size * i / featherParams.points / 2 + 2.0;
        featherInstance.scale.set(s, s, s);

        var tangent = curve.getTangent(i / featherParams.points).normalize();
        axis.crossVectors(up, tangent).normalize();
        var rad = Math.acos(up.dot(tangent));

        featherInstance.quaternion.setFromAxisAngle( axis, rad );
        featherInstance.rotateX(Math.PI / 2.0);

        scene.add(featherInstance);

        // SECOND
        var featherInstance2 = featherMesh.clone();
        featherInstance2.position.set(points2[i].x, points2[i].y, points2[i].z);
        var s2 = featherParams.size + 1.0;
        featherInstance2.scale.set(s2, s2, s2);

        var tangent2 = curve2.getTangent(i / featherParams.points).normalize();
        axis.crossVectors(up, tangent2).normalize();
        var rad2 = Math.acos(up.dot(tangent2));

        featherInstance2.quaternion.setFromAxisAngle( axis, rad2 );
        featherInstance2.rotateX(Math.PI / 2.0);

        scene.add(featherInstance2);


        // THIRD
        var featherInstance3 = featherMesh.clone();
        featherInstance3.position.set(points3[i].x, points3[i].y, points3[i].z);
        var s3 = featherParams.size * 2 * i / featherParams.points + 7.0;
        featherInstance3.scale.set(s3, s3, s3);
        
        var tangent3 = curve3.getTangent(i / featherParams.points).normalize();
        axis.crossVectors(up, tangent3).normalize();
        var rad3 = Math.acos(up.dot(tangent3));

        featherInstance3.quaternion.setFromAxisAngle( axis, rad3 );
        featherInstance3.rotateX(Math.PI / 2.0);

        scene.add(featherInstance3);

        i += add;
    }
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