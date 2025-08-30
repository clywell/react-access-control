import { NavigationAdapter } from '../core/types';

// Next.js router interface for type safety
interface NextJSRouter {
    push?: (url: string) => void;
    replace?: (url: string) => void;
    back?: () => void;
    forward?: () => void;
    pathname?: string;
}

/**
 * Next.js App Router navigation adapter
 * Uses Next.js 13+ navigation functions
 */
export class NextJSAppRouterAdapter implements NavigationAdapter {
    private router: NextJSRouter;
    private pathname: string;

    constructor(router: NextJSRouter, pathname: string) {
        this.router = router;
        this.pathname = pathname;
    }

    navigate(path: string): void {
        if (this.router?.push) {
            this.router.push(path);
        } else {
            // Fallback to window.location when router is not available
            if (typeof window !== 'undefined') {
                window.location.href = path;
            }
        }
    }

    getCurrentPath(): string {
        return this.pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
    }

    replace(path: string): void {
        if (this.router?.replace) {
            this.router.replace(path);
        } else {
            // Fallback to window.location when router is not available
            if (typeof window !== 'undefined') {
                window.location.replace(path);
            }
        }
    }
}

/**
 * Next.js Pages Router navigation adapter
 * Uses traditional Next.js router
 */
export class NextJSPagesRouterAdapter implements NavigationAdapter {
    private router: NextJSRouter;

    constructor(router: NextJSRouter) {
        this.router = router;
    }

    navigate(path: string): void {
        if (this.router?.push) {
            this.router.push(path);
        } else {
            // Fallback to window.location when router is not available
            if (typeof window !== 'undefined') {
                window.location.href = path;
            }
        }
    }

    getCurrentPath(): string {
        return this.router?.pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
    }

    replace(path: string): void {
        if (this.router?.replace) {
            this.router.replace(path);
        } else {
            // Fallback to window.location when router is not available
            if (typeof window !== 'undefined') {
                window.location.replace(path);
            }
        }
    }
}

/**
 * Hook factory for Next.js App Router
 * Creates a navigation adapter using Next.js 13+ hooks
 */
export function createNextJSAppRouterHook() {
    return function useNextJSAppRouterAdapter(): NextJSAppRouterAdapter {
        // This will be implemented by the consumer
        // as it requires Next.js specific imports
        throw new Error(
            'useNextJSAppRouterAdapter must be implemented by importing useRouter and usePathname from next/navigation'
        );
    };
}

/**
 * Hook factory for Next.js Pages Router  
 * Creates a navigation adapter using traditional Next.js router
 */
export function createNextJSPagesRouterHook() {
    return function useNextJSPagesRouterAdapter(): NextJSPagesRouterAdapter {
        // This will be implemented by the consumer
        // as it requires Next.js specific imports
        throw new Error(
            'useNextJSPagesRouterAdapter must be implemented by importing useRouter from next/router'
        );
    };
}
