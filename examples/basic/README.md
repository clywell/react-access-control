# Basic React Access Control Example

This example demonstrates the core functionality of the React Access Control package with a simple React application.

## Features Demonstrated

- Permission-based access control
- Feature flag system
- Conditional rendering with `AccessGuard`
- Programmatic access checks with `useAccessControl` hook
- User authentication simulation
- Custom storage adapter usage

## Running the Example

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

## Key Components

### Authentication Simulation
The example includes a simple login system that allows you to test different user roles:
- **Viewer**: Only has `READ_USERS` permission
- **Editor**: Has `READ_USERS` and `WRITE_USERS` permissions  
- **Admin**: Has all permissions including `ACCESS_ADMIN`

### Access Control Demo
- **User List**: Always visible to users with `READ_USERS` permission
- **Add/Edit Buttons**: Only visible with `WRITE_USERS` permission
- **Delete Button**: Only visible with `DELETE_USERS` permission
- **Admin Panel**: Only visible with `ACCESS_ADMIN` permission

### Feature Flags Demo
- **New UI**: Shown when `NEW_UI` feature flag is enabled
- **Beta Features**: Shown when `BETA_FEATURES` feature flag is enabled

## Code Highlights

### Setting Up the Provider
```jsx
<AccessControlProvider storageAdapter={storageAdapter}>
  <AppContent />
</AccessControlProvider>
```

### Using Access Guards
```jsx
<AccessGuard permissions={['WRITE_USERS']}>
  <button>Add User</button>
</AccessGuard>
```

### Programmatic Checks
```jsx
const { hasPermission } = useAccessControl();

{!hasPermission('WRITE_USERS') && (
  <p>You don't have permission to modify users.</p>
)}
```

This example provides a comprehensive overview of how to implement access control in a React application.