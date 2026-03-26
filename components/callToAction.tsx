import React from 'react'
import Link from 'next/link'

const callToAction = () => {
  return (
    <div className='bg-blue-400 flex justify-center items-center text-center text-white py-8 mt-8'>
        <div className='py-16'>
            <div className='text-white'>
                <h1 className='text-7xl font-bold mb-8'>A better way to work, together</h1>
                <p className='text-[20px]'>Simple and intuitive project management software for moving real work forward</p>
            </div>
            <div className='flex space-x-4 justify-center mt-8'>
                <Link href="/authentication"><button className='bg-blue-700 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-blue-600 transition duration-300 cursor-pointer'>
                    Get Started
                </button></Link>
                <Link href="/authentication"><button className=' border border-gray-300 text-white font-semibold bg-transparent px-8 py-4 rounded-2xl hover:bg-gray-100 hover:text-blue-500 transition duration-300 cursor-pointer'>
                    Join Now
                </button></Link>
            </div>  
        </div>
    </div>
  )
}

export default callToAction