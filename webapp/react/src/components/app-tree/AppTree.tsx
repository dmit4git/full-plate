import React, {ReactElement} from "react";
import {Tree, TreeNodeTemplateOptions, TreeProps, TreeTogglerTemplateOptions} from "primereact/tree";
import {TreeNode} from "primereact/treenode";
import {range} from "lodash-es";
import {Skeleton} from "primereact/skeleton";

interface AppTreeProps extends TreeProps {
    skeletons?: number, // Number of skeleton nodes. Tree displays skeleton nodes instead of content if value is truthy.
    nodes?: TreeProps['value'],
    noBorder?: boolean
}

function AppTreeComponent(props: AppTreeProps): ReactElement {

    function makeSkeletonNodes(skeletons?: number): TreeNode[] {
        return range(skeletons || 0).map(i => {
            return {key: i.toString(), children: [{key: i.toString() + '-1'}]};
        });
    }

    function skeletonBody(node: TreeNode, options: TreeNodeTemplateOptions) {
        return <Skeleton className="w-full"></Skeleton>
    }

    const noBorderPassThrough = {root: {style: {border: 'none'}}};

    const passThrough = {};
    if (props.noBorder) {
        Object.assign(passThrough, noBorderPassThrough);
    }

    const {nodes, noBorder, ...treeProps} = props;

    if (props.skeletons) {
        return <Tree value={makeSkeletonNodes(props.skeletons || 5)} nodeTemplate={skeletonBody} pt={passThrough} />;
    } else {
        return <Tree value={props.nodes} pt={passThrough} {...treeProps} />;
    }
}
export const AppTree = React.memo(AppTreeComponent);
