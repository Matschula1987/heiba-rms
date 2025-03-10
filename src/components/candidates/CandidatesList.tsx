import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Temporäre Beispieldaten
const candidates = [
  {
    id: 1,
    name: "Max Mustermann",
    qualification: "Elektriker",
    location: "Köndringen",
    availability: "Sofort",
    status: "Verfügbar"
  },
  {
    id: 2,
    name: "Anna Schmidt",
    qualification: "Staplerfahrerin",
    location: "Emmendingen",
    availability: "Ab 01.03.2024",
    status: "In Gespräch"
  },
  // Weitere Kandidaten hier...
]

export function CandidatesList() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Qualifikation</TableHead>
            <TableHead>Standort</TableHead>
            <TableHead>Verfügbarkeit</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.id} className="cursor-pointer hover:bg-gray-50">
              <TableCell className="font-medium">{candidate.name}</TableCell>
              <TableCell>{candidate.qualification}</TableCell>
              <TableCell>{candidate.location}</TableCell>
              <TableCell>{candidate.availability}</TableCell>
              <TableCell>
                <Badge 
                  variant={candidate.status === "Verfügbar" ? "success" : "warning"}
                >
                  {candidate.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
