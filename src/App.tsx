import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import useInchDex from './hooks/useInchDex';
import { useMoralis,useTokenPrice,useMoralisWeb3Api } from "react-moralis";
import { Box, Button, Container, Flex, Image, Input, InputGroup, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Spacer, Text, useDisclosure } from '@chakra-ui/react';
import { ArrowDownIcon, ChevronDownIcon } from '@chakra-ui/icons';
import InchModal from "./components/InchModal";
import { getWrappedNative } from './helpers/networks';
import { tokenValue } from "./helpers/formatters";
import { log } from 'console';


const nativeAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

const IsNative = (address) =>
  address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

function App() {
    const [customTokens,setCustomTokens] = useState({});
    const chain = "eth"
    const { trySwap, getQuote } = useInchDex(chain);
    const { Moralis,isInitialized,chainId,authenticate, isAuthenticated, isAuthenticating, user, account, logout } = useMoralis();
    const Web3Api = useMoralisWeb3Api();
    const {isOpen,onOpen,onClose} = useDisclosure();
    const [isFromTokenActive,setFromTokenActive] = useState(false);
    const [isToTokenActive,setToTokenActive] = useState(false);
    const [fromToken, setFromToken] = useState(undefined);
    const [toToken, setToToken] = useState(undefined);
    const [fromAmount, setFromAmount] = useState(0);
    const [quote, setQuote] = useState(undefined);
    const [currentTrade, setCurrentTrade] = useState(undefined);
    const [tokenPricesUSD, setTokenPricesUSD] = useState({});
    const { fetchTokenPrice, data: formattedData, error, isLoading, isFetching } = useTokenPrice({ address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", chain });
    const [tokenList,setTokenList] = useState({});
    
    useEffect(()=>{
        if(!Moralis?.["Plugins"]?.["oneInch"]){
          return
        }
        Moralis.Plugins.oneInch.getSupportedTokens({chain}).then((tokens)=> setTokenList(tokens.tokens))
    },[Moralis,Moralis.Plugins,Moralis.Plugins.oneInch,chain])
    // const getTokenList = async () =>{
    //   Moralis.Plugins.oneInch.getSupportedTokens({chain}).then((tokens)=> setTokenList(tokens.tokens))
    // }
    const getCustomTokens = async ()=>{
      await Web3Api.account.getTokenBalances({address:localStorage.getItem('address'),chain}).then((tokens)=> setCustomTokens(tokens))
    }
    const tokens = useMemo(()=>{
      return {...customTokens,...tokenList}
    },[customTokens,tokenList])
    
    useEffect(()=>{
      if(!fromToken){
        return
      };
      const addressToken = fromToken["address"] || fromToken["token_address"]
      fetchTokenPrice({
        params: {chain: chain, address: addressToken},
        onSuccess: (price)=>{
          setTokenPricesUSD({
            ...tokenPricesUSD,
            [fromToken["address"]] : price["usdPrice"]
          })
        }
      })
    },[fromToken])

    useEffect(()=>{
      if(!toToken){
        return
      };
      const addressToken = toToken["address"] || toToken["token_address"]
      fetchTokenPrice({
        params: {chain: chain, address: addressToken},
        onSuccess: (price)=>{
          setTokenPricesUSD({
            ...tokenPricesUSD,
            [toToken["address"]] : price["usdPrice"]
          })
        }
      })
    },[toToken])

    const fromTokenPriceUsd = useMemo(()=>{
        if(!fromToken) return null
        return tokenPricesUSD[fromToken["address"]]
    },[tokenPricesUSD,fromToken]);

    const toTokenPriceUsd = useMemo(
    ()=> {
     if(!toToken) return null
     return tokenPricesUSD[toToken["address"]]
    },[tokenPricesUSD,toToken])

    const fromTokenAmountUsd = useMemo(()=>{
      if(!fromTokenPriceUsd || !fromAmount) return null;
      return `~$ ${(fromAmount * fromTokenPriceUsd).toFixed(4)}`
    },[fromTokenPriceUsd,fromAmount])

    const toTokenAmountUsd = useMemo(()=>{
      if(!toTokenPriceUsd || !quote) return null;
      return `~$ ${(parseFloat(Moralis?.Units?.FromWei(quote?.toTokenAmount, quote?.toToken?.decimals)) * toTokenPriceUsd).toFixed(4)}`;
    },[toTokenPriceUsd,quote])


    useEffect(() => {
      if(fromToken && toToken && fromAmount)
        setCurrentTrade({fromToken, toToken,fromAmount,chain})
    }, [toToken, fromToken, fromAmount, chain]);

    useEffect(()=>{
      if(currentTrade) getQuote(currentTrade).then((quote)=> setQuote(quote))
    },[currentTrade])

    const handleChange = (event) => {
      setFromAmount(event.target.value)
    }

    const login = async (wallet : any) => {
      
      if (!isAuthenticated) {
        
        await authenticate({
          signingMessage: "Log in using Web3",
          provider: wallet,
        })
          .then(function (user) {
            localStorage.setItem('address',user!.get("ethAddress"));
            getCustomTokens()
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }
    const logOut = async () => {
      await logout();
      localStorage.removeItem('address');
    }

    const PriceSwap = () =>{
      const Quote = quote;
      if(!Quote || !tokenPricesUSD[toToken["address"]]) return null
      const {fromTokenAmount,toTokenAmount} = Quote;
      const {symbol: fromSymbol} = fromToken;
      const {symbol: toSymbol} = toToken;
      const pricePerToken = (tokenValue(fromTokenAmount,fromToken["decimals"]) / tokenValue(toTokenAmount,toToken["decimals"])).toFixed(6)
      
      return (
          <Text>{`1 ${toSymbol}  = ${pricePerToken} ${fromSymbol} ($${tokenPricesUSD[toToken["address"]].toFixed(4)})`}</Text>
      )
    }
  return (
    <Container background="blue.800" rounded="lg" paddingBlockEnd="10px" boxShadow="lg">
      <div>
        <Flex paddingTop="20px" marginBlock="30px">
          <Box>
            <Text fontSize="2xl">WEB3 DEX</Text>
          </Box>
          <Spacer/>
          <Box>
          {
            !isAuthenticated && (
              <>
              <Button colorScheme="blue" onClick={onOpen}>Connect Wallet</Button>
              <Modal isOpen={isOpen} onClose={onClose}>
                  <ModalOverlay/>
                  <ModalContent>
                    <ModalHeader>
                      Connect Wallet
                    </ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                      <Button onClick={() => login("metamask")}>MetaMask</Button>
                      <Button onClick={() => login("walletconnect")}>WalletConnect</Button>
                    </ModalBody>
                    <ModalFooter>
                      <Button colorScheme="blue" mr={3} onClick={onClose}>Close</Button>
                    </ModalFooter>
                  </ModalContent>
              </Modal>
              </>
            )
          }
          {
            isAuthenticated && (
              <Container shadow="md" padding="5px" rounded="lg" background="blackAlpha.600">
                <Flex alignItems="center">
                <Text w="100px" isTruncated>{localStorage.getItem('address')}</Text>
                <Button colorScheme="red" onClick={logOut}>Logout</Button>
                </Flex>
              </Container>
              
            )
          }
          </Box>
        </Flex>
        <Container background="blackAlpha.600" rounded="md" shadow="md" padding="10px">
          {fromToken ? (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <Text>From</Text>
              <Text fontWeight="bold">Balance: {!fromToken["balance"] ? 0 : tokenValue(fromToken["balance"],fromToken["decimals"]).toFixed(4)}</Text>
            </div>
          ) : (
            <Text>From</Text>
          )}
          <InputGroup>
          <Input value={fromAmount} onChange={handleChange} fontWeight="bold" type="number" placeholder="0.00" variant="unstyled" fontSize="20px" paddingInline="5"/>
          <Button onClick={() => setFromTokenActive(true)}>{fromToken ? (
            <Image
              src={fromToken["logoURI"] ||
                "https://etherscan.io/images/main/empty-token.png"
              }
              alt="nologo"
              width= "30px"
              style={{borderRadius: "15px"}}
            />
          ): (
            <span>Select a token</span>
          )}
          <Spacer/>
          {fromToken && (
            <span>{fromToken["symbol"]}</span>
          )}          
          <ChevronDownIcon w="6" h="6"/></Button>
          </InputGroup>
          <Text style={{ fontWeight: "600" }}>
                {fromTokenAmountUsd}
          </Text>
          <Modal isOpen={isFromTokenActive} onClose={() => setFromTokenActive(false)} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Select a Token</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <InchModal
              open={isFromTokenActive}
              onClose={() => setFromTokenActive(false)}
              setToken={setFromToken}
              tokenList={tokens}
            />
            </ModalBody>
          </ModalContent>
        </Modal>
        </Container>
        <div  style={{textAlign:"center",marginBlock:"10px"}}>
          <ArrowDownIcon w="8" h="8"/>
        </div>
        <Container background="blackAlpha.600" rounded="md" shadow="lg" padding="10px">
          {toToken ? (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <Text>To</Text>
                <Text fontWeight="bold">Balance: {!toToken["balance"] ? 0 : tokenValue(toToken["balance"],toToken["decimals"]).toFixed(4)}</Text>
              </div>
            ) : (
              <Text>To</Text>
            )}
          <InputGroup>
            <Input fontWeight="bold" type="number" placeholder="0.00" variant="unstyled" fontSize="20px" paddingInline="5" readOnly value={
              quote
              ? parseFloat(
                Moralis?.Units?.FromWei(
                  quote?.toTokenAmount,
                  quote?.toToken?.decimals
                )
              ).toFixed(6)
              : ""
            }/>
            <Button onClick={() => setToTokenActive(true)}>{toToken ? (
            <Image
              src={toToken["logoURI"] ||
                "https://etherscan.io/images/main/empty-token.png"
              }
              alt="nologo"
              width= "30px"
              style={{borderRadius: "15px"}}
            />
          ): (
            <span>Select a token</span>
          )}
          <Spacer/>
          {toToken && (
            <span>{toToken["symbol"]}</span>
          )}
          <ChevronDownIcon w="6" h="6"/></Button>
          </InputGroup>
          <Text style={{ fontWeight: "600" }}>
                {toTokenAmountUsd}
          </Text>
          <Modal isOpen={isToTokenActive} onClose={() => setToTokenActive(false)} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Select a Token</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
              <InchModal
                open={isToTokenActive}
                onClose={() => setToTokenActive(false)}
                setToken={setToToken}
                tokenList={tokens}
              />
              </ModalBody>
            </ModalContent>
          </Modal>
        </Container>
        {fromToken && toToken && (
          <>
            {quote && (
              <Flex alignItems="center" px="4px" my="5px">
              <Box>
                <Text fontWeight="bold" fontSize="lg">Estimated Gas :</Text>
              </Box>
              <Spacer />
              <Box>
                <Text fontWeight="bold">{quote?.estimatedGas}</Text>
              </Box>
            </Flex>
            )}
             <Flex alignItems="center" px="4px" my="5px">
              <Box>
                <Text fontWeight="bold" fontSize="lg">Price :</Text>
              </Box>
              <Spacer />
              <Box>
                <PriceSwap/>
              </Box>
          </Flex>
          </>
        )}
        {isAuthenticated ? (
            <Button colorScheme="blue" w="100%" size="lg" marginTop="20px">{!fromAmount ? "Enter an Amount" : "Swap"}</Button>
          ) : (
            <Button colorScheme="blue" w="100%" size="lg" marginTop="20px" onClick={onOpen}>Connect Wallet</Button>
          )}
        
      </div>
    </Container>
  );
}

export default App;