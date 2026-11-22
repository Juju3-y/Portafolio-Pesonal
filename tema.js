(function () {
  var raiz = document.documentElement;
  function actual() { return raiz.getAttribute("data-tema") === "oscuro" ? "oscuro" : "claro"; }
  function pintar(t) {
    raiz.setAttribute("data-tema", t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "oscuro" ? "#11191C" : "#2A4A54");
    var bs = document.querySelectorAll(".btn-tema");
    for (var i = 0; i < bs.length; i++) {
      bs[i].setAttribute("aria-pressed", t === "oscuro" ? "true" : "false");
      bs[i].title = t === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
    }
  }
  pintar(actual());
  var bs = document.querySelectorAll(".btn-tema");
  for (var i = 0; i < bs.length; i++) {
    bs[i].addEventListener("click", function () {
      var t = actual() === "oscuro" ? "claro" : "oscuro";
      pintar(t);
      try { localStorage.setItem("tema", t); } catch (e) {}
    });
  }
})();
