import { createSignal, For, Show } from 'solid-js'
import { DomainCard } from '~/components/DomainCard'
import { GeneratorForm } from '~/components/GeneratorForm'
import { SavedDomains } from '~/components/SavedDomains'
import { generateDomainsAction, checkBulkAvailabilityAction } from '~/lib/actions'

interface GeneratedDomain {
  domain: string
  available: boolean | null
  checking: boolean
}

export default function Home() {
  const [domains, setDomains] = createSignal<GeneratedDomain[]>([])
  const [loading, setLoading] = createSignal(false)
  const [searching, setSearching] = createSignal(false)
  const [activeTab, setActiveTab] = createSignal<'generator' | 'saved'>('generator')
  const [lastOptions, setLastOptions] = createSignal<{
    count: number
    tlds: string[]
    includePrefix: boolean
    includeSuffix: boolean
    keywords: string[]
  } | null>(null)

  const handleGenerate = async (options: {
    count: number
    tlds: string[]
    includePrefix: boolean
    includeSuffix: boolean
    keywords: string[]
  }) => {
    setLoading(true)
    setLastOptions(options)
    try {
      const generated = await generateDomainsAction(options)
      setDomains(generated.map(d => ({ domain: d, available: null, checking: false })))
    } catch (error) {
      console.error('Failed to generate domains:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckAll = async () => {
    const currentDomains = domains()
    if (currentDomains.length === 0) return

    setDomains(currentDomains.map(d => ({ ...d, checking: true })))

    try {
      const results = await checkBulkAvailabilityAction(currentDomains.map(d => d.domain))
      const resultMap = new Map(results.map(r => [r.domain, r]))

      setDomains(currentDomains.map(d => ({
        ...d,
        available: resultMap.get(d.domain)?.available ?? null,
        checking: false,
      })))
    } catch (error) {
      console.error('Failed to check availability:', error)
      setDomains(currentDomains.map(d => ({ ...d, checking: false })))
    }
  }

  const handleCheckSingle = async (domain: string) => {
    setDomains(d => d.map(item =>
      item.domain === domain ? { ...item, checking: true } : item
    ))

    try {
      const results = await checkBulkAvailabilityAction([domain])
      const result = results[0]

      setDomains(d => d.map(item =>
        item.domain === domain
          ? { ...item, available: result?.available ?? null, checking: false }
          : item
      ))
    } catch (error) {
      console.error('Failed to check domain:', error)
      setDomains(d => d.map(item =>
        item.domain === domain ? { ...item, checking: false } : item
      ))
    }
  }

  const handleFindAllAvailable = async () => {
    const options = lastOptions()
    if (!options) return

    setSearching(true)
    const availableDomains: GeneratedDomain[] = []
    const maxAttempts = 100

    try {
      let attempts = 0
      while (availableDomains.length < options.count && attempts < maxAttempts) {
        attempts++
        const needed = options.count - availableDomains.length
        const generated = await generateDomainsAction({ ...options, count: needed * 2 })

        setDomains([
          ...availableDomains,
          ...generated.map(d => ({ domain: d, available: null, checking: true }))
        ])

        const results = await checkBulkAvailabilityAction(generated)

        for (const result of results) {
          if (result.available === true && availableDomains.length < options.count) {
            availableDomains.push({
              domain: result.domain,
              available: true,
              checking: false,
            })
          }
        }

        setDomains([...availableDomains])
      }

      if (availableDomains.length < options.count) {
        console.warn(`Only found ${availableDomains.length} available domains after ${maxAttempts} attempts`)
      }
    } catch (error) {
      console.error('Failed to find available domains:', error)
    } finally {
      setSearching(false)
    }
  }

  const allChecked = () => {
    const d = domains()
    return d.length > 0 && d.every(domain => domain.available !== null)
  }

  const hasUnavailable = () => {
    return domains().some(d => d.available === false)
  }

  return (
    <div class="max-w-6xl mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Domain Generator
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Trouvez le nom de domaine parfait pour votre projet
        </p>
      </header>

      <div class="flex justify-center gap-2 mb-8">
        <button
          class={`btn ${activeTab() === 'generator' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('generator')}
        >
          <span class="i-carbon-generate-pdf mr-2" />
          Generateur
        </button>
        <button
          class={`btn ${activeTab() === 'saved' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('saved')}
        >
          <span class="i-carbon-bookmark mr-2" />
          Sauvegardes
        </button>
      </div>

      <Show when={activeTab() === 'generator'}>
        <div class="space-y-6">
          <GeneratorForm onGenerate={handleGenerate} loading={loading()} />

          <Show when={domains().length > 0}>
            <div class="card">
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h2 class="text-xl font-semibold">
                  Resultats ({domains().length})
                </h2>
                <div class="flex gap-2 flex-wrap">
                  <button
                    class="btn-primary"
                    onClick={handleCheckAll}
                    disabled={domains().some(d => d.checking) || searching()}
                  >
                    <span class="i-carbon-search mr-2" />
                    Verifier tout
                  </button>
                  <Show when={allChecked() && hasUnavailable()}>
                    <button
                      class="btn bg-green-600 text-white hover:bg-green-700"
                      onClick={handleFindAllAvailable}
                      disabled={searching()}
                    >
                      {searching() ? (
                        <>
                          <span class="i-carbon-circle-dash animate-spin mr-2" />
                          Recherche...
                        </>
                      ) : (
                        <>
                          <span class="i-carbon-checkmark-filled mr-2" />
                          Trouver que des disponibles
                        </>
                      )}
                    </button>
                  </Show>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <For each={domains()}>
                  {(domain) => (
                    <DomainCard
                      domain={domain.domain}
                      available={domain.available}
                      checking={domain.checking}
                      onCheck={() => handleCheckSingle(domain.domain)}
                    />
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </Show>

      <Show when={activeTab() === 'saved'}>
        <SavedDomains />
      </Show>
    </div>
  )
}
