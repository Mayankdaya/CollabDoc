

"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Spotlight } from '@/components/ui/spotlight-new';
import { CollabDocLogo } from '@/components/collab-doc-logo';
import { ArrowRight, Bot, ShieldCheck, Users, Workflow } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const GlowingCard = ({
  children,
  className,
  glowClassName,
}: {
  children: React.ReactNode;
  className?: string;
  glowClassName?: string;
}) => {
  return (
    <div className={cn("relative group overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800", className)}>
        <div className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-48 opacity-20 group-hover:opacity-30 transition-opacity duration-500 blur-3xl", glowClassName)} />
        <div className="relative z-10 p-8 h-full">
            {children}
        </div>
    </div>
  );
};


export default function LandingPage() {
  const { user, loading } = useAuth();

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Real-Time Collaboration",
      description: "Work together seamlessly with live cursors, instant updates, and shared commenting. No more version conflicts.",
      glowClassName: "bg-cyan-500",
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: "AI-Powered Assistance",
      description: "Supercharge your writing with AI suggestions, grammar checks, content generation, and document summarization.",
       glowClassName: "bg-green-500",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Secure & Reliable",
      description: "Your documents are safe with enterprise-grade security, automatic cloud saves, and a full version history.",
       glowClassName: "bg-blue-500",
    },
  ];

   const testimonials = [
    {
      quote: "CollabDoc has transformed how our team approaches content creation. The AI assistant is a game-changer, and the real-time collaboration is flawless. Our productivity has skyrocketed.",
      name: "Sarah Johnson",
      title: "Director of Marketing, TechCorp",
      avatar: "SJ",
    },
    {
      quote: "The security and reliability of CollabDoc are second to none. We handle sensitive information, and the platform's robust security measures give us complete peace of mind.",
      name: "Michael Chen",
      title: "Lead Engineer, Innovate LLC",
      avatar: "MC",
    },
     {
      quote: "As a creative agency, we juggle multiple projects and collaborators. CollabDoc streamlines our workflow, from brainstorming to final revisions. It's an indispensable tool for us.",
      name: "Emily Rodriguez",
      title: "Creative Director, Visionary Designs",
      avatar: "ER",
    },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const cardVariants = (delay: number) => ({
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay } }
  });

  const navItems = [
      { name: "Features", href: "#features" },
      { name: "Testimonials", href: "#testimonials" },
      { name: "Pricing", href: "#" },
      { name: "Contact", href: "#" },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="absolute top-0 left-0 w-full h-full">
        <Spotlight />
      </div>
      <header className="sticky top-0 z-50 flex h-20 items-center justify-center bg-background/80 backdrop-blur-lg border-b border-slate-300/10 px-4 md:px-6">
        <div className="w-full max-w-7xl flex items-center justify-between">
          <Link href="#" className="flex items-center justify-center gap-2" prefetch={false}>
            <CollabDocLogo className="h-7 w-7" />
            <span className="text-xl font-bold font-headline">CollabDoc</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navItems.map((item) => (
                 <Link key={item.name} href={item.href} className="hover:text-primary transition-colors" prefetch={false}>
                    {item.name}
                </Link>
            ))}
          </nav>
           <div className="flex items-center gap-2">
             <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader>
                           <SheetTitle>Navigation</SheetTitle>
                           <SheetDescription>
                                Main navigation links for the site.
                           </SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-4 p-4">
                             {navItems.map((item) => (
                                <Link key={item.name} href={item.href} className="font-medium hover:text-primary transition-colors" prefetch={false}>
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
             </div>
            <div className="hidden sm:flex items-center gap-2">
                {!loading && user ? (
                    <Button asChild>
                        <Link href="/dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Go to Dashboard
                        </Link>
                    </Button>
                ) : (
                    <>
                        <Button variant="ghost" asChild>
                            <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/login">Get Started</Link>
                        </Button>
                    </>
                )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40">
          <div className="container mx-auto max-w-7xl px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0.0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="relative flex flex-col gap-4 items-center justify-center px-4"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
                Craft Intelligence, <br /> Together.
              </h1>
              <p className="mt-4 max-w-3xl text-md sm:text-lg md:text-xl text-muted-foreground">
                CollabDoc is the enterprise-grade platform where AI-powered workflows and real-time collaboration converge, enabling your team to produce exceptional work with unprecedented speed and precision.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/login">
                    Start Creating For Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  Request a Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12">
            <motion.div 
              className="container mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={sectionVariants}
            >
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <p className="text-sm text-muted-foreground tracking-widest uppercase">Trusted by the world's most innovative teams</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-4 opacity-70">
                        <p className="font-bold text-lg sm:text-2xl">TechCorp</p>
                        <p className="font-bold text-lg sm:text-2xl">Innovate LLC</p>
                        <p className="font-bold text-lg sm:text-2xl">Visionary</p>
                        <p className="font-bold text-lg sm:text-2xl">Quantum Inc.</p>
                         <p className="font-bold text-lg sm:text-2xl">Apex Solutions</p>
                    </div>
                </div>
            </motion.div>
        </section>

        <section className="w-full py-20 md:py-32 overflow-hidden">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-4 md:px-6">
                <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        Unparalleled Efficiency
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-muted-foreground">A Unified Workspace</h2>
                    <p className="max-w-xl text-lg text-muted-foreground">
                        Stop the context-switching.CollabDoc integrates everything your team needs into one powerful, intuitive editor designed for deep work and seamless creativity.
                    </p>
                    <ul className="space-y-4 text-lg">
                        <li className="flex items-start gap-4">
                            <Workflow className="h-7 w-7 mt-1 text-primary" />
                            <div>
                                <h4 className="font-semibold">Intelligent Workflow</h4>
                                <p className="text-muted-foreground">Automate tedious tasks and let our AI handle the heavy lifting, from formatting to content generation.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <Users className="h-7 w-7 mt-1 text-primary" />
                            <div>
                                <h4 className="font-semibold">Seamless Integration</h4>
                                <p className="text-muted-foreground">Connect with your favorite tools and platforms to keep your workflow uninterrupted.</p>
                            </div>
                        </li>
                    </ul>
                </motion.div>
                <motion.div
                     initial={{ opacity: 0, x: 50 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true, amount: 0.5 }}
                     transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Image 
                    src="https://picsum.photos/1200/800" 
                    alt="CollabDoc Editor Interface" 
                    width={1200}
                    height={800}
                    data-ai-hint="dark editor interface"
                    className="rounded-xl shadow-2xl shadow-primary/10"
                  />
                </motion.div>
            </div>
        </section>

        <section id="features" className="w-full py-20 md:py-32 bg-background">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <motion.div 
                className="flex flex-col items-center gap-6 text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionVariants}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-muted-foreground">Engineered for Excellence</h2>
              <p className="max-w-3xl text-lg text-muted-foreground">
                CollabDoc is more than just an editor. It's a comprehensive platform with features designed to empower modern, high-performing teams.
              </p>
            </motion.div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden rounded-2xl"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  variants={cardVariants(index * 0.2)}
                >
                  <Spotlight />
                  <GlowingCard
                    key={index}
                    glowClassName={feature.glowClassName}
                  >
                    <div className="flex flex-col items-start gap-4">
                      {feature.icon}
                      <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-muted-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </GlowingCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full py-20 md:py-32 relative">
             <div className="absolute top-0 left-0 w-full h-full">
               <Spotlight />
             </div>
             <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
                <motion.div 
                    className="flex flex-col items-center gap-6 text-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={sectionVariants}
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-muted-foreground">What Our Users Say</h2>
                    <p className="max-w-3xl text-lg text-muted-foreground">
                        Hear from the leaders who have transformed their workflows with CollabDoc.
                    </p>
                </motion.div>
                 <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <motion.div 
                            key={index} 
                            className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={cardVariants(index * 0.2)}
                        >
                           <p className="text-lg text-foreground mb-6">"{testimonial.quote}"</p>
                           <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                </div>
                           </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>


        <section className="w-full py-20 md:py-32">
            <motion.div 
                className="container mx-auto max-w-7xl px-4 md:px-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionVariants}
            >
                <div className="flex flex-col items-center justify-center space-y-8 text-center bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-12 backdrop-blur-md">
                    <div className="space-y-4">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-muted-foreground">Ready to Elevate Your Workflow?</h2>
                        <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                        Join thousands of teams who are creating, collaborating, and achieving more with CollabDoc.
                        </p>
                    </div>
                    <div className="w-full max-w-md space-y-4">
                        <Button size="lg" className="w-full" asChild>
                           <Link href="/login">
                             Get Started for Free
                           </Link>
                        </Button>
                        <p className="text-xs text-muted-foreground">
                        No credit card required. Cancel anytime.
                        </p>
                    </div>
                </div>
            </motion.div>
        </section>
      </main>
      <footer className="border-t border-white/10">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between py-8 px-4 md:px-6 gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">&copy; 2024 CollabDoc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
