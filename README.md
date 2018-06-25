## `monaco-textmate` with grammars for most languages

See `grammars/` for list of all the languages this package ships with

This package exposes `LanguageRegistry` class which has sweet lookup functions for language grammars.

You can get Grammar/Tokenizer either by language ID or file extension or even MIME type.

Not all grammars have been "registered/activated" for use due to lack of time, so PR's would be appreciated. To "register/activate" a language,
every directory in `grammars/` must have atleast one `[lang-ext].config.json` file that looks like this:

```json
{
    "id": "typescript",
    "scopeName": "source.ts",
    "extensions": [".ts"],
    "mimeType": ["application/typescript"]
}
```

## Usage

```bash
npm i monaco-textmate-languages
```

> You must install all the peer dependencies yourself

```javascript

import { LanguageRegistry } from 'monaco-textmate-languages'

const langRegistry = new LanguageRegistry({
    basePath: 'node_modules/monaco-textmate-languages',
    textFetcher: (uri) => (await fetch(uri)).text(),
    // `jsonFetcher` also works (you must provide either of those)
    // jsonFetcher: (uri) => (await fetch(uri)).json(),
})

langRegistry.getLanguageGrammarByExtension('.tsx')
    .then(grammar => {
        const tokens = grammar.tokenizeLine(`class App extends Component {}`)
        // ...
    })

```

## License

MIT
