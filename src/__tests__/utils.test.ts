import {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasFeature,
    hasAnyFeature,
    hasAllFeatures,
    MemoryCache
} from '../core/utils';
import { FeatureFlag } from '../core/types';

describe('Permission Utilities', () => {
    const testPermissions = ['read', 'write', 'delete', 'admin'];
    const testRoles = ['user', 'admin', 'moderator'];

    describe('hasPermission', () => {
        test('should return true when user has the permission', () => {
            expect(hasPermission(testPermissions, 'read')).toBe(true);
            expect(hasPermission(testPermissions, 'write')).toBe(true);
            expect(hasPermission(testPermissions, 'admin')).toBe(true);
        });

        test('should return false when user does not have the permission', () => {
            expect(hasPermission(testPermissions, 'create')).toBe(false);
            expect(hasPermission(testPermissions, 'update')).toBe(false);
        });

        test('should handle empty permissions array', () => {
            expect(hasPermission([], 'read')).toBe(false);
        });

        test('should handle empty permission string', () => {
            expect(hasPermission(testPermissions, '')).toBe(false);
        });

        test('should be case sensitive', () => {
            expect(hasPermission(testPermissions, 'Read')).toBe(false);
            expect(hasPermission(testPermissions, 'READ')).toBe(false);
        });
    });

    describe('hasAnyPermission', () => {
        test('should return true when user has at least one permission', () => {
            expect(hasAnyPermission(testPermissions, ['read', 'create'])).toBe(true);
            expect(hasAnyPermission(testPermissions, ['create', 'write'])).toBe(true);
            expect(hasAnyPermission(testPermissions, ['admin'])).toBe(true);
        });

        test('should return false when user has none of the permissions', () => {
            expect(hasAnyPermission(testPermissions, ['create', 'update'])).toBe(false);
            expect(hasAnyPermission(testPermissions, ['super-admin'])).toBe(false);
        });

        test('should handle empty permissions arrays', () => {
            expect(hasAnyPermission([], ['read', 'write'])).toBe(false);
            expect(hasAnyPermission(testPermissions, [])).toBe(false);
            expect(hasAnyPermission([], [])).toBe(false);
        });

        test('should handle duplicate permissions in check array', () => {
            expect(hasAnyPermission(testPermissions, ['read', 'read', 'create'])).toBe(true);
        });
    });

    describe('hasAllPermissions', () => {
        test('should return true when user has all permissions', () => {
            expect(hasAllPermissions(testPermissions, ['read', 'write'])).toBe(true);
            expect(hasAllPermissions(testPermissions, ['admin'])).toBe(true);
            expect(hasAllPermissions(testPermissions, testPermissions)).toBe(true);
        });

        test('should return false when user is missing any permission', () => {
            expect(hasAllPermissions(testPermissions, ['read', 'create'])).toBe(false);
            expect(hasAllPermissions(testPermissions, ['super-admin'])).toBe(false);
            expect(hasAllPermissions(testPermissions, ['read', 'write', 'create'])).toBe(false);
        });

        test('should handle empty arrays', () => {
            expect(hasAllPermissions([], ['read'])).toBe(false);
            expect(hasAllPermissions(testPermissions, [])).toBe(true); // vacuous truth
            expect(hasAllPermissions([], [])).toBe(true);
        });

        test('should handle duplicate permissions in check array', () => {
            expect(hasAllPermissions(testPermissions, ['read', 'read', 'write'])).toBe(true);
        });
    });

    describe('hasRole', () => {
        test('should return true when user has the role', () => {
            expect(hasRole(testRoles, 'user')).toBe(true);
            expect(hasRole(testRoles, 'admin')).toBe(true);
            expect(hasRole(testRoles, 'moderator')).toBe(true);
        });

        test('should return false when user does not have the role', () => {
            expect(hasRole(testRoles, 'super-admin')).toBe(false);
            expect(hasRole(testRoles, 'guest')).toBe(false);
        });

        test('should handle empty roles array', () => {
            expect(hasRole([], 'user')).toBe(false);
        });

        test('should handle empty role string', () => {
            expect(hasRole(testRoles, '')).toBe(false);
        });

        test('should be case sensitive', () => {
            expect(hasRole(testRoles, 'User')).toBe(false);
            expect(hasRole(testRoles, 'ADMIN')).toBe(false);
        });
    });
});

describe('Feature Flag Utilities', () => {
    const testFeatureFlags: FeatureFlag[] = [
        { id: 'feature-1', name: 'Enhanced Search', enabled: true },
        { id: 'feature-2', name: 'Beta Dashboard', enabled: false },
        { id: 'feature-3', name: 'Analytics', enabled: true },
        { id: 'feature-4', name: 'Dark Mode', enabled: false }
    ];

    describe('hasFeature', () => {
        test('should return true when feature is enabled', () => {
            expect(hasFeature(testFeatureFlags, 'feature-1')).toBe(true);
            expect(hasFeature(testFeatureFlags, 'feature-3')).toBe(true);
        });

        test('should return false when feature is disabled', () => {
            expect(hasFeature(testFeatureFlags, 'feature-2')).toBe(false);
            expect(hasFeature(testFeatureFlags, 'feature-4')).toBe(false);
        });

        test('should return false when feature does not exist', () => {
            expect(hasFeature(testFeatureFlags, 'non-existent')).toBe(false);
            expect(hasFeature(testFeatureFlags, 'feature-99')).toBe(false);
        });

        test('should handle empty feature flags array', () => {
            expect(hasFeature([], 'feature-1')).toBe(false);
        });

        test('should handle empty feature string', () => {
            expect(hasFeature(testFeatureFlags, '')).toBe(false);
        });
    });

    describe('hasAnyFeature', () => {
        test('should return true when at least one feature is enabled', () => {
            expect(hasAnyFeature(testFeatureFlags, ['feature-1', 'feature-2'])).toBe(true);
            expect(hasAnyFeature(testFeatureFlags, ['feature-2', 'feature-3'])).toBe(true);
            expect(hasAnyFeature(testFeatureFlags, ['feature-1'])).toBe(true);
        });

        test('should return false when no features are enabled', () => {
            expect(hasAnyFeature(testFeatureFlags, ['feature-2', 'feature-4'])).toBe(false);
            expect(hasAnyFeature(testFeatureFlags, ['non-existent'])).toBe(false);
        });

        test('should handle empty arrays', () => {
            expect(hasAnyFeature([], ['feature-1'])).toBe(false);
            expect(hasAnyFeature(testFeatureFlags, [])).toBe(false);
            expect(hasAnyFeature([], [])).toBe(false);
        });

        test('should handle duplicate features in check array', () => {
            expect(hasAnyFeature(testFeatureFlags, ['feature-1', 'feature-1', 'feature-2'])).toBe(true);
        });
    });

    describe('hasAllFeatures', () => {
        test('should return true when all features are enabled', () => {
            expect(hasAllFeatures(testFeatureFlags, ['feature-1', 'feature-3'])).toBe(true);
            expect(hasAllFeatures(testFeatureFlags, ['feature-1'])).toBe(true);
        });

        test('should return false when any feature is disabled or missing', () => {
            expect(hasAllFeatures(testFeatureFlags, ['feature-1', 'feature-2'])).toBe(false);
            expect(hasAllFeatures(testFeatureFlags, ['feature-1', 'non-existent'])).toBe(false);
            expect(hasAllFeatures(testFeatureFlags, ['feature-2', 'feature-4'])).toBe(false);
        });

        test('should handle empty arrays', () => {
            expect(hasAllFeatures([], ['feature-1'])).toBe(false);
            expect(hasAllFeatures(testFeatureFlags, [])).toBe(true); // vacuous truth
            expect(hasAllFeatures([], [])).toBe(true);
        });

        test('should handle duplicate features in check array', () => {
            expect(hasAllFeatures(testFeatureFlags, ['feature-1', 'feature-1', 'feature-3'])).toBe(true);
        });
    });
});

describe('MemoryCache', () => {
    let cache: MemoryCache;

    beforeEach(() => {
        cache = new MemoryCache();
    });

    describe('basic operations', () => {
        test('should store and retrieve values', () => {
            const testData = { id: 1, name: 'test' };
            cache.set('test-key', testData, 1000);

            expect(cache.get('test-key')).toEqual(testData);
        });

        test('should return undefined for non-existent keys', () => {
            expect(cache.get('non-existent')).toBeUndefined();
        });

        test('should delete values', () => {
            cache.set('test-key', 'test-value', 1000);
            expect(cache.get('test-key')).toBe('test-value');

            cache.delete('test-key');
            expect(cache.get('test-key')).toBeUndefined();
        });

        test('should clear all values', () => {
            cache.set('key1', 'value1', 1000);
            cache.set('key2', 'value2', 1000);

            expect(cache.get('key1')).toBe('value1');
            expect(cache.get('key2')).toBe('value2');

            cache.clear();
            expect(cache.get('key1')).toBeUndefined();
            expect(cache.get('key2')).toBeUndefined();
        });
    });

    describe('expiration', () => {
        test('should respect expiration time', (done) => {
            cache.set('test-key', 'test-value', 50); // 50ms expiration

            expect(cache.get('test-key')).toBe('test-value');

            setTimeout(() => {
                expect(cache.get('test-key')).toBeUndefined();
                done();
            }, 100);
        });

        test('should handle zero or negative expiration', () => {
            cache.set('test-key', 'test-value', 0);
            expect(cache.get('test-key')).toBeUndefined();

            cache.set('test-key2', 'test-value2', -100);
            expect(cache.get('test-key2')).toBeUndefined();
        });
    });

    describe('edge cases', () => {
        test('should handle various data types', () => {
            const testCases: Array<[string, any]> = [
                ['string', 'test-string'],
                ['number', 42],
                ['boolean', true],
                ['object', { nested: { data: 'value' } }],
                ['array', [1, 2, 3, { nested: 'object' }]],
                ['null', null],
                ['undefined', undefined]
            ];

            testCases.forEach(([key, value]) => {
                cache.set(key, value, 1000);
                expect(cache.get(key)).toEqual(value);
            });
        });

        test('should handle empty string keys', () => {
            cache.set('', 'empty-key-value', 1000);
            expect(cache.get('')).toBe('empty-key-value');
        });

        test('should overwrite existing values', () => {
            cache.set('test-key', 'original-value', 1000);
            expect(cache.get('test-key')).toBe('original-value');

            cache.set('test-key', 'new-value', 1000);
            expect(cache.get('test-key')).toBe('new-value');
        });
    });
});