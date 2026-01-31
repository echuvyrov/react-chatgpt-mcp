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

const defaultComponentData: Page = emptyState;

export default function DeclarativeUIWidget() {
  const [componentData, setComponentData] = useState<Page>(defaultComponentData);

  useEffect(() => {
    const injectedData = (window as any).__COMPONENT_DATA__;
    if (injectedData) {
      setComponentData(injectedData);
    }
  }, []);

  return (
    <div className="declarative-ui-widget">
      <CanvasRenderer page={componentData} />
    </div>
  );
}
