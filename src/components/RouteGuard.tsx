import React, { useEffect } from 'react';
import { RouteGuardProps } from '../core/types';
import { useAccessControl } from '../hooks/useAccessControl';

/**
 * RouteGuard component for protecting routes based on access control
 * This component handles navigation and redirection when access is denied
 * 
 * @example
 * // Basic route protection
 * <RouteGuard permission="admin:access" redirectTo="/login">
 *   <AdminPanel />
 * </RouteGuard>
 * 
 * @example
 * // Feature flag protection
 * <RouteGuard feature="beta_features" redirectTo="/not-available">
 *   <BetaFeature />
 * </RouteGuard>
 * 
 * @example
 * // Custom access denied handler
 * <RouteGuard 
 *   permission="users:read" 
 *   onAccessDenied={() => showAccessDeniedModal()}
 * >
 *   <UsersList />
 * </RouteGuard>
 */
export function RouteGuard({
    children,
    feature,
    anyFeature,
    allFeatures,
    permission,
    anyPermission,
    allPermissions,
    requireBoth = false,
    redirectTo,
    onAccessDenied,
    loading,
    debugMode = false
}: RouteGuardProps) {
    const { hasAccess, isFeatureFlagsLoading, debugInfo } = useAccessControl({
        feature,
        anyFeature,
        allFeatures,
        permission,
        anyPermission,
        allPermissions,
        requireBoth
    }, { debugMode });

    // Handle access denied
    useEffect(() => {
        if (!isFeatureFlagsLoading && !hasAccess) {
            if (debugMode) {
                // Debug: Access denied
            }

            if (onAccessDenied) {
                onAccessDenied();
            } else if (redirectTo) {
                // Navigation will be handled by the adapter
                // This is a placeholder - actual navigation depends on the routing library
                // Debug: Redirection should be handled by navigation adapter
            }
        }
    }, [
        hasAccess,
        isFeatureFlagsLoading,
        onAccessDenied,
        redirectTo,
        debugMode,
        feature,
        anyFeature,
        allFeatures,
        permission,
        anyPermission,
        allPermissions,
        requireBoth,
        debugInfo
    ]);

    // Show loading state if feature flags are still loading
    if (isFeatureFlagsLoading) {
        return loading ? <React.Fragment>{loading}</React.Fragment> : null;
    }

    // Don't render children if access is denied
    if (!hasAccess) {
        return null;
    }

    return <React.Fragment>{children}</React.Fragment>;
}

/**
 * PermissionRouteGuard component for permission-only route protection
 */
export function PermissionRouteGuard({
    children,
    permission,
    anyPermission,
    allPermissions,
    redirectTo,
    onAccessDenied,
    loading,
    debugMode = false
}: Pick<RouteGuardProps, 'children' | 'permission' | 'anyPermission' | 'allPermissions' | 'redirectTo' | 'onAccessDenied' | 'loading' | 'debugMode'>) {
    return (
        <RouteGuard
            permission={permission}
            anyPermission={anyPermission}
            allPermissions={allPermissions}
            redirectTo={redirectTo}
            onAccessDenied={onAccessDenied}
            loading={loading}
            debugMode={debugMode}
        >
            {children}
        </RouteGuard>
    );
}

/**
 * FeatureRouteGuard component for feature flag-only route protection
 */
export function FeatureRouteGuard({
    children,
    feature,
    anyFeature,
    allFeatures,
    redirectTo,
    onAccessDenied,
    loading,
    debugMode = false
}: Pick<RouteGuardProps, 'children' | 'feature' | 'anyFeature' | 'allFeatures' | 'redirectTo' | 'onAccessDenied' | 'loading' | 'debugMode'>) {
    return (
        <RouteGuard
            feature={feature}
            anyFeature={anyFeature}
            allFeatures={allFeatures}
            redirectTo={redirectTo}
            onAccessDenied={onAccessDenied}
            loading={loading}
            debugMode={debugMode}
        >
            {children}
        </RouteGuard>
    );
}