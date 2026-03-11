import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from './ToastContext'

function ToastTrigger({ message, type }: { message: string; type?: 'success' | 'error' | 'warning' | 'info' }) {
  const { toast } = useToast()
  return <button onClick={() => toast(message, type)}>Déclencher</button>
}

function Wrapper({ message = 'Message test', type }: { message?: string; type?: 'success' | 'error' | 'warning' | 'info' }) {
  return (
    <ToastProvider>
      <ToastTrigger message={message} type={type} />
    </ToastProvider>
  )
}

describe('ToastContext', () => {
  test('affiche un toast au déclenchement', async () => {
    render(<Wrapper message="Opération réussie" type="success" />)
    await userEvent.click(screen.getByRole('button', { name: 'Déclencher' }))
    expect(screen.getByText('Opération réussie')).toBeInTheDocument()
  })

  test('affiche plusieurs toasts indépendants', async () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Toast 1" />
        <ToastTrigger message="Toast 2" />
      </ToastProvider>,
    )
    const buttons = screen.getAllByRole('button', { name: 'Déclencher' })
    await userEvent.click(buttons[0])
    await userEvent.click(buttons[1])
    expect(screen.getByText('Toast 1')).toBeInTheDocument()
    expect(screen.getByText('Toast 2')).toBeInTheDocument()
  })

  test('ferme le toast au clic', async () => {
    render(<Wrapper message="À fermer" />)
    await userEvent.click(screen.getByRole('button', { name: 'Déclencher' }))
    await userEvent.click(screen.getByText('À fermer'))
    expect(screen.queryByText('À fermer')).not.toBeInTheDocument()
  })

  test('utilise le type info par défaut', async () => {
    render(<Wrapper message="Info par défaut" />)
    await userEvent.click(screen.getByRole('button', { name: 'Déclencher' }))
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('alert-info')
  })

  test('applique la classe CSS selon le type', async () => {
    render(<Wrapper message="Erreur" type="error" />)
    await userEvent.click(screen.getByRole('button', { name: 'Déclencher' }))
    expect(screen.getByRole('alert')).toHaveClass('alert-error')
  })

  test('lance une erreur si useToast est utilisé hors du provider', () => {
    function ComponentSansProvider() {
      useToast()
      return null
    }
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ComponentSansProvider />)).toThrow('useToast must be used inside <ToastProvider>')
    vi.restoreAllMocks()
  })
})
