import { useState, useRef } from 'react';
import { X, KeyRound, Check, Camera, Trash2, User } from 'lucide-react';
import { supabase } from '../services/supabase';

// Client-side helper to resize avatar to a crisp 160x160 JPEG (< 15KB)
function resizeImageToBlob(file, maxSize = 160) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = maxSize;
      canvas.height = maxSize;
      const ctx = canvas.getContext('2d');

      // Center-crop square
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxSize, maxSize);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to compress avatar.'));
        },
        'image/jpeg',
        0.82
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Invalid image file.'));
    };
    img.src = objectUrl;
  });
}

export default function AccountSettingsModal({ open, initialTab, user, onClose, onProfileUpdated }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'profile');
  const [explorerName, setExplorerName] = useState(user?.user_metadata?.explorer_name || '');
  const [bio, setBio] = useState(user?.user_metadata?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const fileInputRef = useRef(null);

  // Change password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Socials states
  const [connectedSocials, setConnectedSocials] = useState(
    user?.user_metadata?.connected_socials || {
      instagram: '',
      tiktok: '',
      threads: '',
    }
  );

  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage('');
    setAvatarFile(file);
    setAvatarRemoved(false);
    // Instant local preview using lightweight ObjectURL (zero base64 memory bloat)
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl('');
    setAvatarRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      let finalAvatarUrl = avatarRemoved ? '' : user?.user_metadata?.avatar_url || '';

      if (avatarFile && user?.id) {
        const compressedBlob = await resizeImageToBlob(avatarFile, 160);
        const filePath = `${user.id}/avatar.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, compressedBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(
            'Could not upload avatar. Ensure a public "avatars" bucket exists in Supabase Storage.'
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Cache-busting query string so updated avatars show immediately
        finalAvatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          explorer_name: explorerName.trim(),
          bio: bio.trim(),
          avatar_url: finalAvatarUrl,
        },
      });

      if (error) throw error;
      onProfileUpdated(explorerName.trim());
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setStatusMessage('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocials = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const { error } = await supabase.auth.updateUser({
        data: { connected_socials: connectedSocials },
      });
      if (error) throw error;
      setStatusMessage('Social accounts saved!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save socials.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 p-3 sm:p-4 backdrop-blur-xs">
      <div className="relative flex w-full max-w-md flex-col rounded-2xl border-4 border-espresso bg-[#fdfbf7] p-5 sm:p-6 shadow-2xl text-espresso font-type">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-espresso/20 pb-3">
          <h2 className="font-display text-xl font-bold text-espresso">Account Settings</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-espresso/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-vintage py-2.5">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'account', label: 'Account & Security' },
            { id: 'socials', label: 'Socials' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setErrorMessage('');
                setStatusMessage('');
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-espresso text-parchment'
                  : 'bg-paper text-roast hover:bg-mist'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-4">
          {errorMessage && (
            <div className="mb-3 rounded border border-sakura bg-blush/50 p-2.5 text-xs text-espresso">
              {errorMessage}
            </div>
          )}
          {statusMessage && (
            <div className="mb-3 flex items-center gap-1.5 rounded border border-emerald-400 bg-emerald-50 p-2.5 text-xs text-emerald-800">
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              {statusMessage}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              {/* Avatar Upload & Preview */}
              <div className="flex items-center gap-4 rounded-xl border border-vintage bg-paper/60 p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-espresso bg-mist flex items-center justify-center text-roast">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8" strokeWidth={1.3} />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <p className="font-bold text-espresso">Passport Photo</p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded border border-espresso bg-white px-2.5 py-1 font-bold text-espresso hover:bg-blush/40"
                    >
                      <Camera className="h-3.5 w-3.5 text-sakura" />
                      {avatarUrl ? 'Change' : 'Upload'}
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center gap-1 rounded border border-vintage bg-white px-2.5 py-1 text-roast hover:border-sakura hover:text-[#b5655f]"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-mocha">Auto-optimized for fast loading.</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-espresso mb-1">Explorer Name</label>
                <input
                  type="text"
                  maxLength={28}
                  value={explorerName}
                  onChange={(e) => setExplorerName(e.target.value)}
                  placeholder="Your explorer display name"
                  className="w-full rounded border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-espresso mb-1">Bio</label>
                <textarea
                  rows={2}
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
                  className="rounded bg-espresso px-5 py-1.5 font-medium text-parchment hover:bg-roast disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'account' && (
            <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-espresso mb-1">Email Address</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded border border-vintage bg-mist/50 px-3 py-2 text-espresso opacity-80 cursor-not-allowed"
                />
              </div>

              <div className="border-t border-vintage pt-3 space-y-2.5">
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
              <p className="font-bold text-espresso">Connected Social Handles</p>
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
                  className="w-full rounded border border-vintage bg-white px-3 py-1.5 text-espresso focus:border-sakura focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-roast mb-1">Threads Handle</label>
                <input
                  type="text"
                  placeholder="@yourusername"
                  value={connectedSocials.threads}
                  onChange={(e) => setConnectedSocials({ ...connectedSocials, threads: e.target.value })}
                  className="w-full rounded border border-vintage bg-white px-3 py-1.5 text-espresso focus:border-sakura focus:outline-none"
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