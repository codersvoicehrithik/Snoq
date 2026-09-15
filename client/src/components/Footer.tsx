import { Link } from 'react-router-dom';
import { siteConfig } from '../lib/site-config';

const links = [
  { label: 'Library', to: '/library' },
  { label: 'Documentation', to: '/docs' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
];

export function Footer() {
  return (
    <footer data-tour="app-footer" className="shrink-0 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-8 sm:py-3">
      <div className="app-container grid gap-3 text-xs sm:grid-cols-[1fr_auto] sm:items-center lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-2 text-slate-500"><span className="font-bold text-ink">{siteConfig.productName}</span><span className="text-slate-300">·</span><span>Your AI-organized resource space</span></div>
        <nav className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-5" aria-label="Footer navigation">{links.map((link) => <Link key={link.label} className="rounded-lg bg-slate-50 px-2.5 py-2 text-slate-500 transition hover:bg-vault-50 hover:text-vault-600 sm:bg-transparent sm:p-0" to={link.to}>{link.label}</Link>)}</nav>
        <p className="border-t border-slate-100 pt-3 text-left text-slate-500 sm:col-span-2 sm:border-0 sm:pt-0 lg:col-span-1 lg:text-right">Built with care by <a className="font-semibold text-vault-600 hover:text-vault-500" href={siteConfig.codersvoice.url} target="_blank" rel="noopener noreferrer">Codersvoice</a>.</p>
      </div>
    </footer>
  );
}
