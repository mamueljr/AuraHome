import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useApplyTheme } from '@/hooks/useApplyTheme'
import { AppLayout } from '@/layouts/AppLayout'
import { MODULES } from '@/config/navigation'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ServicesPage } from '@/features/services/ServicesPage'
import { ShoppingPage } from '@/features/shopping/ShoppingPage'
import { TasksPage } from '@/features/tasks/TasksPage'
import { ContactsPage } from '@/features/contacts/ContactsPage'
import { MaintenancePage } from '@/features/maintenance/MaintenancePage'
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
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/compras" element={<ShoppingPage />} />
          <Route path="/mantenimiento" element={<MaintenancePage />} />
          <Route path="/contactos" element={<ContactsPage />} />
          {MODULES.filter(
            (m) =>
              ![
                'servicios',
                'tareas',
                'calendario',
                'compras',
                'mantenimiento',
                'contactos',
              ].includes(m.id),
          ).map((m) => (
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
