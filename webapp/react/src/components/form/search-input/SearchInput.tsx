import React, {ReactElement} from "react";
import {InputText, InputTextProps} from "primereact/inputtext";

interface SearchInputProps extends InputTextProps {

}

function SearchInputComponent(props: SearchInputProps): ReactElement {
    return <span className="p-float-label p-input-icon-right w-full">
        <i className="pi pi-search" />
        <InputText />
        <label>user search</label>
    </span>;
}
export const SearchInput = React.memo(SearchInputComponent);
