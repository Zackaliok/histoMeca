export type VehicleTab = 'informations' | 'historique' | 'entretiens' | 'documents'

export interface Vehicle {
  id: string
  name: string
  type: 'auto' | 'moto'
}

export interface Selection {
  vehicleId: string
  tab: VehicleTab
}

interface SidebarProps {
  vehicles: Vehicle[]
  selection: Selection | null
  onSelect: (selection: Selection) => void
  onHome: () => void
  onAddVehicle: () => void
}

const TABS: { id: VehicleTab; label: string }[] = [
  { id: 'informations', label: 'Informations générales' },
  { id: 'historique',   label: 'Historique' },
  { id: 'entretiens',   label: 'Entretiens' },
  { id: 'documents',    label: 'Documents' },
]

export default function Sidebar({ vehicles, selection, onSelect, onHome, onAddVehicle }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 bg-base-100 border-r border-base-200 flex flex-col min-h-0">

      <div className="p-2 border-b border-base-200">
        <button
          onClick={onHome}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selection === null
              ? 'bg-base-200 text-base-content'
              : 'hover:bg-base-200 text-base-content/70'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Tableau de bord
        </button>
      </div>

      <div className="px-4 py-3 border-b border-base-200">
        <span className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
          Mes véhicules
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {vehicles.length === 0 ? (
          <p className="px-4 py-6 text-sm text-base-content/40 text-center">
            Aucun véhicule enregistré
          </p>
        ) : (
          vehicles.map((vehicle) => (
            <details
              key={vehicle.id}
              open={selection?.vehicleId === vehicle.id}
              className="group"
            >
              <summary className="flex items-center gap-2 px-4 py-2 cursor-pointer select-none hover:bg-base-200 list-none">
                <span>{vehicle.type === 'auto' ? '🚗' : '🏍️'}</span>
                <span className="flex-1 text-sm font-medium truncate">{vehicle.name}</span>
                <svg
                  className="w-4 h-4 text-base-content/40 transition-transform group-open:rotate-180"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              <ul className="pl-8 pb-1">
                {TABS.map((tab) => {
                  const active = selection?.vehicleId === vehicle.id && selection.tab === tab.id
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => onSelect({ vehicleId: vehicle.id, tab: tab.id })}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          active
                            ? 'bg-primary text-primary-content font-medium'
                            : 'hover:bg-base-200 text-base-content/70'
                        }`}
                      >
                        {tab.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </details>
          ))
        )}
      </nav>

      <div className="p-3 border-t border-base-200">
        <button
          onClick={onAddVehicle}
          className="btn btn-primary btn-sm w-full gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un véhicule
        </button>
      </div>

    </aside>
  )
}
