import { languages, grammars } from './manifest'
import { Registry, IRawTheme, IGrammar } from 'monaco-textmate'

export interface ILanguageRegistryConfig {
    /**
     * Absolute UNIX like path that should lead to root of this package
     *
     * Required to compute path of grammar files
     *
     * Examples:
     *  `node_modules/monaco-textmate-languages` OR
     *  `static/third-party/libs/monaco-textmate-languages` OR
     *  `https://cdn.example.com/dist/monaco-textmate-languages`
     *
     * Remember, the path you provide will be used to load a language,
     * so think about all the things that could go wrong in your setup
     * when this library suffixes the path you provide with a relative
     * path to a grammar file and calls `jsonFetcher` or `textFetcher`
     * with a complete URI
     */
    basePath: string,
    theme?: IRawTheme,

    /**
     * A function that takes a URI (basePath + relativePathToGrammarFile) and returns JSON object
     *
     * Alternative to textFetcher
     */
    jsonFetcher?: (uri: string) => object | Promise<object>

    /**
     * A function that takes a URI (basePath + relativePathToGrammarFile) and returns JSON text
     *
     * Alternative to jsonFetcher
     */
    textFetcher?: (uri: string) => string | Promise<string>
}

export {
    languages
}

export class LanguageRegistry extends Registry {
    constructor(config: ILanguageRegistryConfig) {
        Object.freeze(config)
        super({
            theme: config.theme,
            getGrammarDefinition: async (scopeName: string) => {
                const grammar = grammars.find(o => o.scopeName === scopeName)
                if (grammar) {
                    const uri = config.basePath + (config.basePath.endsWith('/') ? '' : '/') + 'grammars/' + grammar.path;
                    let json = null
                    let err = null
                    if (typeof config.jsonFetcher === 'function') {
                        try {
                            json = await config.jsonFetcher(uri)

                        } catch (error) {
                            err = error
                        }
                    }

                    if (json === null && typeof config.textFetcher === 'function') {
                        try {
                            json = await config.textFetcher(uri)

                        } catch (error) {
                            // `jsonFetcher` error gets higher priority over `textFetcher` error
                            if (err) {
                                throw err
                            } else {
                                throw error
                            }
                        }
                    }
                    return {
                        format: 'json',
                        content: json
                    }
                }
                return null
            }
        })

    }

    /**
     * Returns Grammar by language ID
     * @param langId Language ID (Example: `html`, `typescript`)
     */
    public getLanguageGrammar(langId: string): Promise<IGrammar> {
        const lang = languages.find(l => l.id === langId)
        if (!lang) {
            throw new Error(`Language with id '{langId}' not found in the manifest. Check for spellings or try searching with extension or mime type`)
        }
        return super.loadGrammar(lang.scopeName)
    }

    /**
     * Returns Grammar by file extension
     * @param ext File extension (Example: `.tsx`, `.css`)
     */
    public getLanguageGrammarByExtension(ext: string): Promise<IGrammar> {
        if (!ext.startsWith('.')) {
            ext = '.' + ext
        }
        const lang = languages.find(l => l.extensions.some(ext1 => ext1 === ext))
        if (!lang) {
            throw new Error(`No language matches with extension '${ext}'. Check for spellings or try searching with language ID or mime type`)
        }
        return super.loadGrammar(lang.scopeName)
    }

    /**
     * Return Grammar by MIME type
     * @param mime Mime type (Example: `application/javascript`, `text/html`)
     */
    public getLanguageGrammarByMimeType(mime: string): Promise<IGrammar> {
        const lang = languages.find(l => l.mimeType.some(mimeType => mimeType === mime))
        if (!lang) {
            throw new Error(`No language matches with mime '${mime}'. Check for spellings or try searching with language ID or file extension`)
        }
        return super.loadGrammar(lang.scopeName)
    }
}
