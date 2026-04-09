import React from 'react'
import Image from 'next/image'
import Link from 'next/link';

const navBar = () => {
  return (
    <div className=' flex justify-center sticky top-0 bg-white z-50 rounded-2xl  '>
        <nav className=" max-w-[1200px] w-full flex items-center justify-between p-3 shadow-md rounded-4xl mt-4">
        <Link href="/" passHref>
        <Image
          src="/Black Transparent cropped.png"
          alt="Logo"
          width={197}
          height={65}
          className="cursor-pointer"
          style={{ height: 'auto' }}
        />
      </Link>
            <ul className='flex space-x-4 font-semibold text-gray-800'>
                <li className='hover:font-bold ease-in-out transition-all  duration-300'><Link href="/features">Features</Link></li>
                <li className='hover:font-bold ease-in-out transition-all duration-300'><Link href="/">Pricing</Link></li>
                <li className='hover:font-bold ease-in-out transition-all duration-300'><Link href="/">Resources</Link></li>
            </ul>
            <Link href="/authentication"><button className='bg-blue-500 text-white px-6 py-2 rounded-4xl hover:bg-blue-600 transition duration-300 mr-1.5 cursor-pointer'>
                Login
            </button></Link>
        </nav>
    </div>
  )
}

export default navBar