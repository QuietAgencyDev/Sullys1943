# Scanner dry-run (USB HID wedge)

1. Staff sign-in at the desk, then open http://localhost:3001/desk/dry-run. The password is handed over in person.  
2. **Run API dry-run** — expect auto checks green.  
3. Walk the manual checklist on that page.  
4. With a keyboard-wedge scanner: keep **Scan target** focused on `/desk`; scan member QR from `/app/card`.  
5. For unattended door mode, use **Door kiosk** at http://localhost:3001/desk/kiosk (see [`docs/05-devops/11-self-serve-check-in.md`](../05-devops/11-self-serve-check-in.md)).

`POST /api/v1/desk/dry-run` — automated rehearsal.
