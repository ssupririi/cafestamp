import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Navbar from './components/Navbar';
import Passport from './pages/Passport';
import CalendarView from './components/CalendarView';
import NewEntryModal from './components/NewEntryModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import AuthPage from './pages/AuthPage';
import ShareStudio from './pages/ShareStudio';
import { supabase } from './services/supabase';
import { createEntry, deleteEntry, errorMessage, getEntries } from './services/api';

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState('passport');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState(null); // null = closed, or 'profile' | 'account' | 'socials'
  const [explorerName, setExplorerName] = useState('Café Explorer');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.user_metadata?.explorer_name) {
        setExplorerName(session.user.user_metadata.explorer_name);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.user_metadata?.explorer_name) {
        setExplorerName(session.user.user_metadata.explorer_name);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      setError('');
      setEntries(await getEntries());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  const rename = async (name) => {
    setExplorerName(name);
    await supabase.auth.updateUser({
      data: { explorer_name: name },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEntries([]);
  };

  const handleCreate = async (payload) => {
    await createEntry(payload);
    await load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this stamp and its notes?')) return;
    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (authLoading) {
    return <p className="py-20 text-center font-type text-mocha">Checking passport credentials…</p>;
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <>
      <Navbar
        view={view}
        onChange={setView}
        user={session.user}
        explorerName={explorerName}
        onOpenSettings={(tab) => setSettingsTab(tab)}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-sakura bg-blush/50 p-4 text-sm text-espresso">
            {error}
            <button type="button" onClick={load} className="ml-3 underline">Try again</button>
          </div>
        )}

        {loading ? (
          <p className="py-20 text-center font-type text-mocha">Opening your passport…</p>
        ) : view === 'calendar' ? (
          <CalendarView entries={entries} />
        ) : view === 'share' ? (
          <ShareStudio entries={entries} user={session.user} />
        ) : (
          <Passport
            entries={entries}
            explorerName={explorerName}
            onRename={rename}
            onNew={() => setModalOpen(true)}
            onDelete={handleDelete}
          />
        )}
      </main>

      {view === 'calendar' && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Log new visit"
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-espresso text-parchment shadow-lg hover:bg-roast"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <NewEntryModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />

      <AccountSettingsModal
        open={Boolean(settingsTab)}
        initialTab={settingsTab || 'profile'}
        user={session.user}
        onClose={() => setSettingsTab(null)}
        onProfileUpdated={(newName) => setExplorerName(newName)}
      />
    </>
  );
}