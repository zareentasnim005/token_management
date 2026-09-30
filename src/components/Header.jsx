import { Link } from 'react-router-dom';
import { bn } from '../utils/format.js';
import { toBDDateString } from '../utils/time.js';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="হোম পেজে যান">
          <img src="/logo.png" alt="PUST লোগো" />
          <span>পাবনা বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়</span>
        </Link>
        <time className="header-date">{bn(toBDDateString())}</time>
      </div>
    </header>
  );
}

