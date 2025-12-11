/**
 * Header Component
 * 
 * Main navigation bar with responsive design.
 * Adapts based on authentication state and user role.
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  isAuthenticated?: boolean;
  userRole?: 'client' | 'freelancer' | 'admin';
  userName?: string;
  userAvatar?: string;
}

export function Header({ 
  isAuthenticated = false, 
  userRole, 
  userName,
  userAvatar 
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline-block group-hover:text-primary transition-colors">
              Carphatian
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
                <Link href="/find-talent" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Find Talent
                </Link>
                <Link href="/find-work" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Find Work
                </Link>
                <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </>
            ) : (
              <>
                <Link href={`/${userRole}/dashboard`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href={`/${userRole}/jobs`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {userRole === 'client' ? 'My Jobs' : 'Browse Jobs'}
                </Link>
                <Link href={`/${userRole}/messages`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Messages
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName || 'User'}</p>
                      <p className="text-xs text-muted-foreground capitalize">{userRole} Account</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${userRole}/dashboard`}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${userRole}/settings`}>Settings</Link>
                  </DropdownMenuItem>
                  {userRole === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 animate-in">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <Link href="/how-it-works" className="text-sm font-medium py-2 hover:text-primary transition-colors">
                  How It Works
                </Link>
                <Link href="/find-talent" className="text-sm font-medium py-2 hover:text-primary transition-colors">
                  Find Talent
                </Link>
                <Link href="/find-work" className="text-sm font-medium py-2 hover:text-primary transition-colors">
                  Find Work
                </Link>
                <Link href="/pricing" className="text-sm font-medium py-2 hover:text-primary transition-colors">
                  Pricing
                </Link>
                <Button asChild className="mt-2">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href={`/${userRole}/dashboard`} className="text-sm font-medium py-2 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href={`/${userRole}/jobs`} className="text-sm font-medium py-2 hover:text-primary transition-colors">
                  {userRole === 'client' ? 'My Jobs' : 'Browse Jobs'}
                </Link>
                <Link href={`/${userRole}/messages`} className="text-sm font-medium py-2 hover:text-primary transition-colors">
                  Messages
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
