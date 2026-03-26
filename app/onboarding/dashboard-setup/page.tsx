'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const features = [
  {
    id: 'kanban-board',
    title: 'Kanban Board',
    description: 'Organize tasks visually with drag-and-drop boards.',
  },
  {
    id: 'calendar-view',
    title: 'Calendar View',
    description: 'Visualize tasks and deadlines using a calendar.',
  },
  {
    id: 'task-timeline',
    title: 'Task Timeline',
    description: 'Track progress and deadlines across a timeline view.',
  },
  {
    id: 'daily-planner',
    title: 'Daily Planner',
    description: 'Structure your day with focused task planning.',
  },
  {
    id: 'ai-suggestions',
    title: 'AI Suggestions Panel',
    description: 'Receive intelligent recommendations to boost efficiency.',
  },
  {
    id: 'analytics-insights',
    title: 'Analytics & Productivity Insights',
    description: 'Monitor productivity and extract actionable insights.',
  },
];


export default function DashboardSetupPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleFeature = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      router.push('/onboarding/team');
    }
  };

  return (
    <div className="bg-white p-10 mt-32 mb-16 rounded-2xl  max-w-3xl mx-auto">
      <p className="text-sm text-gray-400 mb-2">Step 4</p>
      <h2 className="text-3xl font-semibold text-blue-600 mb-4">Customize Your Dashboard</h2>
      <p className="text-gray-500 mb-6">Pick the features you’d like to use on your dashboard.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`border rounded-xl p-5 cursor-pointer transition ${
              selected.includes(feature.id)
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onClick={() => toggleFeature(feature.id)}
          >
            <h3 className="font-medium text-lg text-gray-800">{feature.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={selected.length === 0}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold transition hover:bg-blue-700 disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
