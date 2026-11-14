import { useState, useRef } from 'react';
import { X, Upload, User, KeyRound, Check } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function AccountSettingsModal({ open, initialTab, user, onClose, onProfileUpdated }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'profile');
  const [explorerName, setExplorerName] = useState(user?.user_metadata?.explorer_name || '');
  const [bio, setBio] = useState(user?.user_metadata?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  
  // Change password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Socials states
  const [connectedSocials, setConnectedSocials] = useState(user?.user_metadata?.connected_socials || {
    instagram: '',
    tiktok: '',
    threads: '',
  });

  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAvatarUrl(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          explorer_name: explorerName.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl,
        },
      });
      if (error) throw error;
      onProfileUpdated(explorerName.trim());
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMessage('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocials = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { connected_socials: connectedSocials },
      });
      if (error) throw error;
      setPasswordMessage('Social accounts saved!');
    } catch (err) {
      console.error('Failed to save socials:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 p-4 backdrop-blur-xs">
      <div className="relative flex w-full max-w-md flex-col rounded-2xl border-4 border-espresso bg-[#fdfbf7] p-6 shadow-2xl text-espresso font-type">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-espresso/20 pb-3">
          <h2 className="font-display text-xl font-bold text-espresso">Account Settings</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-espresso/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-vintage py-3">
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setPasswordError(''); setPasswordMessage(''); }}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
              activeTab === 'profile' ? 'bg-espresso text-parchment' : 'bg-paper text-roast hover:bg-mist'
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('account'); setPasswordError(''); setPasswordMessage(''); }}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
              activeTab === 'account' ? 'bg-espresso text-parchment' : 'bg-paper text-roast hover:bg-mist'
            }`}
          >
            Account & Security
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('socials'); setPasswordError(''); setPasswordMessage(''); }}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
              activeTab === 'socials' ? 'bg-espresso text-parchment' : 'bg-paper text-roast hover:bg-mist'
            }`}
          >
            Socials
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {passwordError && (
            <div className="mb-3 rounded border border-sakura bg-blush/50 p-2.5 text-xs text-espresso">
              {passwordError}
            </div>
          )}
          {passwordMessage && (
            <div className="mb-3 flex items-center gap-1.5 rounded border border-emerald-400 bg-emerald-50 p-2.5 text-xs text-emerald-800">
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              {passwordMessage}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* 1. Avatar photo on top beside the upload photo button */}
              <div>
                <label className="block font-bold text-espresso mb-1">Avatar Photo</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFile}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-vintage bg-mist text-roast shadow-inner">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-7 w-7" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded border border-vintage bg-paper px-3.5 py-2 font-bold text-espresso hover:bg-mist transition-colors shadow-xs"
                  >
                    <Upload className="h-4 w-4 text-mocha" /> Upload New Photo
                  </button>
                </div>
              </div>

              {/* 2. Under avatar: Explorer Name */}
              <div>
                <label className="block font-bold text-espresso mb-1">Explorer Name</label>
                <input
                  type="text"
                  value={explorerName}
                  onChange={(e) => setExplorerName(e.target.value)}
                  placeholder="Your explorer display name"
                  className="w-full rounded border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
                />
              </div>

              {/* 3. Under Explorer Name: Bio */}
              <div>
                <label className="block font-bold text-espresso mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about your coffee journey..."
                  className="w-full rounded border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded border border-vintage px-4 py-1.5 font-medium text-espresso hover:bg-espresso/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-espresso px-5 py-1.5 font-medium text-parchment hover:bg-roast"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'account' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-espresso mb-1">Email Address</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded border border-vintage bg-mist/50 px-3 py-2 text-espresso opacity-80 cursor-not-allowed"
                />
              </div>

              <div className="border-t border-vintage pt-3 space-y-3">
                <p className="font-bold text-espresso flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-sakura" /> Change Password
                </p>
                <div>
                  <label className="block text-roast mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-roast mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded border border-vintage px-4 py-1.5 font-medium text-espresso hover:bg-espresso/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !newPassword}
                  className="rounded bg-espresso px-5 py-1.5 font-medium text-parchment hover:bg-roast disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'socials' && (
            <form onSubmit={handleSaveSocials} className="space-y-3 text-xs">
              <p className="font-bold text-espresso mb-2">Connected Social Handles</p>
              <div>
                <label className="block text-roast mb-1">Instagram Handle / Link</label>
                <input
                  type="text"
                  placeholder="@yourusername"
                  value={connectedSocials.instagram}
                  onChange={(e) => setConnectedSocials({ ...connectedSocials, instagram: e.target.value })}
                  className="w-full rounded border border-vintage bg-white px-3 py-1.5 text-espresso focus:border-sakura focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-roast mb-1">TikTok Handle</label>
                <input
                  type="text"
                  placeholder="@yourusername"
                  value={connectedSocials.tiktok}
                  onChange={(e) => setConnectedSocials({ ...connectedSocials, tiktok: e.target.value })}
                  className="w-full rounded border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-roast mb-1">Threads Handle</label>
                <input
                  type="text"
                  placeholder="@yourusername"
                  value={connectedSocials.threads}
                  onChange={(e) => setConnectedSocials({ ...connectedSocials, threads: e.target.value })}
                  className="w-full rounded border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded border border-vintage px-4 py-1.5 font-medium text-espresso hover:bg-espresso/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-espresso px-5 py-1.5 font-medium text-parchment hover:bg-roast"
                >
                  {saving ? 'Saving...' : 'Save Socials'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}