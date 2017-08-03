"use strict"

window.addEventListener('DOMContentLoaded', function () { main(); });

function main() {
  var scene = makeScene();

  // set up a "default" scene
  var material = makeMaterial();
  scene.materials.push(material);

  var light = makeLight();
  light.type = "spot";
  light.position = [0, 100, 0];
  scene.lights.push(light);

  var offset = 35;

  var mesh = makeMesh();
  mesh.type = "torus";
  mesh.materialId = 0;
  scene.meshes.push(mesh);

  var mesh = makeMesh();
  mesh.type = "box";
  mesh.materialId = 0;
  mesh.position[0] = offset;
  mesh.position[1] = -offset;
  scene.meshes.push(mesh);

  var mesh = makeMesh();
  mesh.type = "cone";
  mesh.materialId = 0;
  mesh.position[0] = -offset;
  mesh.position[1] = -offset;
  scene.meshes.push(mesh);

  var mesh = makeMesh();
  mesh.type = "sphere";
  mesh.materialId = 0;
  mesh.position[0] = -offset;
  mesh.position[1] = offset;
  scene.meshes.push(mesh);

  var mesh = makeMesh();
  mesh.type = "cylinder";
  mesh.materialId = 0;
  mesh.position[0] = offset;
  mesh.position[1] = offset;
  scene.meshes.push(mesh);

  var controllers = [];
  controllers["Babylon.js"] = makeBabylonController(scene);
  controllers["Three.js"] = makeThreeController(scene);
  controllers["PlayCanvas.js"] = makePlayCanvasController(scene);

  var adapter = makeAdapter();
  adapter.addEngine("Three.js", controllers["Three.js"]);
  adapter.addEngine("Babylon.js", controllers["Babylon.js"]);
  adapter.addEngine("PlayCanvas.js", controllers["PlayCanvas.js"]);
  //adapter.setEngine("Three.js");
  //adapter.setEngine("Babylon.js");
  adapter.setEngine("PlayCanvas.js");

  optionsController.initialise(adapter);
  //optionsController.adapter = adapter;

  (function render() {
    requestAnimationFrame(render);
    adapter.render();
  })();

}