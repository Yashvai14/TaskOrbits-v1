import FeatureShowcase from '@/components/FeatureShowcase'
import React from 'react'
export default function features(){
    return(
        <div>
        <div className=' py-16 flex max-w-[1200px] justify-between mx-auto mt-20 '>
        <div>
            <h1 className='text-blue-500 text-7xl font-bold'>All-in-One</h1>
            <h1 className='text-gray-800 text-7xl font-bold'>AI Workspace</h1>
            <p className='text-gray-700 text-[18px] mt-4'>TaskOrbit is your AI-powered task management <br /> solution, designed to help you plan, prioritize,  <br /> and execute tasks effortlessly.</p>
            <div className='mt-8'>
                <button className='bg-blue-500 text-white font-semibold px-8 py-3 rounded-2xl hover:bg-blue-600 transition duration-300 cursor-pointer mr-4'>
                    Get Started
                </button>
                <button className='border border-blue-500 text-blue-500 font-semibold bg-transparent px-8 py-3 rounded-2xl hover:bg-gray-100 transition duration-300 cursor-pointer'>
                    Learn More
                </button>
            </div>
        </div>

        <div className='flex justify-right'>
            <div className='w-[300px] h-[300px] bg-gray-200 rounded-2xl mt-4 '>

            </div>
        </div>
    </div>
        <FeatureShowcase />
    </div>
    )
} 