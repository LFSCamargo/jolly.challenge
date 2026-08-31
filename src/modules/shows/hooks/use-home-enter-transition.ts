import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

let trackedPathname: string | undefined

export function useHomeEnterTransition() {
  const { pathname } = useLocation()
  const [isEnteringFromSearch, setIsEnteringFromSearch] = useState(
    () => pathname === '/' && trackedPathname === '/search',
  )

  useEffect(() => {
    const previousPathname = trackedPathname
    trackedPathname = pathname

    if (pathname === '/' && previousPathname === '/search') {
      setIsEnteringFromSearch(true)

      const timeoutId = window.setTimeout(() => {
        setIsEnteringFromSearch(false)
      }, 700)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }

    setIsEnteringFromSearch(false)
  }, [pathname])

  return isEnteringFromSearch
}
