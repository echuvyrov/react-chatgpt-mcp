import "./styles.css";
import { CanvasRenderer } from "declarative-ui-core";
import { useEffect, useState } from "react";
import type { Page } from "declarative-ui-core";

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

export default function DeclarativeUIWidget() {
  const [componentData, setComponentData] = useState<Page>(emptyState);

  useEffect(() => {
    console.log("[Widget] Mounted, checking for toolOutput...");
    
    const updateFromToolOutput = () => {
      const openai = (window as any).openai;
      
      if (!openai) {
        console.log("[Widget] window.openai not available yet");
        return;
      }
      
      console.log("[Widget] window.openai available:", {
        hasToolOutput: !!openai.toolOutput,
        toolOutput: openai.toolOutput
      });
      
      if (openai?.toolOutput?.ui) {
        console.log("[Widget] Found toolOutput.ui, updating component data");
        setComponentData(openai.toolOutput.ui);
      }
    };

    updateFromToolOutput();

    const interval = setInterval(updateFromToolOutput, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="declarative-ui-widget">
      <CanvasRenderer page={componentData} />
    </div>
  );
}
