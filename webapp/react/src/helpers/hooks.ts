import { useMemo, useState } from "react";
import { isEqual } from 'lodash-es';
import { useLocation } from "react-router-dom";

// builds on useState, the differance is it doesn't update state if new value is same as current
export function useMemoState<T>(initialValue: T): [T, (val: T) => void] {
    const [state, _setState] = useState<T>(initialValue);
    function setState(newState: T) {
        if (!isEqual(newState, state)) {
            _setState(newState);
        }
    }
    return [state, setState];
}
