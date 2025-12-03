import { ExpectingTransaction } from "@/lib/interfaces";
import { create } from "zustand";

interface ExpTransactionsStoreProps {
  expTransactions: ExpectingTransaction[]
  signatures: string[]
  setExpTransactions: (
    updater: ExpectingTransaction[] | ((prev: ExpectingTransaction[]) => ExpectingTransaction[])
  ) => void
  isDuplicate: (id: string) => boolean
}

export const useExpTransactionsStore = create<ExpTransactionsStoreProps>((set, get) => ({
  expTransactions: [],

  signatures: [],

  setExpTransactions: (updater) =>
    set((state) => {
      const updated =
        typeof updater === "function" ? updater(state.expTransactions) : updater;

      return {
        expTransactions: updated,
        signatures: updated.map((tx) => tx.signature),
      };
    }),

  isDuplicate: (signature: string) => {
    return get().signatures.includes(signature);
  },
}));
