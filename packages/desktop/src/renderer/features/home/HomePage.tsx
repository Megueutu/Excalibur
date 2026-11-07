import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { StatusDot } from '@/shared/ui/badge'
import { Group, PageHeader } from '@/shared/ui/page'

const PROTOTYPE_NOTE = 'Protótipo: nada é gravado'

export function HomePage() {
  const { data = [] } = useQuery({ queryKey: ['attention'], queryFn: () => api.listAttention() })

  return (
    <>
      <PageHeader
        title={data.length ? `${data.length} itens pedem atenção` : 'Tudo em dia'}
        subtitle="O resto está em dia."
        actions={
          <Button variant="primary" disabled title={PROTOTYPE_NOTE}>
            Resolver todos
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-auto px-8 pb-8">
        <Group>
        <ul>
          {data.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <StatusDot />
              <span className="flex-1 text-sm">{item.text}</span>
              <Button size="sm" className="bg-bg hover:bg-panel-2" disabled title={PROTOTYPE_NOTE}>
                {item.action}
              </Button>
            </li>
          ))}
        </ul>
        </Group>
      </div>
    </>
  )
}
