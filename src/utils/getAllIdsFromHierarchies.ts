export function getAllIdentifiers(nodes: any[]) {
    const result = [];
    const stack = [...nodes];

    while (stack.length) {
        const node = stack.pop();
        result.push(node.identifier);

        if (node.children && node.children.length) {
            stack.push(...node.children);
        }
    }

    return result;
}