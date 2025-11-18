/**
 * Storage Module Tests
 */
describe('Storage Module', () => {
    // Clean up before tests
    beforeEach(() => {
        localStorage.clear();
    });
    
    it('should store and retrieve a value', () => {
        Storage.set('test', { foo: 'bar' });
        const result = Storage.get('test');
        expect(result.foo).toBe('bar');
    });
    
    it('should return default value for missing keys', () => {
        const result = Storage.get('nonexistent', 'default');
        expect(result).toBe('default');
    });
    
    it('should return null for missing keys with no default', () => {
        const result = Storage.get('nonexistent');
        expect(result).toBeNull();
    });
    
    it('should handle complex objects', () => {
        const data = {
            array: [1, 2, 3],
            nested: { a: { b: 'c' } },
            number: 42
        };
        Storage.set('complex', data);
        const result = Storage.get('complex');
        expect(result).toEqual(data);
    });
    
    it('should remove a value', () => {
        Storage.set('toRemove', 'value');
        Storage.remove('toRemove');
        expect(Storage.get('toRemove')).toBeNull();
    });
    
    it('should prefix keys correctly', () => {
        Storage.set('test', 'value');
        expect(localStorage.getItem('wordbridge_test')).toBe('"value"');
    });
    
    it('should clear only wordbridge keys', () => {
        localStorage.setItem('other_app', 'data');
        Storage.set('mykey', 'myvalue');
        Storage.clear();
        expect(localStorage.getItem('other_app')).toBe('data');
        expect(Storage.get('mykey')).toBeNull();
    });
    
    it('should export all data', () => {
        Storage.set('key1', 'value1');
        Storage.set('key2', 'value2');
        const exported = Storage.exportAll();
        expect(exported.key1).toBe('value1');
        expect(exported.key2).toBe('value2');
    });
});