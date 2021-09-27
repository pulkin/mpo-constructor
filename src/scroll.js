function preventDefault(e) {
  e.preventDefault();
}

var supportsPassive = false;
try {
  window.addEventListener(
    "test",
    null,
    Object.defineProperty({}, "passive", {
      get: function () {
        supportsPassive = true;
      }
    })
  );
} catch (e) {}

var wheelEvent =
  "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";
var wheelOpt = supportsPassive ? { passive: false } : false;

export function scrollOff() {
  window.addEventListener(wheelEvent, preventDefault, wheelOpt);
}

export function scrollOn() {
  window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
}
