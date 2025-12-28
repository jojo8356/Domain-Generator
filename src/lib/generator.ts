const prefixes = [
  'super', 'mega', 'ultra', 'hyper', 'neo', 'cyber', 'digi', 'tech',
  'smart', 'quick', 'fast', 'swift', 'prime', 'next', 'pro', 'max',
  'go', 'my', 'get', 'try', 'use', 'the', 'one', 'all', 'hub', 'app',
  'cloud', 'data', 'meta', 'open', 'easy', 'zen', 'nova', 'flux',
  'vibe', 'wave', 'sync', 'core', 'edge', 'pulse', 'spark', 'blaze'
]

const suffixes = [
  'ly', 'ify', 'io', 'hub', 'lab', 'box', 'kit', 'fy', 'up', 'go',
  'ai', 'app', 'now', 'pro', 'hq', 'base', 'spot', 'zone', 'space',
  'stack', 'flow', 'sync', 'wave', 'nest', 'path', 'way', 'mind',
  'desk', 'point', 'link', 'node', 'net', 'web', 'dev', 'ops'
]

const defaultBaseWords = [
  'code', 'pixel', 'byte', 'logic', 'data', 'algo', 'stack', 'loop',
  'node', 'grid', 'cache', 'query', 'api', 'script', 'dev', 'hack',
  'leaf', 'stone', 'river', 'ocean', 'sky', 'star', 'moon', 'sun',
  'wind', 'fire', 'cloud', 'storm', 'wave', 'peak', 'vale', 'bloom',
  'spark', 'flash', 'pulse', 'flow', 'drift', 'shift', 'boost', 'lift',
  'forge', 'craft', 'build', 'make', 'grow', 'rise', 'leap', 'dash',
  'blue', 'red', 'green', 'gold', 'silver', 'amber', 'azure', 'coral',
  'fox', 'wolf', 'hawk', 'owl', 'bear', 'lion', 'tiger', 'raven',
  'zen', 'sync', 'unity', 'nexus', 'apex', 'core', 'prime', 'nova',
  'vibe', 'aura', 'echo', 'glow', 'haze', 'mist', 'dusk', 'dawn'
]

const shortWords = [
  'bit', 'dot', 'zip', 'tap', 'pop', 'hop', 'jet', 'zap', 'vim', 'pix',
  'dex', 'rex', 'mix', 'fix', 'hex', 'max', 'box', 'fox', 'lux', 'nix'
]

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function weightedRandomElement<T>(arr: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight
  for (let i = 0; i < arr.length; i++) {
    random -= weights[i]
    if (random <= 0) return arr[i]
  }
  return arr[arr.length - 1]
}

// Stratégies avec mots-clés (chaque domaine DOIT contenir au moins un keyword)
function generateWithKeywords(
  keywords: string[],
  includePrefix: boolean,
  includeSuffix: boolean
): string {
  const keyword = randomElement(keywords)

  const strategies: Array<() => string> = [
    // Keyword seul
    () => keyword,
    // Préfixe + keyword
    () => randomElement(prefixes) + keyword,
    // Keyword + suffixe
    () => keyword + randomElement(suffixes),
    // Préfixe + keyword + suffixe
    () => randomElement(prefixes) + keyword + randomElement(suffixes),
    // Keyword + keyword (si plusieurs)
    () => keywords.length > 1
      ? keyword + randomElement(keywords.filter(k => k !== keyword))
      : keyword + randomElement(suffixes),
    // Keyword + mot court
    () => keyword + randomElement(shortWords),
    // Mot court + keyword
    () => randomElement(shortWords) + keyword,
  ]

  // Pondération : favoriser les combinaisons avec préfixes/suffixes selon les options
  const weights = [
    1,                              // keyword seul
    includePrefix ? 3 : 0,          // préfixe + keyword
    includeSuffix ? 3 : 0,          // keyword + suffixe
    (includePrefix && includeSuffix) ? 2 : 0, // préfixe + keyword + suffixe
    keywords.length > 1 ? 2 : 0,    // keyword + keyword
    1,                              // keyword + mot court
    1,                              // mot court + keyword
  ]

  return weightedRandomElement(strategies, weights)().toLowerCase()
}

// Stratégies sans mots-clés (comportement par défaut)
function generateWithoutKeywords(
  includePrefix: boolean,
  includeSuffix: boolean
): string {
  const strategies: Array<() => string | null> = [
    () => randomElement(defaultBaseWords),
    () => includePrefix ? randomElement(prefixes) + randomElement(defaultBaseWords) : null,
    () => includeSuffix ? randomElement(defaultBaseWords) + randomElement(suffixes) : null,
    () => (includePrefix && includeSuffix)
      ? randomElement(prefixes) + randomElement(defaultBaseWords) + randomElement(suffixes)
      : null,
    () => randomElement(shortWords) + randomElement(shortWords),
    () => randomElement(defaultBaseWords) + randomElement(shortWords),
    () => randomElement(shortWords) + randomElement(defaultBaseWords),
  ]

  let result: string | null = null
  let attempts = 0
  while (!result && attempts < 20) {
    attempts++
    result = randomElement(strategies)()
  }

  return (result || randomElement(defaultBaseWords)).toLowerCase()
}

export interface GeneratorOptions {
  count: number
  tlds: string[]
  includePrefix: boolean
  includeSuffix: boolean
  keywords?: string[]
}

export function generateDomains(options: GeneratorOptions): string[] {
  const { count, tlds, includePrefix, includeSuffix, keywords = [] } = options
  const domains = new Set<string>()
  const hasKeywords = keywords.length > 0

  while (domains.size < count) {
    const baseName = hasKeywords
      ? generateWithKeywords(keywords, includePrefix, includeSuffix)
      : generateWithoutKeywords(includePrefix, includeSuffix)

    const tld = randomElement(tlds)
    const domain = `${baseName}${tld}`
    domains.add(domain)
  }

  return Array.from(domains)
}
