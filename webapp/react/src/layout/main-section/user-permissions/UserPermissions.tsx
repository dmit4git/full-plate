import "./UserPermissions.scss"
import React, {ReactElement, useCallback, useEffect, useRef, useState} from "react";
import {
    PermissionsGetRequest,
    useLazyGetUserPermissionsQuery,
    useLazySetUserPermissionsQuery
} from "./UserPermissionsApi";
import {
    applyClaims,
    childKeyAccessor,
    Claim,
    defaultPermissionsWithKeys,
    makeUserRows,
    permissionKeys,
    PermissionsNode,
    UserRow
} from "./UserPermissionsDataHelper";
import {Splitter, SplitterPanel} from "primereact/splitter";
import {Tree} from "primereact/tree";
import {Divider} from "primereact/divider";
import {ControlledMultibox} from "../../../components/controlled-multibox/ControlledMultibox";
import {cloneDeep} from "lodash-es";
import {Button} from "primereact/button";
import {useForm} from "react-hook-form";
import {AppTable} from "../../../components/app-table/AppTable";
import {ColumnProps} from "primereact/column";
import {FieldType, InputField} from "../../../components/form/input-field/InputField";
import {AppPaginator} from "../../../components/app-paginator/AppPaginator";
import {classNames} from "primereact/utils";
import {Messages} from "primereact/messages";
import {getErrorCodes} from "../../../helpers/accessors";
import {setError} from "../../../helpers/errorHnadlers";

function UserPermissionsComponent(): ReactElement {

    // state
    const [userRows, setUserRows] = useState<UserRow[] | null>(null);
    const [selectedUserRows, setSelectedUserRows] = useState<UserRow[]>([]);
    const [permissionNodes, setPermissionNodes] =
        useState<PermissionsNode[]>(cloneDeep(defaultPermissionsWithKeys));
    const [searchCollapsed, setSearchCollapsed] = useState<boolean>(true);
    const searchQuery = useRef<PermissionsGetRequest>({first: 0, last: 9});
    const [usersCount, setUsersCount] = useState<number>(0);

    const getUsersErrors = useRef<Messages>(null);
    const setPermissionsErrors = useRef<Messages>(null);

    // form
    const form = useForm<Claim>({mode: "all"});
    const usersSearchName = 'users search';
    const usersConfigForm = useForm({defaultValues: {[usersSearchName]: ''}});

    // api
    const [getPermissionsTrigger, getPermissionsResult] = useLazyGetUserPermissionsQuery();
    const [setPermissionsTrigger, setPermissionsResult] = useLazySetUserPermissionsQuery();

    const makeDummyRows = useCallback((num: number) => {
        return Array.from({length: num},
            (_, i) => {
                const id = i.toString();
                return {id: id, key: id, isDummy: true, username: '', email: '', claims: {}};
            });
    }, []);

    const queryPermissions = useCallback((params: PermissionsGetRequest) => {
        getPermissionsTrigger(params)
            .then((response) => {
                if (response.isSuccess && response.data) {
                    const rowsUpdate = makeUserRows(response.data.permissions);
                    setUserRows(rowsUpdate);
                    setUsersCount(response.data.count);
                } else {
                    const errorCodes = getErrorCodes(response);
                    for (let errorCode of errorCodes) {
                        setError(getUsersErrors, errorCode);
                    }
                }
            })
            .catch(() => {
                setError(getUsersErrors);
            });
    }, [getPermissionsTrigger]);

    const noUserSelected = selectedUserRows.length === 0;

    useEffect(queryPermissionsInitial, [getPermissionsResult, queryPermissions, makeDummyRows]);

    function queryPermissionsInitial() {
        if (getPermissionsResult.isUninitialized) {
            queryPermissions(searchQuery.current);
        }
    }

    function permissionsNodeTemplate(node: PermissionsNode) {
        if (node.label) {
            return <span>{node.label}</span>;
        } else if (node.permissions) {
            return permissionControls(node);
        } else {
            return null;
        }
    }

    // makes control elements for a given resource
    function permissionControls(node: PermissionsNode) {
        const controls = Object.keys(node.permissions || {}).map(permission => {
            let key = node.key!.toString();
            const regexp = new RegExp(childKeyAccessor + 'permissions$');
            key = key.replace(regexp, '');
            key += childKeyAccessor + permission;
            const allowIndeterminate = form.getValues(key) === null;
            return <ControlledMultibox name={key} key={key} label={permission} control={form.control}
                                       disabled={noUserSelected} indeterminateChoice={allowIndeterminate}/>
        });
        return <div className="flex gap-4">{controls}</div>;
    }

    function setPermissionsControls(rows: UserRow[]) {
        const permissions = cloneDeep(defaultPermissionsWithKeys);
        const defaultFormValues = Object.entries(form.getValues())
            .reduce((values, [k, v]) => (v || v === null) ? Object.assign(values, {[k]: undefined}) : values, {});
        const commonClaims = makeCommonClaims(rows);
        applyClaims(permissions, commonClaims);
        form.reset(Object.assign(defaultFormValues, commonClaims));
        setPermissionNodes(permissions);
    }

    function makeCommonClaims(rows: UserRow[]) {
        const commonClaims = cloneDeep(rows[0].claims);
        const truthyClaimSet = new Set(Object.keys(commonClaims).filter(k => commonClaims[k]));
        // set all contradicting claims to null value
        for (let i = 1; i < rows.length; i++) {
            const currentClaimSet = new Set(truthyClaimSet);
            for (let [k, v] of Object.entries(rows[i].claims)) {
                if (currentClaimSet.has(k)) {
                    currentClaimSet.delete(k);
                    if (commonClaims[k] !== v) {
                        commonClaims[k] = null;
                    }
                } else if (v) {
                    truthyClaimSet.add(k);
                    commonClaims[k] = null;
                }
            }
            for (let claim of Array.from(currentClaimSet)) {
                commonClaims[claim] = null;
            }
        }
        return commonClaims;
    }

    function onApplyClick(data: Claim) {
        if (noUserSelected) { return; }
        const users = selectedUserRows.map(u => u.username);
        for (let key of Object.keys(data)) {
            if (data[key] === undefined || data[key] === null) { delete data[key]; }
        }
        const body = {users: users, claims: data};
        setPermissionsTrigger(body)
            .then((response) => {
                if (response.isSuccess) {
                    selectedUserRows.forEach(u => u.claims = data);
                } else {
                    const errorCodes = getErrorCodes(response);
                    for (let errorCode of errorCodes) {
                        setError(setPermissionsErrors, errorCode);
                    }
                }
            })
            .catch(() => {
                setError(setPermissionsErrors);
            });
    }

    function onDiscardClick() {
        form.reset();
    }

    function onUserRowSelection(rows: UserRow[]) {
        if (!rows) { return; }
        setSelectedUserRows(rows);
        setPermissionsControls(rows);
    }

    function onUserSearch(search: string) {
        setUserRows(null);
        searchQuery.current = {...searchQuery.current, first: 0};
        queryPermissions({...searchQuery.current, search: search});
    }

    function onPaginatorChange(page: number | null | undefined, rowsPerPage: number | null | undefined) {
        if (!page || !rowsPerPage) {
            return;
        }
        const firsIndex = (page - 1) * rowsPerPage;
        searchQuery.current = {first: firsIndex, last: firsIndex + rowsPerPage - 1};
        queryPermissions({...searchQuery.current, search: usersConfigForm.getValues(usersSearchName)});
    }

    function setSearchPaneActive(active: boolean) {
        if (active && searchCollapsed) {
            setSearchCollapsed(false);
        }
        else if (!active && !searchCollapsed) {
            setSearchCollapsed(true);
        }
    }

    const expandedKeys = cloneDeep(permissionKeys);

    const treePassThrough = {root: {style: {border: 'none'}}};

    const columns: ColumnProps[] = [
        {field: 'username', header: 'Username'},
        {field: 'email', header: 'Email'}
    ];

    const searchInputCssClasses = classNames({
        'transition-max-width': true, 'transition-ease-in-out': true,
        'max-w-20rem': !searchCollapsed, 'max-w-4rem': searchCollapsed
    });

    return <div className="user-permissions">
        <h1 className="m-4 text-4xl">User Permissions</h1>
        <Splitter>

            <SplitterPanel>
                <div className="w-full relative">
                    <div className="w-full h-6rem flex justify-content-between align-items-center">
                        <h2 className="text-2xl ml-4 mt-4 mb-4">Users</h2>
                        <div className="mr-4 pl-4">
                            <div className="flex align-items-center">
                                <span onClick={() => setSearchPaneActive(false)}>
                                    <AppPaginator totalRecords={usersCount} collapsed={!searchCollapsed}
                                                  onPaginatorChange={onPaginatorChange}
                                                  disabled={getPermissionsResult.isFetching} />
                                </span>
                                <Divider layout="vertical" />
                                <span className={searchInputCssClasses} onClick={() => setSearchPaneActive(true)}>
                                    <InputField name={usersSearchName} type={FieldType.search}
                                                control={usersConfigForm.control} bottomSpace={true}
                                                isSearching={getPermissionsResult.isFetching}
                                                onSearch={onUserSearch} collapsed={searchCollapsed}/>
                                </span>
                            </div>
                        </div>
                    </div>
                    <Divider className="mt-0 mb-0"/>

                    <Messages ref={getUsersErrors} className="absolute w-full z-1" />

                    <AppTable rows={userRows} columns={columns} stripedRows
                              skeletons={(getPermissionsResult.isFetching && userRows === null) ? 10 : 0}
                              selection={selectedUserRows} onRowSelection={onUserRowSelection} />
                </div>
            </SplitterPanel>

            <SplitterPanel>
                <div className="relative w-full">
                    <div className="w-full h-6rem flex justify-content-between align-items-center">
                        <h2 className="text-2xl ml-4 mt-4 mb-4">Permissions</h2>
                        <div className="flex mr-4 gap-3 align-items-center w-6">
                            <Button className="flex-1" label="Apply" severity="success" disabled={noUserSelected}
                                    onClick={form.handleSubmit(onApplyClick)} loading={setPermissionsResult.isFetching} />
                            <Button className="flex-1" label="Reset" severity="info" onClick={onDiscardClick}
                                    disabled={noUserSelected || setPermissionsResult.isFetching} />
                        </div>
                    </div>
                    <Divider className="mt-0"/>

                    <Messages ref={setPermissionsErrors} className="absolute w-full z-1" />

                    <Tree value={permissionNodes} expandedKeys={expandedKeys}
                          nodeTemplate={permissionsNodeTemplate} pt={treePassThrough} />
                </div>
            </SplitterPanel>

        </Splitter>
    </div>;
}
export const UserPermissions = React.memo(UserPermissionsComponent);
