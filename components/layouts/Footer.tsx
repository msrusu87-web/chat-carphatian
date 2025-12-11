/**
 * Footer Component
 * 
 * Displays the footer with "Built by Carphatian" branding
 * and optional navigation links. Used across all public and authenticated pages.
 */

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold mb-2 text-gradient">
              Carphatian AI Marketplace
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              The next-generation freelance platform powered by AI. 
              Connecting exceptional talent with visionary clients through intelligent matching.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Branding */}
        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Carphatian AI Marketplace. All rights reserved.
          </p>
          
          {/* Built by Carphatian Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Built by</span>
            <Link 
              href="https://carphatian.ro" 
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300"
            >
              <span className="text-xs font-semibold text-primary">Carphatian</span>
              <svg 
                className="w-3 h-3 text-primary group-hover:translate-x-0.5 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
