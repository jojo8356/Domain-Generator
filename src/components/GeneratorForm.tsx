import { Component, createSignal, For, Show } from 'solid-js'

interface GeneratorFormProps {
  onGenerate: (options: {
    count: number
    tlds: string[]
    includePrefix: boolean
    includeSuffix: boolean
    keywords: string[]
  }) => void
  loading: boolean
}

const availableTlds = [
  { value: '.com', label: '.com' },
  { value: '.net', label: '.net' },
  { value: '.org', label: '.org' },
  { value: '.io', label: '.io' },
  { value: '.dev', label: '.dev' },
  { value: '.app', label: '.app' },
  { value: '.co', label: '.co' },
  { value: '.me', label: '.me' },
  { value: '.ai', label: '.ai' },
  { value: '.tech', label: '.tech' },
]

export const GeneratorForm: Component<GeneratorFormProps> = (props) => {
  const [count, setCount] = createSignal(10)
  const [selectedTlds, setSelectedTlds] = createSignal<string[]>(['.com'])
  const [includePrefix, setIncludePrefix] = createSignal(true)
  const [includeSuffix, setIncludeSuffix] = createSignal(true)
  const [keywords, setKeywords] = createSignal<string[]>([])
  const [keywordInput, setKeywordInput] = createSignal('')

  const toggleTld = (tld: string) => {
    const current = selectedTlds()
    if (current.includes(tld)) {
      if (current.length > 1) {
        setSelectedTlds(current.filter(t => t !== tld))
      }
    } else {
      setSelectedTlds([...current, tld])
    }
  }

  const addKeyword = () => {
    const input = keywordInput().trim().toLowerCase()
    if (input && !keywords().includes(input)) {
      setKeywords([...keywords(), input])
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords().filter(k => k !== keyword))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    } else if (e.key === 'Backspace' && keywordInput() === '' && keywords().length > 0) {
      setKeywords(keywords().slice(0, -1))
    }
  }

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    props.onGenerate({
      count: count(),
      tlds: selectedTlds(),
      includePrefix: includePrefix(),
      includeSuffix: includeSuffix(),
      keywords: keywords(),
    })
  }

  return (
    <form onSubmit={handleSubmit} class="card">
      <h2 class="text-xl font-semibold mb-4">Options de generation</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium mb-2">
            Nombre de domaines
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={count()}
            onInput={(e) => setCount(parseInt(e.currentTarget.value) || 10)}
            class="input-field"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">
            Extensions (TLDs)
          </label>
          <div class="flex flex-wrap gap-2">
            <For each={availableTlds}>
              {(tld) => (
                <button
                  type="button"
                  class={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTlds().includes(tld.value)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => toggleTld(tld.value)}
                >
                  {tld.label}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-2">
            Mots-cles (optionnel)
          </label>
          <div class="flex flex-wrap items-center gap-2 p-2 min-h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
            <For each={keywords()}>
              {(keyword) => (
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm">
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    class="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <span class="i-carbon-close text-xs" />
                  </button>
                </span>
              )}
            </For>
            <input
              type="text"
              value={keywordInput()}
              onInput={(e) => setKeywordInput(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder={keywords().length === 0 ? "Tapez un mot et appuyez Entree..." : ""}
              class="flex-1 min-w-32 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
            <Show when={keywordInput().trim()}>
              <button
                type="button"
                onClick={addKeyword}
                class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <span class="i-carbon-add text-indigo-600" />
              </button>
            </Show>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Ces mots seront utilises dans la generation des noms de domaine
          </p>
        </div>

        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includePrefix()}
              onChange={(e) => setIncludePrefix(e.currentTarget.checked)}
              class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm">Inclure prefixes</span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSuffix()}
              onChange={(e) => setIncludeSuffix(e.currentTarget.checked)}
              class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm">Inclure suffixes</span>
          </label>
        </div>
      </div>

      <div class="mt-6">
        <button
          type="submit"
          class="btn-primary w-full md:w-auto"
          disabled={props.loading}
        >
          {props.loading ? (
            <>
              <span class="i-carbon-circle-dash animate-spin mr-2" />
              Generation...
            </>
          ) : (
            <>
              <span class="i-carbon-flash mr-2" />
              Generer des domaines
            </>
          )}
        </button>
      </div>
    </form>
  )
}
