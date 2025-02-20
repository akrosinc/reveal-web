export const getPlanTargetLevelName = (hierarchyNodeOrder: string[], planTargetType: string) => {
    const idx = hierarchyNodeOrder.indexOf(planTargetType);
    return idx > 0 ? hierarchyNodeOrder[idx - 1] : null;
}