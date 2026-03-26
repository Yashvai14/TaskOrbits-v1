'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Upload, Pencil } from 'lucide-react';
import Image from 'next/image';

export default function OrganizationStep2() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex  items-center justify-center py-32 bg-white px-4">
      <div className="w-full max-w-[500px] text-center">
        <button
          onClick={() => router.back()}
          className="text-sm px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white  absolute top-6 left-6"
        >
          &lt; Back
        </button>
        <p className="text-sm text-gray-400">2 / 2</p>
        <h2 className="text-4xl font-semibold text-blue-500 mb-4">Customize your Organization</h2>
        <p className="text-sm text-gray-500 mb-8">Setup your organization for members that may join later.</p>
        <div className="w-32 h-32 rounded-full border-2 border-blue-500 mx-auto flex items-center justify-center mb-6">
          {logo ? (
            <Image src={logo} alt="Uploaded Logo" className="w-full h-full object-cover rounded-full" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
             
                <circle cx="12" cy="12" r="9" stroke="currentColor" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
            </svg>
          )}
        </div>
        <div className="flex justify-center space-x-4 mb-6">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:border-blue-500 transition"
            >
              <Upload className="h-4 w-4" />
              Upload Logo
            </button>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!logo}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:border-blue-500 transition disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
            Edit Logo
          </button>
        </div>
        <button
            onClick={() => {
              if (logo) localStorage.setItem('orgLogo', logo);
              router.push('/onboarding/account-success');
            }}
            className="px-7 cursor-pointer bg-blue-500 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-600 transition"
    >
            Continue
        </button>

      </div>
    </div>
  );
}
