var makeAdapter = function () {
  var engines = [];
  var logos = [];
  var currentEngine = null;

  return {
    addEngine: function (name, engine) {
      engines[name] = engine;
      logos[name] = document.getElementById(name.replace(".", "").toLowerCase() + "-logo");
    },

    setEngine: function (name) {
      if (name in engines) {
        if (currentEngine) {
          currentEngine.display("none");
        }
        currentEngine = engines[name];
        currentEngine.display("block");

        for (key in logos) {
          if (key !== name)
            logos[key].style.display = "none";
          else
            logos[key].style.display = "block";
        }
      }

      var keys = Object.keys(currentEngine);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        this[key] = currentEngine[key];
      }

      //this.setAmbient = currentEngine.setAmbient;
      //this.render = currentEngine.render;
      //this.setBackground = currentEngine.setBackground;
      //this.setScene = currentEngine.setScene;
      //this.getScene = currentEngine.getScene;
      //this.clearAll = currentEngine.clearAll;

      //this.add = currentEngine.add;
      //this.set = currentEngine.set;
      //this.remove = currentEngine.remove;
      //this.replace = currentEngine.replace;
    },
  }
}