import "./styles.css";
import { CanvasRenderer } from "declarative-ui-core";
import { useEffect, useState } from "react";
import type { Page } from "declarative-ui-core";

/* TEST DATA - Commented out, uncomment for local testing
const testComponentData: Page = {
  layout: {
    engine: "rgl",
    cols: 24,
    rowHeight: Math.floor((window.innerHeight - 100) / 20),
    margin: [16, 16],
    containerPadding: [16, 16],
    items: [
      { i: "header", x: 0, y: 0, w: 24, h: 2 },
      { i: "chart1", x: 0, y: 2, w: 12, h: 8 },
      { i: "chart2", x: 12, y: 2, w: 12, h: 8 },
      { i: "markdown1", x: 0, y: 10, w: 12, h: 10 },
      { i: "mermaid1", x: 12, y: 10, w: 12, h: 10 }
    ]
  },
  components: {
    header: {
      type: "markdown",
      config: {
        md: "# 📊 Test Dashboard"
      }
    },
    chart1: {
      type: "vegalite5",
      spec: {
        mark: "bar",
        data: {
          values: [
            { category: "A", value: 28 },
            { category: "B", value: 55 },
            { category: "C", value: 43 },
            { category: "D", value: 91 },
            { category: "E", value: 81 }
          ]
        },
        encoding: {
          x: { field: "category", type: "nominal", axis: { title: "Category" } },
          y: { field: "value", type: "quantitative", axis: { title: "Value" } }
        },
        title: "Bar Chart Example"
      }
    },
    chart2: {
      type: "vegalite5",
      spec: {
        mark: "line",
        data: {
          values: [
            { month: "Jan", sales: 120 },
            { month: "Feb", sales: 150 },
            { month: "Mar", sales: 180 },
            { month: "Apr", sales: 220 },
            { month: "May", sales: 260 }
          ]
        },
        encoding: {
          x: { field: "month", type: "ordinal", axis: { title: "Month" } },
          y: { field: "sales", type: "quantitative", axis: { title: "Sales" } }
        },
        title: "Line Chart Example"
      }
    },
    markdown1: {
      type: "markdown",
      config: {
        md: "## Features Tested\n\nVegaLite Charts (Bar and Line)\n\nMarkdown Rendering\n\nMermaid Diagrams\n\nGrid Layout\n\n**Status:** All components working!"
      }
    },
    mermaid1: {
      type: "mermaid",
      config: {
        mermaid: "graph TD\n  A[Start] --> B[Process]\n  B --> C[End]"
      }
    }
  },
  data: {}
};
*/

const defaultComponentData: Page = {
  layout: {
    engine: "rgl",
    cols: 24,
    rowHeight: Math.floor((window.innerHeight - 100) / 20),
    margin: [16, 16],
    containerPadding: [16, 16],
    items: []
  },
  components: {},
  data: {}
};

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
