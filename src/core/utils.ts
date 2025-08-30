import {
    AccessControlConfig,
    UserPermissions,
    FeatureFlag,
    CacheEntry,
    StorageAdapter
} from './types';

/**
 * Utility functions for access control logic
 */

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
    userPermissions: string[],
    permission: string
): boolean {
    return userPermissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
    userPermissions: string[],
    permissions: string[]
): boolean {
    return permissions.some(permission => userPermissions.includes(permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
    userPermissions: string[],
    permissions: string[]
): boolean {
    return permissions.every(permission => userPermissions.includes(permission));
}

/**
 * Check if a user has a specific role
 */
export function hasRole(
    userRoles: string[],
    role: string
): boolean {
    return userRoles.includes(role);
}

/**
 * Check if a feature flag is enabled
 */
export function hasFeature(
    featureFlags: FeatureFlag[],
    feature: string
): boolean {
    const flag = featureFlags.find(f => f.id === feature || f.name === feature);
    return flag ? flag.enabled : false;
}

/**
 * Check if any of the specified feature flags are enabled
 */
export function hasAnyFeature(
    featureFlags: FeatureFlag[],
    features: string[]
): boolean {
    return features.some(feature => hasFeature(featureFlags, feature));
}

/**
 * Check if all of the specified feature flags are enabled
 */
export function hasAllFeatures(
    featureFlags: FeatureFlag[],
    features: string[]
): boolean {
    return features.every(feature => hasFeature(featureFlags, feature));
}

/**
 * Evaluate access control configuration
 */
export function evaluateAccessControl(
    config: AccessControlConfig,
    userPermissions: UserPermissions,
    featureFlags: FeatureFlag[]
): {
    hasAccess: boolean;
    hasFeatureAccess: boolean;
    hasPermissionAccess: boolean;
    hasFeatureCheck: boolean;
    hasPermissionCheck: boolean;
} {
    const {
        feature,
        anyFeature,
        allFeatures,
        permission,
        anyPermission,
        allPermissions,
        requireBoth = false
    } = config;

    // Check feature flag access
    const checkFeatureAccess = (): boolean => {
        if (feature) {
            return hasFeature(featureFlags, feature);
        }
        if (anyFeature && anyFeature.length > 0) {
            return hasAnyFeature(featureFlags, anyFeature);
        }
        if (allFeatures && allFeatures.length > 0) {
            return hasAllFeatures(featureFlags, allFeatures);
        }
        return true; // No feature check specified
    };

    // Check permission access
    const checkPermissionAccess = (): boolean => {
        if (permission) {
            return hasPermission(userPermissions.permissions, permission);
        }
        if (anyPermission && anyPermission.length > 0) {
            return hasAnyPermission(userPermissions.permissions, anyPermission);
        }
        if (allPermissions && allPermissions.length > 0) {
            return hasAllPermissions(userPermissions.permissions, allPermissions);
        }
        return true; // No permission check specified
    };

    // Determine if any checks are specified
    const hasFeatureCheck = !!(feature || (anyFeature && anyFeature.length > 0) || (allFeatures && allFeatures.length > 0));
    const hasPermissionCheck = !!(permission || (anyPermission && anyPermission.length > 0) || (allPermissions && allPermissions.length > 0));

    // Calculate access results
    const hasFeatureAccess = checkFeatureAccess();
    const hasPermissionAccess = checkPermissionAccess();

    // Calculate final access based on configuration
    const calculateFinalAccess = (): boolean => {
        // If no checks are specified, deny access by default
        if (!hasFeatureCheck && !hasPermissionCheck) {
            return false;
        }

        if (requireBoth) {
            // Both must pass
            if (hasFeatureCheck && hasPermissionCheck) {
                return hasFeatureAccess && hasPermissionAccess;
            }
            // If only one type of check is specified, it must pass
            return hasFeatureCheck ? hasFeatureAccess : hasPermissionAccess;
        } else {
            // Either can pass (OR logic)
            if (hasFeatureCheck && hasPermissionCheck) {
                return hasFeatureAccess || hasPermissionAccess;
            }
            // If only one type of check is specified, it must pass
            return hasFeatureCheck ? hasFeatureAccess : hasPermissionAccess;
        }
    };

    const hasAccess = calculateFinalAccess();

    return {
        hasAccess,
        hasFeatureAccess,
        hasPermissionAccess,
        hasFeatureCheck,
        hasPermissionCheck
    };
}

/**
 * Generate a cache key for a given configuration
 */
export function generateCacheKey(
    config: AccessControlConfig,
    userId?: string
): string {
    const configString = JSON.stringify(config);
    const userString = userId || 'anonymous';
    return `access-control:${userString}:${btoa(configString)}`;
}

/**
 * Check if a cache entry is valid (not expired)
 */
export function isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() < entry.expiresAt;
}

/**
 * Create a cache entry with expiration
 */
export function createCacheEntry<T>(
    data: T,
    ttlMs: number = 5 * 60 * 1000 // 5 minutes default
): CacheEntry<T> {
    const now = Date.now();
    return {
        data,
        timestamp: now,
        expiresAt: now + ttlMs
    };
}

/**
 * Simple in-memory cache implementation
 */
export class MemoryCache {
    private cache = new Map<string, CacheEntry<unknown>>();

    get<T>(key: string): T | undefined {
        const entry = this.cache.get(key) as CacheEntry<T> | undefined;

        if (!entry) {
            return undefined;
        }

        if (!isCacheValid(entry)) {
            this.cache.delete(key);
            return undefined;
        }

        return entry.data;
    }

    set<T>(key: string, data: T, ttlMs?: number): void {
        const entry = createCacheEntry(data, ttlMs);
        this.cache.set(key, entry);
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }
}

/**
 * Storage adapter for localStorage
 */
export class LocalStorageAdapter implements StorageAdapter {
    private prefix: string;

    constructor(prefix = 'access-control') {
        this.prefix = prefix;
    }

    private getKey(key: string): string {
        return `${this.prefix}:${key}`;
    }

    getItem(key: string): string | null {
        try {
            return localStorage.getItem(this.getKey(key));
        } catch {
            return null;
        }
    }

    setItem(key: string, value: string): void {
        try {
            localStorage.setItem(this.getKey(key), value);
        } catch {
            // Silently fail if localStorage is not available
        }
    }

    removeItem(key: string): void {
        try {
            localStorage.removeItem(this.getKey(key));
        } catch {
            // Silently fail if localStorage is not available
        }
    }
}

/**
 * Storage adapter for sessionStorage
 */
export class SessionStorageAdapter implements StorageAdapter {
    private prefix: string;

    constructor(prefix = 'access-control') {
        this.prefix = prefix;
    }

    private getKey(key: string): string {
        return `${this.prefix}:${key}`;
    }

    getItem(key: string): string | null {
        try {
            return sessionStorage.getItem(this.getKey(key));
        } catch {
            return null;
        }
    }

    setItem(key: string, value: string): void {
        try {
            sessionStorage.setItem(this.getKey(key), value);
        } catch {
            // Silently fail if sessionStorage is not available
        }
    }

    removeItem(key: string): void {
        try {
            sessionStorage.removeItem(this.getKey(key));
        } catch {
            // Silently fail if sessionStorage is not available
        }
    }
}

/**
 * Mock storage adapter for testing or server-side rendering
 */
export class MockStorageAdapter implements StorageAdapter {
    private storage = new Map<string, string>();

    getItem(key: string): string | null {
        return this.storage.get(key) || null;
    }

    setItem(key: string, value: string): void {
        this.storage.set(key, value);
    }

    removeItem(key: string): void {
        this.storage.delete(key);
    }

    clear(): void {
        this.storage.clear();
    }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Deep equality check for objects
 */
export function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;

    if (a == null || b == null) return false;

    if (typeof a !== typeof b) return false;

    if (typeof a !== 'object') return false;

    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;

    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);

    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
        if (!bKeys.includes(key)) return false;
        if (!deepEqual(aObj[key], bObj[key])) return false;
    }

    return true;
}