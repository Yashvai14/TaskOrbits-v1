import React from 'react'
import './globals.css'
import Navbar from '../components/navBar'
import CtaHeader from '../components/ctaHeader'
import HeroSection from '../components/heroSection'
import LogoCloud from '../components/logoCloud'
import DemoSection from '../components/demoSection'
import TestimonialCarousel from '../components/testimonial'
import FAQSection from '../components/FAQs'
import CallToAction from '../components/callToAction'


export default function Home() {
  return(
    <>
    <Navbar />
    <CtaHeader />
    <HeroSection />
    <LogoCloud />
    <DemoSection />
    <TestimonialCarousel />
    <FAQSection />
    <CallToAction />
    </>
  );
}