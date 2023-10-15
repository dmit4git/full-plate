import "./UserPermissions.scss"
import React, {ReactElement, useCallback, useEffect, useState} from "react";
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

function UserPermissionsComponent(): ReactElement {

    // state
    const [userRows, setUserRows] = useState<UserRow[]>([]);
    const [selectedUserRows, setSelectedUserRows] = useState<UserRow[]>([]);
    const [permissionNodes, setPermissionNodes] =
        useState<PermissionsNode[]>(cloneDeep(defaultPermissionsWithKeys));

    // form
    const form = useForm<Claim>({mode: "all"});
    const searchForm = useForm({defaultValues: {'user search': ''}});

    // api
    const [getPermissionsTrigger, getPermissionsResult] = useLazyGetUserPermissionsQuery();
    const [setPermissionsTrigger, setPermissionsResult] = useLazySetUserPermissionsQuery();

    const queryPermissions = useCallback((params: PermissionsGetRequest) => {
        const l = params.search!.length;
        getPermissionsTrigger(params).then((response) => {
            if (response.data) {
                setUserRows(makeUserRows(response.data));
            }
        });
    }, [getPermissionsTrigger]);

    useEffect(queryPermissionsInitial, [getPermissionsResult, queryPermissions]);

    const noUserSelected = selectedUserRows.length === 0;

    function queryPermissionsInitial() {
        if (getPermissionsResult.isUninitialized) {
            queryPermissions({take: 10, skip: 0});
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
            const key = node.key!.toString() + childKeyAccessor + permission;
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
        const users = selectedUserRows.map(u => { return {username: u.username, email: u.email} });
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
        queryPermissions({search: search, take: 10, skip: 0});
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

            <SplitterPanel >
                <div className="w-full">
                    <div className="w-full flex justify-content-between align-items-center">
                        <h2 className="ml-4 mt-4 mb-4">Users</h2>
                        <div className="mr-4 pl-4 w-6">
                            <InputField name="users search" type={FieldType.search} control={searchForm.control}
                                        bottomSpace={true} isSearching={getPermissionsResult.isFetching}
                                        onSearch={onUserSearch}/>
                        </div>
                    </div>
                    <Divider className="mt-0 mb-0"/>
                    <AppTable rows={userRows} columns={columns} stripedRows
                              skeletons={getPermissionsResult.isFetching ? 10 : 0}
                              selection={selectedUserRows} onRowSelection={onUserRowSelection} />
                </div>
            </SplitterPanel>

            <SplitterPanel>
                <div className="w-full">
                    <div className="w-full flex justify-content-between">
                        <h2 className="ml-4 mt-4 mb-4">Permissions</h2>
                        <div className="flex mr-4 gap-3 align-items-center w-6">
                            <Button className="flex-1" label="Apply" severity="success" disabled={noUserSelected}
                                    onClick={form.handleSubmit(onApplyClick)} loading={setPermissionsResult.isFetching} />
                            <Button className="flex-1" label="Reset" severity="info" disabled={noUserSelected}
                                    onClick={onDiscardClick} />
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
