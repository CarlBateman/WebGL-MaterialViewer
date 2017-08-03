/// <reference path="../../libs/babylon/babylon.js" />
/// <reference path="polyfills.js" />

function makeBabylonController(sceneGeneric) {
  var glCanvas;
  var view;
  var engine;
  var scene;
  var camera;

  var lightTypes = [];
  lightTypes["spot"] = BABYLON.SpotLight;
  lightTypes["point"] = BABYLON.PointLight;
  lightTypes["hemi"] = BABYLON.HemisphericLight;
  lightTypes["dir"] = BABYLON.DirectionalLight;

  var geometryTypes = [];
  geometryTypes["box"] = BABYLON.MeshBuilder.CreateBox;
  geometryTypes["torus"] = BABYLON.MeshBuilder.CreateTorus;
  geometryTypes["sphere"] = BABYLON.MeshBuilder.CreateSphere;
  geometryTypes["cylinder"] = BABYLON.MeshBuilder.CreateCylinder;

  var geometryDefaults = [];
  geometryDefaults["box"] = BABYLON.MeshBuilder.CreateBox;
  geometryDefaults["torus"] = BABYLON.MeshBuilder.CreateTorus;
  geometryDefaults["sphere"] = BABYLON.MeshBuilder.CreateSphere;
  geometryDefaults["cylinder"] = BABYLON.MeshBuilder.CreateCylinder;

  function init() {
    glCanvas = document.createElement("canvas");
    glCanvas.id = "renderCanvas";

    view = document.getElementById("view");
    view.insertBefore(glCanvas, view.firstChild);

    engine = new BABYLON.Engine(glCanvas, true);
    scene = new BABYLON.Scene(engine);

    camera = new BABYLON.ArcRotateCamera("Camera", 1, 0.8, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.position.z = 50;

    scene.activeCamera.attachControl(glCanvas);

  }

  function clearAll() {
  }

  function getScene() {
    var sceneGeneric;
    return sceneGeneric;
  }

  function setScene(sceneGeneric) {
    var meshes = sceneGeneric.meshes;
    for (var i = 0; i < meshes.length; i++) {
      add(meshes[i]);
    }

    var lights = sceneGeneric.lights;
    for (var i = 0; i < lights.length; i++) {
      add(lights[i]);
    }

    //#region 1
    //var geometry = { types: [], defaults: [] };
    //geometry.types["box"] = BABYLON.Mesh.CreateBox;
    //geometry.defaults["box"] = [1];
    //geometry.types["torus"] = BABYLON.Mesh.CreateTorus;
    //geometry.defaults["torus"] = [5, 1, 10];

    //var lux = { types: [], defaults: [] };
    //lux.types["spot"] = BABYLON.SpotLight;
    //lux.defaults["spot"] = [0, 1, 0];
    ////lux.defaults["spot"] = [0xffffff];

    //lux.types["point"] = BABYLON.PointLight;
    //lux.defaults["point"] = [0, 1, 0];
    //lux.defaults["point"] = [0xffffff];


    //#endregion

    // Create a light
    var light0 = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), scene);
    light0.diffuse = new BABYLON.Color3(1, 1, 1);
    light0.specular = new BABYLON.Color3(1, 1, 1);
    light0.groundColor = new BABYLON.Color3(0, 0, 0);

    //var box = BABYLON.Mesh.CreateBox("box", 4.0, scene);

    // Attach the camera to the scene

    // Once the scene is loaded, just register a render loop to render it
    //engine.runRenderLoop(function () {
    //  scene.render();
    //});
  }

  function render() {
    scene.render();
  }

  function add(item) {
    var type = item.type;
    if (type in geometryTypes) {
      var mesh = geometryTypes[type].call(BABYLON.MeshBuilder, type + "mesh", {}, scene);
      var mesh = geometryTypes[type].bind(BABYLON.MeshBuilder)(type + "mesh", {}, scene);

      var torus = BABYLON.MeshBuilder.CreateTorus("torus", { thickness: 0.2 }, scene);


      mesh.material = new BABYLON.StandardMaterial("texture1", scene);

      return mesh.id;
    }

    if (type in lightTypes) {
      //var lighta = new lux.types[type](type, new BABYLON.Vector3(...lux.defaults[type]),scene);
      var light = new lightTypes[type](type + "light", new BABYLON.Vector3(0, 30, -10), new BABYLON.Vector3(0, -1, 0), Math.PI / 3, 2, scene);
      return light.id;
    }
  }

  function set(id, property, value) {
    var obj;
    if (id.includes("light")) {
      obj = scene.getLightByName(id);
    } else
      obj = scene.getMeshByID(id);
    var prop = Object.resolve(property, obj);

    //if (prop instanceof THREE.Color)
    //  prop.setRGB(...value);
    //else
    if (prop)
      prop.copyFromFloats(...value);
    else
      console.log("www");
  }

  function remove(id) { }
  function replace(id, type) { }

  function display(value) { glCanvas.style.display = value; }

  init();
  if (sceneGeneric)
    setScene(sceneGeneric);
  glCanvas.style.display = "none";

  return { setScene: setScene, render: render, add: add, display: display, set: set };
}