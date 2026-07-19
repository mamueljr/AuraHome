import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useApplyTheme } from '@/hooks/useApplyTheme'
import { AppLayout } from '@/layouts/AppLayout'
import { MODULES } from '@/config/navigation'
import { DesignShowcasePage } from '@/pages/DesignShowcasePage'
import { HomePage } from '@/pages/HomePage'
import { ModulePlaceholderPage } from '@/pages/ModulePlaceholderPage'
import { ModulesPage } from '@/pages/ModulesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function App() {
  useApplyTheme()

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/modulos" element={<ModulesPage />} />
          {MODULES.map((m) => (
            <Route
              key={m.id}
              path={m.path}
              element={<ModulePlaceholderPage module={m} />}
            />
          ))}
          <Route path="/design" element={<DesignShowcasePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
