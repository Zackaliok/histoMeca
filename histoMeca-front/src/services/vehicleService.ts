import { apiGet, apiRequest } from '../utils/api'
import { authService } from './authService'
import type { NewVehicleForm } from '../components/AddVehicleModal'

export interface VehicleDTO {
  id: string
  type: 'auto' | 'moto'
  brand: string
  model: string
  year: number | null
  plate: string
  vin: string | null
  fuel: string | null
  color: string | null
  purchaseDate: string | null
  purchaseMileage: number | null
  mileage: { current: number; updatedAt: string } | null
  nextService: { date: string | null; mileage: number | null; label: string | null } | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export const vehicleService = {
  async getAll(): Promise<VehicleDTO[]> {
    const token = authService.getAccessToken() ?? ''
    return apiGet<VehicleDTO[]>('/vehicles', token)
  },

  async getByIds(ids: string[]): Promise<VehicleDTO[]> {
    const token = authService.getAccessToken() ?? ''
    return apiRequest<VehicleDTO[]>('/vehicles/batch', { ids }, token)
  },

  async create(data: NewVehicleForm): Promise<{ id: string }> {
    const token = authService.getAccessToken() ?? ''
    return apiRequest<{ id: string }>(
      '/vehicles',
      {
        type:            data.type,
        brand:           data.brand,
        model:           data.model,
        plate:           data.plate,
        year:            data.year            ? parseInt(data.year)            : undefined,
        vin:             data.vin             || undefined,
        fuel:            data.fuel            || undefined,
        color:           data.color           || undefined,
        purchaseDate:    data.purchaseDate    ? new Date(data.purchaseDate).toISOString() : undefined,
        purchaseMileage: data.purchaseMileage ? parseInt(data.purchaseMileage)            : undefined,
        mileage:         data.currentMileage  ? { current: parseInt(data.currentMileage) } : undefined,
        notes:           data.notes           || undefined,
      },
      token,
    )
  },
}
