'use client';
import { useRouter } from 'next/navigation';

export default function AccountSuccess() {
  const router = useRouter();

  const handleSetupDashboard = () => {
    router.push('/onboarding/role');
  };

  return (
    <div className="bg-white  rounded-2xl py-32 flex align-center flex-col text-center">
      <div className="w-16 h-16 mx-auto mb-6 text-blue-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Account created successfully!
      </h2>
      <p className="text-gray-600 mb-6">
        Welcome onboard! Let’s start your journey with <span className="font-semibold">TaskOrbits</span>.
      </p>

      <button
        onClick={handleSetupDashboard}
        className="bg-blue-600 text-white px-6 py-3 mx-auto rounded-lg font-medium hover:bg-blue-700 transition"
      >
        Setup Dashboard
      </button>
    </div>
  );
}
