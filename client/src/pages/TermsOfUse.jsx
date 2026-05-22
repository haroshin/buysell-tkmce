import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineScale, 
  HiOutlineUserGroup, 
  HiOutlineBan, 
  HiOutlineCash, 
  HiOutlineBadgeCheck,
  HiOutlineDocumentText
} from 'react-icons/hi';
import SEO from '../components/common/SEO';

const TermsOfUse = () => {
  const [activeSection, setActiveSection] = useState('acceptance');

  const sections = [
    { id: 'acceptance', label: '1. Acceptance of Terms', icon: HiOutlineDocumentText },
    { id: 'eligibility', label: '2. Campus Eligibility', icon: HiOutlineUserGroup },
    { id: 'conduct', label: '3. Code of Conduct & Prohibited Items', icon: HiOutlineBan },
    { id: 'transactions', label: '4. Safe Transactions & Payments', icon: HiOutlineCash },
    { id: 'moderation', label: '5. Moderation & Agents', icon: HiOutlineBadgeCheck },
    { id: 'liability', label: '6. Disclaimer of Liability', icon: HiOutlineScale },
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
        title="Terms of Use | Buy&Sell TKMCE" 
        description="Review the terms, campus community rules, guidelines, and listing standards for using the Buy&Sell TKMCE platform."
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
            ⚖️ Platform Guidelines
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight"
          >
            Terms of <span className="text-primary-400">Use</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-lg leading-relaxed"
          >
            Last Updated: May 22, 2026. Please read these terms carefully before accessing or using the Buy&Sell TKMCE marketplace.
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

          {/* Terms Text Column */}
          <div className="col-span-1 lg:col-span-3 space-y-8">
            
            {/* 1. Acceptance of Terms */}
            <motion.section 
              id="acceptance" 
              className="glass-card p-6 sm:p-8 border-dark-700/50 hover:border-primary-500/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700/40">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xl">
                  <HiOutlineDocumentText />
                </div>
                <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
              </div>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  By creating an account, logging in via Google, or listing items on <strong>Buy&Sell TKMCE</strong>, you agree to be bound by these Terms of Use and our community standards.
                </p>
                <p>
                  If you do not agree with any part of these terms, you are prohibited from utilizing this platform to post listings, message other users, or coordinate transactions.
                </p>
              </div>
            </motion.section>

            {/* 2. Campus Eligibility */}
            <motion.section 
              id="eligibility" 
              className="glass-card p-6 sm:p-8 border-dark-700/50 hover:border-primary-500/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700/40">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xl">
                  <HiOutlineUserGroup />
                </div>
                <h2 className="text-2xl font-bold text-white">2. Campus Eligibility</h2>
              </div>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Buy&Sell TKMCE is an exclusive closed-loop community marketplace. Access is strictly limited to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-400">
                  <li>Active undergraduate and postgraduate students enrolled at <strong className="text-slate-200">TKM College of Engineering, Kollam</strong>.</li>
                  <li>Faculty members and administrative staff currently employed by TKMCE.</li>
                </ul>
                <p>
                  You are required to register using your college email address (or authenticate your active TKMCE status). Alumni access is currently suspended to ensure all active users remain reachable on-campus.
                </p>
              </div>
            </motion.section>

            {/* 3. Code of Conduct & Prohibited Items */}
            <motion.section 
              id="conduct" 
              className="glass-card p-6 sm:p-8 border-dark-700/50 hover:border-primary-500/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700/40">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xl">
                  <HiOutlineBan />
                </div>
                <h2 className="text-2xl font-bold text-white">3. Listing Conduct & Prohibited Items</h2>
              </div>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  We aim to support students by allowing them to trade academic materials, devices, and personal items. However, the listing of the following items is strictly prohibited:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <h4 className="text-white font-semibold mb-2">❌ Restricted Listings</h4>
                    <ul className="text-sm text-slate-400 list-disc pl-4 space-y-1">
                      <li>Alcohol, tobacco, drugs, or e-cigarettes</li>
                      <li>Weapons, firecrackers, or hazardous chemicals</li>
                      <li>Pirated study software or copyright-infringing digital media</li>
                      <li>Off-campus commercial listings not relevant to students</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                    <h4 className="text-white font-semibold mb-2">✅ Approved Items</h4>
                    <ul className="text-sm text-slate-400 list-disc pl-4 space-y-1">
                      <li>Textbooks, lab records, notes, and drawing instruments</li>
                      <li>Laptops, calculators, phones, and accessories</li>
                      <li>Lab coats, college uniforms, and sporting goods</li>
                      <li>Hostel supplies (kettles, mattresses, tables, chairs)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 4. Safe Transactions & Payments */}
            <motion.section 
              id="transactions" 
              className="glass-card p-6 sm:p-8 border-dark-700/50 hover:border-primary-500/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700/40">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xl">
                  <HiOutlineCash />
                </div>
                <h2 className="text-2xl font-bold text-white">4. Safe Transactions & Payments</h2>
              </div>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  To minimize fraud, the platform does not process payments or manage escrow. All sales must be finalized manually by the parties involved:
                </p>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-2">
                  <p className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                    ⚠️ Transaction Guidelines
                  </p>
                  <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4">
                    <li><strong className="text-slate-200">Meet in Public:</strong> Meet exclusively in well-lit, open locations on the TKMCE campus (e.g., central plaza, college library, hostels, or departments).</li>
                    <li><strong className="text-slate-200">Verify Before You Pay:</strong> Inspect electronic goods, textbooks, and hostel furniture physically to verify their condition before making payment.</li>
                    <li><strong className="text-slate-200">Instant Payments:</strong> Use secure direct payment methods, such as UPI (GPay, PhonePe, Paytm) or cash, immediately upon handover of the item.</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* 5. Moderation & Agents */}
            <motion.section 
              id="moderation" 
              className="glass-card p-6 sm:p-8 border-dark-700/50 hover:border-primary-500/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700/40">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xl">
                  <HiOutlineBadgeCheck />
                </div>
                <h2 className="text-2xl font-bold text-white">5. Moderation & Campus Agents</h2>
              </div>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  To maintain quality, Buy&Sell TKMCE operates under a localized peer moderation system:
                </p>
                <p>
                  Designated <strong className="text-slate-200">Class/Department Agents</strong> and <strong className="text-slate-200">Admins</strong> review listings for compliance, approve pending posts, respond to user reports, and flags violating listings.
                </p>
                <p>
                  The platform administrators reserve the right to remove any listing, suspend/terminate any account, or flag conversations that violate these community guidelines without prior notice.
                </p>
              </div>
            </motion.section>

            {/* 6. Disclaimer of Liability */}
            <motion.section 
              id="liability" 
              className="glass-card p-6 sm:p-8 border-dark-700/50 hover:border-primary-500/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700/40">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xl">
                  <HiOutlineScale />
                </div>
                <h2 className="text-2xl font-bold text-white">6. Disclaimer of Liability</h2>
              </div>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Buy&Sell TKMCE is provided on an "as is" basis. The college administration, developers, and moderation agents:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-400">
                  <li>Do not warrant the quality, functionality, safety, or legality of items listed on the marketplace.</li>
                  <li>Are not liable for any financial losses, fraud, damage to property, or disputes arising between buyers and sellers.</li>
                  <li>Are not responsible for offline student behaviors or meetings scheduled through the service.</li>
                </ul>
                <p className="mt-4 text-sm text-slate-400">
                  By using this platform, you assume all risks related to transactions and communication. If you experience suspicious behavior, please report the listing or email us immediately.
                </p>
              </div>
            </motion.section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
