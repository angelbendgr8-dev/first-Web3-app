import React, { useEffect, useState } from "react";

import { ethers } from "ethers";
import { contractAbi, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEtheremContract = async () => {
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();

  const transactionContract = new ethers.BaseContract(
    contractAddress,
    contractAbi,
    signer
  );

  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentWallet, setCurrentWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactionCount, settransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };
  const checkIfWalletIsconnected = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      //  console.log(size(accounts), "here");
      if (accounts.length > 0) {
        console.log(accounts, "here2");
        setCurrentWallet(accounts[0]);
        await getTransactions();
      } else {
        console.log("no account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");

      const { addressTo, amount, keyword, message } = formData;

      const transactionContract = await getEtheremContract();

      const parsedAmount = ethers.parseEther(amount);
      const addToBlockChain = await transactionContract.getFunction(
        "addToBlockChain"
      );
      const getTransactionCount = await transactionContract.getFunction(
        "getTransactionCount"
      );
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentWallet,
            to: addressTo,
            gas: "0x5208",
            value: ethers.toBeHex(parsedAmount),
          },
        ],
      });
      const transactionhash = await addToBlockChain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      setLoading(true);
      console.log(`...loading ${transactionhash.hash}`);
      await transactionhash.wait();
      setLoading(false);
      console.log(`...Success ${transactionhash.hash}`);
      const transactionCount = await getTransactionCount();
      settransactionCount(Number(transactionCount));
    } catch (error) {
      console.log(error);
    }
  };

  const getTransactions = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const transactionContract = await getEtheremContract();
      const getAllTransaction = await transactionContract["getAllTransaction"];
      const transactions = await getAllTransaction();
      console.log(transactions);
      const formatedTransaction = transactions.map((transaction) => {
        const date = Number(transaction[4]);
        const data = {
          addressFrom: transaction[0],
          addressTo: transaction[1],
          amount: Number(transaction[2]) / 10 ** 18,
          message: transaction[3],
          keyword: transaction[5],
          timestamp: new Date(
            Number(transaction[4]) * 1000
          ).toLocaleDateString(),
        };
        return data;
      });
      console.log(formatedTransaction);
      setTransactions(formatedTransaction);
    } catch (error) {}
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentWallet(accounts[0]);
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum object");
    }
  };

  useEffect(() => {
    checkIfWalletIsconnected();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentWallet,
        formData,
        handleChange,
        setFormData,
        sendTransaction,
        transactions,
        loading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
