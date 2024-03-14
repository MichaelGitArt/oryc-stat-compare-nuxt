// https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-ukrainian.html
// https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-equipment.html

import fs from 'fs'
import { URL } from 'url'

import { JSDOM } from 'jsdom'
import { v4 } from 'uuid'

import type { ISection } from '~/types'

const normilizeText = (text: string | undefined | null): string => {
  if (!text || text.trim() === '') {
    return ''
  }

  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 160) {
      text = `${text.slice(0, i)} ${text.slice(i + 1)}`
    }
  }
  return text.trim()
}

const splitStartNumberAndText = (text: string) => {
  const count = parseInt(text.split(' ')[0])
  text = text.replace(/^\d+ /, '')
  return { count, text }
}

const cacheFolder = new URL('cache', import.meta.url).pathname
const websiteUrls = {
  russianLoses: 'https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-equipment.html',
  ukrainianLoses: 'https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-ukrainian.html',
}

const parseUrl = async(url: string, cacheName: string): Promise<Array<ISection>> => {
  if (!fs.existsSync(cacheFolder)) {
    fs.mkdirSync(cacheFolder)
  }

  const cachePath = `${cacheFolder}/${cacheName}.html`
  const cacheExists = fs.existsSync(cachePath)
  const cacheStats = cacheExists ? fs.statSync(cachePath) : null
  const cacheExpired = cacheStats ? (Date.now() - cacheStats.mtimeMs) > 3600000 : true

  let data: any

  if (cacheExists && !cacheExpired) {
    // read from cache
    const cachedHtml = fs.readFileSync(cachePath, 'utf-8')
    data = cachedHtml
  }
  else {
    const response = await fetch(url)

    // parse html
    const html = await response.text()
    data = html

    fs.writeFileSync(cachePath, html)
  }

  const dom = new JSDOM(data)
  const postBody = dom.window.document.querySelector('.post-body')!

  const losesData: Array<ISection> = []

  const nodes = Array.from(postBody.querySelectorAll('h3, ul'))

  let currentSection: number | null = null

  nodes.forEach((node) => {
    const titleExlude = [
      'Ukraine -',
      'Russia -',
    ]

    if (node.nodeName === 'H3') {
      const text = normilizeText(node.textContent)
      if (!text || titleExlude.some(exclude => text.startsWith(exclude))) {
        return
      }

      currentSection = losesData.push({
        title: node.textContent || 'UKNOWN SECTION',
        items: [],
        id: v4(),
      }) - 1
    }
    else if (node.nodeName === 'UL' && currentSection !== null) {
      const ul = node as HTMLUListElement
      const liList = ul.querySelectorAll('li')
      const liArray = Array.from(liList)

      liArray.forEach((li) => {
        const flags = []
        const links: Array<{
          text: string
          src: string
        }> = []
        let baseText = ''
        for (let i = 0; i < li.childNodes.length; i++) {
          const node = li.childNodes[i]
          if (node.nodeName === 'IMG') {
            flags.push((node as HTMLImageElement).src)
          }

          if (node.nodeName === '#text' && !baseText) {
            baseText = node.textContent as string
          }

          if (node.nodeName === 'A') {
            const text = normilizeText((node as HTMLAnchorElement).textContent)
            links.push({
              text,
              src: (node as HTMLAnchorElement).href,
            })
          }
        }

        const { count, text } = splitStartNumberAndText(
          normilizeText(baseText).replace(/:$/, '').trim(),
        )

        losesData[currentSection!].items.push({
          flags,
          text,
          id: v4(),
          count,
          links,
        })
      })
    }
  })

  return losesData
}

export default defineEventHandler(async() => {
  const russianLoses = await parseUrl(websiteUrls.russianLoses, 'russianLoses')
  const ukrainianLoses = await parseUrl(websiteUrls.ukrainianLoses, 'ukrainianLoses')

  return {
    hello: 'world',
    russianLoses,
    ukrainianLoses,
  }
})
