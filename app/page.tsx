/**
 * Home Page (Landing Page)
 * 
 * This is the main entry point for unauthenticated users.
 * Features:
 * - Hero section with AI-powered messaging
 * - Key value propositions
 * - Call-to-action buttons for clients and freelancers
 * - Social proof and testimonials
 * - "Built by Carphatian" branding
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layouts/Header';
import { Footer } from '@/components/layouts/Footer';

export default function HomePage() {
  return (
    <>
      <Header isAuthenticated={false} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">AI-Powered Matching</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              Find{' '}
              <span className="text-gradient">
                Perfect Talent
              </span>
              <br />
              in Seconds, Not Weeks
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI understands your needs and instantly matches you with the right freelancers. 
              No more sifting through hundreds of profiles.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="text-base px-8">
                <Link href="/signup?role=client">
                  Post a Job
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <Link href="/signup?role=freelancer">
                  Find Work
                </Link>
              </Button>
            </div>

            {/* Trust Badge */}
            <p className="text-sm text-muted-foreground">
              ✓ No credit card required • ✓ Free to get started • ✓ AI-powered matching
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Why Choose Carphatian?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Traditional platforms waste your time. We use AI to do the heavy lifting.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="glass border-border/50 hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Instant Matching</h3>
                  <p className="text-muted-foreground">
                    AI analyzes your job requirements and finds the perfect freelancers in seconds. 
                    No manual searching required.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="glass border-border/50 hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Secure Payments</h3>
                  <p className="text-muted-foreground">
                    Escrow protection, milestone-based payments, and instant payouts via Stripe. 
                    Your money is safe.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="glass border-border/50 hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">AI Assistant</h3>
                  <p className="text-muted-foreground">
                    From job descriptions to cover letters, our AI helps you communicate better 
                    and faster.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-20 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Three simple steps to start working together
              </p>
            </div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Describe Your Needs</h3>
                  <p className="text-muted-foreground">
                    Chat with our AI to create the perfect job post. No forms, no hassle. 
                    Just have a conversation.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Get Matched Instantly</h3>
                  <p className="text-muted-foreground">
                    Our AI finds freelancers whose skills, experience, and availability perfectly 
                    match your requirements.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Hire & Pay Securely</h3>
                  <p className="text-muted-foreground">
                    Review proposals, hire the best talent, and pay securely through our 
                    escrow-protected payment system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <Card className="glass border-primary/20 bg-gradient-primary/5">
              <CardContent className="p-12 text-center space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of clients and freelancers who are already using AI to work smarter.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button size="lg" asChild className="text-base px-8">
                    <Link href="/signup?role=client">
                      I&apos;m Hiring
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-base px-8">
                    <Link href="/signup?role=freelancer">
                      I&apos;m Looking for Work
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
