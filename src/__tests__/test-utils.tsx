import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AccessControlProvider, AccessControlProviderProps } from '../components/AccessControlProvider';
import { UserPermissions, FeatureFlag } from '../core/types';

// Mock user permissions for testing
export const mockUserPermissions: UserPermissions = {
    userId: 'test-user-id',
    organizationId: 'test-org-id',
    permissions: ['read', 'write', 'delete', 'admin'],
    roles: ['user', 'admin']
};

// Mock feature flags for testing
export const mockFeatureFlags: FeatureFlag[] = [
    {
        id: 'feature-1',
        name: 'Enhanced Search',
        enabled: true,
        description: 'Advanced search capabilities'
    },
    {
        id: 'feature-2',
        name: 'Beta Dashboard',
        enabled: false,
        description: 'New dashboard interface'
    },
    {
        id: 'feature-3',
        name: 'Analytics',
        enabled: true,
        description: 'Analytics and reporting'
    }
];

// Mock fetch functions
export const mockFetchUserPermissions = jest.fn() as jest.MockedFunction<() => Promise<UserPermissions>>;
export const mockFetchFeatureFlags = jest.fn() as jest.MockedFunction<() => Promise<FeatureFlag[]>>;

// Default provider config for testing
export const defaultTestConfig: AccessControlProviderProps['config'] = {
    fetchUserPermissions: mockFetchUserPermissions,
    fetchFeatureFlags: mockFetchFeatureFlags,
    enableCache: false, // Disable cache by default for predictable tests
    debugMode: false // Disable debug by default to avoid console noise
};

// Custom render function with AccessControlProvider
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    providerProps?: Partial<AccessControlProviderProps['config']>;
    skipProvider?: boolean;
}

export function renderWithProvider(
    ui: ReactElement,
    options: CustomRenderOptions = {}
): ReturnType<typeof render> {
    const { providerProps = {}, skipProvider = false, ...renderOptions } = options;

    if (skipProvider) {
        return render(ui, renderOptions);
    }

    const config = { ...defaultTestConfig, ...providerProps };

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <AccessControlProvider config={config}>
                {children}
            </AccessControlProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Helper to create mock error
export function createMockError(message: string = 'Test error'): Error {
    return new Error(message);
}

// Helper to wait for async operations
export function waitFor(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to reset all mocks
export function resetAllMocks(): void {
    mockFetchUserPermissions.mockReset();
    mockFetchFeatureFlags.mockReset();
    jest.clearAllMocks();
}

// Helper to setup successful mock responses
export function setupSuccessfulMocks(): void {
    mockFetchUserPermissions.mockResolvedValue(mockUserPermissions);
    mockFetchFeatureFlags.mockResolvedValue(mockFeatureFlags);
}

// Helper to setup error mock responses
export function setupErrorMocks(
    userError?: Error,
    featureFlagsError?: Error
): void {
    if (userError) {
        mockFetchUserPermissions.mockRejectedValue(userError);
    }
    if (featureFlagsError) {
        mockFetchFeatureFlags.mockRejectedValue(featureFlagsError);
    }
}

// Test data generators
export function createTestUserPermissions(overrides: Partial<UserPermissions> = {}): UserPermissions {
    return {
        ...mockUserPermissions,
        ...overrides
    };
}

export function createTestFeatureFlags(overrides: Partial<FeatureFlag>[] = []): FeatureFlag[] {
    return overrides.length > 0
        ? overrides.map((override, index) => ({
            ...mockFeatureFlags[index] || {
                id: `test-feature-${index}`,
                name: `Test Feature ${index}`,
                enabled: true
            },
            ...override
        }))
        : mockFeatureFlags;
}

// Console spy helpers for debug testing
export function spyOnConsole() {
    const consoleSpy = {
        log: jest.spyOn(console, 'log').mockImplementation(() => { }),
        error: jest.spyOn(console, 'error').mockImplementation(() => { }),
        warn: jest.spyOn(console, 'warn').mockImplementation(() => { })
    };

    return consoleSpy;
}

export function restoreConsoleSpy(consoleSpy: ReturnType<typeof spyOnConsole>) {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.warn.mockRestore();
}