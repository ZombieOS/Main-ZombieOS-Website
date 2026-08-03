(() => {
  function loadFallbacks() {
    if (window.__TYPESCRIPT_COMPILER_EXTENSION__) return;
    document.querySelectorAll('script[type="module/typescript"][data-js-src], script[type="text/typescript"][data-js-src]')
      .forEach((typescript) => {
        if (typescript.dataset.fallbackLoaded === "true") return;
        typescript.dataset.fallbackLoaded = "true";
        const javascript = document.createElement("script");
        if (typescript.type === "module/typescript" || typescript.hasAttribute("data-module")) javascript.type = "module";
        if (typescript.nonce) javascript.nonce = typescript.nonce;
        javascript.src = new URL(typescript.dataset.jsSrc, document.baseURI).href;
        typescript.replaceWith(javascript);
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadFallbacks, { once: true });
  else loadFallbacks();
})();
