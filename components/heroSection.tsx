import React from 'react'
import Link from 'next/link'
const heroSection = () => {
  return (
    <div className=' py-16 flex max-w-[1200px] justify-between mx-auto'>
        <div>
            <h1 className='text-blue-500 text-7xl font-bold'>Plan Less,</h1>
            <h1 className='text-gray-900 text-7xl font-bold'>Do More</h1>
            <p className='text-gray-700 text-[18px] mt-4'>TaskOrbit is your AI-powered task management <br /> solution, designed to help you plan, prioritize,  <br /> and execute tasks effortlessly.</p>
            <div className='mt-8 flex gap-4'>
                <Link href="/authentication">
                  <button className='bg-blue-500 text-white font-semibold px-8 py-3 rounded-2xl hover:bg-blue-600 transition duration-300 cursor-pointer'>
                      Get Started
                  </button>
                </Link>
                <Link href="/authentication">
                  <button className='border border-blue-500 text-blue-500 font-semibold bg-transparent px-8 py-3 rounded-2xl hover:bg-gray-100 transition duration-300 cursor-pointer'>
                      Learn More
                  </button>
                </Link>
            </div>
        </div>

        <div className='flex justify-right flex-1 ml-12 lg:ml-24 max-w-[600px]'>
            <div className='w-full h-auto bg-gray-100 rounded-2xl mt-4 overflow-hidden shadow-2xl border flex items-center justify-center relative pb-[56.25%]'>
                <video 
                   autoPlay 
                   loop 
                   muted 
                   playsInline 
                   className="absolute top-0 left-0 w-full h-full object-cover"
                >
                    <source src="/taskorbits_intro.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    </div>
  )
}

export default heroSection