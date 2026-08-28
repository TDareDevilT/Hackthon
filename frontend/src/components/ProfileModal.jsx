import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserRound, Mail, Save, X, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { translate as tr } from '../lib/i18n';

export default function ProfileModal({ open, onClose, user, onSaved, language }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;

    setName(
      user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        ''
    );
    setError('');
    setSaved(false);
  }, [open, user]);

  const save = async (event) => {
    event.preventDefault();
    setError('');
    setSaved(false);

    if (!name.trim()) {
      setError(tr(language, 'profileNameRequired'));
      return;
    }

    setBusy(true);

    try {
      if (supabase) {
        const { data, error: updateError } = await supabase.auth.updateUser({
          data: { full_name: name.trim() },
        });

        if (updateError) throw updateError;
        onSaved?.(data.user);
      } else {
        onSaved?.({
          ...user,
          user_metadata: {
            ...(user?.user_metadata || {}),
            full_name: name.trim(),
          },
        });
      }

      setSaved(true);
    } catch (err) {
      setError(err?.message || tr(language, 'profileSaveError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0 }}
          >
            <button
              className="icon-btn close"
              onClick={onClose}
              aria-label={tr(language, 'close')}
              type="button"
            >
              <X />
            </button>

            <div className="profile-head">
              <div className="profile-avatar">
                <UserRound />
              </div>
              <div>
                <span className="eyebrow">
                  <UserRound size={14} /> FIELD PROFILE
                </span>
                <h2>{tr(language, 'profileTitle')}</h2>
                <p>{tr(language, 'profileText')}</p>
              </div>
            </div>

            <form onSubmit={save} className="profile-form">
              <label>
                <span>
                  <UserRound size={14} /> {tr(language, 'fullName')}
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={tr(language, 'fullNamePlaceholder')}
                  autoComplete="name"
                />
              </label>

              <label>
                <span>
                  <Mail size={14} /> {tr(language, 'email')}
                </span>
                <input value={user?.email || ''} disabled />
                <small>{tr(language, 'emailReadOnly')}</small>
              </label>

              <div className="profile-security">
                <ShieldCheck size={18} />
                <div>
                  <b>{tr(language, 'profileSecurity')}</b>
                  <p>{tr(language, 'profileSecurityText')}</p>
                </div>
              </div>

              {error && <div className="error">{error}</div>}
              {saved && <div className="notice">{tr(language, 'profileSaved')}</div>}

              <div className="profile-actions">
                <button type="button" className="secondary" onClick={onClose}>
                  {tr(language, 'cancel')}
                </button>
                <button className="primary" disabled={busy} type="submit">
                  {busy ? (
                    <>
                      <Save size={16} /> {tr(language, 'saving')}
                    </>
                  ) : (
                    <>
                      <Save size={16} /> {tr(language, 'saveProfile')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
