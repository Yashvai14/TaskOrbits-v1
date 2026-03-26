'use client';   
import React, { useState } from 'react';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';

const Demo = [
  {
    id: 0,
    title: "AI-Powered Insights",
    subtitle: "Automate your planning",
    body: "Let artificial intelligence predict bottlenecks and suggest task prioritization. TaskOrbits analyzes your pipeline to help you focus on execution rather than administration.",
  },
  {
    id: 1,
    title: "Seamless Collaboration",
    subtitle: "Work together dynamically",
    body: "Bring your entire team into a single unified workspace. Assign tasks, track progress in real-time on our interactive boards, and eliminate messy email threads forever.",
  },
  {
    id: 2,
    title: "Dynamic Kanbans",
    subtitle: "Visualize your workflow",
    body: "Map your project pipeline with our deeply integrated drag-and-drop boards. Customize stages and let TaskOrbits automatically compute your completion metrics in real-time.",
  },
];

const DemoSection = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedData = Demo[selectedIndex];

  return (
    <div className="flex flex-col items-center justify-center text-center p-10">
      <div>
        <h1 className="text-5xl text-blue-500 font-bold mt-6">
          The all-in-one collaboration <br /> tool for high-velocity teams
        </h1>
        <p className="text-lg mt-3 text-gray-900 font-semibold">
          TaskOrbits frees you up to focus on what matters most.
        </p>
      </div>
      <div className="flex flex-row items-center justify-between mt-15 py-8" style={{ width: 1200 }}>
        <div className="text-left flex-1">
          <h1 className="font-bold text-5xl text-blue-500">{selectedData.title}</h1>
          <h2 className="text-2xl font-semibold py-4">{selectedData.subtitle}</h2>
          <div className="text-lg text-gray-900">
            <p className="max-w-[450px]">{selectedData.body}</p>
          </div>
        </div>
        <div className="flex items-center justify-center mt-4">
          <div className="w-[300px] h-[300px] bg-indigo-50 border-4 border-indigo-100 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden">
             <div className="w-3/4 h-3/4 bg-white rounded-lg shadow flex flex-col gap-2 p-4">
               <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
               <div className="w-full h-12 bg-indigo-100 rounded"></div>
               <div className="w-full h-12 bg-blue-100 rounded"></div>
             </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex space-x-8 mt-8 text-blue-500 font-bold text-2xl text-left justify-between" style={{ width: 1200 }}>
          {Demo.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`hover:text-blue-600 flex items-center focus:outline-none ${selectedIndex === index ? "underline underline-offset-4" : ""}`}
            >
              <h2>
                {item.title.split(" ").slice(0, -1).join(" ")} <br /> {item.title.split(" ").slice(-1)}
              </h2>
              <span className="ml-2">
                <FaRegArrowAltCircleRight />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoSection;
