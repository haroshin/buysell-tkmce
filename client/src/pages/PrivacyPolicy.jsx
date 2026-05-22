import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineShieldCheck, 
  HiOutlineLockClosed, 
  HiOutlineUser, 
  HiOutlineAcademicCap, 
  HiOutlineChat, 
  HiOutlineShare,
  HiOutlineArrowRight
} from 'react-icons/hi';
import SEO from '../components/common/SEO';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', label: '1. Introduction', icon: HiOutlineShieldCheck },
    { id: 'data-collection', label: '2. Information We Collect', icon: HiOutlineUser },
    { id: 'academic-details', label: '3. Academic Verification', icon: HiOutlineAcademicCap },
    { id: 'chat-protection', label: '4. Chat & Phone Protection', icon: HiOutlineChat },
    { id: 'data-sharing', label: '5. Sharing & Exclusivity', icon: HiOutlineShare },
    { id: 'data-security', label: '6. Data Security', icon: HiOutlineLockClosed },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // account for fixed navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <SEO 
        title="Privacy Policy | Buy&Sell TKMCE" 
        description="Learn how Buy&Sell TKMCE handles, protects, and secures your personal and academic data within the campus community."
      />
      
      <div className="page-container">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            🛡️ Trust & Security
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight"
          >
            Privacy <span className="text-primary-400">Policy</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-lg leading-relaxed"
          >
            Last Updated: May 22, 2026. This policy describes how Buy&Sell TKMCE collects, uses, and safeguards your information to maintain a secure student community.
          </motion.p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Sticky Navigation Sidebar (Desktop) */}
          <div className="hidden lg:block sticky top-24 col-span-1">
            <div className="glass-card p-6 border-dark-700/50">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Table of Contents</h3>
              <nav className="space-y-1.5">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/40 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-400' : 'text-slate-500'}`} />
                      <span>{section.label.substring(3)}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Policy Text Column */}
          <div className="col-span-1 lg:col-span-3 space-y-8">
            
            {/* 1. Introduction */}
            <motion.section 
              id="introduction" 
              className="glass-card p-6 sm:p-8 border-dark-700/50 hover:border-primary-500/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700/40">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xl">
                  <HiOutlineShieldCheck />
                </div>
                <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
              </div>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Welcome to <strong>Buy&Sell TKMCE</strong>, the official peer-to-peer campus marketplace designed exclusively for students and staff of TKM College of Engineering (TKMCE). We are committed to protecting your privacy and providing a secure platform for exchanging items.
                </p>
                <p>
                  This Privacy Policy details how we handle information obtained through your registration and interactions on the platform. By logging in and using our services, you consent to the practices described below.
                </p>
              </div>
            </motion.section>

            {/* 2. Information We Collect */}
            <motion.section 
              id="data-collection" 
              className="glass-card p-6 sm:p-8 border-dark-700/50 hover:border-primary-500/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700/40">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xl">
                  <HiOutlineUser />
                </div>
                <h2 className="text-2xl font-bold text-white">2. Information We Collect</h2>
              </div>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  To maintain an active and verified campus community, we collect the following types of information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 rounded-xl bg-dark-800/40 border border-dark-700/30">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-400"></span> Google OAuth Profile
                    </h4>
                    <p className="text-sm text-slate-400">
                      When you log in via Google, we access your institutional or personal Google profile, including your full name, email address, and avatar image.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-dark-800/40 border border-dark-700/30">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-400"></span> Listings & Chat Logs
                    </h4>
                    <p className="text-sm text-slate-400">
                      We store details of items you list for sale (descriptions, images, prices) and the messages exchanged through our secure in-app messaging system.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 3. Academic Verification */}
            <motion.section 
              id="academic-details" 
              className="glass-card p-6 sm:p-8 border-dark-700/50 hover:border-primary-500/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700/40">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xl">
                  <HiOutlineAcademicCap />
                </div>
                <h2 className="text-2xl font-bold text-white">3. Academic Verification Details</h2>
              </div>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Unlike public marketplaces, Buy&Sell TKMCE is restricted strictly to members of the college. During profile completion, we require you to specify your academic metadata:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-400">
                  <li><strong className="text-slate-200">Department:</strong> Your major branch (e.g., Computer Science, Mechanical Engineering) to ensure buyers know where to meet.</li>
                  <li><strong className="text-slate-200">Passout Year:</strong> Helps us identify current student status and manage account life cycles.</li>
                  <li><strong className="text-slate-200">Section:</strong> Used to confirm enrollment and match students for easy item handovers.</li>
                </ul>
                <p className="mt-4">
                  This academic verification dataset is essential for building trust and ensuring that only actual TKMCE community members are interacting on the platform.
                </p>
              </div>
            </motion.section>

            {/* 4. Chat & Phone Protection */}
            <motion.section 
              id="chat-protection" 
              className="glass-card p-6 sm:p-8 border-dark-700/50 hover:border-primary-500/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700/40">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xl">
                  <HiOutlineChat />
                </div>
                <h2 className="text-2xl font-bold text-white">4. Chat & Phone Number Protection</h2>
              </div>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 mb-4">
                  <p className="text-primary-400 font-semibold mb-2 flex items-center gap-2">
                    🛡️ Built-in Privacy Shield
                  </p>
                  <p className="text-sm leading-relaxed">
                    To prevent harassment and unsolicited communication outside our vetted ecosystem, our messaging database utilizes a real-time detection system. Sharing standard 10-digit phone numbers in chat messages will result in the number being automatically masked as <code className="bg-dark-900 px-1.5 py-0.5 rounded text-accent-400 font-mono">[PHONE HIDDEN]</code>.
                  </p>
                </div>
                <p>
                  We encourage all users to communicate using the built-in, secure chat client. If you wish to facilitate in-person exchanges, please share location markers on campus or complete transactions in open common areas (like the college canteen or main library front).
                </p>
              </div>
            </motion.section>

            {/* 5. Sharing & Exclusivity */}
            <motion.section 
              id="data-sharing" 
              className="glass-card p-6 sm:p-8 border-dark-700/50 hover:border-primary-500/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700/40">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xl">
                  <HiOutlineShare />
                </div>
                <h2 className="text-2xl font-bold text-white">5. Sharing & Campus Exclusivity</h2>
              </div>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p className="text-slate-200 font-semibold">
                  Your data is campus-exclusive.
                </p>
                <p>
                  We believe your private information should remain private. Buy&Sell TKMCE enforces strict policies regarding data access:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-400">
                  <li>We <strong className="text-slate-200">never sell or rent</strong> your profile data, email, listing descriptions, or message content to third-party advertisers or data brokers.</li>
                  <li>All profile data, academic details, and active listings are visible only to logged-in, authenticated students of TKMCE.</li>
                  <li>Anonymous search engine indexes are blocked from scraping user profiles or transaction messages.</li>
                </ul>
              </div>
            </motion.section>

            {/* 6. Data Security */}
            <motion.section 
              id="data-security" 
              className="glass-card p-6 sm:p-8 border-dark-700/50 hover:border-primary-500/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700/40">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xl">
                  <HiOutlineLockClosed />
                </div>
                <h2 className="text-2xl font-bold text-white">6. Security Measures</h2>
              </div>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  We implement robust technological safeguards to protect your records:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-400">
                  <li><strong className="text-slate-200">Secure Tokens:</strong> User sessions are encrypted via JSON Web Tokens (JWT) stored safely in local storage or cookies.</li>
                  <li><strong className="text-slate-200">Database Encryption:</strong> Connection links, passwords, and sensitive server variables are encrypted and stored in environment files.</li>
                  <li><strong className="text-slate-200">Role-Based Access:</strong> Moderation logs and student data are only accessible to designated campus agents and system administrators.</li>
                </ul>
                <p className="mt-4 text-sm text-slate-400">
                  If you have questions regarding this Privacy Policy or suspect any safety violations, please contact us at <a href="mailto:support@buysell-tkmce.in" className="text-primary-400 hover:underline">support@buysell-tkmce.in</a>.
                </p>
              </div>
            </motion.section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
