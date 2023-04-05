import { randomUUID, createHash } from "crypto";

interface IFingerprints {
    value: string,
    hash: string
}

export function createFingerprint(): IFingerprints {
    const value: string = randomUUID();
    const hash: string = createHash('sha256').update(value).digest('hex');
    return { value, hash }
}