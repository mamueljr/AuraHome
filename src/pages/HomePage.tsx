import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { MODULES } from '@/config/navigation'

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'Buenas noches'
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const FEATURED_IDS = ['servicios', 'tareas', 'calendario', 'compras'] as const

/**
 * Pantalla de inicio provisional (v0.3). En la v0.5 se convertirá
 * en el Dashboard con datos reales.
 */
export function HomePage() {
  const featured = MODULES.filter((m) =>
    (FEATURED_IDS as readonly string[]).includes(m.id),
  )

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <p className="text-sm text-muted-foreground">{greeting()} 👋</p>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Tu hogar, en orden
        </h2>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {featured.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: 'easeOut' }}
          >
            <Link to={m.path} className="group block">
              <Card className="transition-shadow group-hover:shadow-md">
                <CardContent className="flex items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <m.icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{m.label}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {m.description}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  )
}
