import { Metadata } from 'next';
import TalentPoolMainView from '../../../components/talent-pool/TalentPoolMainView';

export const metadata: Metadata = {
  title: 'Talent-Pool | HeiBa Recruitment',
  description: 'Talent-Pool-Verwaltung im HeiBa Recruitment Management System',
};

export default function TalentPoolPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#002451]">Talent-Pool</h1>
      </div>
      
      <TalentPoolMainView />
    </div>
  );
}
