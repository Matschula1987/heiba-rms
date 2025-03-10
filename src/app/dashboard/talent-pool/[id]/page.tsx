import { Metadata } from 'next';
import TalentPoolDetail from '../../../../components/talent-pool/TalentPoolDetail';

export const metadata: Metadata = {
  title: 'Talent-Pool-Eintrag | HeiBa Recruitment',
  description: 'Detailansicht eines Talent-Pool-Eintrags im HeiBa Recruitment Management System',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function TalentPoolDetailPage({ params }: PageProps) {
  const { id } = params;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <a 
          href="/dashboard/talent-pool" 
          className="text-blue-500 hover:text-blue-700 mr-2"
        >
          ← Zurück zum Talent-Pool
        </a>
        <h1 className="text-2xl font-bold text-[#002451]">Talent-Pool-Eintrag</h1>
      </div>
      
      <TalentPoolDetail id={id} />
    </div>
  );
}
