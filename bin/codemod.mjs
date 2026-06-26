#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getManifest() {
  try {
    const manifestPath = path.resolve(__dirname, '../dist/manifest.json');
    const content = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('❌ Não foi possível carregar o manifesto. Execute a partir do diretório onde a biblioteca está instalada ou rode "npm run build" primeiro.', err);
    process.exit(1);
  }
}

function processFileContent(content, manifest) {
  // Pattern to match: import { CmButton, CmText as Text } from "cosmemilton-ui";
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+["']cosmemilton-ui["'];?/g;
  
  let modified = false;
  const newContent = content.replace(importRegex, (match, importsStr) => {
    const importedItems = importsStr.split(',').map(s => s.trim()).filter(Boolean);
    
    const categorized = {
      client: [],
      server: [],
      theme: [],
      unknown: []
    };

    for (const itemStr of importedItems) {
      // Ex: "CmButton" or "CmButton as MyButton"
      // Match type imports as well: "type CmButtonProps"
      let originalName = itemStr;
      
      if (originalName.startsWith('type ')) {
        originalName = originalName.substring(5).trim();
      }

      const parts = originalName.split(/\s+as\s+/);
      const exportName = parts[0].trim();
      const entry = manifest[exportName];
      
      if (entry && categorized[entry]) {
        categorized[entry].push(itemStr);
      } else {
        categorized.unknown.push(itemStr);
      }
    }

    const newImports = [];
    if (categorized.client.length > 0) {
      newImports.push(`import { ${categorized.client.join(', ')} } from "cosmemilton-ui/client";`);
    }
    if (categorized.server.length > 0) {
      newImports.push(`import { ${categorized.server.join(', ')} } from "cosmemilton-ui/server";`);
    }
    if (categorized.theme.length > 0) {
      newImports.push(`import { ${categorized.theme.join(', ')} } from "cosmemilton-ui/theme";`);
    }
    if (categorized.unknown.length > 0) {
      newImports.push(`import { ${categorized.unknown.join(', ')} } from "cosmemilton-ui"; // FIXME: Componentes desconhecidos no manifesto`);
    }

    modified = true;
    return newImports.join('\n');
  });

  return { newContent, modified };
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Uso: npx cm-ui-codemod <arquivo1> <arquivo2> ...');
    process.exit(1);
  }

  const manifest = await getManifest();
  let changedFiles = 0;

  for (const filePath of args) {
    try {
      const absolutePath = path.resolve(process.cwd(), filePath);
      const content = await fs.readFile(absolutePath, 'utf-8');
      
      const { newContent, modified } = processFileContent(content, manifest);
      if (modified) {
        await fs.writeFile(absolutePath, newContent, 'utf-8');
        console.log(`✅ Atualizado: ${filePath}`);
        changedFiles++;
      }
    } catch (err) {
      console.error(`❌ Erro ao processar ${filePath}:`, err.message);
    }
  }

  console.log(`\n🎉 Codemod concluído. ${changedFiles} arquivo(s) modificado(s).`);
}

run();
