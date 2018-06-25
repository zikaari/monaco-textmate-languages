/**
 * This script will generate a manifest of all the grammars in `/grammars` directory
 * 
 * Manifest will be written at `/src/manifest.ts`
 */

const glob = require('glob')
const Path = require('path')
const fs = require('fs-extra')
const opts = {
    cwd: Path.join(__dirname, '../grammars')
}

const readJson = (relPath) => fs.readJsonSync(Path.join(__dirname, '../grammars', relPath))

const grammarFiles = glob.sync('**/*.tmLanguage.json', opts)
const languageConfigs = glob.sync('**/*.config.json', opts)

const grammarsManifest = grammarFiles.map(grammar => ({
    path: grammar,
    scopeName: readJson(grammar).scopeName,
}))

const languages = languageConfigs.map(configPath => readJson(configPath))

const format = (str) =>
    JSON.stringify(str, '\n', 4)
    .replace(/\"([^(\")"]+)\":/g, '$1:')
    // .replace(/([}"])(?=\W+[}\]])/g, '$1,')

const emit =
    `/**
 * ⚠ This is a script generated file, do not modify by hand ⚠
 */

const grammars = ${format(grammarsManifest)}

const languages = ${format(languages)}

export { grammars, languages }
`

fs.writeFileSync(Path.join(__dirname, '../src/manifest.ts'), emit)