import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-element-bg py-8 px-4 mt-auto">
      <div className="max-w-4xl mx-auto">
        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Facebook">
            <Facebook className="w-6 h-6 text-gray-800" />
          </a>
          <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Instagram">
            <Instagram className="w-6 h-6 text-gray-800" />
          </a>
          <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Twitter">
            <Twitter className="w-6 h-6 text-gray-800" />
          </a>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-center space-x-8 mb-4">
          <a href="#" className="text-text-secondary hover:text-white transition-colors text-sm">
            Info
          </a>
          <a href="#" className="text-text-secondary hover:text-white transition-colors text-sm">
            Support
          </a>
          <a href="#" className="text-text-secondary hover:text-white transition-colors text-sm">
            Marketing
          </a>
        </div>

        {/* Legal Links */}
        <div className="flex justify-center space-x-8 mb-4">
          <a href="#" className="text-text-secondary hover:text-white transition-colors text-sm">
            Terms of Use
          </a>
          <a href="#" className="text-text-secondary hover:text-white transition-colors text-sm">
            Privacy Policy
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-text-secondary text-sm">© 2025 LoveBloom</p>
        </div>
      </div>
    </footer>;
};
export default Footer;