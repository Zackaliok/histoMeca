import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../context/ToastContext'
import LoginForm from './LoginForm'
import * as authServiceModule from '../services/authService'

const TOKENS = { accessToken: 'access', refreshToken: 'refresh' }

function renderLoginForm() {
  render(
    <ToastProvider>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </ToastProvider>,
  )
}

describe('LoginForm', () => {
  afterEach(() => vi.restoreAllMocks())

  test('affiche les champs email et mot de passe', () => {
    renderLoginForm()
    expect(screen.getByPlaceholderText(/votre@email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  test('contient un lien vers la page d\'inscription', () => {
    renderLoginForm()
    expect(screen.getByRole('link', { name: /s'inscrire/i })).toHaveAttribute('href', '/register')
  })

  test('appelle authService.login avec les valeurs saisies', async () => {
    const loginSpy = vi.spyOn(authServiceModule.authService, 'login').mockResolvedValue(TOKENS)
    renderLoginForm()

    await userEvent.type(screen.getByPlaceholderText(/votre@email/i), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'monmotdepasse')
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    expect(loginSpy).toHaveBeenCalledWith({ email: 'test@example.com', password: 'monmotdepasse' })
  })

  test('affiche un toast de succès après connexion', async () => {
    vi.spyOn(authServiceModule.authService, 'login').mockResolvedValue(TOKENS)
    renderLoginForm()

    await userEvent.type(screen.getByPlaceholderText(/votre@email/i), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'monmotdepasse')
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    expect(await screen.findByText(/connexion réussie/i)).toBeInTheDocument()
  })

  test('affiche un toast d\'erreur en cas d\'identifiants invalides', async () => {
    vi.spyOn(authServiceModule.authService, 'login').mockRejectedValue(new Error('Identifiants invalides'))
    renderLoginForm()

    await userEvent.type(screen.getByPlaceholderText(/votre@email/i), 'bad@example.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'mauvaismdp')
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    expect(await screen.findByText('Identifiants invalides')).toBeInTheDocument()
  })

  test('désactive le bouton pendant le chargement', async () => {
    vi.spyOn(authServiceModule.authService, 'login').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(TOKENS), 500)),
    )
    renderLoginForm()

    await userEvent.type(screen.getByPlaceholderText(/votre@email/i), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'monmotdepasse')
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    // Pendant le chargement, le bouton affiche un spinner (sans texte) et est désactivé
    expect(screen.getByRole('button', { name: '' })).toBeDisabled()
  })
})
