'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


export default function OrganizationStep1() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [teamStrength, setTeamStrength] = useState('');

  const handleContinue = () => {
    localStorage.setItem('orgName', companyName);
    router.push('/onboarding/organization/step2');
  };

  return (
    <div className="flex items-center justify-center  bg-white px-4 py-16">
      <div className="w-full max-w-[1200px] bg-white rounded-2xl p-8">
        <div className="text-center mb-6">
        <p className="text-center text-sm text-gray-400 mb-1">1 / 2</p>
        <h2 className="text-center text-5xl font-bold text-blue-500 mb-7">Customize your Organization</h2>
        <p className="text-center text-gray-700 text-[15px] mb-12">
          Setup your organization for members that may join later.
        </p>
        </div>

        <div className="space-y-4 max-w-xl mx-auto">
          <div>
            <label className="text-sm font-medium text-gray-500 mb-3 mt-9 block">Company Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 mb-3 mt-9  block">Company Type <span className="text-red-500">*</span></label>
            <select
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              required
            >
              <option value="">Select Company Type</option>
              <option value="Startup">Startup</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Freelancer">Freelancer</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 mb-3 mt-9 block">Team Strength <span className="text-red-500">*</span></label>
            <select
              value={teamStrength}
              onChange={(e) => setTeamStrength(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              required
            >
              <option value="">Select Team Strength</option>
              <option value="1-5">1-5</option>
              <option value="6-20">6-20</option>
              <option value="21-50">21-50</option>
              <option value="50+">50+</option>
            </select>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-blue-500 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-600 transition mb-3 mt-9 block"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
