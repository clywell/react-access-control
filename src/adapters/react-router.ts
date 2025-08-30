import { NavigationAdapter } from '../core/types';

// React Router interface for type safety
interface ReactRouterNavigateFunction {
    (to: string): void;
    (to: string, options?: { replace?: boolean }): void;
}

interface ReactRouterLocation {
    pathname: string;
}

/**
 * React Router navigation adapter
 * Works with React Router v6
 */
export class ReactRouterAdapter implements NavigationAdapter {
    private navigateFunction: ReactRouterNavigateFunction;
    private location: ReactRouterLocation;

    constructor(navigate: ReactRouterNavigateFunction, location: ReactRouterLocation) {
        this.navigateFunction = navigate;
        this.location = location;
    }

    navigate(path: string): void {
        if (this.navigateFunction) {
            this.navigateFunction(path);
        } else {
            // Fallback to window.location when navigate function is not available
            if (typeof window !== 'undefined') {
                window.location.href = path;
            }
        }
    }

    getCurrentPath(): string {
        return this.location?.pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
    }

    replace(path: string): void {
        if (this.navigateFunction) {
            this.navigateFunction(path, { replace: true });
        } else {
            // Fallback to window.location when navigate function is not available
            if (typeof window !== 'undefined') {
                window.location.replace(path);
            }
        }
    }
}

/**
 * Hook factory for React Router
 * Creates a navigation adapter using React Router hooks
 */
export function createReactRouterHook() {
    return function useReactRouterAdapter(): ReactRouterAdapter {
        // This will be implemented by the consumer
        // as it requires React Router specific imports
        throw new Error(
            'useReactRouterAdapter must be implemented by importing useNavigate and useLocation from react-router-dom'
        );
    };
}

/**
 * Generic browser navigation adapter
 * Falls back to browser APIs when no router is available
 */
export class BrowserNavigationAdapter implements NavigationAdapter {
    navigate(path: string): void {
        if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    }

    getCurrentPath(): string {
        return typeof window !== 'undefined' ? window.location.pathname : '/';
    }

    replace(path: string): void {
        if (typeof window !== 'undefined') {
            window.location.replace(path);
        }
    }
}

/**
 * Example implementation guide for React Router:
 * 
 * ```typescript
 * import { useNavigate, useLocation } from 'react-router-dom';
 * import { ReactRouterAdapter } from '@clywell/react-access-control/adapters/react-router';
 * 
 * export function useReactRouterAdapter(): ReactRouterAdapter {
 *   const navigate = useNavigate();
 *   const location = useLocation();
 *   return new ReactRouterAdapter(navigate, location);
 * }
 * ```
 */