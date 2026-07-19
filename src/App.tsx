import { DesignShowcasePage } from '@/pages/DesignShowcasePage'
import { useApplyTheme } from '@/hooks/useApplyTheme'

export function App() {
  useApplyTheme()
  // v0.2: el showcase del design system es la pantalla temporal.
  // El router y el shell de navegación llegan en la v0.3.
  return <DesignShowcasePage />
}
