import React from 'react'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaRegEnvelope, FaPhoneAlt } from 'react-icons/fa';

const FooterH = () => {
  return (
    <footer className="w-full bg-white dark:bg-slate-950 pt-10 pb-6 px-6 md:px-24 font-gabarito text-[#667085] dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">

      <div className="flex flex-col sm:flex-row justify-between gap-6 lg:gap-8 mb-6 lg:mb-8">

        {/* Brand & Socials */}
        <div>
          <h2 className="text-[#147E8F] dark:text-teal-400 font-labrada text-3xl lg:text-4xl font-bold mb-2">ONSY</h2>
          <p className="mb-4 text-xs italic text-slate-500 dark:text-slate-400">"You Talk. We Understand."</p>
          <div className="flex gap-4 text-[#147E8F] dark:text-teal-400">
            <a href="https://www.facebook.com/AlexandriaUniversityEgypt" target="_blank" rel="noopener noreferrer"><FaFacebookF className="cursor-pointer hover:text-[#036464] dark:hover:text-teal-300 transition-colors" /></a>
            <a href="https://twitter.com/AlexuEduEg" target="_blank" rel="noopener noreferrer"><FaTwitter className="cursor-pointer hover:text-[#036464] dark:hover:text-teal-300 transition-colors" /></a>
            <a href="https://www.instagram.com/alexandriauniversity/" target="_blank" rel="noopener noreferrer"><FaInstagram className="cursor-pointer hover:text-[#036464] dark:hover:text-teal-300 transition-colors" /></a>
            <a href="https://www.linkedin.com/school/alexandria-university/" target="_blank" rel="noopener noreferrer"><FaLinkedinIn className="cursor-pointer hover:text-[#036464] dark:hover:text-teal-300 transition-colors" /></a>
            <a href="https://www.youtube.com/user/AlexandriaUniversity" target="_blank" rel="noopener noreferrer"><FaYoutube className="cursor-pointer hover:text-[#036464] dark:hover:text-teal-300 transition-colors" /></a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-[#111111] dark:text-slate-200 font-bold mb-3 lg:mb-4 text-lg">Contact us</h3>
          <ul className="space-y-2 lg:space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <FaRegEnvelope className="text-lg text-[#147E8F] dark:text-teal-400" />
              <span>onsy876@gmail.com</span>
            </li>
            <li className="flex items-center gap-3">
              <FaPhoneAlt className="text-lg text-[#147E8F] dark:text-teal-400" />
              <span>01204426149</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 dark:border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] lg:text-xs tracking-wide gap-4 md:gap-0">
        <p className="text-slate-500 dark:text-slate-500">Copyright © 2026 ONSY</p>

        <div className="flex flex-wrap justify-center gap-2 text-center">
          <span>All Rights Reserved |</span>
          <a href="https://creativecommons.org/licenses/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#147E8F] dark:hover:text-teal-400 transition-colors">Terms and Conditions</a>
          <span className="hidden sm:inline">|</span>
          <a href="https://creativecommons.org/licenses/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#147E8F] dark:hover:text-teal-400 transition-colors">Privacy Policy</a>
        </div>

        {/* Glowing Signature */}
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-slate-400 dark:text-slate-500 text-[10px]">Crafted by</span>
          <span className="text-teal-500 dark:text-teal-400 drop-shadow-[0_0_5px_rgba(20,184,166,0.8)] dark:drop-shadow-[0_0_8px_rgba(45,212,191,1)] animate-pulse text-xs tracking-widest">
            YE19
          </span>
        </div>
      </div>
    </footer>
  );
};

export default FooterH;