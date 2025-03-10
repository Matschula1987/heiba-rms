import React from 'react';
import { Activity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CandidateActivitiesProps {
  activities: Activity[];
}

export const CandidateActivities: React.FC<CandidateActivitiesProps> = ({ activities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitäten</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-gray-500">Keine Aktivitäten vorhanden.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between">
                  <span className="font-medium">{activity.type}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <p className="mt-1">{activity.description}</p>
                <p className="text-sm text-gray-500 mt-1">Von: {activity.user}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
