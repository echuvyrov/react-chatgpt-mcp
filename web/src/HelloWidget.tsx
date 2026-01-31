import "./styles.css";
import { CanvasRenderer } from "declarative-ui-core";
import { useEffect, useState } from "react";
import type { Page } from "declarative-ui-core";

console.log("[Widget] Module loaded");

const emptyState: Page = {
  layout: {
    engine: "rgl",
    cols: 24,
    rowHeight: 50,
    margin: [16, 16],
    containerPadding: [16, 16],
    items: [
      { i: "welcome", x: 0, y: 0, w: 24, h: 6 }
    ]
  },
  components: {
    welcome: {
      type: "markdown",
      config: {
        md: "# Declarative UI Widget\n\nNo dashboard loaded yet.\n\nUse the **generate_declarative_ui** tool to create a dashboard from natural language."
      }
    }
  },
  data: {}
};

// Read initial data from window.openai.toolOutput at module load time (before React mounts)
console.log("[Widget] === DEBUGGING WINDOW.OPENAI ===");
console.log("[Widget] window.openai exists?", !!(window as any).openai);
console.log("[Widget] window.openai:", (window as any).openai);
console.log("[Widget] window.openai.toolOutput:", (window as any).openai?.toolOutput);
console.log("[Widget] window.openai.toolOutput.componentData:", (window as any).openai?.toolOutput?.componentData);

const initialData: Page = (window as any).openai?.toolOutput?.componentData ?? emptyState;
console.log("[Widget] Initial data selected:", initialData === emptyState ? "EMPTY STATE" : "HAS DATA");
if (initialData !== emptyState) {
  console.log("[Widget] Initial data components:", Object.keys(initialData.components));
}

export default function DeclarativeUIWidget() {
  const [componentData, setComponentData] = useState<Page>(initialData);

  useEffect(() => {
    console.log("[Widget] === COMPONENT MOUNTED ===");
    console.log("[Widget] Current componentData state:", componentData);
    console.log("[Widget] Is showing empty state?", componentData === emptyState);
    
    // Check window.openai again after mount
    const openai = (window as any).openai;
    console.log("[Widget] window.openai after mount:", openai);
    console.log("[Widget] window.openai.toolOutput after mount:", openai?.toolOutput);
    
    if (openai?.toolOutput?.componentData) {
      console.log("[Widget] ✓ Found toolOutput.componentData after mount, updating state");
      console.log("[Widget] componentData keys:", Object.keys(openai.toolOutput.componentData));
      setComponentData(openai.toolOutput.componentData);
    } else {
      console.log("[Widget] ✗ No toolOutput.componentData found after mount");
    }

    // Listen for updates via openai:set_globals event (Apps SDK pattern)
    const handleSetGlobals = (event: any) => {
      console.log("[Widget] === SET_GLOBALS EVENT RECEIVED ===");
      console.log("[Widget] Event detail:", event.detail);
      const globals = event.detail?.globals;
      console.log("[Widget] Globals:", globals);
      console.log("[Widget] Globals.toolOutput:", globals?.toolOutput);
      
      if (globals?.toolOutput?.componentData) {
        console.log("[Widget] ✓ Updating from set_globals event");
        console.log("[Widget] New componentData:", globals.toolOutput.componentData);
        setComponentData(globals.toolOutput.componentData);
      } else {
        console.log("[Widget] ✗ No componentData in set_globals event");
      }
    };

    console.log("[Widget] Registering openai:set_globals event listener");
    window.addEventListener("openai:set_globals", handleSetGlobals, { passive: true });

    return () => {
      console.log("[Widget] Cleanup: removing event listener");
      window.removeEventListener("openai:set_globals", handleSetGlobals);
    };
  }, []);

  return (
    <div className="declarative-ui-widget">
      <CanvasRenderer page={componentData} />
    </div>
  );
}
