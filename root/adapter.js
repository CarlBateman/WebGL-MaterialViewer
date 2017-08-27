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

      keys.map((key) => { this[key] = currentEngine[key]; });
    },
  }
}