'use client'
import React from 'react';
import { useMetaMaskTatum } from '@/hooks/useMetaMaskTatum.tsx';

function MetaMaskTatumButton() {
const { connectMetaMask, account } = useMetaMaskTatum();

return (
<div>
{account ? (
<div>Connected to: {account}</div>
) : (
<button onClick={connectMetaMask}>Connect MetaMask</button>
)}
</div>
);
}

export default MetaMaskTatumButton;