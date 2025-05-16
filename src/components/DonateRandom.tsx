'use client';

import { useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { parseUnits } from "viem";
import { Button } from "~/components/ui/button";

export default function DonateRandom() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [amount, setAmount] = useState("0.01");
  const [isDonating, setIsDonating] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const donateRandom = async () => {
    setError(null);
    if (!address || !walletClient || !publicClient) {
      setError("Wallet or public client not connected");
      return;
    }
    setIsDonating(true);
    try {
      const res = await fetch(`/api/following?address=${address}`);
      if (!res.ok) throw new Error("Failed to fetch following list");
      const data = await res.json();
      const follows: string[] = data.follows;
      if (!follows.length) throw new Error("You don’t follow anyone");
      const rec = follows[Math.floor(Math.random() * follows.length)];
      const recAddress = rec as `0x${string}`;
      setRecipient(recAddress);
      const hash = await walletClient.sendTransaction({
        to: recAddress,
        value: parseUnits(amount, 18),
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      setTxHash(hash);
    } catch (err: any) {
      setError(err.message);
    }
    setIsDonating(false);
  };

  const shareOnWarpcast = () => {
    const url = encodeURIComponent(process.env.NEXT_PUBLIC_URL || window.location.href);
    const text = encodeURIComponent(
      `I just donated ${amount} MONAD to ${recipient} on Vibes mini app!`
    );
    window.open(`https://warpcast.com/compose?text=${text}&url=${url}`, "_blank");
  };

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-lg font-semibold">Donate Testnet Monad</h2>
      <input
        type="number"
        step="0.0001"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-4 py-2 border rounded-md focus:outline-none"
        placeholder="Amount in MONAD"
      />
      <Button
        onClick={donateRandom}
        disabled={isDonating}
        className="w-full"
      >
        {isDonating ? "Donating..." : `Donate ${amount} MONAD`}
      </Button>
      {txHash && recipient && (
        <div className="space-y-2">
          <p className="text-sm text-green-600">
            Donated {amount} MONAD to {recipient}.{" "}
            <a
              href={`https://testnet.blockexplorer.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              View Tx
            </a>
          </p>
          <Button onClick={shareOnWarpcast} className="w-full">
            Share this mini app on Warpcast
          </Button>
        </div>
      )}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
