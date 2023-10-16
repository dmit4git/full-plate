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
import {Tree, TreeNodeTemplateOptions} from "primereact/tree";
import {Divider} from "primereact/divider";
import {ControlledMultibox} from "../../../components/./controlled-multibox/ControlledMultibox";
import {cloneDeep} from "lodash-es";
import {Button} from "primereact/button";
import {useForm} from "react-hook-form";
import {AppTable} from "../../../components/app-table/AppTable";
import {ColumnProps} from "primereact/column";
import {FieldType, InputField} from "../../../components/form/input-field/InputField";
import {Skeleton} from "primereact/skeleton";
import {VirtualScrollerLazyEvent} from "primereact/virtualscroller";
import {InputNumber} from "primereact/inputnumber";

function UserPermissionsComponent(): ReactElement {

    // state
    const [userRows, setUserRows] = useState<UserRow[] | null>(null);
    const [selectedUserRows, setSelectedUserRows] = useState<UserRow[]>([]);
    const [permissionNodes, setPermissionNodes] =
        useState<PermissionsNode[]>(cloneDeep(defaultPermissionsWithKeys));
    const [usersTableSize, setUsersTableSize] = useState<number>(10);

    useEffect(() => setUsersTableSize(10), [setUsersTableSize]);

    // form
    const form = useForm<Claim>({mode: "all"});
    const usersSearchName = 'users search';
    const tableSizeName = 'table size';
    const usersConfigForm = useForm(
        {defaultValues: {[usersSearchName]: '', [tableSizeName]: usersTableSize}}
    );

    // api
    const [getPermissionsTrigger, getPermissionsResult] = useLazyGetUserPermissionsQuery();
    const [setPermissionsTrigger, setPermissionsResult] = useLazySetUserPermissionsQuery();

    const queryPermissions = useCallback((params: PermissionsGetRequest) => {
        getPermissionsTrigger(params).then((response) => {
            if (response.data) {
                // setUserRows(makeUserRows(response.data));
                let updatedRows;
                if (userRows && userRows.length === response.data.count) {
                    updatedRows = [...(userRows || [])];
                }
                else {
                    // reset userRows in case number of rows has changed
                    updatedRows = Array.from({length: response.data.count},
                        (_, i) => {
                        const id = i.toString();
                        return {id: id, key: id, isDummy: true, username: '', email: '', claims: {}};
                    });
                }
                // splice in rows from response
                const rowsUpdate = makeUserRows(response.data.permissions);
                updatedRows.splice(params.first, rowsUpdate.length, ...rowsUpdate);
                // update userRows state
                setUserRows(updatedRows);
            }
        });
    }, [getPermissionsTrigger, userRows]);

    useEffect(queryPermissionsInitial, [getPermissionsResult, queryPermissions]);

    const noUserSelected = selectedUserRows.length === 0;

    function queryPermissionsInitial() {
        if (getPermissionsResult.isUninitialized) {
            queryPermissions({first: 0, last: usersTableSize});
        }
    }

    function permissionsNodeTemplate(node: PermissionsNode, options: TreeNodeTemplateOptions) {
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
        // make initial set of truthy claims using first selected user claims
        // const truthyClaims = Object.keys(rows[0].claims).filter(k => rows[0].claims[k]);
        // const claimsSet = new Set(truthyClaims);
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
                console.log(response);
                selectedUserRows.forEach(u => u.claims = data);
            })
            .catch(reason => {
                console.log(reason);
            });
    }

    function onDiscardClick(e: any) {
        form.reset();
    }

    function onUserRowSelection(rows: UserRow[]) {
        if (!rows) { return; }
        setSelectedUserRows(rows);
        setPermissionsControls(rows);
    }

    function onUserSearch(search: string) {
        setUserRows(null);
        queryPermissions({search: search, first: 0, last: usersTableSize});
    }

    function onUsersScroll(event: VirtualScrollerLazyEvent) {
        const [first, last] = [Number(event.first), Number(event.last)];
        if (userRows === null) { return; }
        // check if scroll window has dummy rows
        let hasDummy = false;
        for (let i = first; i <= last; i++) {
            if (userRows[i].isDummy) {
                hasDummy = true;
                break;
            }
        }
        if (!hasDummy) { return; }
        // get rows for scroll window
        const search = usersConfigForm.getValues(usersSearchName);
        queryPermissions({search: search, first: first, last: last});
    }

    const expandedKeys = cloneDeep(permissionKeys);

    const treePassThrough = {root: {style: {border: 'none'}}};

    const columns: ColumnProps[] = [
        {field: 'username', header: 'Username'},
        {field: 'email', header: 'Email'}
    ];

    return <div className="user-permissions">
        <h1>User Permissions</h1>
        <Splitter>

            <SplitterPanel>
                <div className="w-full">
                    <div className="w-full flex justify-content-between align-items-center">
                        <div className="w-full flex justify-content-between align-items-center flex-1">
                            <h2 className="ml-4 mt-4 mb-4">Users</h2>
                            <div className="w-7rem">
                                <div className="p-float-label">
                                    <InputNumber value={usersTableSize} onValueChange={e => setUsersTableSize(e.value || 1)}
                                                 className="w-7rem" showButtons min={1} max={1000} />
                                    <label>{tableSizeName}</label>
                                </div>
                            </div>
                        </div>
                        <div className="mr-4 pl-4 w-6 flex-1">
                            <InputField name={usersSearchName} type={FieldType.search} control={usersConfigForm.control}
                                        bottomSpace={true} isSearching={getPermissionsResult.isFetching}
                                        onSearch={onUserSearch}/>
                        </div>
                    </div>

                    <Divider className="mt-0 mb-0"/>
                    <AppTable rows={userRows} columns={columns} stripedRows
                              skeletons={(getPermissionsResult.isFetching && userRows === null) ? usersTableSize : 0}
                              selection={selectedUserRows} onRowSelection={onUserRowSelection}
                              sizeInRows={usersTableSize} onLazyLoad={onUsersScroll}/>
                </div>
            </SplitterPanel>

            <SplitterPanel>
                <div className="w-full">
                    <div className="w-full flex justify-content-between">
                        <h2 className="ml-4 mt-4 mb-4">Permissions</h2>
                        <div className="flex mr-4 gap-3 align-items-center w-6">
                            <Button className="flex-1" label="Apply" severity="success" disabled={noUserSelected}
                                    onClick={form.handleSubmit(onApplyClick)} loading={setPermissionsResult.isFetching} />
                            <Button className="flex-1" label="Reset" severity="info" onClick={onDiscardClick}
                                    disabled={noUserSelected || setPermissionsResult.isFetching} />
                        </div>
                    </div>
                    <Divider className="mt-0"/>
                    <Tree value={permissionNodes} expandedKeys={expandedKeys}
                          nodeTemplate={permissionsNodeTemplate} pt={treePassThrough} />
                </div>
            </SplitterPanel>

        </Splitter>
    </div>;
}
export const UserPermissions = React.memo(UserPermissionsComponent);
