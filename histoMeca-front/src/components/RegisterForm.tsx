import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { useToast } from '../context/ToastContext'

export default function RegisterForm() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.register(form)
      toast('Compte créé avec succès', 'success')
      navigate('/dashboard')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erreur lors de la création du compte', 'error')
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
            <p className="text-base-content/60 text-sm mt-1">Créez votre espace</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-2">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Prénom</span>
                </div>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Jean"
                  className="input input-bordered w-full"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Nom</span>
                </div>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Dupont"
                  className="input input-bordered w-full"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Email</span>
              </div>
              <input
                type="email"
                name="email"
                placeholder="votre@email.com"
                className="input input-bordered w-full"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Mot de passe</span>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />
              <div className="label">
                <span className="label-text-alt text-base-content/50">8 caractères minimum</span>
              </div>
            </label>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Déjà un compte ?{' '}
            <Link to="/login" className="link link-primary">
              Se connecter
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
