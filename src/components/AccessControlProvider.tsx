import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    AccessControlContextValue,
    AccessControlProviderConfig,
    UserPermissions,
    FeatureFlag,
    AccessControlError,
    AccessControlErrorType
} from '../core/types';
import {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasFeature,
    hasAnyFeature,
    hasAllFeatures,
    MemoryCache
} from '../core/utils';

// Create context
const AccessControlContext = createContext<AccessControlContextValue | null>(null);

// Global cache for provider data
const providerCache = new MemoryCache();

/**
 * AccessControlProvider component that manages access control state
 * Provides user permissions and feature flags to the component tree
 */
export interface AccessControlProviderProps {
    children: ReactNode;
    config: AccessControlProviderConfig;
}

export function AccessControlProvider({
    children,
    config
}: AccessControlProviderProps) {
    const {
        fetchUserPermissions,
        fetchFeatureFlags,
        cacheTimeout = 5 * 60 * 1000, // 5 minutes
        enableCache = true,
        onError,
        debugMode = false
    } = config;

    // User permissions state
    const [user, setUser] = useState<UserPermissions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Feature flags state
    const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
    const [isFeatureFlagsLoading, setIsFeatureFlagsLoading] = useState(!!fetchFeatureFlags);
    const [featureFlagsError, setFeatureFlagsError] = useState<Error | null>(null);

    // Load user permissions
    const loadUserPermissions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Check cache first
            const cacheKey = 'user-permissions';
            if (enableCache) {
                const cached = providerCache.get<UserPermissions>(cacheKey);
                if (cached) {
                    setUser(cached);
                    setIsLoading(false);

                    if (debugMode) {
                        console.log('[AccessControl] Using cached user permissions:', {
                            userId: cached.userId,
                            organizationId: cached.organizationId,
                            permissions: cached.permissions,
                            roles: cached.roles,
                            cacheKey
                        });
                    }
                    return;
                }
            }

            const permissions = await fetchUserPermissions();
            setUser(permissions);

            // Cache the result
            if (enableCache) {
                providerCache.set(cacheKey, permissions, cacheTimeout);
            }

            if (debugMode) {
                console.log('[AccessControl] Loaded user permissions:', {
                    userId: permissions.userId,
                    organizationId: permissions.organizationId,
                    permissions: permissions.permissions,
                    roles: permissions.roles,
                    fetchTime: new Date().toISOString()
                });
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to load user permissions');
            setError(error);

            if (onError) {
                onError(error);
            }

            if (debugMode) {
                console.error('[AccessControl] Error loading user permissions:', {
                    error: error.message,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [fetchUserPermissions, enableCache, cacheTimeout, onError, debugMode]);

    // Load feature flags
    const loadFeatureFlags = useCallback(async () => {
        if (!fetchFeatureFlags) return;

        try {
            setIsFeatureFlagsLoading(true);
            setFeatureFlagsError(null);

            // Check cache first
            const cacheKey = 'feature-flags';
            if (enableCache) {
                const cached = providerCache.get<FeatureFlag[]>(cacheKey);
                if (cached) {
                    setFeatureFlags(cached);
                    setIsFeatureFlagsLoading(false);

                    if (debugMode) {
                        console.log('[AccessControl] Using cached feature flags:', {
                            flags: cached.map(f => ({ id: f.id, name: f.name, enabled: f.enabled })),
                            count: cached.length,
                            enabledCount: cached.filter(f => f.enabled).length,
                            cacheKey
                        });
                    }
                    return;
                }
            }

            const flags = await fetchFeatureFlags();
            setFeatureFlags(flags);

            // Cache the result
            if (enableCache) {
                providerCache.set(cacheKey, flags, cacheTimeout);
            }

            if (debugMode) {
                console.log('[AccessControl] Loaded feature flags:', {
                    flags: flags.map(f => ({ id: f.id, name: f.name, enabled: f.enabled })),
                    count: flags.length,
                    enabledCount: flags.filter(f => f.enabled).length,
                    disabledCount: flags.filter(f => !f.enabled).length,
                    fetchTime: new Date().toISOString()
                });
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to load feature flags');
            setFeatureFlagsError(error);

            if (onError) {
                onError(error);
            }

            if (debugMode) {
                console.error('[AccessControl] Error loading feature flags:', {
                    error: error.message,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                });
            }
        } finally {
            setIsFeatureFlagsLoading(false);
        }
    }, [fetchFeatureFlags, enableCache, cacheTimeout, onError, debugMode]);

    // Permission helper methods
    const checkPermission = useCallback((permission: string): boolean => {
        if (!user) return false;
        return hasPermission(user.permissions, permission);
    }, [user]);

    const checkAnyPermission = useCallback((permissions: string[]): boolean => {
        if (!user) return false;
        return hasAnyPermission(user.permissions, permissions);
    }, [user]);

    const checkAllPermissions = useCallback((permissions: string[]): boolean => {
        if (!user) return false;
        return hasAllPermissions(user.permissions, permissions);
    }, [user]);

    const checkRole = useCallback((role: string): boolean => {
        if (!user) return false;
        return hasRole(user.roles, role);
    }, [user]);

    // Feature flag helper methods
    const checkFeature = useCallback((feature: string): boolean => {
        return hasFeature(featureFlags, feature);
    }, [featureFlags]);

    const checkAnyFeature = useCallback((features: string[]): boolean => {
        return hasAnyFeature(featureFlags, features);
    }, [featureFlags]);

    const checkAllFeatures = useCallback((features: string[]): boolean => {
        return hasAllFeatures(featureFlags, features);
    }, [featureFlags]);

    // Refresh methods
    const refreshPermissions = useCallback(async () => {
        // Clear cache for permissions
        if (enableCache) {
            providerCache.delete('user-permissions');
        }
        await loadUserPermissions();
    }, [loadUserPermissions, enableCache]);

    const refreshFeatureFlags = useCallback(async () => {
        // Clear cache for feature flags
        if (enableCache) {
            providerCache.delete('feature-flags');
        }
        await loadFeatureFlags();
    }, [loadFeatureFlags, enableCache]);

    // Load data on mount
    useEffect(() => {
        loadUserPermissions();
        loadFeatureFlags();
    }, [loadUserPermissions, loadFeatureFlags]);

    // Context value
    const contextValue: AccessControlContextValue = {
        // User data
        user,
        isLoading,
        error,

        // Feature flags
        featureFlags,
        isFeatureFlagsLoading,
        featureFlagsError,

        // Permission methods
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
        hasRole: checkRole,

        // Feature flag methods
        hasFeature: checkFeature,
        hasAnyFeature: checkAnyFeature,
        hasAllFeatures: checkAllFeatures,

        // Utility methods
        refreshPermissions,
        refreshFeatureFlags
    };

    return (
        <AccessControlContext.Provider value={contextValue}>
            {children}
        </AccessControlContext.Provider>
    );
}

/**
 * Hook to use the access control context
 * Throws an error if used outside of AccessControlProvider
 */
export function useAccessControlContext(): AccessControlContextValue {
    const context = useContext(AccessControlContext);

    if (!context) {
        throw new AccessControlError(
            AccessControlErrorType.INVALID_CONFIG,
            'useAccessControlContext must be used within an AccessControlProvider'
        );
    }

    return context;
}

/**
 * Hook to get user permissions from context
 */
export function useUserPermissions() {
    const { user, isLoading, error, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, refreshPermissions } = useAccessControlContext();

    return {
        user,
        isLoading,
        error,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        refreshPermissions,
        permissions: user?.permissions || [],
        roles: user?.roles || [],
        userId: user?.userId,
        organizationId: user?.organizationId
    };
}

/**
 * Hook to get feature flags from context
 */
export function useFeatureFlagsContext() {
    const {
        featureFlags,
        isFeatureFlagsLoading,
        featureFlagsError,
        hasFeature,
        hasAnyFeature,
        hasAllFeatures,
        refreshFeatureFlags
    } = useAccessControlContext();

    return {
        featureFlags,
        isLoading: isFeatureFlagsLoading,
        error: featureFlagsError,
        hasFeature,
        hasAnyFeature,
        hasAllFeatures,
        refreshFeatureFlags,
        enabledFeatures: featureFlags.filter(f => f.enabled),
        disabledFeatures: featureFlags.filter(f => !f.enabled),
        featureCount: featureFlags.length,
        enabledCount: featureFlags.filter(f => f.enabled).length
    };
}