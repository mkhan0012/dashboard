"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Mail, BrainCircuit, Zap, CheckCircle2, PlayCircle } from "lucide-react";

export default function LandingPage() {
  
  // Function to handle smooth scrolling for "View Demo"
  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo-section");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            JobTracker
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/DasboardClient" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/dashboard/DasboardClient">
            <Button className="bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-6 font-semibold transition-all hover:scale-105">
              Launch App
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Version Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-xs font-medium text-indigo-400 mb-4 hover:border-indigo-500/50 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            v2.0 Now with AI Resume Coach
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Stop guessing. <br />
            Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">getting hired.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The all-in-one AI career copilot. Sync your emails, analyze your resume, 
            and draft perfect replies in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all hover:scale-105 hover:shadow-indigo-500/40">
                Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Button 
              onClick={scrollToDemo}
              variant="outline" 
              size="lg" 
              className="h-12 px-8 rounded-full border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 transition-all"
            >
              <PlayCircle className="mr-2 h-5 w-5" /> View Demo
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Preview Visual (Linked to View Demo) */}
        <motion.div 
           id="demo-section" 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="mt-20 relative mx-auto max-w-5xl scroll-mt-24"
        >
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-2 backdrop-blur-sm shadow-2xl">
            <div className="rounded-lg overflow-hidden bg-zinc-950 aspect-[16/9] relative group border border-zinc-900">
              
              {/* Fake UI Content to look like the dashboard */}
              <div className="absolute inset-0 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4">
                  <div className="w-32 h-6 bg-zinc-900 rounded-md"></div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-zinc-900 rounded-full"></div>
                    <div className="w-24 h-8 bg-indigo-900/20 rounded-md"></div>
                  </div>
                </div>
                <div className="flex gap-4 mb-6">
                   <div className="w-1/4 h-24 bg-zinc-900 rounded-lg"></div>
                   <div className="w-1/4 h-24 bg-indigo-900/10 border border-indigo-900/20 rounded-lg"></div>
                   <div className="w-1/4 h-24 bg-zinc-900 rounded-lg"></div>
                   <div className="w-1/4 h-24 bg-zinc-900 rounded-lg"></div>
                </div>
                <div className="flex-1 bg-zinc-900/30 rounded-lg border border-zinc-900 p-4 space-y-3">
                   <div className="w-full h-12 bg-zinc-900 rounded border border-zinc-800 flex items-center px-4">
                      <div className="w-8 h-8 rounded bg-zinc-800 mr-4"></div>
                      <div className="w-48 h-4 bg-zinc-800 rounded"></div>
                   </div>
                   <div className="w-full h-12 bg-zinc-900 rounded border border-zinc-800 flex items-center px-4 opacity-50"></div>
                   <div className="w-full h-12 bg-zinc-900 rounded border border-zinc-800 flex items-center px-4 opacity-30"></div>
                </div>
              </div>
              
              {/* Overlay Gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60 pointer-events-none" />
              
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-zinc-950/80 backdrop-blur-md px-6 py-3 rounded-full border border-zinc-800 shadow-xl">
                  <p className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-500" /> Live Dashboard Preview
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Glow Effect behind image */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-3xl opacity-20 -z-10" />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-950/50 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Supercharge your job search</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Replace your spreadsheet with an intelligent system that works for you 24/7.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Mail className="text-blue-400" />}
              title="Auto-Sync Emails"
              desc="Connect your Gmail and watch your applications appear instantly. No more manual data entry."
            />
            <FeatureCard 
              icon={<BrainCircuit className="text-purple-400" />}
              title="AI Recruiter Insights"
              desc="Get real-time feedback on your application status and probability of getting an interview."
            />
             <FeatureCard 
              icon={<Zap className="text-amber-400" />}
              title="Smart Reply Drafts"
              desc="Let AI write the perfect follow-up or thank you email in seconds based on context."
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat number="100%" label="Private Data" />
            <Stat number="500+" label="Resumes Parsed" />
            <Stat number="24/7" label="AI Availability" />
            <Stat number="10x" label="Faster Apply" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-3xl p-12 text-center border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-[100px] -mr-32 -mt-32" />
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Ready to land your next role?</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto relative z-10">
            Join thousands of developers who are organizing their job search with AI.
          </p>
          <Link href="/dashboard" className="relative z-10">
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-zinc-100 font-bold px-8 py-6 rounded-full text-lg shadow-xl transition-transform hover:scale-105">
              Start Tracking Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-900 text-center text-zinc-500 text-sm">
        <p>© 2024 JobTracker AI. Built for developers.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1 group">
      <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-800/80 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function Stat({ number, label }: any) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-white mb-1">{number}</div>
      <div className="text-zinc-500 text-sm uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}