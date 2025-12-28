'use server'

import dns from 'dns'
import { promisify } from 'util'

const resolveDns = promisify(dns.resolve)

export interface AvailabilityResult {
  available: boolean | null
  method: string
  error?: string
}

async function checkViaDNS(domain: string): Promise<boolean | null> {
  try {
    await resolveDns(domain)
    return false
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return true
    }
    return null
  }
}

async function checkViaRDAP(domain: string): Promise<boolean | null> {
  const tld = domain.split('.').pop()

  const rdapServers: Record<string, string> = {
    'com': 'https://rdap.verisign.com/com/v1/domain/',
    'net': 'https://rdap.verisign.com/net/v1/domain/',
    'org': 'https://rdap.org.afilias.info/rdap/domain/',
    'io': 'https://rdap.nic.io/domain/',
    'dev': 'https://rdap.nic.google/domain/',
    'app': 'https://rdap.nic.google/domain/',
  }

  const server = rdapServers[tld || '']
  if (!server) {
    return null
  }

  try {
    const response = await fetch(`${server}${domain}`, {
      headers: { 'Accept': 'application/rdap+json' },
    })

    if (response.status === 200) {
      return false
    } else if (response.status === 404) {
      return true
    }
    return null
  } catch {
    return null
  }
}

export async function checkDomainAvailability(domain: string): Promise<AvailabilityResult> {
  const cleanDomain = domain.toLowerCase().trim()

  const rdapResult = await checkViaRDAP(cleanDomain)
  if (rdapResult !== null) {
    return { available: rdapResult, method: 'rdap' }
  }

  const dnsResult = await checkViaDNS(cleanDomain)
  if (dnsResult !== null) {
    return { available: dnsResult, method: 'dns' }
  }

  return { available: null, method: 'unknown', error: 'Could not determine availability' }
}
