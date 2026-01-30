import React from "react";
import ReactDOM from "react-dom/client";
import DeclarativeUIWidget from "./HelloWidget";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DeclarativeUIWidget />
  </React.StrictMode>
);

if (typeof window !== "undefined") {
  window.requestAnimationFrame(() => {
    const openai = (window as any).openai;
    if (openai?.notifyIntrinsicHeight) {
      openai.notifyIntrinsicHeight();
    }
  });
}
