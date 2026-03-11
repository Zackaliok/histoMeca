import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { useToast } from '../context/ToastContext'

export default function LoginForm() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.login({ email, password })
      toast('Connexion réussie', 'success')
      navigate('/dashboard')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Identifiants invalides', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">🚗 histoMeca 🏍️</h1>
            <p className="text-base-content/60 text-sm mt-1">Connectez-vous à votre espace</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Email</span>
              </div>
              <input
                type="email"
                placeholder="votre@email.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Mot de passe</span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="label">
                <a href="#" className="label-text-alt link link-hover">Mot de passe oublié ?</a>
              </div>
            </label>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Pas encore de compte ?{' '}
            <Link to="/register" className="link link-primary">
              S'inscrire
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
