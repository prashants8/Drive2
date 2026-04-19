import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Shield, Zap, Lock, Globe, HardDrive, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Cloud className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">DRIVETO</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-300">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="rounded-xl shadow-xl shadow-indigo-600/20">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-indigo-600/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-1000">
              <Zap className="w-3 h-3" /> Secure Cloud Storage v2.0
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Your entire digital life, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600">securely stored.</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto animate-in fade-in duration-1000 delay-300">
              DRIVETO offers high-speed, encrypted cloud storage for modern users. Store, manage, and share your files with military-grade security.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in duration-1000 delay-500">
              <Link to="/signup">
                <Button size="lg" className="h-14 px-10 text-lg rounded-2xl group">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-2xl border-white/10 text-white hover:bg-white/5">
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "End-to-End Encryption", desc: "Your files are encrypted before they even leave your device." },
              { icon: HardDrive, title: "15GB Free Storage", desc: "Get started with 15GB of high-speed cloud storage for free." },
              { icon: Globe, title: "Access Anywhere", desc: "Sync your files across all your devices instantly and securely." }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] hover:border-indigo-500/50 transition-all group">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
