import React from "react"
import * as Tabs from "@radix-ui/react-tabs"
import { Progress } from "@radix-ui/react-progress"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Upload 
} from "lucide-react"

const ApplicationForm = () => {
  const [currentStep, setCurrentStep] = React.useState(0)
  const totalSteps = 5

  const tabs = [
    { 
      id: "personal", 
      label: "Persönliche Daten", 
      icon: <User className="w-4 h-4" />,
      status: "Aktiv"
    },
    { 
      id: "experience", 
      label: "Berufserfahrung", 
      icon: <Briefcase className="w-4 h-4" />,
      status: "Ausstehend"
    },
    { 
      id: "education", 
      label: "Ausbildung", 
      icon: <GraduationCap className="w-4 h-4" />,
      status: "Ausstehend"
    },
    { 
      id: "skills", 
      label: "Qualifikationen", 
      icon: <FileText className="w-4 h-4" />,
      status: "Ausstehend"
    },
    { 
      id: "documents", 
      label: "Dokumente", 
      icon: <Upload className="w-4 h-4" />,
      status: "Ausstehend"
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Bewerbungsformular</h1>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={(currentStep / (totalSteps - 1)) * 100} />
        <p className="text-sm text-gray-600 mt-2">
          Schritt {currentStep + 1} von {totalSteps}
        </p>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="personal" className="flex flex-col gap-6">
        <Tabs.List className="flex space-x-4 border-b">
          {tabs.map((tab, index) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className={`
                flex items-center gap-2 px-4 py-2 
                ${index === currentStep ? 'border-b-2 border-blue-500' : ''}
              `}
              onClick={() => setCurrentStep(index)}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <Badge 
                variant={tab.status === "Aktiv" ? "default" : "secondary"}
                className="ml-2"
              >
                {tab.status}
              </Badge>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Tab Panels */}
        <Tabs.Content value="personal" className="space-y-4">
          <h2 className="text-xl font-semibold">Persönliche Daten</h2>
          {/* Persönliche Daten Formular hier */}
        </Tabs.Content>

        <Tabs.Content value="experience" className="space-y-4">
          <h2 className="text-xl font-semibold">Berufserfahrung</h2>
          {/* Berufserfahrung Formular hier */}
        </Tabs.Content>

        <Tabs.Content value="education" className="space-y-4">
          <h2 className="text-xl font-semibold">Ausbildung</h2>
          {/* Ausbildung Formular hier */}
        </Tabs.Content>

        <Tabs.Content value="skills" className="space-y-4">
          <h2 className="text-xl font-semibold">Qualifikationen</h2>
          {/* Qualifikationen Formular hier */}
        </Tabs.Content>

        <Tabs.Content value="documents" className="space-y-4">
          <h2 className="text-xl font-semibold">Dokumente</h2>
          {/* Dokumente Upload hier */}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

export default ApplicationForm