import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  navigate: (path: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, navigate }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <li>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Inicio</span>
          </button>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.url}>
              <li>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </li>
              <li>
                {isLast ? (
                  <span className="font-semibold text-slate-900" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(item.url)}
                    className="hover:text-slate-900 transition-colors"
                  >
                    {item.name}
                  </button>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
