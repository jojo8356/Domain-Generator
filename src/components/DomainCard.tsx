import { Component, Show } from 'solid-js'
import { saveDomainAction } from '~/lib/actions'

interface DomainCardProps {
  domain: string
  available: boolean | null
  checking: boolean
  onCheck: () => void
}

export const DomainCard: Component<DomainCardProps> = (props) => {
  const handleSave = async () => {
    try {
      await saveDomainAction(props.domain, props.available)
    } catch (error) {
      console.error('Failed to save domain:', error)
    }
  }

  const statusColor = () => {
    if (props.available === null) return 'text-gray-400'
    return props.available ? 'text-available' : 'text-taken'
  }

  const statusBg = () => {
    if (props.available === null) return 'bg-gray-100 dark:bg-gray-700'
    return props.available ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
  }

  const statusIcon = () => {
    if (props.available === null) return 'i-carbon-help'
    return props.available ? 'i-carbon-checkmark-filled' : 'i-carbon-close-filled'
  }

  const statusText = () => {
    if (props.available === null) return 'Non verifie'
    return props.available ? 'Disponible' : 'Pris'
  }

  return (
    <div class={`rounded-lg p-4 border border-gray-200 dark:border-gray-700 ${statusBg()} transition-colors`}>
      <div class="flex items-center justify-between mb-3">
        <span class="font-mono font-medium text-lg">{props.domain}</span>
        <Show when={!props.checking} fallback={
          <span class="i-carbon-circle-dash animate-spin text-indigo-500" />
        }>
          <span class={`${statusIcon()} ${statusColor()}`} />
        </Show>
      </div>

      <div class="flex items-center justify-between">
        <span class={`text-sm ${statusColor()}`}>
          {props.checking ? 'Verification...' : statusText()}
        </span>

        <div class="flex gap-2">
          <Show when={props.available === null && !props.checking}>
            <button
              onClick={props.onCheck}
              class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Verifier la disponibilite"
            >
              <span class="i-carbon-search" />
            </button>
          </Show>

          <button
            onClick={handleSave}
            class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Sauvegarder"
          >
            <span class="i-carbon-bookmark-add" />
          </button>

          <a
            href={`https://www.namecheap.com/domains/registration/results/?domain=${props.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Rechercher sur Namecheap"
          >
            <span class="i-carbon-launch" />
          </a>
        </div>
      </div>
    </div>
  )
}
