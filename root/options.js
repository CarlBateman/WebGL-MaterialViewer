/// <reference path="adapter.js" />

var optionsController = {
  options: {
    Renderer: "PlayCanvas.js",
  },

  //options: new HandleChanges(),

  gui: new dat.GUI({ autoPlace: false, /*width: 30, closeOnTop: true */ }),

  adapter: null,

  initialise: function (adapter) {
    var self = this;
    self.adapter = adapter;
    var scene = adapter.getScene();
    document.getElementById('controls').appendChild(this.gui.domElement)

    this.gui.add(this.options, 'Renderer', ['Three.js', 'Babylon.js', 'PlayCanvas.js']).onFinishChange(function () {
      var adapter = self.adapter;
      var scene = adapter.getScene();
      adapter.setEngine(self.options.Renderer);
      adapter.clearAll();
      adapter.setScene(scene);
    });

    //var obj = { "Reset camera": function () { console.log("clicked") } };
    //this.gui.add(obj, 'Reset camera');

    //this.gui.add({ "Reset camera": function () { } }, "Reset camera");

    var sceneFolder = this.gui.addFolder("Scene");
    sceneFolder.open();
    this.options['Background'] = rgbToHex1(...scene.background);
    sceneFolder.addColor(this.options, 'Background').onChange(function () {
      var col = hexToRgbNew(self.options['Background']);
      self.adapter.setBackground(col);
    });

    this.options['Ambient'] = rgbToHex1(...scene.ambient);
    sceneFolder.addColor(this.options, 'Ambient').onChange(function () {
      var col = hexToRgbNew(self.options['Ambient']);
      self.adapter.setAmbient(col);
    });

    var materialFolder = this.gui.addFolder("Material");
    materialFolder.open();


    var t = makeMaterial();
    var keys = Object.keys(t);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      this.options[key] = rgbToHex1(...t[key]);
      materialFolder.addColor(this.options, key).onChange(function (key) {
        var col = hexToRgbNew(self.options[key]);
        self.adapter.setMaterial(0, key, col);
      }.bind(null, key));
    }

  },

}




function componentToHex256(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function componentToHex1(c) {
  var hex = Math.floor(c * 255).toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex1(r, g, b) {
  return "#" + componentToHex1(r) + componentToHex1(g) + componentToHex1(b);
}

function rgbToHex256(r, g, b) {
  return "#" + componentToHex256(r) + componentToHex256(g) + componentToHex256(b);
}

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function hexToArray(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function hexToRgbNew(hex) {
  hex = hex.replace("#", "");
  var arrBuff = new ArrayBuffer(4);
  var vw = new DataView(arrBuff);
  vw.setUint32(0,parseInt(hex, 16),false);
  var arrByte = new Uint8Array(arrBuff);

  return [(arrByte[1] / 255), (arrByte[2] / 255), (arrByte[3] / 255)];
}