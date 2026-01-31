// IMMEDIATE LOGGING - BEFORE ANY IMPORTS
console.log("========================================");
console.log("[WIDGET MAIN] Script executing!");
console.log("[WIDGET MAIN] window.openai:", (window as any).openai);
console.log("[WIDGET MAIN] window.openai.toolOutput:", (window as any).openai?.toolOutput);
console.log("========================================");

import React from "react";
import ReactDOM from "react-dom/client";
import DeclarativeUIWidget from "./HelloWidget";

console.log("[WIDGET MAIN] After imports, before root creation");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("[WIDGET MAIN] ERROR: Failed to find root element!");
  throw new Error("Failed to find the root element");
}

console.log("[WIDGET MAIN] Root element found, creating React root");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <DeclarativeUIWidget />
  </React.StrictMode>
);

console.log("[WIDGET MAIN] React rendered");

if (typeof window !== "undefined") {
  window.requestAnimationFrame(() => {
    const openai = (window as any).openai;
    if (openai?.notifyIntrinsicHeight) {
      console.log("[WIDGET MAIN] Calling notifyIntrinsicHeight");
      openai.notifyIntrinsicHeight();
    } else {
      console.log("[WIDGET MAIN] notifyIntrinsicHeight not available");
    }
  });
}
