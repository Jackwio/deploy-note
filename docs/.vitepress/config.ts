import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type DefaultTheme } from 'vitepress'

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const collator = new Intl.Collator('zh-Hant')
const siteBase = resolveSiteBase()

// 根層資料夾白名單：放入名稱可在初始載入時展開
const expandedTopLevelDirs = new Set<string>([])

function isHidden(name: string): boolean {
  return name.startsWith('.')
}

function sortByLocale<T extends { name: string }>(entries: T[]): T[] {
  return entries.sort((a, b) => collator.compare(a.name, b.name))
}

function readVisibleEntries(dirPath: string): fs.Dirent[] {
  return sortByLocale(
    fs.readdirSync(dirPath, { withFileTypes: true }).filter((entry) => {
      if (entry.name === '.vitepress') {
        return false
      }

      return !isHidden(entry.name)
    })
  )
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join('/')
}

function toPageLink(relativeMarkdownPath: string): string {
  const normalized = toPosixPath(relativeMarkdownPath).replace(/\.md$/, '')

  if (normalized === 'index') {
    return '/'
  }

  if (normalized.endsWith('/index')) {
    return `/${normalized.slice(0, -'/index'.length)}/`
  }

  return `/${normalized}`
}

function createDirectoryGroup(relativeDirPath: string, depth: number): DefaultTheme.SidebarItem {
  const absoluteDirPath = path.join(docsRoot, relativeDirPath)
  const entries = readVisibleEntries(absoluteDirPath)
  const items: DefaultTheme.SidebarItem[] = []

  for (const entry of entries) {
    const relativeEntryPath = path.join(relativeDirPath, entry.name)

    if (entry.isDirectory()) {
      items.push(createDirectoryGroup(relativeEntryPath, depth + 1))
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      continue
    }

    const link = toPageLink(relativeEntryPath)
    if (link === '/') {
      continue
    }

    items.push({
      text: path.basename(entry.name, '.md'),
      link
    })
  }

  const dirName = path.basename(relativeDirPath)
  const isTopLevelDirectory = depth === 0

  return {
    text: dirName,
    collapsed: isTopLevelDirectory ? !expandedTopLevelDirs.has(dirName) : false,
    items
  }
}

function createSidebar(): DefaultTheme.SidebarItem[] {
  const rootEntries = readVisibleEntries(docsRoot)
  const rootItems: DefaultTheme.SidebarItem[] = []
  const directoryGroups: DefaultTheme.SidebarItem[] = []

  for (const entry of rootEntries) {
    if (entry.isDirectory()) {
      directoryGroups.push(createDirectoryGroup(entry.name, 0))
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      continue
    }

    if (entry.name === 'index.md') {
      continue
    }

    rootItems.push({
      text: path.basename(entry.name, '.md'),
      link: toPageLink(entry.name)
    })
  }

  if (rootItems.length > 0) {
    directoryGroups.unshift({
      text: '根目錄',
      collapsed: false,
      items: rootItems
    })
  }

  return directoryGroups
}

function resolveSiteBase(): string {
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'

  if (!isGitHubActions || !repository || repository.endsWith('.github.io')) {
    return '/'
  }

  return `/${repository}/`
}

export default defineConfig({
  base: siteBase,
  title: 'Deploy Note',
  description: 'Deploy on K8s or Zeabur and some Docker info',
  themeConfig: {
    nav: [{ text: 'Home', link: '/' }],
    sidebar: createSidebar()
  }
})
