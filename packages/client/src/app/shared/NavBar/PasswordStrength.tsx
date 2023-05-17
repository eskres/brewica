import { useState, useEffect, useDeferredValue } from "react";
import {Props} from '../../../../../types'
import { zxcvbnOptions, zxcvbnAsync, ZxcvbnResult } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import { matcherPwnedFactory } from '@zxcvbn-ts/matcher-pwned'

// zxcvbn configuration
const matcherPwned = matcherPwnedFactory(fetch, zxcvbnOptions)
zxcvbnOptions.addMatcher('pwned', matcherPwned)
const options = {
    dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
    },
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    useLevenshteinDistance: true,
    translations: zxcvbnEnPackage.translations,
}
zxcvbnOptions.setOptions(options);

// Custom hook
const usePasswordStrength = (password: string) => {

    const [result, setResult] = useState<ZxcvbnResult | null>(null);
    const deferredPassword = useDeferredValue(password)

    useEffect(() => {
    zxcvbnAsync(deferredPassword).then((response) => setResult(response))
    }, [deferredPassword])
    
    return result
}

// Convert score to labels
const passwordStrengthLabel = (score: number) => {
    switch (score) {
        case 0:
        return 'Very weak';
        case 1:
        return 'Weak';
        case 2:
        return 'Fair';
        case 3:
        return 'Good';
        case 4:
        return 'Strong';
        default:
        return '';
    }
}

export default function PasswordStrength(props: Props) {
    const result = usePasswordStrength(props.password)
    return (
        <div className="form-text" aria-label="Password strength">
            Password strength: {result !== null && passwordStrengthLabel(result.score)}
        </div>
    )
}