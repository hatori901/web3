import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { useMoralis } from "react-moralis";
import { Box, Button, Container, Flex, Input, InputGroup, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Spacer, Text, useDisclosure } from '@chakra-ui/react';
import { ArrowDownIcon, ChevronDownIcon } from '@chakra-ui/icons';



function App() {

    const { authenticate, isAuthenticated, isAuthenticating, user, account, logout } = useMoralis();
    const {isOpen,onOpen,onClose} = useDisclosure();
    const [isFromTokenActive,setFromTokenActive] = useState(false);
    const [isToTokenActive,setToTokenActive] = useState(false);
    const login = async () => {
      if (!isAuthenticated) {

        await authenticate({signingMessage: "Log in using Web3" })
          .then(function (user) {
            localStorage.setItem('address',user!.get("ethAddress"));
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }
    const logOut = async () => {
      await logout();
      console.log("logged out");
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
                      <Button onClick={login}>MetaMask</Button>
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
          <Text fontWeight="bold" fontSize="md">From</Text>
          <InputGroup>
          <Input type="number" placeholder="0.00" variant="unstyled" fontSize="20px" paddingInline="5"/>
          <Button onClick={() => setFromTokenActive(true)}>ETH <ChevronDownIcon w="6" h="6"/></Button>
          </InputGroup>
          <Modal isOpen={isFromTokenActive} onClose={() => setFromTokenActive(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Select a Token</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <p>test</p>
            </ModalBody>
          </ModalContent>
        </Modal>
        </Container>
        <div  style={{textAlign:"center",marginBlock:"10px"}}>
          <ArrowDownIcon w="8" h="8"/>
        </div>
        <Container background="blackAlpha.600" rounded="md" shadow="lg" padding="10px">
          <Text fontWeight="bold" fontSize="md">To</Text>
          <InputGroup>
            <Input type="number" placeholder="0.00" variant="unstyled" fontSize="20px" paddingInline="5"/>
            <Button onClick={() => setToTokenActive(true)}>ETH <ChevronDownIcon w="6" h="6"/></Button>
          </InputGroup>
          <Modal isOpen={isToTokenActive} onClose={() => setToTokenActive(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Select a Token</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <p>test</p>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Container>
        <Button colorScheme="blue" w="100%" size="lg" marginTop="20px">Swap</Button>
      </div>
    </Container>
  );
}

export default App;