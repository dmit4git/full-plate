import React, {useState} from "react";

function ProbeComponent(): JSX.Element {
    const [value, setValue] = useState<number>(1);
    function generateValue() {
        let sum = 0;
        for (let i = 0; i < 10000000; i++) {
            sum += Math.random() * (i % 2 === 0 ? 1 : -1);
        }
        return sum;
    }
    function onButtonClick(event: any) {
        const sum = generateValue();
        setValue(value + sum);
    }
    return <div>
        <p>{value}</p>
        <p>random value = {generateValue()}</p>
        <button onClick={onButtonClick}>generate value</button>
    </div>;
}
export const Probe = React.memo(ProbeComponent);