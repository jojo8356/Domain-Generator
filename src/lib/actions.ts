'use server'

import { prisma } from './db'
import { generateDomains, type GeneratorOptions } from './generator'
import { checkDomainAvailability } from './availability'

export async function generateDomainsAction(options: GeneratorOptions) {
  return generateDomains(options)
}

export async function checkAvailabilityAction(domain: string) {
  return checkDomainAvailability(domain)
}

export async function checkBulkAvailabilityAction(domains: string[]) {
  const results = await Promise.all(
    domains.map(async (domain) => {
      const result = await checkDomainAvailability(domain)
      return { domain, ...result }
    })
  )
  return results
}

export async function saveDomainAction(domain: string, available?: boolean | null) {
  return prisma.savedDomain.upsert({
    where: { domain },
    update: { available, checkedAt: new Date() },
    create: { domain, available, checkedAt: new Date() },
  })
}

export async function getSavedDomainsAction() {
  return prisma.savedDomain.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function toggleFavoriteAction(id: number) {
  const domain = await prisma.savedDomain.findUnique({ where: { id } })
  if (!domain) throw new Error('Domain not found')

  return prisma.savedDomain.update({
    where: { id },
    data: { favorite: !domain.favorite },
  })
}

export async function deleteDomainAction(id: number) {
  await prisma.savedDomain.delete({ where: { id } })
  return { success: true }
}
