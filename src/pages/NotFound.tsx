import React from 'react';
import { Link } from 'react-router-dom';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Button } from '@/components/ui/Button';
import { SEOHead } from '@/components/common/SEOHead';
import { House, Package } from '@phosphor-icons/react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center justify-center p-6 sm:p-8 font-sans selection:bg-[var(--accent)]/25 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(217,192,138,0.12),transparent_70%)] blur-3xl" />

      <SEOHead
        title="Page Not Found"
        description="The requested page could not be found on Dream to Achievers."
        noindex={true}
      />

      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-[#0D1512]/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,192,138,0.06)] text-center space-y-6 relative z-10">
        <div className="flex justify-center">
          <Link to="/">
            <DreamLogo size={46} />
          </Link>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D9C08A] font-semibold block">
            HTTP Status 404
          </span>
          <h1 className="font-serif font-normal text-3xl sm:text-4xl text-[#F4F7F5] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed">
            The page or catalog route you are looking for does not exist or has been relocated within the network.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="champagne" size="md" className="w-full justify-center text-xs font-medium" iconLeft={<House size={14} />}>
              Return to Home
            </Button>
          </Link>
          <Link to="/products" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full justify-center text-xs font-medium border-white/10 text-[#F4F7F5] hover:border-[#D9C08A]/40" iconLeft={<Package size={14} />}>
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
