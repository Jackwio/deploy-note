import DefaultTheme from 'vitepress/theme'
import { inBrowser, useRoute, type Theme } from 'vitepress'
import { nextTick, watch } from 'vue'
import mediumZoom, { type Zoom } from 'medium-zoom'
import './style.css'

const imageSelector = '.vp-doc img'
let zoom: Zoom | null = null

function setupImageZoom(): void {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>(imageSelector)).filter((image) => {
    return !image.closest('a, .no-zoom') && !image.classList.contains('no-zoom')
  })

  if (!zoom) {
    zoom = mediumZoom(images, {
      background: 'var(--vp-c-bg)'
    })
    return
  }

  zoom.detach()
  zoom.attach(images)
}

const theme: Theme = {
  extends: DefaultTheme,
  setup() {
    if (!inBrowser) {
      return
    }

    const route = useRoute()

    nextTick(setupImageZoom)
    watch(
      () => route.path,
      () => {
        nextTick(setupImageZoom)
      }
    )
  }
}

export default theme
