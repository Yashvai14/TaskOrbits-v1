'use client';

import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import Image from 'next/image'

const Footer = () => {
  return (
    <footer className="bg-[#f9fafb] text-[#1a1a1a]">
      <div className="max-w-screen-xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-1 flex flex-col gap-2">
          <Image src="/Black Transparent cropped.png" alt="Logo" width={197} height={65} />
        </div>
        <div>
          <h4 className="font-semibold mb-3">NAVIGATION</h4>
          <ul className="space-y-2 text-sm">
            <li>Home</li>
            <li>About Us</li>
            <li>What We Do</li>
            <li>To The Power of 10</li>
            <li>Donate</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">WHAT WE DO</h4>
          <ul className="space-y-2 text-sm">
            <li>Encouraging Testing</li>
            <li>Strengthening Advocacy</li>
            <li>Sharing Information</li>
            <li>Building Leadership</li>
            <li>Engaging With Global Fund</li>
            <li>Shining a Light</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">LEGAL</h4>
          <ul className="space-y-2 text-sm">
            <li>General Info</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">TALK TO US</h4>
          <ul className="space-y-2 text-sm">
            <li>support@tercom.com</li>
            <li>+66 2839 1145</li>
            <li>Contact Us</li>
            <li>Facebook</li>
            <li>LinkedIn</li>
            <li>Twitter</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 mt-6">
        <div className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; 2019 TaskOrbits. All Rights Reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-black"><FaFacebookF /></a>
            <a href="#" className="text-gray-600 hover:text-black"><FaLinkedinIn /></a>
            <a href="#" className="text-gray-600 hover:text-black"><FaTwitter /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
