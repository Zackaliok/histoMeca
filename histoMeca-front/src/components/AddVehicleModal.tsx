import { useState } from 'react'

export interface NewVehicleForm {
  type: 'auto' | 'moto'
  brand: string
  model: string
  year: string
  plate: string
  vin: string
  fuel: 'essence' | 'diesel' | 'hybride' | 'electrique' | 'autre' | ''
  color: string
  purchaseDate: string
  purchaseMileage: string
  currentMileage: string
  notes: string
}

const INITIAL: NewVehicleForm = {
  type: 'auto',
  brand: '',
  model: '',
  year: '',
  plate: '',
  vin: '',
  fuel: '',
  color: '',
  purchaseDate: '',
  purchaseMileage: '',
  currentMileage: '',
  notes: '',
}

interface AddVehicleModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: NewVehicleForm) => void
}

export default function AddVehicleModal({ open, onClose, onSubmit }: AddVehicleModalProps) {
  const [form, setForm] = useState<NewVehicleForm>(INITIAL)

  function set<K extends keyof NewVehicleForm>(key: K, value: NewVehicleForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    onSubmit(form)
    setForm(INITIAL)
    onClose()
  }

  function handleClose() {
    setForm(INITIAL)
    onClose()
  }

  if (!open) return null

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-2xl w-full">

        <button
          onClick={handleClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
        >
          ✕
        </button>

        <h3 className="font-bold text-lg mb-6">Ajouter un véhicule</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <span className="label-text font-medium">Type</span>
            <div className="join">
              {(['auto', 'moto'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('type', t)}
                  className={`join-item btn btn-sm flex-1 ${form.type === t ? 'btn-primary' : 'btn-outline'}`}
                >
                  {t === 'auto' ? '🚗 Voiture' : '🏍️ Moto'}
                </button>
              ))}
            </div>
          </div>

          {/* Marque / Modèle / Année */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Marque" required>
              <input
                type="text"
                placeholder="Renault"
                className="input input-bordered input-sm w-full"
                value={form.brand}
                onChange={(e) => set('brand', e.target.value)}
                required
              />
            </Field>
            <Field label="Modèle" required>
              <input
                type="text"
                placeholder="Clio V"
                className="input input-bordered input-sm w-full"
                value={form.model}
                onChange={(e) => set('model', e.target.value)}
                required
              />
            </Field>
            <Field label="Année" required>
              <input
                type="number"
                placeholder="2021"
                min={1900}
                max={new Date().getFullYear() + 1}
                className="input input-bordered input-sm w-full"
                value={form.year}
                onChange={(e) => set('year', e.target.value)}
                required
              />
            </Field>
          </div>

          {/* Immatriculation / VIN */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Immatriculation" required>
              <input
                type="text"
                placeholder="AB-123-CD"
                className="input input-bordered input-sm w-full uppercase"
                value={form.plate}
                onChange={(e) => set('plate', e.target.value.toUpperCase())}
                required
              />
            </Field>
            <Field label="Numéro de châssis (VIN)">
              <input
                type="text"
                placeholder="VF1RJA000XXXXXXXX"
                className="input input-bordered input-sm w-full uppercase"
                value={form.vin}
                onChange={(e) => set('vin', e.target.value.toUpperCase())}
              />
            </Field>
          </div>

          {/* Carburant / Couleur */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Carburant" required>
              <select
                className="select select-bordered select-sm w-full"
                value={form.fuel}
                onChange={(e) => set('fuel', e.target.value as NewVehicleForm['fuel'])}
                required
              >
                <option value="" disabled>Choisir…</option>
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="hybride">Hybride</option>
                <option value="electrique">Électrique</option>
                <option value="autre">Autre</option>
              </select>
            </Field>
            <Field label="Couleur">
              <input
                type="text"
                placeholder="Gris"
                className="input input-bordered input-sm w-full"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
              />
            </Field>
          </div>

          {/* Kilométrage actuel / Date d'achat / Km à l'achat */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Kilométrage actuel" required>
              <label className="input input-bordered input-sm flex items-center gap-1 w-full">
                <input
                  type="number"
                  placeholder="45 000"
                  min={0}
                  className="grow min-w-0"
                  value={form.currentMileage}
                  onChange={(e) => set('currentMileage', e.target.value)}
                  required
                />
                <span className="text-base-content/40 text-xs shrink-0">km</span>
              </label>
            </Field>
            <Field label="Date d'achat">
              <input
                type="date"
                className="input input-bordered input-sm w-full"
                value={form.purchaseDate}
                onChange={(e) => set('purchaseDate', e.target.value)}
              />
            </Field>
            <Field label="Km à l'achat">
              <label className="input input-bordered input-sm flex items-center gap-1 w-full">
                <input
                  type="number"
                  placeholder="12 000"
                  min={0}
                  className="grow min-w-0"
                  value={form.purchaseMileage}
                  onChange={(e) => set('purchaseMileage', e.target.value)}
                />
                <span className="text-base-content/40 text-xs shrink-0">km</span>
              </label>
            </Field>
          </div>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              placeholder="Achetée d'occasion, carnet de révisions complet…"
              className="textarea textarea-bordered textarea-sm w-full resize-none"
              rows={3}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </Field>

          <div className="modal-action mt-2">
            <button type="button" onClick={handleClose} className="btn btn-ghost btn-sm">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Enregistrer
            </button>
          </div>

        </form>
      </div>

      <div className="modal-backdrop" onClick={handleClose} />
    </dialog>
  )
}

function Field({ label, required, children }: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="form-control w-full">
      <div className="label py-0 mb-1">
        <span className="label-text text-sm">
          {label}{required && <span className="text-error ml-0.5">*</span>}
        </span>
      </div>
      {children}
    </label>
  )
}
