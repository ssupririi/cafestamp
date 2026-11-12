import { useState } from 'react';
import { Coffee, Compass, KeyRound, Mail, User } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [explorerName, setExplorerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              explorer_name: explorerName.trim() || 'Café Explorer',
            },
          },
        });
        if (signUpError) throw signUpError;
        setMessage('Passport issued! Check your email to confirm your account, or sign in if confirmation is disabled.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border-4 border-espresso bg-espresso p-2.5 shadow-2xl">
        <div className="book-page rounded-xl p-8">
          {/* Passport Emblem Header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-espresso bg-blush/50 text-espresso">
              <Coffee className="h-7 w-7" />
            </div>
            <p className="mt-3 font-type text-xs uppercase tracking-widest text-mocha">Official Travel Log</p>
            <h1 className="font-display text-3xl font-bold text-espresso">CafeStamp</h1>
            <p className="mt-1 font-type text-xs text-roast">
              {isSignUp ? 'Issue a new café explorer passport' : 'Present your credentials to open your passport'}
            </p>
          </div>

          {error && (
            <div role="alert" className="mt-5 rounded-lg border border-sakura bg-blush/50 p-3 font-type text-xs text-espresso">
              {error}
            </div>
          )}

          {message && (
            <div role="status" className="mt-5 rounded-lg border border-gold bg-mist p-3 font-type text-xs text-espresso">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 font-type text-sm">
            {isSignUp && (
              <div>
                <label htmlFor="explorer-name" className="block text-xs font-bold text-espresso">
                  Explorer Name
                </label>
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-latte" />
                  <input
                    id="explorer-name"
                    type="text"
                    required
                    maxLength={28}
                    value={explorerName}
                    onChange={(e) => setExplorerName(e.target.value)}
                    placeholder="e.g., Ishi"
                    className="w-full rounded-md border border-vintage bg-white py-2 pl-9 pr-3 text-espresso focus:border-sakura focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-espresso">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-latte" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="explorer@cafestamp.app"
                  className="w-full rounded-md border border-vintage bg-white py-2 pl-9 pr-3 text-espresso focus:border-sakura focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-espresso">
                Password
              </label>
              <div className="relative mt-1">
                <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-latte" />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-vintage bg-white py-2 pl-9 pr-3 text-espresso focus:border-sakura focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-espresso py-2.5 text-sm font-medium text-parchment transition-colors hover:bg-roast disabled:opacity-50"
            >
              <Compass className="h-4 w-4" />
              {loading ? 'Verifying...' : isSignUp ? 'Issue Passport' : 'Open Passport'}
            </button>
          </form>

          <div className="mt-6 border-t border-vintage pt-4 text-center font-type text-xs text-mocha">
            {isSignUp ? 'Already have a passport?' : "Don't have a passport yet?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setMessage('');
              }}
              className="font-bold text-espresso underline hover:text-roast"
            >
              {isSignUp ? 'Sign In' : 'Create One'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}