'use strict'

const compile = require('@adguard/hostlist-compiler')
const { join } = require('path')
const fs = require('fs-extra')
const slugify = require('@sindresorhus/slugify')

const distDir = join(__dirname, '../domain-set')
const configurations = [
  {
    name: 'Adaway',
    homepage: 'https://adaway.org',
    sources: [
      {
        source: 'https://adaway.org/hosts.txt',
        type: 'hosts',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Compress',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'neohosts',
    homepage: 'https://github.com/neoFelhz/neohosts',
    sources: [
      {
        source:
          'https://cdn.jsdelivr.net/gh/neoFelhz/neohosts@gh-pages/basic/hosts',
        type: 'hosts',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Compress',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'neohosts-full',
    homepage: 'https://github.com/neoFelhz/neohosts',
    sources: [
      {
        source:
          'https://cdn.jsdelivr.net/gh/neoFelhz/neohosts@gh-pages/full/hosts',
        type: 'hosts',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Compress',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'Tracking Protection filter',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_3_Spyware/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'Chinese filter',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_224_Chinese/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'Annoyances filter',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_14_Annoyances/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'Annoyances filter (cookie notices)',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_18_Annoyances_Cookies/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'Annoyances filter (popups)',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_19_Annoyances_Popups/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'Annoyances filter (mobile app banners)',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_20_Annoyances_MobileApp/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'Annoyances filter (widgets)',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_22_Annoyances_Widgets/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'Annoyances filter (other)',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_21_Annoyances_Other/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'Base filter',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_2_Base/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'Social media filter',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_4_Social/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
  {
    name: 'DNS filter',
    sources: [
      {
        source:
          'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_15_DnsFilter/filter.txt',
      },
    ],
    transformations: [
      'RemoveComments',
      'RemoveModifiers',
      'Validate',
      'Deduplicate',
    ],
  },
]

function formatRule(rule) {
  const reg = /^\|\|(.*)\^$/

  if (!reg.test(rule)) {
    return
  }

  const domain = rule.match(reg)[1]

  return '.' + domain
}

async function outputCompiled(config, compiled) {
  const fileName = `${slugify(config.name)}.txt`
  const dest = join(distDir, fileName)

  if (fs.existsSync(dest)) {
    await fs.remove(dest)
  }

  const stream = fs.createWriteStream(dest)

  for (const rule of compiled) {
    const formatted = formatRule(rule)

    if (formatted) {
      if (formatted.includes('*')) {
        console.warn('⚠️', formatted, 'is skipped because it contains *')
        continue
      }

      stream.write(formatted + '\n')
    }
  }

  stream.end()
}

async function main() {
  for (const config of configurations) {
    const compiled = await compile(config)
    await outputCompiled(config, compiled)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
