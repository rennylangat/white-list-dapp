import Head from "next/head";
import Image from "next/image";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  const [walletConnetced, setWalletConnected] = useState(false);

  const [joinedWhiteList, setJoinedWhiteList] = useState(false);

  const [loading, setLoading] = useState(false);

  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  const web3ModalRef = useRef();

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();

    if(chainId !=4){
      window.alert("Change the network to Rinkeby")
      throw new Error("Change the network to Rinkeby")
    }

    if(needSigner){
      const signer=web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  };

  /**
   * addressToWhitelist: Adds the current connected address to the whitelist
   */

  const addressToWhitelist = async () => {
    try{
      const signer =await getProviderOrSigner(true);

      const whitelistContract=new Contract (
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const tx=await whitelistContract.addAddressToWhitelist();

      setLoading(true);

      await tx.wait();
      setLoading(false);

      await getNumberOfWhitelisted();
      setJoinedWhiteList(true);

    }catch(e){
      console.error("Adding Error", e);

    }
  }

  /**
   * getNumberofWhitelisted: Returns the number of addresses whitelisted
   */

  const getNumberofWhitelisted = async () => {
    try{

      //Get the provider from web3Modal (Metamask)
      const provider=await getProviderOrSigner();

      //We connect the Contract using a Provider, so we will only have read-only access to the Contract

      const whitelistContract=new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider);

        //call the numAddresesWhitelisted from the contract

      const _numberofWhiteListed=await whitelistContract.numAddressesWhitelisted();

      setNumberOfWhitelisted(_numberofWhiteListed);

    }catch(e){
      console.error(e);
    }
  }

  /**
   * checkIfAddressInWhitelist: Checks if the address is in whitelist
   */

  const checkIfAddressInWhitelist = async () => {
    try{
      //We will need the signer later to get the user's address
      //Even though it is a read transaction, since igners are just special kinds of providers, we can use it in it's place

      const signer=await getProviderOrSigner(true);

      const whitelistContract=new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      
      const address=await signer.getAddress();

      const _joinedWhitelist=await whitelistContract.whitelistedAddresses(
        address
      );

      setJoinedWhiteList(_joinedWhitelist);

    }catch(e){
      console.error(e);

    }
  }

  /**
   * Connect the Metamask Wallet
   */

  const connectWallet = async () => {
    try{
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();

      getNumberofWhitelisted();
    }catch(e){
      console.error(e);
    }
  }

  /**
   * renderButton:returns a button based on the state of the dApp
   */

  const renderButton = () => {
    if(walletConnetced){
      if(joinedWhiteList){
        return (
          <div className={styles.description}>
            Thanks for joining the whitelist!
          </div>
        )
      }else if(loading){
        return <button className={styles.button}>Loading...</button>
      }else{
        return (
          <button onClick={addressToWhitelist} className={styles.button}>
            Join the whitelist
          </button>
        )
    
    }  }else{
      return (
        <button onClick={connectWallet} className={styles.button}>Connect your Wallet</button>
      )
    }
  }

  useEffect(()=>{
    if(!walletConnetced){
      web3ModalRef.current=new Web3Modal({
        network:"rinkeby",
        providerOptions: {},
        disableInjectedProvider:false,
      });

      connectWallet();
    }
  },[walletConnetced]);


  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}