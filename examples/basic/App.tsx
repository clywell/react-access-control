import React, { useState } from 'react';
import {
    AccessControlProvider,
    AccessGuard,
    useAccessControl,
    LocalStorageAdapter
} from '@clywell/react-access-control';

// Custom storage adapter
const storageAdapter = new LocalStorageAdapter('access-control-demo');

// Mock user data
const mockUsers = {
    admin: {
        id: '1',
        name: 'Admin User',
        permissions: ['READ_USERS', 'WRITE_USERS', 'DELETE_USERS', 'ACCESS_ADMIN'],
        featureFlags: ['NEW_UI', 'BETA_FEATURES']
    },
    editor: {
        id: '2',
        name: 'Editor User',
        permissions: ['READ_USERS', 'WRITE_USERS'],
        featureFlags: ['NEW_UI']
    },
    viewer: {
        id: '3',
        name: 'Viewer User',
        permissions: ['READ_USERS'],
        featureFlags: []
    }
};

// Login component
function LoginForm() {
    const { setUserContext } = useAccessControl();
    const [selectedUser, setSelectedUser] = useState('viewer');

    const handleLogin = () => {
        const userData = mockUsers[selectedUser as keyof typeof mockUsers];
        setUserContext({
            user: { id: userData.id, name: userData.name },
            permissions: userData.permissions,
            featureFlags: userData.featureFlags
        });
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Login as:</h2>
            <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                style={{ margin: '10px', padding: '5px' }}
            >
                <option value="viewer">Viewer (READ_USERS only)</option>
                <option value="editor">Editor (READ_USERS, WRITE_USERS)</option>
                <option value="admin">Admin (All permissions)</option>
            </select>
            <button onClick={handleLogin} style={{ margin: '10px', padding: '5px 15px' }}>
                Login
            </button>
        </div>
    );
}

// User list component
function UserList() {
    const { hasPermission } = useAccessControl();

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px 0' }}>
            <h3>User Management</h3>
            <ul>
                <li>John Doe</li>
                <li>Jane Smith</li>
                <li>Bob Johnson</li>
            </ul>

            <div style={{ marginTop: '10px' }}>
                <AccessGuard permissions={['WRITE_USERS']}>
                    <button style={{ margin: '5px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Add User
                    </button>
                    <button style={{ margin: '5px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Edit User
                    </button>
                </AccessGuard>

                <AccessGuard permissions={['DELETE_USERS']}>
                    <button style={{ margin: '5px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Delete User
                    </button>
                </AccessGuard>
            </div>

            {!hasPermission('WRITE_USERS') && (
                <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    You don't have permission to modify users.
                </p>
            )}
        </div>
    );
}

// Admin panel component
function AdminPanel() {
    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px 0', backgroundColor: '#f8f9fa' }}>
            <h3>Admin Panel</h3>
            <p>This is only visible to users with ACCESS_ADMIN permission.</p>
            <button style={{ padding: '5px 10px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px' }}>
                System Settings
            </button>
        </div>
    );
}

// Feature flag demo component
function BetaFeatures() {
    return (
        <div style={{ padding: '20px', border: '2px dashed #ffc107', borderRadius: '8px', margin: '10px 0', backgroundColor: '#fff8dc' }}>
            <h3>🚀 Beta Features</h3>
            <p>This section is only visible when the BETA_FEATURES flag is enabled.</p>
            <button style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}>
                Try Beta Feature
            </button>
        </div>
    );
}

// New UI component
function NewUI() {
    return (
        <div style={{ padding: '20px', border: '2px solid #17a2b8', borderRadius: '8px', margin: '10px 0', backgroundColor: '#e7f3ff' }}>
            <h3>✨ New UI</h3>
            <p>This is the new user interface, available when NEW_UI feature flag is enabled.</p>
        </div>
    );
}

// Main app component
function AppContent() {
    const { user, logout, hasPermission, hasFeatureFlag } = useAccessControl();

    if (!user) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                <h1>React Access Control Demo</h1>
                <p>This demo shows how to use permission-based access control and feature flags.</p>
                <LoginForm />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div>
                    <h1>Welcome, {user.name}!</h1>
                    <p style={{ margin: '5px 0', color: '#6c757d' }}>
                        Permissions: {hasPermission('READ_USERS') && 'READ'} {hasPermission('WRITE_USERS') && 'WRITE'} {hasPermission('DELETE_USERS') && 'DELETE'} {hasPermission('ACCESS_ADMIN') && 'ADMIN'}
                    </p>
                    <p style={{ margin: '5px 0', color: '#6c757d' }}>
                        Feature Flags: {hasFeatureFlag('NEW_UI') && 'NEW_UI'} {hasFeatureFlag('BETA_FEATURES') && 'BETA_FEATURES'}
                    </p>
                </div>
                <button
                    onClick={logout}
                    style={{ padding: '5px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    Logout
                </button>
            </div>

            {/* Always visible to logged-in users */}
            <AccessGuard permissions={['READ_USERS']}>
                <UserList />
            </AccessGuard>

            {/* Only visible to admins */}
            <AccessGuard permissions={['ACCESS_ADMIN']}>
                <AdminPanel />
            </AccessGuard>

            {/* Feature flag demos */}
            <AccessGuard featureFlags={['NEW_UI']}>
                <NewUI />
            </AccessGuard>

            <AccessGuard featureFlags={['BETA_FEATURES']}>
                <BetaFeatures />
            </AccessGuard>

            {/* Fallback for users without access */}
            {!hasPermission('READ_USERS') && (
                <div style={{ padding: '20px', border: '1px solid #dc3545', borderRadius: '8px', backgroundColor: '#f8d7da', color: '#721c24' }}>
                    <h3>Access Denied</h3>
                    <p>You don't have permission to view this content.</p>
                </div>
            )}
        </div>
    );
}

// Root app with provider
function App() {
    return (
        <AccessControlProvider storageAdapter={storageAdapter}>
            <AppContent />
        </AccessControlProvider>
    );
}

export default App;