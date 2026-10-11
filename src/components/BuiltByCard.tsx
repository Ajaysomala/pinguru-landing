import React from 'react';
import { Github, Globe, Linkedin } from 'lucide-react';
import { EXTERNAL_LINK_PROPS, SOCIAL_LINKS } from '../lib/links';
import '../styles/built-by.css';

const LINKS = [
  { href: SOCIAL_LINKS.github, label: 'GitHub', icon: Github },
  { href: SOCIAL_LINKS.linkedin, label: 'LinkedIn', icon: Linkedin },
  { href: SOCIAL_LINKS.portfolio, label: 'Portfolio', icon: Globe },
];

/** "Built by" credit with the builder's public profiles. */
export const BuiltByCard: React.FC = () => (
  <aside className="built-by-card" aria-labelledby="built-by-title">
    <div className="built-by-avatar" aria-hidden="true">SA</div>
    <div className="built-by-text">
      <h2 id="built-by-title" className="built-by-title">Built by Somala Ajay</h2>
      <p className="built-by-bio">Indie developer who designs, builds and runs PinGuru from India.</p>
    </div>
    <div className="built-by-links">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <a key={label} href={href} {...EXTERNAL_LINK_PROPS} className="built-by-link" aria-label={`Somala Ajay on ${label} (opens in a new tab)`}>
          <Icon size={16} aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </div>
  </aside>
);

export default BuiltByCard;
