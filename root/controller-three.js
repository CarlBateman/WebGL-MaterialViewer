/// <reference path="libs/three.js" />
/// <reference path="scene.js" />

function makeThreeController(sceneGeneric) {
  var glCanvas;
  var view;
  var renderer;
  var scene;
  var camera;
  var controls;
  var ambientLight;
  var originalScene;

  var lightTypes = [];
  lightTypes["spot"] = THREE.SpotLight;
  lightTypes["point"] = THREE.PointLight;
  lightTypes["hemi"] = THREE.HemisphericLight;
  lightTypes["dir"] = THREE.DirectionalLight;

  var lightDefaults = [];
  lightDefaults["spot"] = [0xffffff];
  lightDefaults["point"] = [0xffffff];
  lightDefaults["hemi"] = [0xffffff];
  lightDefaults["dir"] = [0xffffff];

  var geometryTypes = [];
  geometryTypes["box"] = THREE.BoxBufferGeometry;
  geometryTypes["torus"] = THREE.TorusBufferGeometry;
  geometryTypes["sphere"] = THREE.SphereBufferGeometry;
  geometryTypes["cylinder"] = THREE.CylinderBufferGeometry;
  geometryTypes["cone"] = THREE.ConeBufferGeometry;

  var geometryDefaults = [];
  geometryDefaults["box"] = [20, 20, 20];
  geometryDefaults["torus"] = [25, 2.5, 8, 64];
  geometryDefaults["sphere"] = [10,18,32];
  geometryDefaults["cylinder"] = [10, 10, 30, 16];
  geometryDefaults["cone"] = [10, 30, 16];

  function init() {
    renderer = new THREE.WebGLRenderer({ alpha: true });

    glCanvas = renderer.domElement;
    document.getElementById("view").insertBefore(glCanvas, document.getElementById("view").firstChild);

    renderer.setSize(glCanvas.clientWidth, glCanvas.clientHeight);
    renderer.setClearColor(0xEEEEEE, 1);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, glCanvas.clientWidth / glCanvas.clientHeight, 0.1, 1000);
    camera.position.z = 10;

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    ambientLight = new THREE.AmbientLight(0x404040);
    ambientLight.cb_tag = "ignore";
    scene.add(ambientLight);
  }

  function clearAll() {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    scene.add(ambientLight);
  }

  function getScene() {
    var sceneGeneric = makeScene();
    sceneGeneric.materials = originalScene.materials;
    sceneGeneric.background = renderer.getClearColor().toArray();
    sceneGeneric.ambient = ambientLight.color.toArray();

    sceneGeneric.cameraRot = camera.rotation.toArray();
    sceneGeneric.cameraRot.pop();

    sceneGeneric.cameraPos = camera.position.toArray();

    sceneGeneric.cameraTarget[0] = controls.target.x;
    sceneGeneric.cameraTarget[1] = controls.target.y;
    sceneGeneric.cameraTarget[2] = controls.target.z;

    for (var i = 0; i < scene.children.length; i++) {
      var item = scene.children[i];
      var type = item.cb_tag;

      if (type === "ignore") continue;

      if (type.includes("light")) {
        if (type.includes("ambient")) {
          sceneGeneric.ambient = item.color.toArray();
        } else {
          var light = makeLight();
          light.type = type.replace("light", "");
          light.position = item.position.toArray();
          light.direction = type === "spotlight" ? item.target.position : item.target.position;

          sceneGeneric.lights.push(light);
        }
      } else if (type.includes("mesh")) {
        var mesh = makeMesh();
        var geometry = item.geometry;
        mesh.type = item.cb_tag.replace("mesh", "");
        mesh.position = item.position.toArray();
        
        //var material = makeMaterial();
        mesh.materialId = item.material.genericId;
        var material = originalScene.materials[item.material.genericId];
        material.ambient = item.material.ambient.toArray();
        material.diffuse = item.material.color.toArray();
        material.specular = item.material.specular.toArray();
        material.emissive = item.material.emissive.toArray();
        sceneGeneric.materials[item.material.genericId] = material;

        sceneGeneric.meshes.push(mesh);
        //sceneGeneric.material.push(material);
      }
    } 

    return sceneGeneric;
  }

  function setScene(sceneGeneric) {
    originalScene = sceneGeneric;
    renderer.setClearColor(new THREE.Color(...sceneGeneric.background));
    ambientLight.color = new THREE.Color(...sceneGeneric.ambient);
    camera.position.set(...sceneGeneric.cameraPos);
    camera.rotation.set(...sceneGeneric.cameraRot);

    controls.target.x = sceneGeneric.cameraTarget[0];
    controls.target.y = sceneGeneric.cameraTarget[1];
    controls.target.z = sceneGeneric.cameraTarget[2];

    camera.fov = sceneGeneric.cameraFOV;
    camera.updateProjectionMatrix();

    var meshes = sceneGeneric.meshes;
    for (var i = 0; i < meshes.length; i++) {
      add(meshes[i]);
    }

    var lights = sceneGeneric.lights;
    for (var i = 0; i < lights.length; i++) {
      add(lights[i]);
    }
  }

  function render() {
    renderer.render(scene, camera);
    controls.update();

    //lightControl.update();
    //targetControl.update();
  };

  //var defaultMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  function add(item) {
    var type = item.type;
    if (type in geometryTypes) {
      var materialValue = originalScene.materials[item.materialId];
      var material = new THREE.MeshPhongMaterial();
      material.genericId = item.materialId;
      material.color.setRGB(...materialValue.diffuse);
      material.specular.setRGB(...materialValue.specular);
      material.emissive.setRGB(...materialValue.emissive);
      material.ambient = new THREE.Color(...materialValue.ambient);

      var mesh = new THREE.Mesh(new geometryTypes[type](...geometryDefaults[type]), material);
      mesh.position.set(...item.position);
      scene.add(mesh);

      mesh.cb_tag = type + "mesh";

      return mesh.id;
    }

    if (type in lightTypes) {
      var light = new lightTypes[type](...lightDefaults[type]);
      light.position.set(...item.position);
      scene.add(light);

      light.cb_tag = type + "light";

      return light.id;
    }
  }

  function setMaterial(idx, parameter, color) {
    //if (parameter === "ambient") return;

    parameter = parameter === "diffuse" ? "color" : parameter;

    for (var i = 0; i < scene.children.length; i++) {
      var item = scene.children[i];
      if (item.cb_tag.includes("mesh")) {
        item.material[parameter].setRGB(...color);
      }
    }
  }

  function setBackground(color) {
    renderer.setClearColor(new THREE.Color(...color));
  }

  function setAmbient(color) {
    ambientLight.color = new THREE.Color(...color);
  }

  function set(id, property, value) {
    var obj = scene.getObjectById(id);
    var prop = Object.resolve(property, obj);

    if (prop instanceof THREE.Color)
      prop.setRGB(...value);
    else
      prop.set(...value);
  }

  function remove(id) { }
  function replace(id, type) { }
  function display(value) { glCanvas.style.display = value; }

  init();
  if (sceneGeneric)
    setScene(sceneGeneric);
  glCanvas.style.display = "none";

  return {
    clearAll: clearAll,
    getScene: getScene,
    setScene: setScene,
    render: render,
    add: add,
    display: display,
    set: set,
    setBackground: setBackground,
    setAmbient: setAmbient,
    setMaterial: setMaterial,
  }
}