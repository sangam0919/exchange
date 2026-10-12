# SA Exchange

A portfolio demo for browsing every Upbit KRW market and practicing buy/sell orders with virtual funds. Market quotes are fetched live from public Upbit data. Orders, balances, and holdings are simulated in the current browser only. The app does not use a wallet, smart account, blockchain, or real funds.

## Features

- Paginated list of all available KRW markets, with search and sorting
- Market detail charts and live prices
- Browser-based paper trading with a starting balance of 10,000,000 KRW
- Buy and sell orders with a 0.05% simulated fee
- Local portfolio, holdings, and order history

Each browser profile has a separate account stored in localStorage. It does not sync across devices. Use the portfolio page reset button to restore the starting balance and clear the local demo history.

## Run locally

Install Node.js, then run from the repository root:

```bash
npm install
npm install --prefix exchangebackend
npm install --prefix exchangefront
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Backend health: http://localhost:4000/health

The backend provides the market ticker API used by the frontend. Set `REACT_APP_API_BASE_URL` in the frontend environment when the API is hosted somewhere other than `http://localhost:4000`.

## Deployment notes

Deploy the frontend and ticker API to hosts reachable by the user. Configure `REACT_APP_API_BASE_URL` for the deployed API and allow the deployed frontend origin in the backend CORS configuration. The demo account is stored only in the visitor's browser and is not a production account or secure wallet.

This project is for portfolio demonstration and simulated trading only. It does not place real orders or provide financial services.
