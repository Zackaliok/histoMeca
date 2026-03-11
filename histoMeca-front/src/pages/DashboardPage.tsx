import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { vehicleService, type VehicleDTO } from '../services/vehicleService'
import Sidebar, { type Vehicle, type Selection } from '../components/Sidebar'
import AddVehicleModal, { type NewVehicleForm } from '../components/AddVehicleModal'
import { useToast } from '../context/ToastContext'

function toSidebarVehicle(dto: VehicleDTO): Vehicle {
  return {
    id:   dto.id,
    name: `${dto.brand} ${dto.model}`,
    type: dto.type,
  }
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [vehicleDTOs, setVehicleDTOs] = useState<VehicleDTO[]>([])
  const [selection, setSelection] = useState<Selection | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const vehicles = vehicleDTOs.map(toSidebarVehicle)

  useEffect(() => {
    vehicleService.getAll()
      .then(setVehicleDTOs)
      .catch(() => toast('Impossible de charger les véhicules', 'error'))
  }, [])

  async function handleAddVehicle(data: NewVehicleForm) {
    try {
      const { id } = await vehicleService.create(data)
      const newDTO: VehicleDTO = {
        id,
        type:            data.type,
        brand:           data.brand,
        model:           data.model,
        year:            data.year ? parseInt(data.year) : null,
        plate:           data.plate,
        vin:             data.vin || null,
        fuel:            data.fuel || null,
        color:           data.color || null,
        purchaseDate:    data.purchaseDate || null,
        purchaseMileage: data.purchaseMileage ? parseInt(data.purchaseMileage) : null,
        mileage:         data.currentMileage ? { current: parseInt(data.currentMileage), updatedAt: new Date().toISOString() } : null,
        nextService:     null,
        notes:           data.notes || null,
        createdAt:       new Date().toISOString(),
        updatedAt:       new Date().toISOString(),
      }
      setVehicleDTOs((prev) => [...prev, newDTO])
      toast(`${data.brand} ${data.model} ajouté`, 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur lors de l'ajout", 'error')
    }
  }

  async function handleLogout() {
    await authService.logout()
    navigate('/')
  }

  return (
    <div className="h-screen flex flex-col bg-base-200">

      <header className="navbar bg-base-100 shadow-sm px-6 shrink-0">
        <div className="flex-1">
          <span className="text-xl font-bold">🚗 histoMeca 🏍️</span>
        </div>
        <div className="flex-none">
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            Se déconnecter
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        <Sidebar
          vehicles={vehicles}
          selection={selection}
          onSelect={setSelection}
          onHome={() => setSelection(null)}
          onAddVehicle={() => setModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {selection ? (
            <VehicleContent vehicles={vehicles} selection={selection} />
          ) : (
            <Welcome
              vehicleDTOs={vehicleDTOs}
              onAddVehicle={() => setModalOpen(true)}
              onSelect={setSelection}
            />
          )}
        </main>

      </div>

      <AddVehicleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddVehicle}
      />

    </div>
  )
}

// ---------------------------------------------------------------------------

function Welcome({
  vehicleDTOs,
  onAddVehicle,
  onSelect,
}: {
  vehicleDTOs: VehicleDTO[]
  onAddVehicle: () => void
  onSelect: (s: Selection) => void
}) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-base-content/60 text-sm mt-1">Bienvenue sur votre espace histoMeca</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Véhicules</div>
          <div className="stat-value">{vehicleDTOs.length}</div>
          <div className="stat-desc">enregistrés</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Entretiens</div>
          <div className="stat-value">0</div>
          <div className="stat-desc">ce mois-ci</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Prochaine échéance</div>
          <div className="stat-value text-lg">—</div>
          <div className="stat-desc">aucune planifiée</div>
        </div>
      </div>

      {vehicleDTOs.length === 0 ? (
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center gap-3">
            <span className="text-4xl">🚗</span>
            <h2 className="card-title">Ajoutez votre premier véhicule</h2>
            <p className="text-base-content/60 text-sm">
              Enregistrez votre véhicule pour commencer à suivre son historique d'entretien.
            </p>
            <button onClick={onAddVehicle} className="btn btn-primary btn-sm mt-1">
              Ajouter un véhicule
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vehicleDTOs.map((dto) => (
            <VehicleCard
              key={dto.id}
              dto={dto}
              onSelect={() => onSelect({ vehicleId: dto.id, tab: 'informations' })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function VehicleCard({ dto, onSelect }: { dto: VehicleDTO; onSelect: () => void }) {
  const emoji = dto.type === 'auto' ? '🚗' : '🏍️'

  return (
    <div className="card bg-base-100 shadow hover:shadow-md transition-shadow">
      <div className="card-body gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h2 className="card-title text-base leading-tight">{dto.brand} {dto.model}</h2>
            {dto.year && <p className="text-base-content/50 text-xs">{dto.year}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {dto.plate && (
            <InfoRow label="Immatriculation" value={dto.plate} />
          )}
          {dto.fuel && (
            <InfoRow label="Carburant" value={dto.fuel} />
          )}
          {dto.mileage?.current != null && (
            <InfoRow label="Kilométrage" value={`${dto.mileage.current.toLocaleString('fr-FR')} km`} />
          )}
          {dto.color && (
            <InfoRow label="Couleur" value={dto.color} />
          )}
        </div>

        <div className="card-actions justify-end mt-1">
          <button onClick={onSelect} className="btn btn-primary btn-xs">
            Voir le détail
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-base-content/40 text-xs">{label}</span>
      <p className="font-medium text-sm">{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------

function VehicleContent({ vehicles, selection }: { vehicles: Vehicle[]; selection: Selection }) {
  const vehicle = vehicles.find((v) => v.id === selection.vehicleId)
  if (!vehicle) return null

  const titles: Record<Selection['tab'], string> = {
    informations: 'Informations générales',
    historique:   'Historique',
    entretiens:   'Entretiens',
    documents:    'Documents',
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{vehicle.name}</h1>
        <p className="text-base-content/60 text-sm mt-1">{titles[selection.tab]}</p>
      </div>
      <div className="card bg-base-100 shadow">
        <div className="card-body items-center text-center text-base-content/40 py-16">
          À implémenter
        </div>
      </div>
    </div>
  )
}
