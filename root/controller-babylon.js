function makeBabylonController(sceneGeneric) {
  var glCanvas;
  var view;
  var engine;
  var scene;
  var camera;

  var originalScene;

  var lightTypes = [];
  lightTypes["spot"] = BABYLON.SpotLight;
  lightTypes["point"] = BABYLON.PointLight;
  lightTypes["hemi"] = BABYLON.HemisphericLight;
  lightTypes["dir"] = BABYLON.DirectionalLight;

  var lightDefaults = [];   //position, direction, angle, exponent
  lightDefaults["spot"] =  [new BABYLON.Vector3(0, 30, -10), new BABYLON.Vector3(0, -1, 0), 0.872, 2];
  lightDefaults["point"] = [new BABYLON.Vector3(0, 1, 0)];
  lightDefaults["hemi"] =  [new BABYLON.Vector3(0, 1, 0)];
  lightDefaults["dir"] =   [new BABYLON.Vector3(0, 1, 0)];

  var geometryTypes = [];
  geometryTypes["box"] = BABYLON.MeshBuilder.CreateBox;
  geometryTypes["torus"] = BABYLON.MeshBuilder.CreateTorus;
  geometryTypes["sphere"] = BABYLON.MeshBuilder.CreateSphere;
  geometryTypes["cylinder"] = BABYLON.MeshBuilder.CreateCylinder;
  geometryTypes["cone"] = BABYLON.MeshBuilder.CreateCylinder;

  var geometryDefaults = [];
  geometryDefaults["box"] = {size: 20};
  geometryDefaults["torus"] = { diameter: 50, thickness: 5, tessellation: 64 };
  geometryDefaults["sphere"] = { diameter: 20 };
  geometryDefaults["cylinder"] = { height: 30, tessellation: 16, diameterTop: 20, diameterBottom: 20 };
  geometryDefaults["cone"] = { height: 30, tessellation : 16,diameterTop: 0, diameterBottom : 20 };

  function init() {
    glCanvas = document.createElement("canvas");
    glCanvas.id = "renderCanvas";

    view = document.getElementById("view");
    view.insertBefore(glCanvas, view.firstChild);

    engine = new BABYLON.Engine(glCanvas, true);
    scene = new BABYLON.Scene(engine);

    camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3.Zero(), scene);
    camera.fov = 1.309;
    camera.setPosition(new BABYLON.Vector3(0, 0, 10));

    scene.activeCamera.attachControl(glCanvas);
  }

  function clearAll() {
    while (scene.meshes.length > 0) {
      scene.meshes[0].dispose();
    }
    while (scene.lights.length > 0) {
      scene.lights[0].dispose();
    }
  }

  function getScene() {
    var sceneGeneric = makeScene();
    sceneGeneric.background = scene.clearColor.asArray();
    sceneGeneric.ambient = scene.ambientColor.asArray();

    sceneGeneric.cameraRot = camera.rotation.asArray();
    sceneGeneric.cameraPos = camera.position.asArray();
    sceneGeneric.cameraTarget = camera.target.asArray();

    sceneGeneric.cameraPos[2] *= -1;
    sceneGeneric.cameraTarget[2] *= -1;

    for (var i = 0; i < scene.lights.length; i++) {
      var item = scene.lights[i];
      var type = item.cb_tag;

      var light = makeLight();
      light.type = type;//.replace("light", "");
      light.position = item.position.asArray();
      light.direction = type === "spotlight" ? item.direction.asArray() : item.direction.asArray();

      sceneGeneric.lights.push(light);
    }

    for (var i = 0; i < scene.meshes.length; i++) {
      var item = scene.meshes[i];
      var type = item.cb_tag;

      var mesh = makeMesh();
      var geometry = item.geometry;
      mesh.type = type;
      mesh.position = item.position.asArray();
      //mesh.position[0] *= -1;

      //var material = makeMaterial();
      mesh.materialId = item.material.genericId;
      var material = originalScene.materials[item.material.genericId];
      material.ambient = item.material.ambientColor.asArray();
      material.diffuse = item.material.diffuseColor.asArray();
      material.specular = item.material.specularColor.asArray();
      material.emissive = item.material.emissiveColor.asArray();
      sceneGeneric.materials[item.material.genericId] = material;

      sceneGeneric.meshes.push(mesh);
      //sceneGeneric.material.push(material);
    }

    return sceneGeneric;
  }

  function setScene(sceneGeneric) {
    originalScene = sceneGeneric;
    scene.clearColor = new BABYLON.Color3(...sceneGeneric.background);
    scene.ambientColor = new BABYLON.Color3(...sceneGeneric.ambient);

    sceneGeneric.cameraPos[2] *= -1;
    sceneGeneric.cameraTarget[2] *= -1;

    camera.setPosition(new BABYLON.Vector3(...sceneGeneric.cameraPos));
    camera.setTarget(new BABYLON.Vector3(...sceneGeneric.cameraTarget));

    camera.fov = sceneGeneric.cameraFOV * Math.PI / 180;

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
    scene.render();
  }

  function add(item) {
    var type = item.type;
    if (type in geometryTypes) {
      // var mesh = geometryTypes[type].call(BABYLON.MeshBuilder, type + "mesh", geometryDefaults[type], scene);
      // or
      var mesh = geometryTypes[type].bind(BABYLON.MeshBuilder)(type + "mesh", geometryDefaults[type], scene);
      // or
      // var mesh = BABYLON.MeshBuilder["CreateTorus"]("torus", { thickness: 0.2 }, scene);
      mesh.position = new BABYLON.Vector3(...item.position);
      //mesh.position.x *= -1;

      var materialValue = originalScene.materials[item.materialId];
      var material = new BABYLON.StandardMaterial("texture1", scene);
      material.genericId = item.materialId;
      material.ambientColor = new BABYLON.Color3(...materialValue.ambient);
      material.diffuseColor = new BABYLON.Color3(...materialValue.diffuse);
      material.specularColor = new BABYLON.Color3(...materialValue.specular);
      material.specularPower *= .25;
      material.emissiveColor = new BABYLON.Color3(...materialValue.emissive);
      mesh.material = material;

      mesh.cb_tag = type;

      return mesh.id;
    }

    if (type in lightTypes) {
      var light = new lightTypes[type](type + "light", ...lightDefaults[type], scene);

      light.intensity = 2;
      light.position = new BABYLON.Vector3(...item.position);
      light.cb_tag = type;

      return light.id;
    }
  }

  function setMaterial(idx, parameter, color) {
    scene.meshes.forEach(function (mesh) {
      mesh.material[parameter + "Color"] = new BABYLON.Color3(...color);
    });
  }

  function setBackground(color) {
    scene.clearColor = new BABYLON.Color3(...color);
  }

  function setAmbient(color) {
    scene.ambientColor = new BABYLON.Color3(...color);
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