import { ExpenseItem, Member, PaymentSettlement } from '../types';

export interface MemberBalance {
  memberId: string;
  name: string;
  paid: number;
  share: number;
  net: number; // paid - share (positive = owed to them, negative = they owe)
}

/**
 * Calculates net balances for each member across a set of expenses.
 */
export function calculateBalances(
  expenses: ExpenseItem[],
  members: Member[]
): Record<string, MemberBalance> {
  const balances: Record<string, MemberBalance> = {};

  // Initialize for all members
  members.forEach((m) => {
    balances[m.id] = {
      memberId: m.id,
      name: m.name,
      paid: 0,
      share: 0,
      net: 0,
    };
  });

  expenses.forEach((expense) => {
    // Who paid
    if (balances[expense.paidByMemberId]) {
      balances[expense.paidByMemberId].paid += expense.amount;
    }

    // Split shares
    const participants = expense.splitAmongMemberIds.filter((id) => balances[id]);
    if (participants.length > 0) {
      const splitAmount = expense.amount / participants.length;
      participants.forEach((id) => {
        balances[id].share += splitAmount;
      });
    }
  });

  // Calculate net
  Object.values(balances).forEach((b) => {
    b.net = Math.round((b.paid - b.share) * 100) / 100;
  });

  return balances;
}

/**
 * Calculates minimal transactions needed to settle all balances (Greedy debt simplification).
 */
export function calculateSettlements(
  expenses: ExpenseItem[],
  members: Member[],
  existingSettlements: PaymentSettlement[] = []
): PaymentSettlement[] {
  const balances = calculateBalances(expenses, members);

  // Apply already paid/settled transactions to balances
  existingSettlements
    .filter((s) => s.isSettled)
    .forEach((s) => {
      if (balances[s.fromMemberId]) balances[s.fromMemberId].net += s.amount;
      if (balances[s.toMemberId]) balances[s.toMemberId].net -= s.amount;
    });

  // Separate debtors and creditors
  interface PersonNet {
    id: string;
    amount: number;
  }

  const debtors: PersonNet[] = []; // negative net, they owe money
  const creditors: PersonNet[] = []; // positive net, they are owed money

  Object.values(balances).forEach((b) => {
    const net = Math.round(b.net * 100) / 100;
    if (net < -0.01) {
      debtors.push({ id: b.memberId, amount: -net });
    } else if (net > 0.01) {
      creditors.push({ id: b.memberId, amount: net });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const calculated: PaymentSettlement[] = [];
  let dIndex = 0;
  let cIndex = 0;

  while (dIndex < debtors.length && cIndex < creditors.length) {
    const debtor = debtors[dIndex];
    const creditor = creditors[cIndex];

    const settleAmount = Math.min(debtor.amount, creditor.amount);
    const rounded = Math.round(settleAmount * 100) / 100;

    if (rounded > 0.01) {
      // Check if there is an existing settlement matching this pair
      const matched = existingSettlements.find(
        (es) => es.fromMemberId === debtor.id && es.toMemberId === creditor.id && Math.abs(es.amount - rounded) < 0.05
      );

      calculated.push({
        id: matched ? matched.id : `stl-${debtor.id}-${creditor.id}-${Math.random().toString(36).substring(2, 7)}`,
        fromMemberId: debtor.id,
        toMemberId: creditor.id,
        amount: rounded,
        isSettled: matched ? matched.isSettled : false,
        settledAt: matched?.settledAt,
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) dIndex++;
    if (creditor.amount < 0.01) cIndex++;
  }

  return calculated;
}
