import React from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function EventStats({ events }) {
  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.category === 'upcoming').length,
    ongoing: events.filter(e => e.category === 'ongoing').length,
    completed: events.filter(e => e.category === 'completed').length,
  };

  const statCards = [
    { title: 'Total Events', value: stats.total, icon: Calendar, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'text-info', bgColor: 'bg-info/10' },
    { title: 'Ongoing', value: stats.ongoing, icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
    // Completed now uses same icon as Ongoing but filled color
    { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-white', bgColor: 'bg-success' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="transition-smooth hover:shadow-soft animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-3 h-20 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-2 rounded-full`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
