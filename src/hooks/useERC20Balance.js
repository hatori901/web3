import { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";


export const useERC20Balance = (params) => {
    const {account} = useMoralisWeb3Api();
    const {isInitilialized,chainId,account: walletAddress} = useMoralis();

    const [assets,setAssets] = useState();

    useEffect(() =>{
        if(isInitilialized){
            fetchERC20Balance().then((balance) => setAssets(balance));
        }
    },[isInitilialized,chainId,walletAddress]);

    const fetchERC20Balance = async () =>{
        return await account
            .getTokenBalances({
                address: walletAddress,
                chain: params?.chain ||chainId,
            })
            .then((result) => result);
    };
    return {fetchERC20Balance,assets}
}