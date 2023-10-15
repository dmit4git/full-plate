import {cloneDeep, extend} from "lodash-es";
import {TreeNode} from "primereact/treenode";

export const childKeyAccessor = ' -> ';

export interface Claim extends Record<string, boolean | null> {}

// data format of server response to requesting list of users with permissions
export interface UserPermissionsData {
    username: string,
    email: string
    claims: Claim
}

export interface UserRow extends UserPermissionsData {
    id: string
}

export function makeUserNodes(data: UserPermissionsData[]): TreeNode[] {
    const nodes: TreeNode[] = [];
    for (let userData of data) {
        const emailNode: TreeNode = {
            key: userData.email,
            label: userData.email,
            icon: 'pi pi-fw pi-at'
        };
        const userNode: TreeNode = {
            key: userData.username,
            label: userData.username,
            data: userData.claims,
            children: [emailNode]
        };
        nodes.push(userNode);
    }
    return nodes;
}

export function makeUserRows(data: UserPermissionsData[]): UserRow[] {
    const rows: UserRow[] = [];
    for (const userPermissions of data) {
        rows.push({id: userPermissions.username, ...userPermissions});
    }
    return rows;
}

// table row of user and associated permissions, used as data of tree-table node
export interface PermissionsRow {
    user?: Omit<UserPermissionsData, 'claims'>,
    resource: string,
    permissions?: Claim
}

// node of permissions tree-table
export interface PermissionsNode extends TreeNode {
    children?: PermissionsNode[],
    parent?: PermissionsNode,
    permissions?: Claim
}

// default user permissions
export const defaultUserPermissions: PermissionsNode[] = [
    {
        // key: 'Administration',
        label: 'Administration',
        children: [
            {
                // key: 'User permissions',
                label: 'User permissions',
                children: [
                    {
                        // key: 'User permissions - controls',
                        permissions: {
                            view: false,
                            edit: false
                        }
                    }
                ]
            }
        ]
    },
    {
        // key: 'Monitoring',
        label: 'Monitoring',
        children: [
            {
                // key: 'Log monitor',
                label: 'Log monitor',
                children: [
                    {
                        // key: 'Log monitor - controls',
                        permissions: {
                            view: false,
                            query: false
                        }
                    }
                ]
            },
            {
                // key: 'Health monitor',
                label: 'Health monitor',
                children: [
                    {
                        // key: 'Health monitor - controls',
                        permissions: {
                            view: false,
                            configure: false
                        }
                    }
                ]
            }
        ]
    }
];

// make permissions tree-table nodes from server response to request of user permissions
export let defaultPermissionsWithKeys: PermissionsNode[] = cloneDeep(defaultUserPermissions);
export let permissionKeys: Record<string, boolean> = setKeys(defaultPermissionsWithKeys);

function setKeys(permissions: PermissionsNode[], prefix: string | null = null): Record<string, boolean> {
    let keys: Record<string, number> = {};
    let permissionKeys: string[] = [];
    for (let permission of permissions) {
        let key = permission.label || 'controls';
        key = key.replace(childKeyAccessor, '_');
        if (key in keys) {
            keys[key] += 1;
            key += '_' + keys[key];
        } else {
            keys[key] = 1;
        }
        permission.key = (prefix ? prefix + childKeyAccessor : '') + key;
        permissionKeys.push(permission.key);
        if (permission.children) {
            const childrenKeys = setKeys(permission.children, permission.key);
            permissionKeys = permissionKeys.concat(Object.keys(childrenKeys));
        }
    }
    return permissionKeys.reduce((a, v) => ({ ...a, [v]: true}), {});
}

// set user permissions on a tree-table node from user's claims
export function applyClaims(permissionsNodes: PermissionsNode[], claims: UserPermissionsData['claims']) {
    for (let [key, value] of Object.entries(claims)) {
        if (!value) { continue; }
        const path = key.split(childKeyAccessor);
        let node: PermissionsNode | undefined = undefined;
        while (path.length > 2) {
            const resource = path.shift();
            node = (node ? node.children || [] : permissionsNodes).find(n => n.label === resource);
            if (!node) { break; }
        }
        if (node) {
            node = (node.children || [])[0];
            if (node.permissions) {
                node.permissions[path[1]] = Boolean(value);
            }
        }
    }
}
