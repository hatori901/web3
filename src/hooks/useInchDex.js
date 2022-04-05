import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis"

const useInchDex = (chain) => {
    const {Moralis,account} = useMoralis();
    const [tokenList,setTokenList] = useState();
    
    useEffect(() =>{
        if(!Moralis?.["Plugins"]?.["oneInch"]) return "langka";
        Moralis.Plugins.oneInch
            .getSupportedTokens({chain: "eth"})
            .then((tokens) => setTokenList(tokens.tokens))
    },[Moralis,Moralis.Plugins]);

    const getQuote = async (params) => {
        await Moralis.Plugins.oneInch.quote({
            chain : params.chain,
            fromTokenAddress: params.fromToken.address,
            toTokenAddress:params.toToken.address,
            amount: Moralis.Units.Token(
                params.fromAmount,
                params.fromToken.decimals,
            ).toString(),
        })
    }

    async function trySwap(params){
        const {fromToken,fromAmount,chain} = params ;
        const amount = Moralis.Units.Token(
            fromAmount,
            fromToken.decimals,
        ).toString();

        if(fromToken.address !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"){
            await Moralis.Plugins.oneInch
                .hasAllowance({
                    chain,
                    fromTokenAddress : fromToken.address,
                    fromAddress : account,
                    amount,
                })
                .then(async (allowance) => {
                    console.log(allowance);
                    if(!allowance){
                        await Moralis.Plugins.oneInch.approve({
                            chain,
                            tokenAddress: fromToken.address,
                            fromAddress: account,
                        })
                    }
                })
                .catch((e) => {
                    alert(e.message);
                })
        }
        
        await doSwap(params)
            .then((receipt) => {
                if(receipt.statusCode !== 400){
                    alert("Swap Complete")
                }
                console.log(receipt);
            })
            .catch((e) => alert(e.message));

    }

    async function doSwap(params){
        return await Moralis.Plugins.oneInch.swap({
            chain: params.chain,
            fromTokenAddress: params.fromToken.address,
            toTokenAddress: params.toToken.address,
            amount: Moralis.Units.Token(
                params.fromAmount,
                params.fromToken.decimals
            ).toString(),
            fromAddress: account,
            slippage: 1,
        });
    }

    return {getQuote,trySwap,tokenList}
}

export default useInchDex;