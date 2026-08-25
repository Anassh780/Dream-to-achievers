import React from 'react';
import { Link } from 'react-router-dom';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Button } from '@/components/ui/Button';
import { WarningCircle, House } from '@phosphor-icons/react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 space-y-5 font-mono">
      <DreamLogo size={48} showText={false} />
      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-heading">404</h1>
        <p className="text-base text-slate-300">Page Not Found in Dream to Achievers Directory</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The link you followed may be expired or the route may have been repositioned.
        </p>
      </div>

      <div className="flex items-center space-x-3 pt-2">
        <Link to="/">
          <Button variant="primary" size="md" iconLeft={<House size={16} />}>
            Return Home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="secondary" size="md">
            Partner Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
