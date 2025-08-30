# Examples

This directory contains practical examples demonstrating how to use the React Access Control package in different scenarios.

## Available Examples

### Basic Usage (`basic/`)
- Simple permission-based access control
- Feature flag integration
- Basic route protection

### Next.js Integration (`nextjs/`)
- App Router integration
- Server-side access control
- Route guards implementation

### Advanced Usage (`advanced/`)
- Custom storage adapters
- Multi-framework integration
- Complex permission hierarchies

## Running Examples

Each example directory contains its own README with specific setup instructions.

```bash
cd examples/basic
npm install
npm start
```

## Integration Patterns

### 1. Simple Permission Check
```jsx
import { AccessGuard } from '@clywell/react-access-control';

function MyComponent() {
  return (
    <AccessGuard permissions={['READ_USERS']}>
      <UserList />
    </AccessGuard>
  );
}
```

### 2. Feature Flag Control
```jsx
import { AccessGuard } from '@clywell/react-access-control';

function MyComponent() {
  return (
    <AccessGuard featureFlags={['NEW_UI']}>
      <NewUserInterface />
    </AccessGuard>
  );
}
```

### 3. Route Protection
```jsx
import { RouteGuard } from '@clywell/react-access-control';

function ProtectedRoute({ children }) {
  return (
    <RouteGuard 
      permissions={['ACCESS_ADMIN']}
      fallbackPath="/login"
    >
      {children}
    </RouteGuard>
  );
}
```

### 4. Custom Storage
```jsx
import { AccessControlProvider, LocalStorageAdapter } from '@clywell/react-access-control';

const storageAdapter = new LocalStorageAdapter('my-app');

function App() {
  return (
    <AccessControlProvider storageAdapter={storageAdapter}>
      <YourApp />
    </AccessControlProvider>
  );
}
```