import React from 'react'
import Image from 'next/image'

const logoCloud = () => {
  return (
    <div className='py-12 flex flex-col items-center'>
        <h2 className='text-[25px] font-semibold'>Trusted by over 18,000 companies worldwide</h2>
        <div className='flex justify-between items-center mt-6 w-full max-w-[1200px] ml-8 '>
            <Image src="/Img/logo1.svg" alt="Logo 1" width={200} height={100} className="h-17 w-56 grayscale hover:grayscale-0 transition duration-300" />
            <Image src="/Img/logo2.svg" alt="Logo 2" width={200} height={100} className="h-19 w-56 grayscale hover:grayscale-0 transition duration-300" />
            <Image src="/Img/logo4.svg" alt="Logo 4" width={200} height={100} className="h-19 w-56 grayscale hover:grayscale-0 transition duration-300" />
            <Image src="/Img/logo3.svg" alt="Logo 3" width={200} height={100} className="h-19 w-56 grayscale hover:grayscale-0 transition duration-300" />
            <Image src="/Img/logo5.svg" alt="Logo 5" width={200} height={100} className="h-17 w-56 grayscale hover:grayscale-0 transition duration-300" />
        </div>
    </div>
  );
}

export default logoCloud