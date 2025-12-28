import { Component, createSignal, onMount, For, Show } from 'solid-js'
import { getSavedDomainsAction, toggleFavoriteAction, deleteDomainAction } from '~/lib/actions'

interface Domain {
  id: number
  domain: string
  available: boolean | null
  favorite: boolean
}

export const SavedDomains: Component = () => {
  const [domains, setDomains] = createSignal<Domain[]>([])
  const [loading, setLoading] = createSignal(true)
  const [filter, setFilter] = createSignal<'all' | 'available' | 'favorites'>('all')

  const loadDomains = async () => {
    try {
      const data = await getSavedDomainsAction()
      setDomains(data as Domain[])
    } catch (error) {
      console.error('Failed to load domains:', error)
    } finally {
      setLoading(false)
    }
  }

  onMount(loadDomains)

  const handleToggleFavorite = async (id: number) => {
    try {
      const updated = await toggleFavoriteAction(id)
      setDomains(d => d.map(item => item.id === id ? updated as Domain : item))
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteDomainAction(id)
      setDomains(d => d.filter(item => item.id !== id))
    } catch (error) {
      console.error('Failed to delete domain:', error)
    }
  }

  const filteredDomains = () => {
    const all = domains()
    switch (filter()) {
      case 'available':
        return all.filter(d => d.available === true)
      case 'favorites':
        return all.filter(d => d.favorite)
      default:
        return all
    }
  }

  const statusColor = (available: boolean | null | undefined) => {
    if (available === null || available === undefined) return 'text-gray-400'
    return available ? 'text-available' : 'text-taken'
  }

  const statusIcon = (available: boolean | null | undefined) => {
    if (available === null || available === undefined) return 'i-carbon-help'
    return available ? 'i-carbon-checkmark-filled' : 'i-carbon-close-filled'
  }

  return (
    <div class="card">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 class="text-xl font-semibold">Domaines sauvegardes</h2>

        <div class="flex gap-2">
          <button
            class={`btn ${filter() === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            class={`btn ${filter() === 'available' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('available')}
          >
            Disponibles
          </button>
          <button
            class={`btn ${filter() === 'favorites' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('favorites')}
          >
            Favoris
          </button>
        </div>
      </div>

      <Show when={!loading()} fallback={
        <div class="flex justify-center py-12">
          <span class="i-carbon-circle-dash animate-spin text-3xl text-indigo-500" />
        </div>
      }>
        <Show when={filteredDomains().length > 0} fallback={
          <div class="text-center py-12 text-gray-500">
            <span class="i-carbon-document text-4xl mb-4 block" />
            <p>Aucun domaine sauvegarde</p>
          </div>
        }>
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <For each={filteredDomains()}>
              {(domain) => (
                <div class="flex items-center justify-between py-4">
                  <div class="flex items-center gap-4">
                    <span class={`${statusIcon(domain.available)} ${statusColor(domain.available)}`} />
                    <span class="font-mono font-medium">{domain.domain}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFavorite(domain.id)}
                      class={`p-2 rounded-lg transition-colors ${
                        domain.favorite
                          ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={domain.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <span class={domain.favorite ? 'i-carbon-star-filled' : 'i-carbon-star'} />
                    </button>

                    <a
                      href={`https://www.namecheap.com/domains/registration/results/?domain=${domain.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Rechercher sur Namecheap"
                    >
                      <span class="i-carbon-launch" />
                    </a>

                    <button
                      onClick={() => handleDelete(domain.id)}
                      class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Supprimer"
                    >
                      <span class="i-carbon-trash-can" />
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  )
}
