import { ReactNode } from 'react';

/**
 * Configuration for access control checks
 */
export interface AccessControlConfig {
    // Feature flag access control
    /**
     * Single feature flag to check
     */
    feature?: string;
    /**
     * Multiple feature flags to check - will grant access if user has ANY of these features
     */
    anyFeature?: string[];
    /**
     * Multiple feature flags to check - will grant access if user has ALL of these features
     */
    allFeatures?: string[];

    // Permission-based access control
    /**
     * Single permission to check
     */
    permission?: string;
    /**
     * Multiple permissions to check - will grant access if user has ANY of these permissions
     */
    anyPermission?: string[];
    /**
     * Multiple permissions to check - will grant access if user has ALL of these permissions
     */
    allPermissions?: string[];

    // Combined access control
    /**
     * If true, both feature flag AND permission checks must pass
     * If false (default), either feature flag OR permission check can pass
     */
    requireBoth?: boolean;
}

/**
 * Return type for the access control hook
 */
export interface AccessControlResult {
    /**
     * Whether the user has access based on the provided configuration
     */
    hasAccess: boolean;

    /**
     * Whether the feature flag checks passed (if any were specified)
     */
    hasFeatureAccess: boolean;

    /**
     * Whether the permission checks passed (if any were specified)
     */
    hasPermissionAccess: boolean;

    /**
     * Whether feature flag checks are currently loading
     */
    isFeatureFlagsLoading: boolean;

    /**
     * Any error from feature flag loading
     */
    featureFlagsError: Error | null;

    /**
     * Raw feature flags data for debugging
     */
    debugInfo: {
        enabledFeatures: string[];
        userPermissions: string[];
        userRoles: string[];
        hasFeatureCheck: boolean;
        hasPermissionCheck: boolean;
    };
}

/**
 * User permission and role information
 */
export interface UserPermissions {
    permissions: string[];
    roles: string[];
    userId?: string;
    organizationId?: string;
}

/**
 * Feature flag configuration
 */
export interface FeatureFlag {
    id: string;
    name: string;
    enabled: boolean;
    description?: string;
    category?: string;
    requiresConfig?: boolean;
}

/**
 * Access control provider context value
 */
export interface AccessControlContextValue {
    // User data
    user: UserPermissions | null;
    isLoading: boolean;
    error: Error | null;

    // Feature flags
    featureFlags: FeatureFlag[];
    isFeatureFlagsLoading: boolean;
    featureFlagsError: Error | null;

    // Permission methods
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    hasRole: (role: string) => boolean;

    // Feature flag methods
    hasFeature: (feature: string) => boolean;
    hasAnyFeature: (features: string[]) => boolean;
    hasAllFeatures: (features: string[]) => boolean;

    // Utility methods
    refreshPermissions: () => Promise<void>;
    refreshFeatureFlags: () => Promise<void>;
}

/**
 * Access guard component props
 */
export interface AccessGuardProps {
    children: ReactNode;

    // Feature flag access control
    feature?: string;
    anyFeature?: string[];
    allFeatures?: string[];

    // Permission-based access control
    permission?: string;
    anyPermission?: string[];
    allPermissions?: string[];

    // Combined access control
    requireBoth?: boolean;

    // UI options
    fallback?: ReactNode;
    loading?: ReactNode;

    // Debug options
    debugMode?: boolean;
}

/**
 * Route guard component props
 */
export interface RouteGuardProps extends Omit<AccessGuardProps, 'fallback'> {
    redirectTo?: string;
    onAccessDenied?: () => void;
}

/**
 * Provider configuration
 */
export interface AccessControlProviderConfig {
    // Data fetching functions
    fetchUserPermissions: () => Promise<UserPermissions>;
    fetchFeatureFlags?: () => Promise<FeatureFlag[]>;

    // Cache configuration
    cacheTimeout?: number; // in milliseconds
    enableCache?: boolean;

    // Error handling
    onError?: (error: Error) => void;

    // Debug mode
    debugMode?: boolean;
}

/**
 * Hook options for useAccessControl
 */
export interface UseAccessControlOptions {
    // Auto-refresh options
    enableAutoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds

    // Cache options
    enableCache?: boolean;

    // Debug options
    debugMode?: boolean;
}

/**
 * Navigation adapter interface for different routing libraries
 */
export interface NavigationAdapter {
    navigate: (path: string) => void;
    getCurrentPath: () => string;
    replace: (path: string) => void;
}

/**
 * Storage adapter interface for different storage solutions
 */
export interface StorageAdapter {
    getItem: (key: string) => string | null | Promise<string | null>;
    setItem: (key: string, value: string) => void | Promise<void>;
    removeItem: (key: string) => void | Promise<void>;
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

/**
 * Error types for access control
 */
export enum AccessControlErrorType {
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    FEATURE_NOT_ENABLED = 'FEATURE_NOT_ENABLED',
    NETWORK_ERROR = 'NETWORK_ERROR',
    INVALID_CONFIG = 'INVALID_CONFIG',
    USER_NOT_AUTHENTICATED = 'USER_NOT_AUTHENTICATED'
}

/**
 * Custom error class for access control
 */
export class AccessControlError extends Error {
    public readonly type: AccessControlErrorType;
    public readonly details?: Record<string, unknown>;

    constructor(
        type: AccessControlErrorType,
        message: string,
        details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'AccessControlError';
        this.type = type;
        this.details = details;
    }
}