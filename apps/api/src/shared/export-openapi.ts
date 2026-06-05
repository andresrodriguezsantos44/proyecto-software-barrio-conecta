// ============================================================================
// Exporta el spec OpenAPI a docs/openapi.json (fuente versionada para la rúbrica).
// Uso: bun run src/shared/export-openapi.ts
// ============================================================================

import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { openapiSpec } from './openapi';

const OUT = resolve(import.meta.dir, '../../../../docs/openapi.json');

await mkdir(dirname(OUT), { recursive: true });
await Bun.write(OUT, JSON.stringify(openapiSpec, null, 2) + '\n');

const pathCount = Object.keys((openapiSpec.paths as object) ?? {}).length;
console.log(`✅ OpenAPI exportado a ${OUT} (${pathCount} paths)`);
