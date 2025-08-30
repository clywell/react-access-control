// Core exports
export * from './core/types';
export * from './core/utils';

// Hook exports
export * from './hooks/useAccessControl';

// Component exports
export * from './components/AccessGuard';
export * from './components/RouteGuard';
export * from './components/AccessControlProvider';

// Adapter exports
export * from './adapters/storage';
export * from './adapters/nextjs';
export * from './adapters/react-router';

// Default exports for convenience
export { AccessControlProvider as default } from './components/AccessControlProvider';