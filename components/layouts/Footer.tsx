/**
 * Footer Component
 * 
 * Displays the footer with "Built by Carphatian" branding
 * and optional navigation links. Used across all public and authenticated pages.
 * Fully translated using next-intl.
 * 
 * Built by Carphatian
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
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
              {t('tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">{t('platform')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">{t('aboutUs')}</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary transition-colors">{t('howItWorks')}</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">{t('pricing')}</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">{t('blog')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">{t('legal')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary transition-colors">{t('terms')}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">{t('privacy')}</Link></li>
              <li><Link href="/cookies" className="hover:text-primary transition-colors">{t('cookies')}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t('contact')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Branding */}
        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            {t('copyright')}
          </p>
          
          {/* Built by Carphatian Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('builtBy')}</span>
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
