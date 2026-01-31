export const PAGE_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/ai-canvas/page.schema.json",
  "title": "AI Canvas Page",
  "type": "object",
  "additionalProperties": false,
  "required": ["layout", "components", "data"],
  "properties": {
    "meta": { "$ref": "#/$defs/Meta" },
    "layout": { "$ref": "#/$defs/Layout" },
    "components": { "$ref": "#/$defs/Components" },
    "data": { "$ref": "#/$defs/Data" }
  },
  "$defs": {
    "Meta": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "title": { "type": "string", "minLength": 1 },
        "description": { "type": "string" },
        "version": { "type": "string" }
      }
    },
    "Layout": {
      "type": "object",
      "additionalProperties": false,
      "required": ["engine", "items"],
      "properties": {
        "engine": { "type": "string", "enum": ["rgl"] },
        "cols": { "type": "integer", "minimum": 1, "default": 24 },
        "rowHeight": { "type": "integer", "minimum": 1, "default": 30 },
        "margin": {
          "type": "array",
          "items": { "type": "integer", "minimum": 0 },
          "minItems": 2,
          "maxItems": 2,
          "default": [10, 10]
        },
        "containerPadding": {
          "type": "array",
          "items": { "type": "integer", "minimum": 0 },
          "minItems": 2,
          "maxItems": 2,
          "default": [0, 0]
        },
        "items": {
          "type": "array",
          "minItems": 1,
          "items": { "$ref": "#/$defs/RglItem" }
        }
      }
    },
    "RglItem": {
      "type": "object",
      "additionalProperties": false,
      "required": ["i", "x", "y", "w", "h"],
      "properties": {
        "i": { "type": "string", "minLength": 1 },
        "x": { "type": "integer", "minimum": 0 },
        "y": { "type": "integer", "minimum": 0 },
        "w": { "type": "integer", "minimum": 1 },
        "h": { "type": "integer", "minimum": 1 },
        "static": { "type": "boolean", "default": false }
      }
    },
    "Components": {
      "type": "object",
      "description": "Map of componentId -> component config. Keys should match layout.items[*].i.",
      "additionalProperties": { "$ref": "#/$defs/Component" }
    },
    "Component": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type"],
      "properties": {
        "type": { "type": "string", "enum": ["vegalite5", "map", "list", "form", "table", "markdown", "mermaid"] },
        "title": { "type": "string" },
        "dataRef": { "type": "string", "minLength": 1 },
        "config": {
          "type": "object",
          "description": "Component-specific configuration (non-Vega-Lite components). Keep flexible for now.",
          "additionalProperties": true,
          "default": {}
        },
        "spec": {
          "type": "object",
          "description": "Vega-Lite spec (only for type=vegalite5).",
          "additionalProperties": true
        }
      },
      "allOf": [
        {
          "if": { "properties": { "type": { "const": "vegalite5" } }, "required": ["type"] },
          "then": {
            "required": ["spec"]
          },
          "else": {
            "properties": {
              "spec": false
            }
          }
        },
        {
          "if": { "properties": { "type": { "const": "map" } }, "required": ["type"] },
          "then": {
            "properties": {
              "config": {
                "type": "object",
                "additionalProperties": true,
                "description": "MapLibre GL JS configuration. Provide either a MapLibre Style Specification object (Mapbox style spec v8) directly, or an object like { style: <style-spec-or-url>, options: <map options> }."
              }
            }
          }
        },
        {
          "if": { "properties": { "type": { "const": "table" } }, "required": ["type"] },
          "then": {
            "properties": {
              "config": {
                "type": "object",
                "additionalProperties": true,
                "required": ["columns"],
                "properties": {
                  "columns": {
                    "type": "array",
                    "minItems": 1,
                    "items": { "$ref": "#/$defs/Column" }
                  }
                }
              }
            }
          }
        },
        {
          "if": { "properties": { "type": { "const": "form" } }, "required": ["type"] },
          "then": {
            "properties": {
              "config": {
                "type": "object",
                "additionalProperties": true,
                "required": ["columns"],
                "properties": {
                  "columns": {
                    "type": "array",
                    "minItems": 1,
                    "items": { "$ref": "#/$defs/Column" }
                  }
                }
              }
            }
          }
        },
        {
          "if": { "properties": { "type": { "const": "list" } }, "required": ["type"] },
          "then": {
            "properties": {
              "config": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        },
        {
          "if": { "properties": { "type": { "const": "markdown" } }, "required": ["type"] },
          "then": {
            "properties": {
              "config": {
                "type": "object",
                "additionalProperties": true,
                "required": ["md"],
                "properties": {
                  "md": {
                    "type": "string",
                    "minLength": 1,
                    "description": "Markdown content to render"
                  }
                }
              }
            }
          }
        },
        {
          "if": { "properties": { "type": { "const": "mermaid" } }, "required": ["type"] },
          "then": {
            "properties": {
              "config": {
                "type": "object",
                "additionalProperties": true,
                "required": ["mermaid"],
                "properties": {
                  "mermaid": {
                    "type": "string",
                    "minLength": 1,
                    "description": "Mermaid diagram definition"
                  }
                }
              }
            }
          }
        }
      ]
    },
    "Column": {
      "type": "object",
      "additionalProperties": false,
      "required": ["key", "label"],
      "properties": {
        "key": { "type": "string", "minLength": 1 },
        "label": { "type": "string", "minLength": 1 }
      }
    },
    "Data": {
      "type": "object",
      "description": "Map of datasetName -> inline dataset.",
      "additionalProperties": { "$ref": "#/$defs/InlineDataset" }
    },
    "InlineDataset": {
      "type": "object",
      "additionalProperties": false,
      "required": ["source", "rows"],
      "properties": {
        "source": { "type": "string", "enum": ["inline"] },
        "rows": {
          "type": "array",
          "items": { "type": "object", "additionalProperties": true }
        }
      }
    }
  }
} as const;
