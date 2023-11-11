import "./AppPaginator.scss";
import React, {ReactElement} from "react";
import {InputNumber, InputNumberValueChangeEvent} from "primereact/inputnumber";
import {classNames} from "primereact/utils";
import {Button} from "primereact/button";
import {useMemoState} from "../../helpers/hooks";

export interface AppPaginatorProps { // extends PaginatorProps
    classNames?: string,
    collapsed?: boolean,
    totalRecords?: number,
    onPaginatorChange?: (page?: number | null, rowsPerPage?: number | null) => void,
    disabled?: boolean
}

function AppPaginatorComponent(props: AppPaginatorProps): ReactElement {

    const [currentPage, setCurrentPage] = useMemoState<number | null | undefined>(1);
    const [rowsPerPage, setRowsPerPage] = useMemoState<number | null | undefined>(10);

    let disabled = Boolean(props.disabled || !props.totalRecords);

    if (!currentPage && props.totalRecords) {
        setCurrentPage(1);
    }
    const totalPages = Math.ceil((props.totalRecords || 0) / (rowsPerPage || 1));
    if (currentPage && currentPage > totalPages) {
        setCurrentPage(totalPages);
    }

    function onPageChange(page?: number | null) {
        if (!page) {
            return;
        }
        page = Math.min(totalPages, page);
        setCurrentPage(page);
        if (props.onPaginatorChange) {
            props.onPaginatorChange(page, rowsPerPage);
        }
    }

    function onRowsNumberChange(rowPerPage?: number | null) {
        if (!currentPage || !rowPerPage) {
            return;
        }
        const totalPages = Math.ceil((props.totalRecords || 0) / (rowPerPage || 1));
        const page = Math.min(totalPages, currentPage);
        setRowsPerPage(rowPerPage);
        if (props.onPaginatorChange) {
            props.onPaginatorChange(page, rowPerPage);
        }
    }

    const rowsPerPageCssClasses = classNames({
        'overflow-x-hidden': true, 'pt-3': true, 'pb-3': true,
        'transition-max-width': true, 'transition-ease-in-out': true,
        'max-w-10rem': !props.collapsed, 'max-w-0': props.collapsed,
        'flex': true, 'flex-nowrap': true, 'align-items-center': true
    });

    const currentPageNumber = currentPage || 0;

    return <div className="app-paginator flex align-items-center ml-4 mt-2 mb-2">
        <Button icon="pi pi-angle-left" text disabled={disabled || currentPageNumber <= 1}
                onClick={() => onPageChange(currentPageNumber - 1)} />
        <span className="p-float-label">
            <InputNumber className="w-4rem" disabled={disabled} value={currentPage}
                         onValueChange={(event: InputNumberValueChangeEvent) => onPageChange(event.value)}
                         min={!disabled ? 1 : undefined} max={!disabled ? totalPages : undefined} />
            <label>Page</label>
        </span>
        <Button icon="pi pi-angle-right" text disabled={disabled || currentPageNumber >= totalPages}
                onClick={() => onPageChange(currentPageNumber + 1)} />

        <span className={rowsPerPageCssClasses}>
            <span className="p-float-label">
                <InputNumber className="w-4rem" disabled={disabled} value={rowsPerPage} // showButtons step={1}
                             onValueChange={(event: InputNumberValueChangeEvent) => onRowsNumberChange(event.value)}
                             min={!disabled ? 1 : undefined} max={!disabled ? props.totalRecords : undefined} />
                <label>Users per page</label>
            </span>
            <span className="flex flex-column">
                <Button className="h-1rem" icon="pi pi-angle-up" text onClick={() => {
                    onRowsNumberChange(Math.min(props.totalRecords || 0, (rowsPerPage || 0) + 1))
                }} disabled={disabled} />
                <Button className="h-1rem" icon="pi pi-angle-down" text onClick={() => {
                    onRowsNumberChange(Math.max(1, (rowsPerPage || 0) - 1))
                }} disabled={disabled} />
            </span>
        </span>
    </div>;
}
export const AppPaginator = React.memo(AppPaginatorComponent);
