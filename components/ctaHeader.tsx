import React from 'react'
import Link from 'next/link'

const ctaHeader = () => {
  return (
    <div className='bg-gray-200 py-4 mt-8 flex justify-center'>
        <div className='max-w-[1200px] w-full flex items-center justify-between px-1'>
            <div className='flex space-x-12 text-lg text-gray-800 '>
                <Link href="/"><h2 className='font-bold hover:text-blue-500 transition duration-300'>TaskOrbits</h2></Link>
                <Link href="/"><h2 className='font-semibold hover:text-blue-500 transition duration-300'>Features</h2></Link>
                <Link href="/"><h2 className='font-semibold hover:text-blue-500 transition duration-300'>Pricing</h2></Link>
            </div>
            <div className='flex space-x-4'>
                <Link href="/authentication"><button className='bg-blue-500 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-blue-600 transition duration-300 cursor-pointer'>
                    Get Started
                </button></Link>
                <Link href="/authentication"><button className=' border border-blue-500 text-blue-500 font-semibold bg-transparent px-8 py-4 rounded-2xl hover:bg-gray-100 transition duration-300 cursor-pointer'>
                    Contact Us
                </button></Link>
            </div>            
        </div>
    </div>
  )
}

export default ctaHeader