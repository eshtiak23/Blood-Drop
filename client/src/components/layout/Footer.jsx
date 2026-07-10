/**
 * Footer.jsx — Site-Wide Footer
 * 
 * A visually unique and cool footer with:
 * - Wave SVG divider on top
 * - Dark gradient background
 * - Brand logo + description
 * - Quick links with hover glow effects
 * - Contact info with icons
 * - Social media links
 * - Mobile responsive layout (stacks on small screens)
 * 
 * The glow effects adapt to both dark and light themes.
 */

import { Link } from "react-router-dom";
import { Droplet, Mail, Phone, MapPin, Heart, ArrowUp, Globe, MessageCircle, Share2, Code } from "lucide-react";

export default function Footer() {
  /** Smooth scroll to top of page */
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="footer-wrap">
      {/* Wave SVG Divider */}
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60L48 52C96 44 192 28 288 32C384 36 480 60 576 68C672 76 768 68 864 56C960 44 1056 28 1152 24C1248 20 1344 28 1392 32L1440 36V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z" className="footer-wave-fill" />
        </svg>
      </div>

      {/* Main Footer Content */}
      <div className="footer-inner">
        <div className="container">
          <div className="footer-grid">
            
            {/* Column 1: Brand + Tagline */}
            <div className="footer-col footer-brand">
              <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="footer-logo-icon">
                  <img src="/Logo.png" alt="LifeDrop" style={{ height: 28, width: 28, objectFit: "contain" }} />
                </div>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Life<span style={{ color: "#F87171" }}>Drop</span></span>
              </Link>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 14, lineHeight: 1.7 }}>
                Connecting blood donors with people in need. Together, every drop saves a life.
              </p>
              {/* Social Icons */}
              <div className="footer-socials">
                <a href="#" className="footer-social-link" aria-label="Facebook"><Globe size={16} /></a>
                <a href="#" className="footer-social-link" aria-label="Twitter"><MessageCircle size={16} /></a>
                <a href="#" className="footer-social-link" aria-label="Instagram"><Share2 size={16} /></a>
                <a href="#" className="footer-social-link" aria-label="GitHub"><Code size={16} /></a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="footer-col">
              <h4 className="footer-heading">Quick Links</h4>
              <div className="footer-links">
                <Link to="/" className="footer-link">Home</Link>
                <Link to="/donors" className="footer-link">Find Donors</Link>
                <Link to="/requests" className="footer-link">Blood Requests</Link>
                <Link to="/register" className="footer-link">Become a Donor</Link>
              </div>
            </div>

            {/* Column 3: Support */}
            <div className="footer-col">
              <h4 className="footer-heading">Support</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">Help Center</a>
                <a href="#" className="footer-link">Privacy Policy</a>
                <a href="#" className="footer-link">Terms of Service</a>
                <a href="#" className="footer-link">FAQ</a>
              </div>
            </div>

            {/* Column 4: Contact */}
            <div className="footer-col">
              <h4 className="footer-heading">Contact Us</h4>
              <div className="footer-contact">
                <span className="footer-contact-item"><Mail size={14} /> info@lifedrop.com</span>
                <span className="footer-contact-item"><Phone size={14} /> +880 1700-000000</span>
                <span className="footer-contact-item"><MapPin size={14} /> Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              &copy; {new Date().getFullYear()} LifeDrop. Made with <Heart size={12} fill="#F87171" color="#F87171" style={{ display: "inline", verticalAlign: "middle" }} /> in Bangladesh
            </p>
            <button onClick={scrollToTop} className="footer-top-btn" aria-label="Back to top">
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
