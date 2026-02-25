import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-primary">404</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="btn btn-primary w-full flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="btn btn-outline w-full flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-center text-muted-foreground">
            <Search className="h-4 w-4 mr-2" />
            <span className="text-sm">
              Looking for something specific? Try searching or browsing our questions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
