import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useMoralis,useNativeBalance } from "react-moralis";
import { Box, Button, Container, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spacer, Text, useDisclosure } from '@chakra-ui/react';


function App() {

    const { authenticate, isAuthenticated, isAuthenticating, user, account, logout } = useMoralis();
    const {isOpen,onOpen,onClose} = useDisclosure();
    const login = async () => {
      if (!isAuthenticated) {

        await authenticate({signingMessage: "Log in using Moralis" })
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
    <Container boxShadow="lg" h="200px">
      <div>
        <Flex marginTop="20px">
          <Box>
            <Text fontSize="2xl">WEB3</Text>
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
              <Button colorScheme="red" onClick={logOut}>Logout</Button>
            )
          }
          </Box>
        </Flex>
        {
            isAuthenticated && (
              <div>
                Your Address : {localStorage.getItem('address')}
              </div>
            )
        }
      </div>
    </Container>
  );
}

export default App;