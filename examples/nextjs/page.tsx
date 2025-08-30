'use client';

import {
    AccessControlProvider,
    AccessGuard,
    RouteGuard,
    useAccessControl,
    LocalStorageAdapter,
    NextJSAdapter
} from '@clywell/react-access-control';

// Storage and navigation adapters
const storageAdapter = new LocalStorageAdapter('nextjs-demo');
const navigationAdapter = new NextJSAdapter();

// Mock authentication
const mockAuth = {
    admin: {
        id: '1',
        name: 'Admin User',
        permissions: ['READ_USERS', 'WRITE_USERS', 'DELETE_USERS', 'ACCESS_ADMIN'],
        featureFlags: ['NEW_UI', 'BETA_FEATURES']
    },
    user: {
        id: '2',
        name: 'Regular User',
        permissions: ['READ_USERS'],
        featureFlags: ['NEW_UI']
    }
};

function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <AccessControlProvider
            storageAdapter={storageAdapter}
            navigationAdapter={navigationAdapter}
        >
            {children}
        </AccessControlProvider>
    );
}

function LoginForm() {
    const { setUserContext } = useAccessControl();

    const handleLogin = (userType: keyof typeof mockAuth) => {
        const userData = mockAuth[userType];
        setUserContext({
            user: { id: userData.id, name: userData.name },
            permissions: userData.permissions,
            featureFlags: userData.featureFlags
        });
    };

    return (
        <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <div className="space-y-2">
                <button
                    onClick={() => handleLogin('user')}
                    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Login as User
                </button>
                <button
                    onClick={() => handleLogin('admin')}
                    className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Login as Admin
                </button>
            </div>
        </div>
    );
}

function Dashboard() {
    const { user, logout, hasPermission } = useAccessControl();

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard - Welcome {user?.name}</h1>
                <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <div className="grid gap-6">
                {/* Always visible to authenticated users */}
                <div className="p-4 border rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">User Profile</h2>
                    <p>This section is visible to all authenticated users.</p>
                </div>

                {/* Permission-based access */}
                <AccessGuard permissions={['WRITE_USERS']}>
                    <div className="p-4 border rounded-lg bg-blue-50">
                        <h2 className="text-lg font-semibold mb-2">User Management</h2>
                        <p>This section requires WRITE_USERS permission.</p>
                        <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">
                            Add User
                        </button>
                    </div>
                </AccessGuard>

                <AccessGuard permissions={['ACCESS_ADMIN']}>
                    <div className="p-4 border rounded-lg bg-green-50">
                        <h2 className="text-lg font-semibold mb-2">Admin Panel</h2>
                        <p>This section requires ACCESS_ADMIN permission.</p>
                        <button className="mt-2 px-3 py-1 bg-green-500 text-white rounded">
                            System Settings
                        </button>
                    </div>
                </AccessGuard>

                {/* Feature flag based access */}
                <AccessGuard featureFlags={['BETA_FEATURES']}>
                    <div className="p-4 border rounded-lg bg-yellow-50">
                        <h2 className="text-lg font-semibold mb-2">🚀 Beta Features</h2>
                        <p>This section is only visible when BETA_FEATURES flag is enabled.</p>
                    </div>
                </AccessGuard>

                {/* Combined permission and feature flag */}
                <AccessGuard permissions={['DELETE_USERS']} featureFlags={['NEW_UI']}>
                    <div className="p-4 border rounded-lg bg-red-50">
                        <h2 className="text-lg font-semibold mb-2">⚠️ Danger Zone</h2>
                        <p>Requires both DELETE_USERS permission and NEW_UI feature flag.</p>
                        <button className="mt-2 px-3 py-1 bg-red-500 text-white rounded">
                            Delete Users
                        </button>
                    </div>
                </AccessGuard>

                {/* Conditional content based on permissions */}
                {!hasPermission('ACCESS_ADMIN') && (
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h2 className="text-lg font-semibold mb-2">Limited Access</h2>
                        <p>You don't have admin permissions. Contact your administrator for more access.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProtectedAdminPage() {
    return (
        <RouteGuard
            permissions={['ACCESS_ADMIN']}
            fallback={
                <div className="p-6 text-center">
                    <h1 className="text-xl font-bold text-red-600">Access Denied</h1>
                    <p>You need admin permissions to access this page.</p>
                </div>
            }
        >
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                <p>This page is only accessible to users with ACCESS_ADMIN permission.</p>
            </div>
        </RouteGuard>
    );
}

export default function NextJSExample() {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-100">
                <div className="container mx-auto py-8">
                    <AccessControlContent />
                </div>
            </div>
        </AuthProvider>
    );
}

function AccessControlContent() {
    const { user } = useAccessControl();

    if (!user) {
        return (
            <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Next.js Access Control Demo</h1>
                <LoginForm />
            </div>
        );
    }

    return <Dashboard />;
}