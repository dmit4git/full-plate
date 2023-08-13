export function traverseOrderedTree(tree: any, childrenKey: string, transformer: Function) {
    for (let branch of tree) {
        transformer(branch);
        const children = tree[childrenKey];
        if (children instanceof Array) {
            traverseOrderedTree(children, childrenKey, transformer);
        }
    }
}
