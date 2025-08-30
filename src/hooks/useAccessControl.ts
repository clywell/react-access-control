import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    AccessControlConfig,
    AccessControlResult,
    UserPermissions,
    FeatureFlag,
    UseAccessControlOptions
} from '../core/types';
import {
    evaluateAccessControl,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasFeature,
    hasAnyFeature,
    hasAllFeatures,
    MemoryCache,
    generateCacheKey
} from '../core/utils';

// Global cache instance
const globalCache = new MemoryCache();

/**
 * Hook for unified access control that combines feature flags and permissions.
 * This provides a single source of truth for determining user access to features
 * and functionality throughout the application.
 */
export function useAccessControl(
    config: AccessControlConfig = {},
    options: UseAccessControlOptions = {}
): AccessControlResult {
    const {
        enableCache = true,
        debugMode = false
    } = options;

    const [userPermissions, _setUserPermissions] = useState<UserPermissions | null>(null);
    const [featureFlags, _setFeatureFlags] = useState<FeatureFlag[]>([]);
    const [isLoading, _setIsLoading] = useState(true);
    const [isFeatureFlagsLoading, _setIsFeatureFlagsLoading] = useState(true);
    const [_error, _setError] = useState<Error | null>(null);
    const [_featureFlagsError, _setFeatureFlagsError] = useState<Error | null>(null);

    // Memoize the cache key
    const cacheKey = useMemo(() => {
        if (!enableCache || !userPermissions) return null;
        return generateCacheKey(config, userPermissions.userId);
    }, [config, enableCache, userPermissions]);

    // Check cache first
    const cachedResult = useMemo(() => {
        if (!cacheKey || !enableCache) return null;
        return globalCache.get<AccessControlResult>(cacheKey);
    }, [cacheKey, enableCache]);

    // Evaluate access control
    const evaluateAccess = useCallback(() => {
        if (!userPermissions) {
            return {
                hasAccess: false,
                hasFeatureAccess: false,
                hasPermissionAccess: false,
                hasFeatureCheck: false,
                hasPermissionCheck: false
            };
        }

        return evaluateAccessControl(config, userPermissions, featureFlags);
    }, [config, userPermissions, featureFlags]);

    // Main access control evaluation
    const accessResult = useMemo(() => {
        // Return cached result if available
        if (cachedResult && !isLoading && !isFeatureFlagsLoading) {
            if (debugMode) {
                // Debug logging for cached results
            }
            return cachedResult;
        }

        const result = evaluateAccess();

        const debugInfo = {
            enabledFeatures: featureFlags.filter(f => f.enabled).map(f => f.id),
            userPermissions: userPermissions?.permissions || [],
            userRoles: userPermissions?.roles || [],
            hasFeatureCheck: result.hasFeatureCheck,
            hasPermissionCheck: result.hasPermissionCheck,
        };

        const accessControlResult: AccessControlResult = {
            hasAccess: result.hasAccess,
            hasFeatureAccess: result.hasFeatureAccess,
            hasPermissionAccess: result.hasPermissionAccess,
            isFeatureFlagsLoading,
            featureFlagsError: _featureFlagsError,
            debugInfo
        };

        // Cache the result
        if (cacheKey && enableCache && !isLoading && !isFeatureFlagsLoading) {
            globalCache.set(cacheKey, accessControlResult);

            if (debugMode) {
                // Debug logging for cached result
            }
        }

        if (debugMode) {
            // Debug logging for access evaluation
        }

        return accessControlResult;
    }, [
        cachedResult,
        evaluateAccess,
        featureFlags,
        userPermissions,
        isFeatureFlagsLoading,
        _featureFlagsError,
        cacheKey,
        enableCache,
        isLoading,
        debugMode
    ]);

    return accessResult;
}

/**
 * Simplified version of useAccessControl that returns only a boolean.
 * Useful when you only need to know if access is granted.
 */
export function useHasAccess(
    config: AccessControlConfig = {},
    options: UseAccessControlOptions = {}
): boolean {
    const { hasAccess } = useAccessControl(config, options);
    return hasAccess;
}

/**
 * Hook for checking access to multiple configurations at once.
 * Useful for complex UI scenarios where different sections need different access levels.
 */
export function useMultipleAccessControl<T extends Record<string, AccessControlConfig>>(
    configs: T,
    options: UseAccessControlOptions = {}
): Record<keyof T, AccessControlResult> {
    const results = {} as Record<keyof T, AccessControlResult>;

    for (const key in configs) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        results[key] = useAccessControl(configs[key], options);
    }

    return results;
}

/**
 * Simplified version of useMultipleAccessControl that returns only booleans.
 */
export function useHasMultipleAccess<T extends Record<string, AccessControlConfig>>(
    configs: T,
    options: UseAccessControlOptions = {}
): Record<keyof T, boolean> {
    const results = {} as Record<keyof T, boolean>;

    for (const key in configs) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        results[key] = useHasAccess(configs[key], options);
    }

    return results;
}

/**
 * Hook for managing user permissions with built-in helper methods
 */
export function usePermissions() {
    const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Helper methods
    const checkPermission = useCallback((permission: string): boolean => {
        if (!userPermissions) return false;
        return hasPermission(userPermissions.permissions, permission);
    }, [userPermissions]);

    const checkAnyPermission = useCallback((permissions: string[]): boolean => {
        if (!userPermissions) return false;
        return hasAnyPermission(userPermissions.permissions, permissions);
    }, [userPermissions]);

    const checkAllPermissions = useCallback((permissions: string[]): boolean => {
        if (!userPermissions) return false;
        return hasAllPermissions(userPermissions.permissions, permissions);
    }, [userPermissions]);

    const checkRole = useCallback((role: string): boolean => {
        if (!userPermissions) return false;
        return hasRole(userPermissions.roles, role);
    }, [userPermissions]);

    return {
        // State
        userPermissions,
        isLoading,
        error,

        // Setters (to be used by provider)
        setUserPermissions,
        setIsLoading,
        setError,

        // Helper methods
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
        hasRole: checkRole,

        // Derived state
        permissions: userPermissions?.permissions || [],
        roles: userPermissions?.roles || [],
        userId: userPermissions?.userId,
        organizationId: userPermissions?.organizationId
    };
}

/**
 * Hook for managing feature flags
 */
export function useFeatureFlags() {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Helper methods
    const checkFeature = useCallback((feature: string): boolean => {
        return hasFeature(featureFlags, feature);
    }, [featureFlags]);

    const checkAnyFeature = useCallback((features: string[]): boolean => {
        return hasAnyFeature(featureFlags, features);
    }, [featureFlags]);

    const checkAllFeatures = useCallback((features: string[]): boolean => {
        return hasAllFeatures(featureFlags, features);
    }, [featureFlags]);

    // Get feature by ID or name
    const getFeature = useCallback((identifier: string): FeatureFlag | undefined => {
        return featureFlags.find(f => f.id === identifier || f.name === identifier);
    }, [featureFlags]);

    // Get features by category
    const getFeaturesByCategory = useCallback((category: string): FeatureFlag[] => {
        return featureFlags.filter(f => f.category === category);
    }, [featureFlags]);

    return {
        // State
        featureFlags,
        isLoading,
        error,

        // Setters (to be used by provider)
        setFeatureFlags,
        setIsLoading,
        setError,

        // Helper methods
        hasFeature: checkFeature,
        hasAnyFeature: checkAnyFeature,
        hasAllFeatures: checkAllFeatures,
        getFeature,
        getFeaturesByCategory,

        // Derived state
        enabledFeatures: featureFlags.filter(f => f.enabled),
        disabledFeatures: featureFlags.filter(f => !f.enabled),
        featureCount: featureFlags.length,
        enabledCount: featureFlags.filter(f => f.enabled).length
    };
}

/**
 * Hook for debounced access control checks
 * Useful for real-time permission updates without excessive re-renders
 */
export function useDebouncedAccessControl(
    config: AccessControlConfig,
    debounceMs: number = 300,
    options: UseAccessControlOptions = {}
): AccessControlResult {
    const [debouncedConfig, setDebouncedConfig] = useState(config);

    // Debounce config changes
    const debouncedSetConfig = useMemo(
        () => {
            let timeout: NodeJS.Timeout;
            return (newConfig: AccessControlConfig) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => setDebouncedConfig(newConfig), debounceMs);
            };
        },
        [debounceMs]
    );

    useEffect(() => {
        debouncedSetConfig(config);
    }, [config, debouncedSetConfig]);

    return useAccessControl(debouncedConfig, options);
}

/**
 * Hook for cache management
 */
export function useAccessControlCache() {
    const clearCache = useCallback(() => {
        globalCache.clear();
    }, []);

    const getCacheSize = useCallback(() => {
        return globalCache.size();
    }, []);

    const deleteCacheEntry = useCallback((key: string) => {
        globalCache.delete(key);
    }, []);

    return {
        clearCache,
        getCacheSize,
        deleteCacheEntry
    };
}