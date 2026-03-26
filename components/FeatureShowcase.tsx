'use client';
import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Clock,
  Users,
  MessageCircle,
  TrendingUp,
  Megaphone,
  Zap,
  BarChart3,
  Settings,
} from "lucide-react";

// TaskOrbitsFeaturesGrid.jsx
// Single-file React component using Tailwind CSS + Framer Motion + Lucide icons
// Drop into a project that has Tailwind + framer-motion + lucide-react installed.

const features = [
  {
    id: "ai-task-assistant",
    title: "AI Task Assistant",
    desc:
      "Automatically generate, assign, and schedule tasks with GPT-powered suggestions based on your team's needs and workload.",
    icon: Brain,
    featured: true,
    gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
  },
  {
    id: "deadline",
    title: "Smart Deadline Management",
    desc: "Intelligent deadline tracking with predictive analytics and automated reminders.",
    icon: Clock,
    gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
  },
  {
    id: "role-based",
    title: "Role-Based Dashboard Setup",
    desc: "Customized dashboards that adapt to user roles and responsibilities.",
    icon: Users,
    gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
  },
  {
    id: "meeting",
    title: "AI Meeting Summarizer",
    desc: "Transform meeting recordings into actionable insights and task lists.",
    icon: MessageCircle,
    gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
  },
  {
    id: "sentiment",
    title: "Team Sentiment Tracker",
    desc: "Monitor team morale and productivity with AI-powered sentiment analysis.",
    icon: TrendingUp,
    gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
  },
  {
    id: "marketing",
    title: "Marketing & Announcement AI",
    desc: "Automated content generation for team updates and marketing materials.",
    icon: Megaphone,
    gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
  },
  {
    id: "self-healing",
    title: "Self-Healing Workflows",
    desc: "Automatically detect and resolve workflow bottlenecks and inefficiencies.",
    icon: Zap,
    gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
  },
  {
    id: "analytics",
    title: "AI-Powered Analytics",
    desc: "Deep insights into team performance with predictive modeling and trends.",
    icon: BarChart3,
    gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
  },
  {
    id: "custom-models",
    title: "Customizable AI Models",
    desc: "Train and customize AI models to match your specific workflow needs.",
    icon: Settings,
   gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.995 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function TaskOrbitsFeaturesGrid() {
  return (
    <section className="w-full py-16 px-6 lg:px-24 bg-gradient-to-b from-white via-sky-50 to-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-3 bg-clip-text text-transparent bg-blue-500">
          Explore Powerful Features of TaskOrbits
        </h2>
        <p className="text-center text-sm sm:text-base text-gray-500 mb-10">
          Revolutionize your workflow with AI-powered productivity tools designed for modern teams.
        </p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <motion.article
              key={f.id}
              variants={cardVariants}
              className={`relative rounded-2xl p-5 md:p-6 border border-gray-200/60 bg-white/60 backdrop-blur-[8px] shadow-sm hover:shadow-xl transition-shadow duration-300 ease-out transform-gpu will-change-transform`}
              whileHover={{ y: -8 }}
            >
              {/* Gradient icon + badge */}
              <div className="flex items-start gap-4">
                <div
                  aria-hidden
                  className={`flex-none w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${f.gradient} text-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-transform duration-300 transform-gpu`}
                >
                  <motion.div whileHover={{ scale: 1.12 }} className="p-1">
                    <f.icon size={20} />
                  </motion.div>
                </div>

                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${f.featured ? "text-gray-800" : "text-gray-800"}`}>
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>

                {/* Featured badge for first card */}
                {f.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-500 text-white">Featured</span>
                  </div>
                )}
              </div>

              {/* Gradient bottom border that scales on hover */}
              <div className="absolute left-6 right-6 bottom-4 h-0.5 rounded-full origin-left scale-x-0 transition-transform duration-300 ease-out"
                   style={{
                     background: f.featured
                       ? "linear-gradient(90deg,#34d399, #059669, #0ea5a3)"
                       : "linear-gradient(90deg,#60a5fa,#6366f1,#4f46e5)",
                   }}
              />

              {/* Hover effect to expand the bottom border */}
              <style>
                {`article:hover > div[style] { transform: scaleX(1); }`}
              </style>

              {/* Glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-1 rounded-2xl blur-3xl opacity-0 transition-opacity duration-300"
                style={{
                  boxShadow: f.featured
                    ? "0 10px 40px rgba(16,185,129,0.12)"
                    : "0 10px 40px rgba(79,70,229,0.08)",
                }}
              />
            </motion.article>
          ))}
        </motion.div>

        
      </div>
    </section>
  );
}
