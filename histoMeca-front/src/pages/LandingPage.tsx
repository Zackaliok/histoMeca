import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">

      <header className="navbar bg-base-100 shadow-sm px-6">
        <div className="flex-1">
          <span className="text-xl font-bold">🚗 histoMeca 🏍️</span>
        </div>
        <div className="flex-none">
          <Link to="/login" className="btn btn-primary btn-sm">
            Se connecter
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="max-w-2xl flex flex-col gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight">
            L'historique de vos véhicules,<br />enfin centralisé.
          </h1>
          <p className="text-base-content/60 text-lg">
            Suivez les entretiens, réparations et contrôles techniques de vos voitures et motos en un seul endroit.
          </p>
        </div>

        <Link to="/login" className="btn btn-primary btn-lg">
          Commencer gratuitement
        </Link>
      </main>

      <footer className="footer footer-center p-4 text-base-content/40 text-sm">
        <p>© {new Date().getFullYear()} histoMeca</p>
      </footer>

    </div>
  )
}
