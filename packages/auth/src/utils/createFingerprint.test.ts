import { createFingerprint } from "./createFingerprint";

describe.only('create fingerprints for the prevention of token sidejacking', () => { 
    test('it should return an uuid and a SHA256 hash of the uuid ', async () => {
        const fingerprints = createFingerprint()
        
        expect(fingerprints.value.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)).not.toBeNull();
        expect(fingerprints.value).toHaveLength(36);
        expect(fingerprints.hash).toHaveLength(64);
    });
});