'use client';

import React, { useRef } from 'react';
import { FaArrowLeft, FaArrowRight, FaQuoteRight } from 'react-icons/fa';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  rating: number;
  image: string;
  title: string;
  message: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Product Manager',
    rating: 5,
    image: 'https://via.placeholder.com/400x400',
    title: 'Transformed our daily standups',
    message: 'TaskOrbits completely revolutionized how our engineering pod handles daily tasks. The drag-and-drop Kanban interface combined with the integrated analytics board gives me immediate oversight without micromanaging the team.',
  },
  {
    id: 2,
    name: 'David Chen',
    role: 'Founder, CloudScale',
    rating: 5,
    image: 'https://via.placeholder.com/400x400',
    title: 'The AI insights save hours',
    message: 'Before TaskOrbits, I spent hours manually graphing our velocity and determining bottlenecks. Now, the dashboard computes everything in real-time. It is easily the best investment our startup has made this year.',
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'Marketing Director',
    rating: 4,
    image: 'https://via.placeholder.com/400x400',
    title: 'Beautiful and functional',
    message: 'I love how clean the UI is. Bringing my entire marketing team onto a single unified workspace was seamless. The Agenda tab ensures none of our campaign deadlines are ever missed.',
  },
];

const TestimonialCarousel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = 1200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="flex flex-col items-center justify-center py-10 px-4 bg-white w-full mt-32">
      <div className="flex items-center justify-between w-full max-w-[1200px] mb-8">
        <h2 className="text-6xl font-bold text-blue-500 mb-6">Testimonials</h2>
        <div className="flex gap-4">
          <button
            onClick={() => scroll('left')}
            className="bg-blue-500 text-white p-5  rounded-full shadow hover:bg-blue-600"
          >
            <FaArrowLeft />
          </button>
          <button
            onClick={() => scroll('right')}
            className="bg-blue-500 text-white p-5 rounded-full shadow hover:bg-blue-600"
          >
            <FaArrowRight />
          </button>
        </div>
      </div>

      <div className="relative w-[1200px] overflow-hidden">
        <div
          ref={containerRef}
          className="flex overflow-x-auto scroll-smooth no-scrollbar"
        >
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[1200px] flex bg-white gap-8 rounded-xl overflow-hidden"
            >
              <div className="relative w-1/2 h-auto mr-6">
                
                <div className="absolute bottom-0 w-full h-[100px] bg-[#5C43E9] rounded-tl-[100px]" />
                <div className="absolute right-[-24px] top-1/2 transform -translate-y-1/2 bg-[#5C43E9] p-3 rounded-full">
                  <FaQuoteRight className="text-white text-2xl" />
                </div>
              </div>
              <div className="p-8 w-1/2">
                <p className="text-[#FF5722] text-3xl mb-2">“</p>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">{item.message}</p>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(item.rating)].map((_, i) => (
                    <span key={i} className="text-red-500 text-sm">★</span>
                  ))}
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500 text-sm">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
