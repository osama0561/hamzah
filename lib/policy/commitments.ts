import type { Commitment } from "./types";

export function aggregateCommitments(commitments: Commitment[] | undefined): {
  commitmentsTotal: number;
  commitmentsCount: number;
} {
  const list = commitments || [];
  const commitmentsTotal = list.reduce(
    (s, c) => s + (Number(c.amount) || 0),
    0,
  );
  return { commitmentsTotal, commitmentsCount: list.length };
}
