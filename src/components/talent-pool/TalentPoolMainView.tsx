'use client'

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTalentPoolStore } from '@/store/talentPoolStore';
import TalentPoolList from '@/components/talent-pool/TalentPoolList';
import TalentPoolFilter from '@/components/talent-pool/TalentPoolFilter';

export default function TalentPoolMainView() {
  const { 
    loading, 
    error, 
    entries, 
    total,
    fetchEntries,
    setFilter,
    filter
  } = useTalentPoolStore();
  
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Lade Talent-Pool-Einträge beim ersten Rendern
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);
  
  // Aktualisiere Filter, wenn sich der Tab ändert
  useEffect(() => {
    if (activeTab === 'all') {
      setFilter({ entity_type: undefined });
    } else if (activeTab === 'candidates') {
      setFilter({ entity_type: 'candidate' });
    } else if (activeTab === 'applications') {
      setFilter({ entity_type: 'application' });
    }
  }, [activeTab, setFilter]);
  
  // Behandle Tab-Wechsel
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="space-y-6">
      {/* Fehleranzeige */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Tabs für verschiedene Ansichten */}
      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">Alle Einträge</TabsTrigger>
            <TabsTrigger value="candidates">Kandidaten</TabsTrigger>
            <TabsTrigger value="applications">Bewerber</TabsTrigger>
          </TabsList>
          
          {/* Filter-Komponente */}
          <TalentPoolFilter />
        </div>
        
        {/* Tab-Inhalte */}
        <TabsContent value="all" className="space-y-4">
          <TalentPoolList 
            loading={loading} 
            entries={entries} 
            total={total}
            entityType={undefined}
          />
        </TabsContent>
        
        <TabsContent value="candidates" className="space-y-4">
          <TalentPoolList 
            loading={loading} 
            entries={entries} 
            total={total}
            entityType="candidate"
          />
        </TabsContent>
        
        <TabsContent value="applications" className="space-y-4">
          <TalentPoolList 
            loading={loading} 
            entries={entries} 
            total={total}
            entityType="application"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
