export function isDesktopViewport(): boolean {
  if (typeof window.matchMedia !== 'function') {
    return true
  }

  return window.matchMedia('(min-width: 768px)').matches
}

export function isMobileViewport(): boolean {
  if (typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia('(max-width: 767px)').matches
}
