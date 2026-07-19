import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useApplyTheme } from '@/hooks/useApplyTheme'
import { AppLayout } from '@/layouts/AppLayout'
import { MODULES } from '@/config/navigation'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ServicesPage } from '@/features/services/ServicesPage'
import { TasksPage } from '@/features/tasks/TasksPage'
import { DesignShowcasePage } from '@/pages/DesignShowcasePage'
import { ModulePlaceholderPage } from '@/pages/ModulePlaceholderPage'
import { ModulesPage } from '@/pages/ModulesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SettingsPage } from '@/pages/SettingsPage'

export function App() {
  useApplyTheme()

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/modulos" element={<ModulesPage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/tareas" element={<TasksPage />} />
          {MODULES.filter((m) => !['servicios', 'tareas'].includes(m.id)).map((m) => (
            <Route
              key={m.id}
              path={m.path}
              element={<ModulePlaceholderPage module={m} />}
            />
          ))}
          <Route path="/ajustes" element={<SettingsPage />} />
          <Route path="/design" element={<DesignShowcasePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
