import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export default function DashboardPage() {
  const navigate = useNavigate()

  async function handleLogout() {
    await authService.logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200">

      <header className="navbar bg-base-100 shadow-sm px-6">
        <div className="flex-1">
          <span className="text-xl font-bold">🚗 histoMeca 🏍️</span>
        </div>
        <div className="flex-none">
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-base-content/60 text-sm mt-1">Bienvenue sur votre espace histoMeca</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-title">Véhicules</div>
            <div className="stat-value">0</div>
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

        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center gap-3">
            <span className="text-4xl">🚗</span>
            <h2 className="card-title">Ajoutez votre premier véhicule</h2>
            <p className="text-base-content/60 text-sm">
              Commencez par enregistrer un véhicule pour suivre son historique d'entretien.
            </p>
            <button className="btn btn-primary mt-2" disabled>
              Ajouter un véhicule
            </button>
          </div>
        </div>

      </main>

    </div>
  )
}
