'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const roles = [
  {
    id: 'personal',
    label: 'Personal Productivity',
    description: 'Manage your own tasks, deadlines, and goals efficiently.',
  },
  {
    id: 'manager',
    label: 'Team Manager',
    description: 'Organize your team, assign tasks, and monitor progress.',
  },
  {
    id: 'employee',
    label: 'Team Member',
    description: 'Collaborate on projects and stay on top of assignments.',
  },
  {
    id: 'freelancer',
    label: 'Freelancer',
    description: 'Handle multiple clients and manage freelance projects.',
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      const roleMap: Record<string,string> = { personal:'owner', manager:'manager', employee:'member', freelancer:'freelancer' }
      localStorage.setItem('userRole', roleMap[selectedRole] ?? selectedRole)
      router.push('/onboarding/dashboard-setup');
    }
  };

  const handleBack = () => {
    router.back(); // or router.push('/onboarding/previous-step') if you have a specific route
  };

  return (
    <div className="bg-white p-10 rounded-2xl py-32 max-w-2xl mx-auto">
      <p className="text-sm text-gray-400 mb-2">Step 3</p>
      <h2 className="text-3xl font-semibold text-blue-600 mb-4">How will you use TaskOrbits?</h2>
      <p className="text-gray-500 mb-6">Select a role that best fits your work style.</p>

      <div className="grid gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`border rounded-xl p-5 cursor-pointer transition ${
              selectedRole === role.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onClick={() => setSelectedRole(role.id)}
          >
            <h3 className="font-medium text-lg text-gray-800">{role.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{role.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="bg-gray-400 text-white py-3 px-5 rounded-lg flex font-semibold transition hover:bg-gray-700"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="bg-blue-600 text-white py-3 px-4 rounded-lg flex font-semibold transition hover:bg-blue-700 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
