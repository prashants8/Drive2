import React, { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Cloud, ArrowRight, Loader2, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Registration successful! Please check your email.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 relative z-10">
        <div className="max-w-md w-full mx-auto space-y-12">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Cloud className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">DRIVETO</span>
          </Link>

          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white tracking-tight">Create Account</h1>
            <p className="text-slate-500 font-medium">Join thousands of users who trust DRIVETO for their cloud storage.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <Input 
                    type="email" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg rounded-2x" 
              disabled={loading}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>Get Started <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-slate-500 font-medium pt-4">
            Already have an account? <Link to="/login" className="text-indigo-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right side: Decorative */}
      <div className="hidden lg:flex flex-1 bg-slate-900 items-center justify-center p-24 border-l border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="relative z-10 space-y-12">
           <div className="p-12 bg-slate-950/50 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl space-y-6 animate-in slide-in-from-right-12 duration-1000">
             <div className="flex items-center gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-800 bg-slate-900 overflow-hidden">
                    <img src={`https://picsum.photos/seed/${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-slate-800 bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  +2k
                </div>
             </div>
             <p className="text-2xl font-bold text-white leading-tight underline decoration-indigo-500 decoration-4 underline-offset-8">
               Join a community of secure storage lovers.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
