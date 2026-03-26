'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react'; // Optional icon

export default function TeamSetupPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState(['']);

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const addMember = () => {
    setMembers([...members, '']);
  };

  const removeMember = (index: number) => {
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
  };

  const handleContinue = () => {
    if (teamName.trim() !== '') {
      localStorage.setItem('teamName', teamName);
      localStorage.setItem('teamMembers', JSON.stringify(members));
      router.push('/onboarding/summary'); 
    }
  };

  return (
    <div className="bg-white p-10 rounded-2xl py-32 mb-32 mt-16 max-w-3xl mx-auto">
      <p className="text-sm text-gray-400 mb-2">Step 5</p>
      <h2 className="text-5xl font-semibold text-blue-600 mb-4">Set Up Your Team</h2>
      <p className="text-gray-500 mb-6">Invite your team members and create your workspace.</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Team Name</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., InternPro Dev Team"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Team Members</label>
          {members.map((member, index) => (
            <div key={index} className="flex items-center gap-2 mt-2">
              <input
                type="email"
                value={member}
                onChange={(e) => handleMemberChange(index, e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email address"
              />
              {members.length > 1 && (
                <button
                  onClick={() => removeMember(index)}
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addMember}
            className="text-blue-600 text-sm mt-2 hover:underline"
            type="button"
          >
            + Add another member
          </button>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!teamName}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold transition hover:bg-blue-700 disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
