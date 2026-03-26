"use client";

import React, { useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const faqData = [
  {
    key: "1",
    question: "What is TaskOrbits and how does it organize my work?",
    answer: "TaskOrbits is an AI-powered project management platform that merges Kanban boards, integrated calendars, and advanced analytics into a single workspace to help high-velocity teams execute faster.",
  },
  {
    key: "2",
    question: "Can I invite my team members to collaborate?",
    answer: "Yes! You can seamlessly invite colleagues to your Organization. Assign tasks, track progress across members, and view live updates on the integrated Activity Feed.",
  },
  {
    key: "3",
    question: "Is there a Calendar view for upcoming deadlines?",
    answer: "Absolutely. Tasks with a designated Due Date are automatically synced to your dashboard Agenda and Calendar tabs, ensuring no deadline ever slips through the cracks.",
  },
  {
    key: "4",
    question: "Does TaskOrbits offer analytics and productivity tracking?",
    answer: "Yes. TaskOrbits automatically processes your daily completions to generate dynamic productivity graphs, priority breakdowns, and pipeline metrics without any manual configuration.",
  },
];

export default function FAQSection() {
  const [expanded, setExpanded] = useState<string | false>("1");
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleFAQ = (key: string) => {
    setExpanded(expanded === key ? false : key);
  };

  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-[#0057FF]">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqData.map((faq) => {
            const isOpen = expanded === faq.key;
            const contentHeight = contentRefs.current[faq.key]?.scrollHeight ?? 0;

            return (
              <div
                key={faq.key}
                className="bg-white rounded-4xl shadow-md transition-all duration-300 border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(faq.key)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left text-[#111827] font-semibold text-base sm:text-lg focus:outline-none"
                >
                  <span className={`transition-all ${isOpen ? "font-bold text-[#0057FF]" : ""}`}>
                    {faq.question}
                  </span>
                  <FaChevronDown
                    className={`ml-4 text-gray-500 transform transition-transform duration-500 ${
                      isOpen ? "rotate-180 text-[#0057FF]" : ""
                    }`}
                  />
                </button>
                <div
                  ref={(el) => { contentRefs.current[faq.key] = el; }}
                  style={{
                    maxHeight: isOpen ? `${contentHeight}px` : "0px",
                    transition: "max-height 0.5s ease, opacity 0.5s ease",
                    opacity: isOpen ? 1 : 0,
                  }}
                  className="px-6 text-gray-600 text-sm leading-relaxed"
                >
                  <div className="py-4">{faq.answer}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
