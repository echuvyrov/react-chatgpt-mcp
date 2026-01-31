import Ajv, { type ErrorObject } from "ajv";
import { PAGE_SCHEMA } from "./schema";

let ajvInstance: Ajv | null = null;

function getAjv(): Ajv {
  if (!ajvInstance) {
    ajvInstance = new Ajv({ 
      allErrors: true, 
      strict: false,
      validateSchema: false
    });
  }
  return ajvInstance;
}

export function validatePageJson(data: unknown): { valid: boolean; errors: ErrorObject[] | null } {
  const ajv = getAjv();
  
  const schemaClone = JSON.parse(JSON.stringify(PAGE_SCHEMA));
  delete schemaClone.$schema;
  delete schemaClone.$id;
  
  const validate = ajv.compile(schemaClone);
  const valid = validate(data);
  
  return {
    valid,
    errors: valid ? null : (validate.errors ?? null)
  };
}
