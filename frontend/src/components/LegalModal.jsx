import { AnimatePresence, motion } from 'framer-motion';
import { X, ShieldCheck, FileText, Sparkles } from 'lucide-react';
import { translate as tr } from '../lib/i18n';

const content = {
  privacy: {
    icon: ShieldCheck,
    title: 'Privacy Policy',
    items: [
      'We use account details and field data to provide the service you request.',
      'Reports may be stored in your connected database so you can revisit them.',
      'API providers may receive only the data needed to perform the requested operation.',
      'Do not enter highly sensitive personal information or secrets into field notes.',
    ],
  },
  terms: {
    icon: FileText,
    title: 'Terms & Conditions',
    items: [
      'Climate Aware is decision support, not a replacement for local agronomy or emergency advice.',
      'You are responsible for reviewing readings and AI-generated guidance before acting.',
      'Do not use the service as the sole basis for high-stakes agricultural, safety or financial decisions.',
    ],
  },
  ai: {
    icon: Sparkles,
    title: 'AI Transparency',
    items: [
      'AI interprets your field readings, crop context and optional weather context to create recommendations.',
      'AI output is validated before application use, but generated advice can still be wrong or incomplete.',
      'The product distinguishes user readings from optional weather context and simulated demo data.',
      'Always verify consequential decisions with trusted local agricultural expertise.',
    ],
  },
};

export default function LegalModal({ open, onClose, type = 'privacy', language }) {
  const data = content[type] || content.privacy;
  const Icon = data.icon;

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
            className="legal-modal"
            role="dialog"
            aria-modal="true"
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
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

            <div className="legal-icon">
              <Icon />
            </div>
            <span className="eyebrow">CLIMATE AWARE · TRUST CENTER</span>
            <h2>{data.title}</h2>
            <p className="legal-intro">{tr(language, 'legalIntro')}</p>

            <div className="legal-list">
              {data.items.map((item, index) => (
                <div className="legal-item" key={index}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>

            <button className="primary wide" onClick={onClose} type="button">
              {tr(language, 'done')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
