function makePlayCanvasController(sceneGeneric) {
  var glCanvas;
  var app;
  var view;
  var scene;
  var camera;

  var entities = [];
  var originalScene;

  var lightTypes = [];
  lightTypes["spot"] = "";
  lightTypes["point"] ="";
  lightTypes["hemi"] = "";
  lightTypes["dir"] =  "";

  var lightDefaults = [];
  lightDefaults["spot"] = [1, 1, 1];
  lightDefaults["point"] = [1, 1, 1];
  lightDefaults["dir"] = [1, 1, 1];

  var geometryTypes = [];
  geometryTypes["box"] = pc.createBox;
  geometryTypes["torus"] = pc.createTorus;
  geometryTypes["sphere"] = pc.createSphere;
  geometryTypes["cylinder"] = pc.createCylinder;
  geometryTypes["cone"] = pc.createCone;

  var geometryDefaults = [];
  geometryDefaults["box"] = { halfExtents: new pc.Vec3(10, 10, 10) };
  geometryDefaults["torus"] = { tubeRadius: 2.5, ringRadius: 25, segments: 64 };
  geometryDefaults["sphere"] = { radius: 10, segments: 16 };
  geometryDefaults["capsule"] = { radius: 10, height: 30, side: 16 };
  geometryDefaults["cylinder"] = { baseRadius: 10, radius: 10, height: 30, capSegments: 16 };
  geometryDefaults["cone"] = { baseRadius: 10, peakRadius: 0, height: 30, capSegments: 16 };

  function init() {
    glCanvas = document.createElement("canvas");
    glCanvas.id = "playCanvas";
    document.getElementById("view").insertBefore(glCanvas, document.getElementById("view").firstChild);

    app = new pc.Application(glCanvas, {
      mouse: new pc.Mouse(glCanvas),
    });
    app.start();

    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      fov: 74,
    });

    app.assets.loadFromUrl('libs/orbit-camera-input-mouse.js', 'script', function (err, asset) {
      camera.addComponent('script');
      camera.script.create('orbitCameraInputMouse');

      app.assets.loadFromUrl('libs/orbitcamera.js', 'script', function (err, asset) {
        camera.script.create('orbitCamera');
        camera.script.orbitCamera.frameOnStart = false;
        app.root.addChild(camera);
      });
    });
  }

  function clearAll() {
    while (entities.length > 0) {
      entities.pop().destroy();
    }
  }

  function getScene() {
    var sceneGeneric = makeScene();
    sceneGeneric.materials = originalScene.materials;
    sceneGeneric.ambient = app.scene.ambientLight.data;
    sceneGeneric.background = camera.camera.clearColor.data;

    sceneGeneric.cameraPos = camera.position.data;
    var t = camera.rotation.getEulerAngles();
    sceneGeneric.cameraRot = [t.x, t.y, t.z];

    if (camera.script && camera.script.orbitCamera) {
      sceneGeneric.cameraTarget[0] = camera.script.orbitCamera.pivotPoint.x;
      sceneGeneric.cameraTarget[1] = camera.script.orbitCamera.pivotPoint.y;
      sceneGeneric.cameraTarget[2] = camera.script.orbitCamera.pivotPoint.z;
    }

    for (var i = 0; i < entities.length; i++) {
      var item = entities[i];
      var type = item.cb_tag;

      if (type === "ignore") continue;

      if (type.includes("light")) {
        var light = makeLight();
        light.type = type.replace("light", "");
        light.position = [...item.localPosition.data];
        //light.direction = type === "spotlight" ? item.target.position : item.target.position;

        sceneGeneric.lights.push(light);
      }

      if (type.includes("mesh")) {
        var mesh = makeMesh();
        var geometry = item.geometry;
        mesh.type = item.cb_tag.replace("mesh", "");
        
        mesh.position = [...item.localPosition.data];

        mesh.materialId = item.model.material.genericId;
        var material = originalScene.materials[item.model.material.genericId];
        material.ambient = item.model.material.ambient.data;
        material.diffuse = item.model.material.diffuse.data;
        material.specular = item.model.material.specular.data;
        material.emissive = item.model.material.emissive.data;
        sceneGeneric.materials[item.model.material.genericId] = material;

        sceneGeneric.meshes.push(mesh);
        //sceneGeneric.material.push(material);
      }
    }

    return sceneGeneric;
  }

  function setScene(sceneGeneric) {
    originalScene = sceneGeneric;
    camera.camera.clearColor = new pc.Color(...sceneGeneric.background);
    app.scene.ambientLight = new pc.Color(...sceneGeneric.ambient);

    camera.camera.fov = sceneGeneric.cameraFOV;

    if (camera.script)
      if (camera.script.orbitCamera) {
        var cameraQuat = new pc.Quat();
        cameraQuat.setFromEulerAngles(...sceneGeneric.cameraRot);
        var yaw = camera.script.orbitCamera._calcYaw(cameraQuat);
        var pitch = camera.script.orbitCamera._calcPitch(cameraQuat, yaw);

        camera.script.orbitCamera.pitch = pitch;//sceneGeneric.cameraRot[0];
        camera.script.orbitCamera.yaw = yaw;//sceneGeneric.cameraRot[2];
        camera.script.orbitCamera._removeInertia();

        camera.script.orbitCamera.pivotPoint.x = sceneGeneric.cameraTarget[0];
        camera.script.orbitCamera.pivotPoint.y = sceneGeneric.cameraTarget[1];
        camera.script.orbitCamera.pivotPoint.z = sceneGeneric.cameraTarget[2];
      }

    //camera.setEulerAngles(...sceneGeneric.cameraRot);
    camera.setLocalPosition(...sceneGeneric.cameraPos);

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
    app.render();
  };

  function add(item) {
    var type = item.type;
    if (type in geometryTypes) {
      var mesh1 = new pc.Entity('cube');
      mesh1.addComponent('model', {
        type: 'box'//type
      });

      mesh1.cb_tag = type + "mesh";

      var node = new pc.GraphNode();
      var mesh = geometryTypes[type](app.graphicsDevice, geometryDefaults[type]);

      var material = new pc.StandardMaterial();
      var meshInstance = new pc.MeshInstance(mesh1.model.meshInstances[0].node, mesh, material);

      mesh1.model.meshInstances = [meshInstance];

      var materialValue = originalScene.materials[item.materialId];
      material.genericId = item.materialId;
      material.ambient.set(...materialValue.ambient);
      material.diffuse.set(...materialValue.diffuse);
      material.emissive.set(...materialValue.emissive);
      material.specular.set(...materialValue.specular);
      mesh1.model.material = material;

      mesh1.setLocalPosition(...item.position);

      app.root.addChild(mesh1);

      entities.push(mesh1);
     // materials.push(material);

      return mesh.id;
    }

    if (type in lightTypes) {
      var light = new pc.Entity('light');
      light.addComponent('light', {
        type: type,
        color: new pc.Color(...lightDefaults[type]),
        range: 200,
        intensity: 2,
      });
      light.setLocalPosition(...item.position);
      app.root.addChild(light);

      light.cb_tag = type + "light";

      entities.push(light);

      return light.id;
    }
  }

  function setMaterial(idx, parameter, color) {
    for (var i = 0; i < entities.length; i++) {
      var item = entities[i];
      if (item.cb_tag.includes("mesh")) {
        item.model.material[parameter].set(...color);
        item.model.material.update();
      }
    }
  }

  function setBackground(color) {
    camera.camera.clearColor = new pc.Color(...color);
  }

  function setAmbient(color) {
    app.scene.ambientLight = new pc.Color(...color);
  }

  function set(id, property, value) {
  }

  function remove(id) { }
  function replace(id, type) { }
  function display(value) {
    app.timeScale = value==="none"?0:1;
    app.autoRender = (value!=="none");
    glCanvas.style.display = value;
  }

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