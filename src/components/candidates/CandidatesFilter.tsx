import { Card } from "../Card"

export const CandidatesFilter = () => {
  return (
    <Card>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Filter</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-corporate-blue focus:ring-corporate-blue"
              placeholder="z.B. Elektriker"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Standort
            </label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-corporate-blue focus:ring-corporate-blue"
              placeholder="z.B. Köndringen"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-corporate-blue focus:ring-corporate-blue">
              <option value="">Alle</option>
              <option value="available">Verfügbar</option>
              <option value="in_talk">Im Gespräch</option>
              <option value="placed">Vermittelt</option>
            </select>
          </div>
          <button className="w-full btn-primary mt-4">
            Filter anwenden
          </button>
        </div>
      </div>
    </Card>
  )
}
