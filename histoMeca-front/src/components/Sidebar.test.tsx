import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar, { type Vehicle, type Selection } from './Sidebar'

const vehicles: Vehicle[] = [
  { id: '1', name: 'Renault Clio', type: 'auto' },
  { id: '2', name: 'Yamaha MT-07', type: 'moto' },
]

function renderSidebar(selection: Selection | null = null) {
  const onSelect = vi.fn()
  const onHome = vi.fn()
  const onAddVehicle = vi.fn()
  render(
    <Sidebar
      vehicles={vehicles}
      selection={selection}
      onSelect={onSelect}
      onHome={onHome}
      onAddVehicle={onAddVehicle}
    />,
  )
  return { onSelect, onHome, onAddVehicle }
}

describe('Sidebar', () => {
  describe('lien tableau de bord', () => {
    test('est présent', () => {
      renderSidebar()
      expect(screen.getByRole('button', { name: /tableau de bord/i })).toBeInTheDocument()
    })

    test('appelle onHome au clic', async () => {
      const { onHome } = renderSidebar()
      await userEvent.click(screen.getByRole('button', { name: /tableau de bord/i }))
      expect(onHome).toHaveBeenCalledOnce()
    })

    test('est actif quand aucune sélection', () => {
      renderSidebar(null)
      expect(screen.getByRole('button', { name: /tableau de bord/i })).toHaveClass('bg-base-200')
    })

    test("n'est pas actif quand un véhicule est sélectionné", () => {
      renderSidebar({ vehicleId: '1', tab: 'informations' })
      expect(screen.getByRole('button', { name: /tableau de bord/i })).not.toHaveClass('bg-base-200')
    })
  })

  describe('liste des véhicules', () => {
    test('affiche tous les véhicules', () => {
      renderSidebar()
      expect(screen.getByText('Renault Clio')).toBeInTheDocument()
      expect(screen.getByText('Yamaha MT-07')).toBeInTheDocument()
    })

    test('affiche un message quand la liste est vide', () => {
      render(
        <Sidebar vehicles={[]} selection={null} onSelect={vi.fn()} onHome={vi.fn()} onAddVehicle={vi.fn()} />,
      )
      expect(screen.getByText(/aucun véhicule/i)).toBeInTheDocument()
    })
  })

  describe('onglets', () => {
    test('appelle onSelect avec le bon véhicule et onglet', async () => {
      const selection: Selection = { vehicleId: '1', tab: 'informations' }
      const { onSelect } = renderSidebar(selection)

      // Les onglets du véhicule 1 sont visibles (details ouvert)
      const historiqueButtons = screen.getAllByRole('button', { name: /historique/i })
      await userEvent.click(historiqueButtons[0])

      expect(onSelect).toHaveBeenCalledWith({ vehicleId: '1', tab: 'historique' })
    })

    test("met en évidence l'onglet actif", () => {
      renderSidebar({ vehicleId: '1', tab: 'entretiens' })
      const entretienButtons = screen.getAllByRole('button', { name: /entretiens/i })
      expect(entretienButtons[0]).toHaveClass('bg-primary')
    })
  })

  describe('bouton ajouter', () => {
    test('appelle onAddVehicle au clic', async () => {
      const { onAddVehicle } = renderSidebar()
      await userEvent.click(screen.getByRole('button', { name: /ajouter un véhicule/i }))
      expect(onAddVehicle).toHaveBeenCalledOnce()
    })
  })
})
