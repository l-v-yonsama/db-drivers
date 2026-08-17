// Pure, vendor-neutral plan-node math shared by every vendor's plan parser
// (postgresPlanParser.ts, mysqlPlanParser.ts, ...). Lives in its own file
// rather than one vendor's parser module so a Provider for a different
// vendor doesn't have to import from a file named after another vendor.

// Only meaningful once both figures exist - `actualRows` currently never
// does for any vendor (it only comes from an EXPLAIN ANALYZE-equivalent,
// and `mode: 'analyze'` isn't implemented anywhere yet), but the
// computation itself is vendor- and mode-independent, so it's written and
// tested now rather than left as a TODO for whichever step adds Analyze
// (§10 Phase 2: "estimated / actual rows が両方ある場合だけ row estimate ratio
// を計算する"). `estimatedRows <= 0` is excluded too - a zero-row estimate
// makes the ratio either undefined (0/0) or meaningless (n/0 -> Infinity),
// neither of which is a fact worth handing to an AI.
export function computeRowEstimateRatio(
  estimatedRows: number | undefined,
  actualRows: number | undefined,
): number | undefined {
  if (estimatedRows === undefined || actualRows === undefined || estimatedRows <= 0) {
    return undefined;
  }
  return actualRows / estimatedRows;
}
