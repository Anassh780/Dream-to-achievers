import React from 'react';
import { Link } from 'react-router-dom';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Button } from '@/components/ui/Button';
import { SEOHead } from '@/components/common/SEOHead';
import { House, Package } from '@phosphor-icons/react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] flex flex-col items-center justify-center p-6 sm:p-8 font-sans selection:bg-[#B8862E]/25">
      <SEOHead
        title="Page Not Found"
        description="The requested page could not be found on Dream to Achievers."
        noindex={true}
      />

      <div className="max-w-md w-full p-8 sm:p-10 rounded-2xl bg-white border border-[#E3DCC8] shadow-xs text-center space-y-6">
        <div className="flex justify-center">
          <Link to="/">
            <DreamLogo size={42} />
          </Link>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#B8862E] font-semibold block">
            HTTP Status 404
          </span>
          <h1 className="font-display font-medium text-3xl sm:text-4xl text-[#1E241F] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
            The page or catalog route you are looking for does not exist or has been relocated within the network.
          </p>
        </div>

        <div className="pt-2 border-t border-[#E3DCC8] flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full justify-center text-xs font-medium" iconLeft={<House size={14} />}>
              Return to Home
            </Button>
          </Link>
          <Link to="/products" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full justify-center text-xs font-medium" iconLeft={<Package size={14} />}>
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
