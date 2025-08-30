import React, { Fragment, type PropsWithChildren } from 'react';
import { AccessGuardProps, AccessControlConfig } from '../core/types';
import { useAccessControl } from '../hooks/useAccessControl';

/**
 * AccessGuard component that combines both feature flag and permission checking.
 * This is the single source of truth for access control, replacing separate
 * permission guards and feature guards.
 * 
 * @example
 * // Feature flag only
 * <AccessGuard feature="user_management">
 *   <UserManagementComponent />
 * </AccessGuard>
 * 
 * @example
 * // Permission only
 * <AccessGuard permission="users:read">
 *   <UserListComponent />
 * </AccessGuard>
 * 
 * @example
 * // Either feature OR permission (default behavior)
 * <AccessGuard feature="advanced_user_management" permission="users:admin">
 *   <AdvancedUserComponent />
 * </AccessGuard>
 * 
 * @example
 * // Both feature AND permission required
 * <AccessGuard feature="advanced_user_management" permission="users:admin" requireBoth>
 *   <AdvancedUserComponent />
 * </AccessGuard>
 * 
 * @example
 * // Multiple features with fallback
 * <AccessGuard 
 *   anyFeature={["inventory_management", "product_management"]}
 *   fallback={<div>Feature not available</div>}
 * >
 *   <InventoryComponent />
 * </AccessGuard>
 */
export function AccessGuard({
    children,
    feature,
    anyFeature,
    allFeatures,
    permission,
    anyPermission,
    allPermissions,
    requireBoth = false,
    fallback,
    loading,
    debugMode = false
}: AccessGuardProps) {
    const { hasAccess, isFeatureFlagsLoading, debugInfo: _debugInfo } = useAccessControl({
        feature,
        anyFeature,
        allFeatures,
        permission,
        anyPermission,
        allPermissions,
        requireBoth
    }, { debugMode });

    // Show loading state if feature flags are still loading
    if (isFeatureFlagsLoading) {
        return loading ? <Fragment>{loading}</Fragment> : null;
    }

    // Debug logging
    if (debugMode) {
        // Debug: Access check result
    }

    if (!hasAccess) {
        return fallback ? <Fragment>{fallback}</Fragment> : null;
    }

    return <Fragment>{children}</Fragment>;
}

/**
 * PermissionGuard component for permission-only access control
 * Simplified component when you only need permission checking
 */
export function PermissionGuard({
    children,
    permission,
    anyPermission,
    allPermissions,
    fallback,
    loading,
    debugMode = false
}: Pick<AccessGuardProps, 'children' | 'permission' | 'anyPermission' | 'allPermissions' | 'fallback' | 'loading' | 'debugMode'>) {
    return (
        <AccessGuard
            permission={permission}
            anyPermission={anyPermission}
            allPermissions={allPermissions}
            fallback={fallback}
            loading={loading}
            debugMode={debugMode}
        >
            {children}
        </AccessGuard>
    );
}

/**
 * FeatureGuard component for feature flag-only access control
 * Simplified component when you only need feature flag checking
 */
export function FeatureGuard({
    children,
    feature,
    anyFeature,
    allFeatures,
    fallback,
    loading,
    debugMode = false
}: Pick<AccessGuardProps, 'children' | 'feature' | 'anyFeature' | 'allFeatures' | 'fallback' | 'loading' | 'debugMode'>) {
    return (
        <AccessGuard
            feature={feature}
            anyFeature={anyFeature}
            allFeatures={allFeatures}
            fallback={fallback}
            loading={loading}
            debugMode={debugMode}
        >
            {children}
        </AccessGuard>
    );
}

/**
 * ConditionalRender component for more complex conditional rendering scenarios
 * Provides more granular control over rendering logic
 */
export interface ConditionalRenderProps extends PropsWithChildren {
    condition: boolean;
    fallback?: React.ReactNode;
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

export function ConditionalRender({
    children,
    condition,
    fallback,
    wrapper: Wrapper
}: ConditionalRenderProps) {
    if (!condition) {
        return fallback ? <Fragment>{fallback}</Fragment> : null;
    }

    if (Wrapper) {
        return <Wrapper>{children}</Wrapper>;
    }

    return <Fragment>{children}</Fragment>;
}

/**
 * AccessControlDebugger component for development and debugging
 * Shows detailed information about access control state
 */
export interface AccessControlDebuggerProps {
    config?: AccessControlConfig;
    showUserInfo?: boolean;
    showFeatureFlags?: boolean;
    showPermissions?: boolean;
    className?: string;
}

export function AccessControlDebugger({
    config = {},
    showUserInfo = true,
    showFeatureFlags = true,
    showPermissions = true,
    className = 'access-control-debugger'
}: AccessControlDebuggerProps) {
    const { hasAccess, debugInfo, isFeatureFlagsLoading } = useAccessControl(config, { debugMode: true });

    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <div className={className} style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#000',
            color: '#fff',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            maxWidth: '400px',
            zIndex: 9999,
            border: '1px solid #333'
        }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold', color: hasAccess ? '#4ade80' : '#f87171' }}>
                Access: {hasAccess ? 'GRANTED' : 'DENIED'}
            </div>

            {isFeatureFlagsLoading && (
                <div style={{ marginBottom: '10px', color: '#fbbf24' }}>
                    Loading feature flags...
                </div>
            )}

            {showUserInfo && (
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>User Info:</div>
                    <div>Permissions: {debugInfo.userPermissions.length}</div>
                    <div>Roles: {debugInfo.userRoles.length}</div>
                </div>
            )}

            {showFeatureFlags && (
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Feature Flags:</div>
                    <div>Enabled: {debugInfo.enabledFeatures.length}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>
                        {debugInfo.enabledFeatures.join(', ') || 'None'}
                    </div>
                </div>
            )}

            {showPermissions && (
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Permissions:</div>
                    <div style={{ fontSize: '10px', opacity: 0.8, wordBreak: 'break-all' }}>
                        {debugInfo.userPermissions.join(', ') || 'None'}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #333' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Current Config:</div>
                <pre style={{ fontSize: '10px', opacity: 0.8, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(config, null, 2)}
                </pre>
            </div>
        </div>
    );
}