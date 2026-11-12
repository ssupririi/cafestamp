import { useEffect, useState } from 'react';
import { Check, KeyRound, Mail, Share2, Shield, User, X } from 'lucide-react';
import { supabase } from '../services/supabase';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Shield },
  { id: 'socials', label: 'Socials', icon: Share2 },
];

export default function AccountSettingsModal({ open, initialTab = 'profile', user, onClose, onProfileUpdated }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Profile fields
  const meta = user?.user_metadata || {};
  const [explorerName, setExplorerName] = useState(meta.explorer_name || 'Café Explorer');
  const [avatarUrl, setAvatarUrl] = useState(meta.avatar_url || '');
  const [bio, setBio] = useState(meta.bio || '');

  // Account fields
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Connected socials (stored in user_metadata.socials)
  const [socials, setSocials] = useState({
    instagram: meta.socials?.instagram || '',
    tiktok: meta.socials?.tiktok || '',
    threads: meta.socials?.threads || '',
  });

  useEffect(() => {
    setActiveTab(initialTab);
    setFeedback({ type: '', text: '' });
  }, [initialTab, open]);

  useEffect(() => {
    if (user) {
      const m = user.user_metadata || {};
      setExplorerName(m.explorer_name || 'Café Explorer');
      setAvatarUrl(m.avatar_url || '');
      setBio(m.bio || '');
      setEmail(user.email || '');
      setSocials({
        instagram: m.socials?.instagram || '',
        tiktok: m.socials?.tiktok || '',
        threads: m.socials?.threads || '',
      });
    }
  }, [user]);

  if (!open) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', text: '' });
    try {
      const cleanName = explorerName.trim() || 'Café Explorer';
      const { error } = await supabase.auth.updateUser({
        data: {
          explorer_name: cleanName,
          avatar_url: avatarUrl.trim(),
          bio: bio.trim(),
        },
      });
      if (error) throw error;
      onProfileUpdated?.(cleanName);
      setFeedback({ type: 'success', text: 'Passport profile updated!' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });

    if (newPassword && newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSaving(true);
    try {
      const updates = {};
      if (email.trim() && email.trim() !== user?.email) {
        updates.email = email.trim();
      }
      if (newPassword) {
        updates.password = newPassword;
      }

      if (Object.keys(updates).length === 0) {
        setFeedback({ type: 'error', text: 'No account changes to save.' });
        setSaving(false);
        return;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      setNewPassword('');
      setConfirmPassword('');
      setFeedback({
        type: 'success',
        text: updates.email
          ? 'Account updated! Check your inbox if email confirmation is required.'
          : 'Password updated successfully!',
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocials = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', text: '' });
    try {
      const cleaned = {
        instagram: socials.instagram.replace(/^@/, '').trim(),
        tiktok: socials.tiktok.replace(/^@/, '').trim(),
        threads: socials.threads.replace(/^@/, '').trim(),
      };
      const { error } = await supabase.auth.updateUser({
        data: { socials: cleaned },
      });
      if (error) throw error;
      setSocials(cleaned);
      setFeedback({ type: 'success', text: 'Social accounts linked for one-click Share Studio!' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border-4 border-espresso bg-parchment shadow-2xl">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between border-b border-vintage bg-mist/60 px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-espresso">Explorer Settings</h2>
            <p className="font-type text-xs text-mocha">Manage your passport identity, security, and sharing links</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-md p-1 text-espresso hover:bg-roast/15"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-vintage bg-paper px-6 pt-2 font-type text-xs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                setFeedback({ type: '', text: '' });
              }}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 font-bold transition-colors ${
                activeTab === id
                  ? 'border-espresso text-espresso'
                  : 'border-transparent text-mocha hover:text-espresso'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6 font-type text-sm">
          {feedback.text && (
            <div
              role="alert"
              className={`mb-4 rounded-lg border p-3 text-xs ${
                feedback.type === 'error'
                  ? 'border-sakura bg-blush/50 text-espresso'
                  : 'border-gold bg-mist text-espresso'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-vintage bg-mist text-latte">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-7 w-7" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <label htmlFor="settings-avatar" className="block text-xs font-bold text-espresso">
                    Avatar Photo URL
                  </label>
                  <input
                    id="settings-avatar"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-md border border-vintage bg-white px-3 py-1.5 text-xs text-espresso focus:border-sakura focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="settings-name" className="block text-xs font-bold text-espresso">
                  Explorer Name (Printed on Passport)
                </label>
                <input
                  id="settings-name"
                  type="text"
                  required
                  maxLength={28}
                  value={explorerName}
                  onChange={(e) => setExplorerName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="settings-bio" className="block text-xs font-bold text-espresso">
                  Tasting Motto / Bio
                </label>
                <textarea
                  id="settings-bio"
                  rows="2"
                  maxLength={120}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Hunting down the best iced matcha & flaky croissants..."
                  className="mt-1 w-full rounded-md border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-espresso px-5 py-2 text-xs font-medium text-parchment hover:bg-roast disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ACCOUNT & SECURITY */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div>
                <label htmlFor="settings-email" className="block text-xs font-bold text-espresso">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-latte" />
                  <input
                    id="settings-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-vintage bg-white py-2 pl-9 pr-3 text-espresso focus:border-sakura focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-vintage pt-4">
                <p className="text-xs font-bold text-espresso">Change Password</p>
                <p className="text-[11px] text-mocha">Leave blank if you want to keep your current password.</p>
              </div>

              <div>
                <label htmlFor="settings-new-pw" className="block text-xs font-bold text-espresso">
                  New Password
                </label>
                <div className="relative mt-1">
                  <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-latte" />
                  <input
                    id="settings-new-pw"
                    type="password"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-md border border-vintage bg-white py-2 pl-9 pr-3 text-espresso focus:border-sakura focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="settings-confirm-pw" className="block text-xs font-bold text-espresso">
                  Confirm New Password
                </label>
                <div className="relative mt-1">
                  <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-latte" />
                  <input
                    id="settings-confirm-pw"
                    type="password"
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-md border border-vintage bg-white py-2 pl-9 pr-3 text-espresso focus:border-sakura focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-espresso px-5 py-2 text-xs font-medium text-parchment hover:bg-roast disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Account'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CONNECTED SOCIALS */}
          {activeTab === 'socials' && (
            <form onSubmit={handleSaveSocials} className="space-y-4">
              <p className="text-xs text-roast">
                Link your social handles so **Share Studio** can stamp your handle watermark and launch one-click sharing.
              </p>

              {[
                { key: 'instagram', label: 'Instagram', placeholder: 'yourhandle' },
                { key: 'tiktok', label: 'TikTok', placeholder: 'yourhandle' },
                { key: 'threads', label: 'Threads / X', placeholder: 'yourhandle' },
              ].map(({ key, label, placeholder }) => {
                const connected = Boolean(socials[key]);
                return (
                  <div key={key} className="rounded-lg border border-vintage bg-white p-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor={`social-${key}`} className="text-xs font-bold text-espresso">
                        {label}
                      </label>
                      {connected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blush/60 px-2 py-0.5 text-[10px] font-bold text-espresso">
                          <Check className="h-3 w-3" /> Linked
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center rounded-md border border-vintage bg-paper px-2.5">
                      <span className="text-xs text-mocha">@</span>
                      <input
                        id={`social-${key}`}
                        type="text"
                        value={socials[key]}
                        onChange={(e) => setSocials({ ...socials, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full bg-transparent px-1.5 py-1.5 text-xs text-espresso focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-espresso px-5 py-2 text-xs font-medium text-parchment hover:bg-roast disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Connected Socials'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}