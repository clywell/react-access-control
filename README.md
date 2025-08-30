# React Access Control

A flexible, lightweight React library for implementing permission-based access control and feature flags in your applications.

## Features

- 🔐 **Permission-based Access Control** - Granular control over what users can see and do
- 🚩 **Feature Flags** - Toggle features on/off for different user groups
- 🛡️ **Route Protection** - Protect entire routes based on permissions
- 💾 **Flexible Storage** - Multiple storage adapters (localStorage, sessionStorage, AsyncStorage, IndexedDB)
- 🔒 **Security** - Encrypted storage options available
- 🚀 **Framework Agnostic** - Works with Next.js, React Router, and other routing solutions
- 📱 **React Native Support** - Full support for React Native applications
- 🎯 **TypeScript First** - Built with TypeScript for excellent developer experience

## Installation

```bash
npm install @clywell/react-access-control
# or
yarn add @clywell/react-access-control
# or
pnpm add @clywell/react-access-control
```

## Quick Start

### 1. Wrap your app with AccessControlProvider

```jsx
import { AccessControlProvider } from '@clywell/react-access-control';

function App() {
  return (
    <AccessControlProvider>
      <YourApp />
    </AccessControlProvider>
  );
}
```

### 2. Set user context after authentication

```jsx
import { useAccessControl } from '@clywell/react-access-control';

function LoginComponent() {
  const { setUserContext } = useAccessControl();

  const handleLogin = async (credentials) => {
    const user = await authenticateUser(credentials);
    
    setUserContext({
      user: { id: user.id, name: user.name },
      permissions: user.permissions, // ['READ_USERS', 'WRITE_POSTS', etc.]
      featureFlags: user.featureFlags // ['BETA_UI', 'NEW_DASHBOARD', etc.]
    });
  };

  return (
    // Your login form
  );
}
```

### 3. Control access with AccessGuard

```jsx
import { AccessGuard } from '@clywell/react-access-control';

function UserManagement() {
  return (
    <div>
      {/* Always visible */}
      <h1>User Management</h1>
      
      {/* Only visible with READ_USERS permission */}
      <AccessGuard permissions={['READ_USERS']}>
        <UserList />
      </AccessGuard>
      
      {/* Only visible with WRITE_USERS permission */}
      <AccessGuard permissions={['WRITE_USERS']}>
        <AddUserButton />
      </AccessGuard>
      
      {/* Only visible when BETA_UI feature flag is enabled */}
      <AccessGuard featureFlags={['BETA_UI']}>
        <NewUserInterface />
      </AccessGuard>
    </div>
  );
}
```

### 4. Protect routes with RouteGuard

```jsx
import { RouteGuard } from '@clywell/react-access-control';

function AdminRoute() {
  return (
    <RouteGuard 
      permissions={['ACCESS_ADMIN']}
      fallbackPath="/unauthorized"
    >
      <AdminDashboard />
    </RouteGuard>
  );
}
```

## Advanced Usage

### Custom Storage Adapter

```jsx
import { AccessControlProvider, LocalStorageAdapter } from '@clywell/react-access-control';

// Use localStorage with custom prefix
const storageAdapter = new LocalStorageAdapter('my-app');

function App() {
  return (
    <AccessControlProvider storageAdapter={storageAdapter}>
      <YourApp />
    </AccessControlProvider>
  );
}
```

### Encrypted Storage

```jsx
import { 
  AccessControlProvider, 
  LocalStorageAdapter, 
  EncryptedStorageAdapter 
} from '@clywell/react-access-control';

const baseAdapter = new LocalStorageAdapter('my-app');
const encryptedAdapter = new EncryptedStorageAdapter(baseAdapter, 'your-secret-key');

function App() {
  return (
    <AccessControlProvider storageAdapter={encryptedAdapter}>
      <YourApp />
    </AccessControlProvider>
  );
}
```

### React Native with AsyncStorage

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AccessControlProvider, 
  AsyncStorageAdapter 
} from '@clywell/react-access-control';

const storageAdapter = new AsyncStorageAdapter(AsyncStorage);

function App() {
  return (
    <AccessControlProvider storageAdapter={storageAdapter}>
      <YourApp />
    </AccessControlProvider>
  );
}
```

### Multiple Storage Tiers

```jsx
import { 
  AccessControlProvider,
  MultiTierStorageAdapter,
  IndexedDBStorageAdapter,
  LocalStorageAdapter
} from '@clywell/react-access-control';

// Try IndexedDB first, fallback to localStorage
const storageAdapter = new MultiTierStorageAdapter([
  new IndexedDBStorageAdapter(),
  new LocalStorageAdapter()
]);

function App() {
  return (
    <AccessControlProvider storageAdapter={storageAdapter}>
      <YourApp />
    </AccessControlProvider>
  );
}
```

### Framework Integration

#### Next.js App Router

```jsx
import { NextJSAdapter } from '@clywell/react-access-control/adapters/nextjs';

const navigationAdapter = new NextJSAdapter();

function App() {
  return (
    <AccessControlProvider navigationAdapter={navigationAdapter}>
      <YourApp />
    </AccessControlProvider>
  );
}
```

#### React Router

```jsx
import { ReactRouterAdapter } from '@clywell/react-access-control/adapters/react-router';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const navigationAdapter = new ReactRouterAdapter(navigate);

  return (
    <AccessControlProvider navigationAdapter={navigationAdapter}>
      <YourApp />
    </AccessControlProvider>
  );
}
```

## API Reference

### AccessControlProvider

| Prop | Type | Description |
|------|------|-------------|
| `storageAdapter` | `StorageAdapter` | Custom storage implementation |
| `navigationAdapter` | `NavigationAdapter` | Custom navigation implementation |
| `children` | `ReactNode` | Your app components |

### AccessGuard

| Prop | Type | Description |
|------|------|-------------|
| `permissions` | `string[]` | Required permissions (OR logic) |
| `featureFlags` | `string[]` | Required feature flags (OR logic) |
| `requireAll` | `boolean` | Use AND logic instead of OR |
| `fallback` | `ReactNode` | Fallback component when access denied |
| `children` | `ReactNode` | Content to protect |

### RouteGuard

| Prop | Type | Description |
|------|------|-------------|
| `permissions` | `string[]` | Required permissions |
| `featureFlags` | `string[]` | Required feature flags |
| `requireAll` | `boolean` | Use AND logic instead of OR |
| `fallbackPath` | `string` | Redirect path when access denied |
| `fallback` | `ReactNode` | Fallback component instead of redirect |
| `children` | `ReactNode` | Content to protect |

### useAccessControl Hook

```typescript
const {
  user,              // Current user info
  permissions,       // User's permissions array
  featureFlags,      // User's feature flags array
  hasPermission,     // (permission: string) => boolean
  hasFeatureFlag,    // (flag: string) => boolean
  hasAnyPermission,  // (permissions: string[]) => boolean
  hasAllPermissions, // (permissions: string[]) => boolean
  hasAnyFeatureFlag, // (flags: string[]) => boolean
  hasAllFeatureFlags,// (flags: string[]) => boolean
  setUserContext,    // (context: UserContext) => void
  updatePermissions, // (permissions: string[]) => void
  updateFeatureFlags,// (flags: string[]) => void
  logout,            // () => void
  isLoading          // boolean
} = useAccessControl();
```

## Storage Adapters

### Built-in Adapters

- **LocalStorageAdapter** - Browser localStorage
- **SessionStorageAdapter** - Browser sessionStorage  
- **AsyncStorageAdapter** - React Native AsyncStorage
- **IndexedDBStorageAdapter** - Browser IndexedDB
- **EncryptedStorageAdapter** - Encrypted wrapper for any adapter
- **MultiTierStorageAdapter** - Multiple adapters with fallback

### Custom Storage Adapter

```typescript
import { StorageAdapter } from '@clywell/react-access-control';

class CustomStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    // Your implementation
  }

  async setItem(key: string, value: string): Promise<void> {
    // Your implementation
  }

  async removeItem(key: string): Promise<void> {
    // Your implementation
  }
}
```

## Examples

Check out the [examples](./examples/) directory for complete working examples:

- [Basic Usage](./examples/basic/) - Simple permission and feature flag demo
- [Next.js Integration](./examples/nextjs/) - App Router with server-side access control
- [React Native](./examples/react-native/) - Mobile app integration

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT © [Clywell](https://github.com/clywell)

## Support

- 📖 [Documentation](https://github.com/clywell/react-access-control)
- 🐛 [Issues](https://github.com/clywell/react-access-control/issues)
- 💬 [Discussions](https://github.com/clywell/react-access-control/discussions)