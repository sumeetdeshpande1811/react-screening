'use client'

import { useState, useEffect } from 'react'
import { useWalletUi } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

interface PortfolioData {
  balance: number
  tokens: TokenInfo[]
  totalValue: number
}

interface TokenInfo {
  mint: string
  amount: string
  decimals: number
  symbol?: string
}

export function PortfolioDashboard() {
  const { account, cluster } = useWalletUi()
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    balance: 0,
    tokens: [],
    totalValue: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (account) {
      fetchPortfolioData();
    }
  }, [account]); 

  const fetchPortfolioData = async () => {
    if (!account?.address) return;
  
    setIsLoading(true);
    setError('');
  
    try {
      const connection = new Connection(clusterApiUrl("devnet"));
      const publicKey = new PublicKey(account.address);
      const lamports = await connection.getBalance(publicKey);
      const solBalance = lamports / 1e9;
  
      setPortfolio({
        balance: solBalance,
        tokens: [
          {
            mint: publicKey.toBase58(),
            amount: solBalance.toFixed(4),
            decimals: 9,
            symbol: "SOL",
          },
        ],
        totalValue: solBalance * 150, // Placeholder USD value
      });
    } catch (err) {
      console.error("Error fetching SOL balance:", err);
      setError("Failed to fetch portfolio data.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return portfolio.totalValue;
  };
  

  const formatBalance = (balance: number) => {
    return balance.toFixed(2)
  }

  if (!account) {
    return (
      <div className="p-2">
        <h1 className="text-6xl font-bold mb-2 whitespace-nowrap overflow-hidden">
          Portfolio Dashboard - Please Connect Wallet
        </h1>
        <div className="bg-yellow-200 p-8 rounded border-4 border-yellow-500">
          <p className="text-2xl font-bold whitespace-nowrap">
            ⚠️ WALLET CONNECTION REQUIRED - Please connect your Solana wallet to view your cryptocurrency portfolio
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 max-w-none overflow-x-hidden">
      <img src="/third-time-icon-tiny-white.png" alt="Third Time" className="h-12 w-auto mb-4" />
      <h1 className="text-5xl font-bold mb-2 whitespace-nowrap overflow-hidden text-purple-700">
        My Portfolio Dashboard for Cryptocurrency Assets
      </h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-xs">{error}</div>
      )}

<div className="flex flex-wrap gap-4 justify-start items-stretch">

        <Card className="min-w-80 flex-shrink-0">
          <CardHeader>
          <CardTitle className="text-xl text-purple-600 whitespace-nowrap">
            SOL Balance Information
          </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-lg">Loading your balance...</div>
            ) : (
              <div>
                <p className="text-4xl font-bold whitespace-nowrap">{formatBalance(portfolio.balance)} SOL</p>
                <p className="text-base text-gray-500 whitespace-nowrap">Current Network: {cluster.label}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-96 flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-xl whitespace-nowrap">Token Holdings & Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolio.tokens.length === 0 ? (
              <p className="text-lg">No tokens found in wallet</p>
            ) : (
              <div className="space-y-3">
                {portfolio.tokens.map((token, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <span className="text-lg font-medium">{token.symbol || 'Unknown Token'}</span>
                      <p className="text-sm text-gray-600 font-mono">{token.mint}</p>
                    </div>
                    <span className="text-lg font-mono whitespace-nowrap">{token.amount} tokens</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-72 flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-xl whitespace-nowrap">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold whitespace-nowrap">${calculateTotalValue().toFixed(2)} USD</p>
            <Button
  onClick={fetchPortfolioData}
  disabled={isLoading}
  className="mt-6 w-full text-lg py-4 px-8 whitespace-nowrap bg-purple-700 hover:bg-purple-800 text-white"
>
  Refresh Portfolio Data
</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
