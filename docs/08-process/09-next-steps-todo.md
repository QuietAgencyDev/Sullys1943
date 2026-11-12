# Sully’s — Next Steps To-Do List

**PDF:** [Sullys-Next-Steps-Todo.pdf](./Sullys-Next-Steps-Todo.pdf) · HTML: [09-next-steps-todo.html](./09-next-steps-todo.html)

Companions: [Banking](./07-banking-payment-setup.md) · [QuickBooks](./08-quickbooks-integration.md) · [Demo guide](./06-client-demo-test-guide.md)

**Bottom line:** Recurring pay stays on **Stripe** for cards and **GoCardless** for bank debit. Helcim is not the processor. Nothing is charged until one real payment matches the owner total, and nobody is billed in Glofox and here for the same month.

1. Owner: Stripe for card memberships, GoCardless for the Glofox bank-debit members, kids/adult pricing, soft-launch date
2. Eng: Stripe Checkout is the card path. GoCardless stays unwired until the bank-debit list is ready. Cash stays on the Sully ledger
3. Soft launch dry-run: join → waiver → book → check-in → drop-in → owner totals match drawer
4. Accounting: CSV export, then QuickBooks OAuth sync
5. Later: kitchen pay, push/SMS groups, realtime TV, kids/progression depth  
