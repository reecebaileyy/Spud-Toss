import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { useState, useRef, useEffect, useCallback } from 'react'
import { Web3Button } from '@web3modal/react'
import ABI from '../abi/UNKNOWN.json'
import { useAccount, useBalance, useContractRead, usePrepareContractWrite, useContractWrite, useContractEvent } from 'wagmi'
import potato from '../../public/assets/images/potato.png'
import blacklogo from '../../public/assets/images/BlackLogo.png'
import TokenImage from '../../components/displayImage'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

export default function Play() {

  /* 
    ______  ________  ______  ________ ________      __    __  ______   ______  __    __  ______  
   /      \|        \/      \|        \        \    |  \  |  \/      \ /      \|  \  /  \/      \ 
  |  ▓▓▓▓▓▓\\▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓\\▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓    | ▓▓  | ▓▓  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\ ▓▓ /  ▓▓  ▓▓▓▓▓▓\
  | ▓▓___\▓▓  | ▓▓  | ▓▓__| ▓▓  | ▓▓  | ▓▓__        | ▓▓__| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓/  ▓▓| ▓▓___\▓▓
   \▓▓    \   | ▓▓  | ▓▓    ▓▓  | ▓▓  | ▓▓  \       | ▓▓    ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓  ▓▓  \▓▓    \ 
   _\▓▓▓▓▓▓\  | ▓▓  | ▓▓▓▓▓▓▓▓  | ▓▓  | ▓▓▓▓▓       | ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓▓▓▓\  _\▓▓▓▓▓▓\
  |  \__| ▓▓  | ▓▓  | ▓▓  | ▓▓  | ▓▓  | ▓▓_____     | ▓▓  | ▓▓ ▓▓__/ ▓▓ ▓▓__/ ▓▓ ▓▓ \▓▓\|  \__| ▓▓
   \▓▓    ▓▓  | ▓▓  | ▓▓  | ▓▓  | ▓▓  | ▓▓     \    | ▓▓  | ▓▓\▓▓    ▓▓\▓▓    ▓▓ ▓▓  \▓▓\\▓▓    ▓▓
    \▓▓▓▓▓▓    \▓▓   \▓▓   \▓▓   \▓▓   \▓▓▓▓▓▓▓▓     \▓▓   \▓▓ \▓▓▓▓▓▓  \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓ 
                                                                                   
  */
  const [darkMode, setDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false)
  const [events, setEvents] = useState([]);
  const [tokenId, setTokenId] = useState("");
  const [maxMintAmount, setMaxMintAmount] = useState(0);
  const [mintAmount, setMintAmount] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const argsArray = [1, 2, 3, 4, 5];
  const [activeTokens, setActiveTokens] = useState(0);
  const [potatoOwner, setPotatoOwner] = useState("");
  const [_potatoTokenId, setPotatoTokenId] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);
  const [_getGameState, setGetGameState] = useState("Loading...");
  const [_roundMints, setRoundMints] = useState(0);
  const menuRef = useRef()
  const divRef = useRef(null);
  const [passes, setPasses] = useState(0);
  const [wins, setWins] = useState(0);



  // STORING USERS ADDRESS
  const { address } = useAccount()
  /*
   ________ __     __ ________ __    __ ________      __    __  ______   ______  __    __  ______  
  |        \  \   |  \        \  \  |  \        \    |  \  |  \/      \ /      \|  \  /  \/      \ 
  | ▓▓▓▓▓▓▓▓ ▓▓   | ▓▓ ▓▓▓▓▓▓▓▓ ▓▓\ | ▓▓\▓▓▓▓▓▓▓▓    | ▓▓  | ▓▓  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\ ▓▓ /  ▓▓  ▓▓▓▓▓▓\
  | ▓▓__   | ▓▓   | ▓▓ ▓▓__   | ▓▓▓\| ▓▓  | ▓▓       | ▓▓__| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓/  ▓▓| ▓▓___\▓▓
  | ▓▓  \   \▓▓\ /  ▓▓ ▓▓  \  | ▓▓▓▓\ ▓▓  | ▓▓       | ▓▓    ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓  ▓▓  \▓▓    \ 
  | ▓▓▓▓▓    \▓▓\  ▓▓| ▓▓▓▓▓  | ▓▓\▓▓ ▓▓  | ▓▓       | ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓▓▓▓\  _\▓▓▓▓▓▓\
  | ▓▓_____   \▓▓ ▓▓ | ▓▓_____| ▓▓ \▓▓▓▓  | ▓▓       | ▓▓  | ▓▓ ▓▓__/ ▓▓ ▓▓__/ ▓▓ ▓▓ \▓▓\|  \__| ▓▓
  | ▓▓     \   \▓▓▓  | ▓▓     \ ▓▓  \▓▓▓  | ▓▓       | ▓▓  | ▓▓\▓▓    ▓▓\▓▓    ▓▓ ▓▓  \▓▓\\▓▓    ▓▓
   \▓▓▓▓▓▓▓▓    \▓    \▓▓▓▓▓▓▓▓\▓▓   \▓▓   \▓▓        \▓▓   \▓▓ \▓▓▓▓▓▓  \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓ 
                                                                                           
  */
  /*
                                                                                       
    ▄▄█▀▀▀█▄█                                      ▄█▀▀▀█▄█ ██            ██           
  ▄██▀     ▀█                                     ▄██    ▀█ ██            ██           
  ██▀       ▀ ▄█▀██▄ ▀████████▄█████▄   ▄▄█▀██    ▀███▄   ██████ ▄█▀██▄ ██████  ▄▄█▀██ 
  ██         ██   ██   ██    ██    ██  ▄█▀   ██     ▀█████▄ ██  ██   ██   ██   ▄█▀   ██
  ██▄    ▀████▄█████   ██    ██    ██  ██▀▀▀▀▀▀   ▄     ▀██ ██   ▄█████   ██   ██▀▀▀▀▀▀
  ▀██▄     ████   ██   ██    ██    ██  ██▄    ▄   ██     ██ ██  ██   ██   ██   ██▄    ▄
    ▀▀███████▀████▀██▄████  ████  ████▄ ▀█████▀   █▀█████▀  ▀████████▀██▄ ▀████ ▀█████▀
                                                                                       
                                                                                       
  
  */

  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'GameStarted',
    listener(log) {
      setRoundMints(0);
      setActiveTokens(0);
      refetchGameState();
      refetchMaxSupply();
      refetchPrice();
      refetchCurrentGeneration();
      const message = "Heating up";
      console.log("Started");
      setGetGameState("Minting");
      setEvents(prevEvents => [...prevEvents, message]);

    },
  })

  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'MintingEnded',
    listener(log) {
      const message = "No more mints";
      console.log("Minting Ended");
      setGetGameState("Playing");
      refetchPotatoTokenId();
      refetchGameState();
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })

  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'GameResumed',
    async listener(log) {
      const message = "Back to it";
      console.log("Resumed");
      refetchGameState();
      refetchPotatoTokenId();
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })


  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'GamePaused',
    listener(log) {
      console.log(log);
      const message = "Cooling off";
      console.log("Paused");
      setGetGameState("Paused");
      refetchGameState();
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })

  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'GameRestarted',
    listener(log) {
      const message = "Game Over";
      setGetGameState("Queued");
      refetchGameState();
      setRoundMints(0);
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })

  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'FinalRoundStarted',
    listener(log) {
      const message = "HOT HANDZ";
      refetchPotatoTokenId();
      setGetGameState("Final Round");
      refetchGameState();
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })


  /*
               ▄▄                                                                           
  ▀███▀▀▀██▄ ▀███                                        ▄█▀▀▀█▄█ ██            ██          
    ██   ▀██▄  ██                                       ▄██    ▀█ ██            ██          
    ██   ▄██   ██  ▄█▀██▄ ▀██▀   ▀██▀ ▄▄█▀██▀███▄███    ▀███▄   ██████ ▄█▀██▄ ██████ ▄██▀███
    ███████    ██ ██   ██   ██   ▄█  ▄█▀   ██ ██▀ ▀▀      ▀█████▄ ██  ██   ██   ██   ██   ▀▀
    ██         ██  ▄█████    ██ ▄█   ██▀▀▀▀▀▀ ██        ▄     ▀██ ██   ▄█████   ██   ▀█████▄
    ██         ██ ██   ██     ███    ██▄    ▄ ██        ██     ██ ██  ██   ██   ██   █▄   ██
  ▄████▄     ▄████▄████▀██▄   ▄█      ▀█████▀████▄      █▀█████▀  ▀████████▀██▄ ▀██████████▀
                            ▄█                                                              
                          ██▀                                                               
  */

  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'PlayerWon',
    async listener(log) {
      try {
        console.log(`Player ${log} won!`)
        const player = log[0]?.args?.player?.toString();
        refetchGameState();
        refetchHallOfFame();
        refetchWinner();
        refetchRewards();
        setEvents(prevEvents => [...prevEvents, `+1: ${player}`]);

        // Send a POST request to the API route to update the database
        const response = await fetch('/api/update-wins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address: address }),
        });

        // Send a POST request to the API route to update the database for the gamestate
        setGetGameState("Ended");

        // If the passing player is the connected address, fetch the latest data for this address
        if (player === address) {
          refetchTotalWins();
          toast.success("You won! 🎉 Don't forget to claim your rewards!");
        }

      } catch (error) {
        console.error('Error updating wins', error);
      }
    },
  });

  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'SuccessfulPass',
    async listener(log) {
      try {
        console.log(`Successful pass by ${log}`);
        const player = log[0].args.player.toString();
        refetchPotatoTokenId();
        setEvents(prevEvents => [...prevEvents, `+1: ${player}`]);

        if (address === player) {
          toast.success("Pass Successful!");
          refetchSuccessfulPasses();
        }

        // Send a POST request to the API route to update the database
        const response = await fetch('/api/update-passes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address: address }),
        });

        const response2 = await fetch(`/api/get-player-data/${address}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log(`Successful pass data ${data}`);
        setPasses(data.passes);


      } catch (error) {
        console.error('Error updating successful passes', error);
      }
    },
  });

  /*
                                                                       ▄▄                   
  ▀███▀▀▀██▄           ██            ██               ▀████▄     ▄███▀ ██              ██   
    ██   ▀██▄          ██            ██                 ████    ████                   ██   
    ██   ▄██  ▄██▀██▄██████ ▄█▀██▄ ██████  ▄██▀██▄      █ ██   ▄█ ██ ▀███ ▀████████▄ ██████ 
    ███████  ██▀   ▀██ ██  ██   ██   ██   ██▀   ▀██     █  ██  █▀ ██   ██   ██    ██   ██   
    ██       ██     ██ ██   ▄█████   ██   ██     ██     █  ██▄█▀  ██   ██   ██    ██   ██   
    ██       ██▄   ▄██ ██  ██   ██   ██   ██▄   ▄██     █  ▀██▀   ██   ██   ██    ██   ██   
  ▄████▄      ▀█████▀  ▀████████▀██▄ ▀████ ▀█████▀    ▄███▄ ▀▀  ▄████▄████▄████  ████▄ ▀████
  */
  let mintResolve, mintReject;
  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'PotatoMinted',
    async listener(log) {
      try {
        const amount = parseInt(log[0].args.amount);
        setRoundMints(prevRoundMints => prevRoundMints + amount);
        refetchGetRoundMints();
        const player = log[0].args.player.toString();
        const amountDisplay = String(log[0].args.amount); //Need this one
        setEvents(prevEvents => [...prevEvents, `+${amountDisplay}: ${player}`]);

        if (address === player) {
          // Resolve our promise
          refetchGetActiveTokenCount();
          mintResolve();
        } else {
          mintReject();
        }

        const data = await response.json();
        console.log(data.message);

      } catch (error) {
        console.error('Error updating mints', error);
      }
    },
  });
  /*
                                                    ▄▄  
  ▀███▀▀▀██▄                                      ▀███  
    ██   ▀██▄                                       ██  
    ██   ▄██   ▄██▀██▄▀███  ▀███ ▀████████▄    ▄█▀▀███  
    ███████   ██▀   ▀██ ██    ██   ██    ██  ▄██    ██  
    ██  ██▄   ██     ██ ██    ██   ██    ██  ███    ██  
    ██   ▀██▄ ██▄   ▄██ ██    ██   ██    ██  ▀██    ██  
  ▄████▄ ▄███▄ ▀█████▀  ▀████▀███▄████  ████▄ ▀████▀███▄
  */
  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'NewRound',
    async listener(log) {
      try {
        console.log(log);
        console.log(`new round ${log[0]?.args?.round}`);
        const currentRound = String(log[0]?.args?.round);
        console.log(`round: ${currentRound}`);
        refetchCurrentGeneration();
      } catch (error) {
        console.error('Error updating mints', error);
      }// CACHE THIS DATA IN LOCAL STORAGE
    },
  });


  /*
               ▄▄                                   
  ███▀▀██▀▀███ ██                                   
  █▀   ██   ▀█                                      
       ██    ▀███ ▀████████▄█████▄   ▄▄█▀██▀███▄███ 
       ██      ██   ██    ██    ██  ▄█▀   ██ ██▀ ▀▀ 
       ██      ██   ██    ██    ██  ██▀▀▀▀▀▀ ██     
       ██      ██   ██    ██    ██  ██▄    ▄ ██     
     ▄████▄  ▄████▄████  ████  ████▄ ▀█████▀████▄   
  */

  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'UpdatedTimer',
    async listener(log) {
      try {
        const time = log[0].args.time.toString();
        console.log(`time: ${time}`);
        setRemainingTime(time);
        localStorage.setItem('remainingTime', time);
        setEvents(prevEvents => [...prevEvents, `+${time}`]);
      } catch (error) {
        console.error('Error updating timer', error);
      }
    },
  });

  /*
                              ▄▄                                                                                 
        ██              ██    ██                        ███▀▀██▀▀███        ▀███                                 
       ▄██▄             ██                              █▀   ██   ▀█          ██                                 
      ▄█▀██▄    ▄██▀████████▀███ ▀██▀   ▀██▀  ▄▄█▀██         ██      ▄██▀██▄  ██  ▄██▀  ▄▄█▀██▀████████▄  ▄██▀███
     ▄█  ▀██   ██▀  ██  ██    ██   ██   ▄█   ▄█▀   ██        ██     ██▀   ▀██ ██ ▄█    ▄█▀   ██ ██    ██  ██   ▀▀
     ████████  ██       ██    ██    ██ ▄█    ██▀▀▀▀▀▀        ██     ██     ██ ██▄██    ██▀▀▀▀▀▀ ██    ██  ▀█████▄
    █▀      ██ ██▄    ▄ ██    ██     ███     ██▄    ▄        ██     ██▄   ▄██ ██ ▀██▄  ██▄    ▄ ██    ██  █▄   ██
  ▄███▄   ▄████▄█████▀  ▀████████▄    █       ▀█████▀      ▄████▄    ▀█████▀▄████▄ ██▄▄ ▀█████▀████  ████▄██████▀
  */
  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'HandsActivated',
    async listener(log) {
      try {
        console.log(`Hands Activated, check ${log}`);
        const amount = log[0].args.count;
        setActiveTokens(amount);
        console.log(`Active Tokens Total: ${activeTokens}`);
        localStorage.setItem('activeTokens', amount);
      } catch (error) {
        console.error('Error updating timer', error);
      }
    },
  });


  /*
                                   ▄▄                   ▄▄                      
  ▀███▀▀▀███                     ▀███                   ██                      
    ██    ▀█                       ██                                           
    ██   █  ▀██▀   ▀██▀████████▄   ██   ▄██▀██▄ ▄██▀██████   ▄██▀██▄▀████████▄  
    ██████    ▀██ ▄█▀   ██   ▀██   ██  ██▀   ▀████   ▀▀ ██  ██▀   ▀██ ██    ██  
    ██   █  ▄   ███     ██    ██   ██  ██     ██▀█████▄ ██  ██     ██ ██    ██  
    ██     ▄█ ▄█▀ ██▄   ██   ▄██   ██  ██▄   ▄███▄   ██ ██  ██▄   ▄██ ██    ██  
  ▄████████████▄   ▄██▄ ██████▀  ▄████▄ ▀█████▀ ██████▀████▄ ▀█████▀▄████  ████▄
                        ██                                                      
                      ▄████▄
  */
  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'PotatoExploded',
    listener(log) {
      try {
        console.log(`potato exploded ${log}`)
        if (typeof log[0]?.args?.tokenId === 'bigint') {
          const tokenId_ = log[0].args.tokenId.toString();
          refetchGetExplosionTime();
          refetchGetActiveTokens();
          refetchPotatoTokenId();
          refetchGetActiveTokenCount();
          refetchUserHasPotatoToken();
          setEvents(prevEvents => [...prevEvents, `Potato Exploded: ${tokenId_}`]);
          setActiveTokens(prevactiveTokens => prevactiveTokens - 1);
        } else {
          console.error('TokenId is not a BigInt or is not found in log args', log);
        }
      } catch (error) {
        console.log(error)
      }
    },
  });

  /*
                                   
  ▀███▀▀▀██▄                       
    ██   ▀██▄                      
    ██   ▄██ ▄█▀██▄  ▄██▀███▄██▀███
    ███████ ██   ██  ██   ▀▀██   ▀▀
    ██       ▄█████  ▀█████▄▀█████▄
    ██      ██   ██  █▄   ███▄   ██
  ▄████▄    ▀████▀██▄██████▀██████▀                           
  */

  useContractEvent({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    eventName: 'PotatoPassed',
    listener(log) {
      try {
        console.log(`potato passed ${log}`)
        if (typeof log[0]?.args?.tokenIdFrom === 'bigint' && typeof log[0]?.args?.tokenIdTo === 'bigint') {
          const tokenIdFrom = log[0]?.args?.tokenIdFrom?.toString();
          const tokenIdTo = log[0]?.args?.tokenIdTo?.toString();
          const yielder = log[0]?.args?.yielder?.toString();
          console.log(`Potato Passed from: ${tokenIdFrom} to: ${tokenIdTo}! ${yielder} now has the potato`)
          setPotatoTokenId(tokenIdTo);
          setPotatoOwner(yielder);
          refetchUserHasPotatoToken();
          localStorage.setItem('_potatoTokenId', tokenIdTo);
          localStorage.setItem('potatoOwner', yielder);
          setEvents(prevEvents => [...prevEvents, `Potato Passed from: ${tokenIdFrom} to: ${tokenIdTo} ${yielder} now has the potato`]);
        } else {
          console.error('tokenIdFrom or tokenIdTo is not a BigInt or is not found in log args', log);
        }
      } catch (error) {
        console.log(error)
      }
    },
  });




  /*
   _______  ________  ______  _______       __    __  ______   ______  __    __  ______  
  |       \|        \/      \|       \     |  \  |  \/      \ /      \|  \  /  \/      \ 
  | ▓▓▓▓▓▓▓\ ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓\ ▓▓▓▓▓▓▓\    | ▓▓  | ▓▓  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\ ▓▓ /  ▓▓  ▓▓▓▓▓▓\
  | ▓▓__| ▓▓ ▓▓__   | ▓▓__| ▓▓ ▓▓  | ▓▓    | ▓▓__| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓/  ▓▓| ▓▓___\▓▓
  | ▓▓    ▓▓ ▓▓  \  | ▓▓    ▓▓ ▓▓  | ▓▓    | ▓▓    ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓  ▓▓  \▓▓    \ 
  | ▓▓▓▓▓▓▓\ ▓▓▓▓▓  | ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓    | ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓▓▓▓\  _\▓▓▓▓▓▓\
  | ▓▓  | ▓▓ ▓▓_____| ▓▓  | ▓▓ ▓▓__/ ▓▓    | ▓▓  | ▓▓ ▓▓__/ ▓▓ ▓▓__/ ▓▓ ▓▓ \▓▓\|  \__| ▓▓
  | ▓▓  | ▓▓ ▓▓     \ ▓▓  | ▓▓ ▓▓    ▓▓    | ▓▓  | ▓▓\▓▓    ▓▓\▓▓    ▓▓ ▓▓  \▓▓\\▓▓    ▓▓
   \▓▓   \▓▓\▓▓▓▓▓▓▓▓\▓▓   \▓▓\▓▓▓▓▓▓▓      \▓▓   \▓▓ \▓▓▓▓▓▓  \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓ 
  
  */



  // GET MINT PRICE
  const { data: getGameState, refetch: refetchGameState, isLoading: loadingGetGameState } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'getGameState',
    enabled: false,
  })

  // GET MINT PRICE
  const { data: getExplosionTime, isLoading: loadingExplosionTime, refetch: refetchGetExplosionTime } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'getExplosionTime',
    enabled: false,
  })
  const explosionTime = parseInt(getExplosionTime, 10);

  // GET MINT PRICE
  const { data: _price, isLoading: loadingPrice, refetch: refetchPrice } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: '_price',
    enabled: false,
  })
  const price = parseInt(_price, 10) / 10 ** 18;

  // GET NUMBER OF MINTS DURING THE ROUND
  const { data: getActiveTokenCount, isLoading: loadingActiveTokenCount, refetch: refetchGetActiveTokenCount } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'getActiveTokenCount',
    args: [address],
    enabled: false,
  })
  const activeTokensCount = parseInt(getActiveTokenCount, 10);

  // GET NUMBER OF MAX MINTS DURING THE ROUND
  const { data: _maxsupply, isLoading: loadingMaxSupply, refetch: refetchMaxSupply } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: '_maxsupplyPerRound',
    enabled: false,
  })
  const maxSupply = parseInt(_maxsupply, 10);

  // GET TOKENS OWNED BY USER
  const { data: userHasPotatoToken, isLoading: loadingHasPotato, refetch: refetchUserHasPotatoToken } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'userHasPotatoToken',
    args: [address],
    enabled: false,
  })
  const hasPotatoToken = userHasPotatoToken?.toString();

  // GET POTATO HOLDER
  const { data: getPotatoOwner, isLoading: loadingPotatoOwner, refetch: refetchGetPotatoOwner } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'getPotatoOwner',
    enabled: false,
  })
  const _potatoOwner = getPotatoOwner?.toString();

  // GET POTATO TOKEN ID
  const { data: potatoTokenId, isLoading: loadingPotatoTokenId, refetch: refetchPotatoTokenId } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'potatoTokenId',
    enabled: false,
  })

  const _potato_token = parseInt(potatoTokenId, 10)

  // GET ACTIVE TOKENS
  const { data: getActiveTokens, isLoading: loadingActiveTokens, refetch: refetchGetActiveTokens } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'getActiveTokens',
    enabled: false,
  })
  const _activeTokens = parseInt(getActiveTokens, 10);

  // GET CURRENT GENERATION
  const { data: currentGeneration, isLoading: loadingCurrentGeneration, refetch: refetchCurrentGeneration } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'currentGeneration',
    enabled: false,
  })
  const _currentGeneration = parseInt(currentGeneration, 10);

  const { data: getRoundMints, isLoading: loadingGetRoundMints, refetch: refetchGetRoundMints } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'roundMints',
    enabled: false,
  })
  const totalMints = parseInt(getRoundMints, 10);


  // GET IMAGES
  argsArray.map(tokenId => <TokenImage key={tokenId} tokenId={tokenId} ABI={ABI} />)

  const { data: balanceOf, isLoading: loadingBalance, refetch: refetchBalanceOf } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: false,
  })
  const _balanceOf = parseInt(balanceOf, 10);

  const { data: _owner, isLoading: loadingOwner, refetch: refetchowner } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: '_owner',
    enabled: true,
  })
  const _ownerAddress = _owner?.toString();

  const { data: getActiveTokenIds = [], isLoading: loadingActiveTokenIds, refetch: refetchGetActiveTokenIds } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'getActiveTokenIds',
    enabled: false,
  })

  const { data: allWinners, isLoading: loadingWinners, refetch: refetchWinner } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'getAllWinners',
    enabled: false,
  })
  const isWinner = allWinners?.includes(address)

  const { data: rewards, isLoading: loadingRewards, refetch: refetchRewards } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'rewards',
    args: [address],
    enabled: false,
  })
  const _rewards = parseInt(rewards, 10);

  const { data: _totalWins, isLoading: loadingTotalWins, refetch: refetchTotalWins } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'totalWins',
    args: [address],
    enabled: false,
  })
  const totalWins = parseInt(_totalWins, 10);


  const { data: _successfulPasses, isLoading: loadingSuccessfulPasses, refetch: refetchSuccessfulPasses } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'successfulPasses',
    args: [address],
    enabled: false,
  })
  const successfulPasses = parseInt(_totalWins, 10);

  const { data: hallOfFame, isLoading: loadingHGallOfFame, refetch: refetchHallOfFame } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'hallOfFame',
    args: [_currentGeneration],
    enabled: false,
  })
  const roundWinner = hallOfFame?.toString();

  const { data: _maxperwallet, isLoading: loadingMaxPerWallet, refetch: refetchMaxPerWallet } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: '_maxperwallet',
  })
  const maxPerWallet = parseInt(_maxperwallet, 10);

  const { data: isTokenActive, isLoading: loadingIsTokenActive, refetch: refetchIsTokenActive } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: '_isTokenActive',
    args: [tokenId],
    enabled: false,
  })

  const { data: ownerOf, isLoading: loadingOwnerOf, refetch: refetchOwnerOf } = useContractRead({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'ownerOf',
    args: [tokenId],
    enabled: false,
  })

  const { data: userBalance, isError, isLoading } = useBalance({
    address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  })
  const balance = parseInt(userBalance, 10);




  /*
   __       __ _______  ______ ________ ________      __    __  ______   ______  __    __  ______  
  |  \  _  |  \       \|      \        \        \    |  \  |  \/      \ /      \|  \  /  \/      \ 
  | ▓▓ / \ | ▓▓ ▓▓▓▓▓▓▓\\▓▓▓▓▓▓\▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓    | ▓▓  | ▓▓  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\ ▓▓ /  ▓▓  ▓▓▓▓▓▓\
  | ▓▓/  ▓\| ▓▓ ▓▓__| ▓▓ | ▓▓    | ▓▓  | ▓▓__        | ▓▓__| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓/  ▓▓| ▓▓___\▓▓
  | ▓▓  ▓▓▓\ ▓▓ ▓▓    ▓▓ | ▓▓    | ▓▓  | ▓▓  \       | ▓▓    ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓  ▓▓  \▓▓    \ 
  | ▓▓ ▓▓\▓▓\▓▓ ▓▓▓▓▓▓▓\ | ▓▓    | ▓▓  | ▓▓▓▓▓       | ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓▓▓▓\  _\▓▓▓▓▓▓\
  | ▓▓▓▓  \▓▓▓▓ ▓▓  | ▓▓_| ▓▓_   | ▓▓  | ▓▓_____     | ▓▓  | ▓▓ ▓▓__/ ▓▓ ▓▓__/ ▓▓ ▓▓ \▓▓\|  \__| ▓▓
  | ▓▓▓    \▓▓▓ ▓▓  | ▓▓   ▓▓ \  | ▓▓  | ▓▓     \    | ▓▓  | ▓▓\▓▓    ▓▓\▓▓    ▓▓ ▓▓  \▓▓\\▓▓    ▓▓
   \▓▓      \▓▓\▓▓   \▓▓\▓▓▓▓▓▓   \▓▓   \▓▓▓▓▓▓▓▓     \▓▓   \▓▓ \▓▓▓▓▓▓  \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓ 
  
  */

  // MINT HAND
  const { config } = usePrepareContractWrite({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'mintHand',
    args: [mintAmount.toString()],
    value: totalCost,
  })
  const { data: mintData, isSuccess, write: mint } = useContractWrite(config)



  // PASS POTATO
  const { config: configPass } = usePrepareContractWrite({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'passPotato',
    args: [tokenId],
  })
  const { data: passData, isSuccess: Successful, write: pass } = useContractWrite(configPass)

  // CLAIM REWARDS
  const { config: withdrawWinnersFunds } = usePrepareContractWrite({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'withdrawWinnersFunds',
  })
  const { data: claimRewardsData, isSuccess: claimRewardsSuccessful, write: claimRewards } = useContractWrite(withdrawWinnersFunds)


  // CHECK EXPLOSION
  const { config: configCheck } = usePrepareContractWrite({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'checkExplosion',
  })
  const { data: checkData, isSuccess: CheckSuccessful, write: check } = useContractWrite(configCheck)


  /*
      ______  __       __ __    __ ________ _______       __    __  ______   ______  __    __  ______  
   /      \|  \  _  |  \  \  |  \        \       \     |  \  |  \/      \ /      \|  \  /  \/      \ 
  |  ▓▓▓▓▓▓\ ▓▓ / \ | ▓▓ ▓▓\ | ▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓\    | ▓▓  | ▓▓  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\ ▓▓ /  ▓▓  ▓▓▓▓▓▓\
  | ▓▓  | ▓▓ ▓▓/  ▓\| ▓▓ ▓▓▓\| ▓▓ ▓▓__   | ▓▓__| ▓▓    | ▓▓__| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓/  ▓▓| ▓▓___\▓▓
  | ▓▓  | ▓▓ ▓▓  ▓▓▓\ ▓▓ ▓▓▓▓\ ▓▓ ▓▓  \  | ▓▓    ▓▓    | ▓▓    ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓  ▓▓  \▓▓    \ 
  | ▓▓  | ▓▓ ▓▓ ▓▓\▓▓\▓▓ ▓▓\▓▓ ▓▓ ▓▓▓▓▓  | ▓▓▓▓▓▓▓\    | ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓▓▓▓\  _\▓▓▓▓▓▓\
  | ▓▓__/ ▓▓ ▓▓▓▓  \▓▓▓▓ ▓▓ \▓▓▓▓ ▓▓_____| ▓▓  | ▓▓    | ▓▓  | ▓▓ ▓▓__/ ▓▓ ▓▓__/ ▓▓ ▓▓ \▓▓\|  \__| ▓▓
   \▓▓    ▓▓ ▓▓▓    \▓▓▓ ▓▓  \▓▓▓ ▓▓     \ ▓▓  | ▓▓    | ▓▓  | ▓▓\▓▓    ▓▓\▓▓    ▓▓ ▓▓  \▓▓\\▓▓    ▓▓
    \▓▓▓▓▓▓ \▓▓      \▓▓\▓▓   \▓▓\▓▓▓▓▓▓▓▓\▓▓   \▓▓     \▓▓   \▓▓ \▓▓▓▓▓▓  \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓ 
                                                                                                
  */
  // START GAME
  const { config: startGame } = usePrepareContractWrite({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'startGame',
  })
  const { data: startGameData, isSuccess: started, write: _startGame } = useContractWrite(startGame)

  // END MINTING
  const { config: endMinting } = usePrepareContractWrite({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'endMinting',
  })
  const { data: endMintingData, isSuccess: ended, write: _endMint } = useContractWrite(endMinting)

  // PAUSE GAME
  const { config: pauseGame } = usePrepareContractWrite({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'pauseGame',
  })
  const { data: pauseGameData, isSuccess: pasued, write: _pauseGame } = useContractWrite(pauseGame)

  // RESUME GAME
  const { config: resumeGame } = usePrepareContractWrite({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'resumeGame',
  })
  const { data: resumeGameData, isSuccess: resumed, write: _resumeGame } = useContractWrite(resumeGame)

  // RESTART GAME 
  const { config: restartGame } = usePrepareContractWrite({
    address: '0x9826FdE8E13C4Dec926A0CB2FC537DD6828343d0',
    abi: ABI,
    functionName: 'restartGame',
  })
  const { data: restartGameData, isSuccess: restarted, write: _restartGame } = useContractWrite(restartGame)

  /*
                                            
  ███▀▀██▀▀███                         ██   
  █▀   ██   ▀█                         ██   
       ██      ▄██▀██▄ ▄█▀██▄  ▄██▀████████ 
       ██     ██▀   ▀███   ██  ██   ▀▀ ██   
       ██     ██     ██▄█████  ▀█████▄ ██   
       ██     ██▄   ▄███   ██  █▄   ██ ██   
     ▄████▄    ▀█████▀▀████▀██▄██████▀ ▀████                                     
  */

  function noAddressToast() {
    toast.info("Please Connect to Interact")
  }

  function startToast() {
    toast.error("Must Restart Game to Start Again")
  }

  function endToast() {
    toast.error("Minting Already Ended")
  }

  function pauseToast() {
    toast.error("Game Already Paused")
  }

  function resumeToast() {
    toast.error("Game Already Resumed")
  }

  function restartToast() {
    toast.error("Game Already Restarted")
  }

  function onlyNumbersToast() {
    toast.info("Only Numbers Allowed")
  }

  function cannotPassToast() {
    toast.error("The Game Has not started yet")
  }

  function ownThePotatoToast() {
    toast.error("You have to own the Potato to pass it")
  }

  function noEnoughFundsToast() {
    toast.error("You do not have enough funds to mint")
  }

  function cannotPassToSelfToast() {
    toast.error("You cannot pass the Potato to yourself")
  }

  function gameFullToast() {
    toast.error("The Round is already Full")
  }

  function tokenInactiveToast() {
    toast.error("The token you tried to pass to is inactive")
  }

  function maxPerWalletToast() {
    toast.error(`You can only mint ${maxPerWallet} Potato per round`);
  }

  function mintOneToast() {
    toast.info("Mint at least 1 to play");
  }

  function hasMoreTimeToast() {
    toast.warn("There is still time left to pass the Potato");
  }

  function noRewardsToast() {
    toast.warn("You have no rewards to claim");
  }


  /* 
   __    __  ______  __    __ _______  __       ________ _______   ______  
  |  \  |  \/      \|  \  |  \       \|  \     |        \       \ /      \ 
  | ▓▓  | ▓▓  ▓▓▓▓▓▓\ ▓▓\ | ▓▓ ▓▓▓▓▓▓▓\ ▓▓     | ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓\  ▓▓▓▓▓▓\
  | ▓▓__| ▓▓ ▓▓__| ▓▓ ▓▓▓\| ▓▓ ▓▓  | ▓▓ ▓▓     | ▓▓__   | ▓▓__| ▓▓ ▓▓___\▓▓
  | ▓▓    ▓▓ ▓▓    ▓▓ ▓▓▓▓\ ▓▓ ▓▓  | ▓▓ ▓▓     | ▓▓  \  | ▓▓    ▓▓\▓▓    \ 
  | ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓\▓▓ ▓▓ ▓▓  | ▓▓ ▓▓     | ▓▓▓▓▓  | ▓▓▓▓▓▓▓\_\▓▓▓▓▓▓\
  | ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓ \▓▓▓▓ ▓▓__/ ▓▓ ▓▓_____| ▓▓_____| ▓▓  | ▓▓  \__| ▓▓
  | ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓  \▓▓▓ ▓▓    ▓▓ ▓▓     \ ▓▓     \ ▓▓  | ▓▓\▓▓    ▓▓
   \▓▓   \▓▓\▓▓   \▓▓\▓▓   \▓▓\▓▓▓▓▓▓▓ \▓▓▓▓▓▓▓▓\▓▓▓▓▓▓▓▓\▓▓   \▓▓ \▓▓▓▓▓▓ 
                                                                                               
  */

  const handleStartGame = () => {
    if (!address) {
      noAddressToast();
    } else if (getGameState !== "Queued") {
      startToast();
    } else {
      _startGame?.();
    }
  }

  const handleEndMinting = () => {
    if (!address) {
      noAddressToast();
    } else if (getGameState !== "Minting") {
      endToast();
    } else {
      _endMint?.();
    }
  }

  const handlePauseGame = () => {
    if (!address) {
      noAddressToast();
    } else if (getGameState !== "Playing" && getGameState !== "Final Round" && getGameState !== "Minting") {
      pauseToast();
    } else {
      _pauseGame?.();
    }
  }

  const handleResumeGame = () => {
    if (!address) {
      resumeToast()
    } else if (getGameState !== "Paused") {
      resumeToast()
    } else {
      _resumeGame?.();
    }
  }

  const handleRestartGame = () => {
    try {
      if (!address) {
        noAddressToast();
      } else if (getGameState !== "Ended" && getGameState !== "Paused" && getGameState !== "Queued") {
        restartToast();
      } else {
        _restartGame?.();
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleClaimReward = () => {
    if (!address) {
      noAddressToast();
    } else if (_rewards == 0) {
      noRewardsToast();
    }
    else {
      claimRewards?.();
      refetchRewards();
    }
  }

  const allActivetokenIds = () => {
    let activeIds = [];
    for (let i = 1; i < 1000; i++) {
      if (getActiveTokenIds[i] === undefined) { break; }
      activeIds.push(getActiveTokenIds[i]?.toString());
    }
    return activeIds;
  }
  const activeIds = allActivetokenIds();

  const handlePass = () => {
    if (!address) {
      noAddressToast();
    } else if (getGameState !== "Playing" && getGameState !== "Final Round") {
      cannotPassToast();
    } else if (!userHasPotatoToken) {
      ownThePotatoToast();
    } else if (!isTokenActive) {
      tokenInactiveToast();
    } else if (address == ownerOf) {
      cannotPassToSelfToast();
    } else {
      toast.promise(
        pass?.(), // Assuming this returns a promise
        {
          pending: {
            render() {
              return 'Passing...'
            },
            icon: false
          },
          success: {
            render() {
              return 'Pass Successful!'
            },
            icon: '🟢',
          },
          error: {
            render({ data }) {
              return `Passing failed! Error: ${data.message}`
            }
          }
        }
      );
    }
  };

  const handleInputChangeToken = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    if (numericValue !== inputValue) {
      onlyNumbersToast();
    }
    else if (inputValue === "") {
      setTokenId("");
    }
    else if (inputValue !== "") {
      const _tokenId = parseInt(inputValue);
      setTokenId(_tokenId);
    }
  }

  const handleMint = () => {
    if (!address) {
      noAddressToast();
    } else if (balance < totalCost) {
      console.log(`balance, totalCost: ${balance}, ${totalCost}`);
      noEnoughFundsToast();
    } else if (mintAmount > (maxSupply - _roundMints)) {
      gameFullToast();
    } else if (mintAmount === 0) {
      mintOneToast();
    } else if (activeTokensCount + parseInt(mintAmount) > maxPerWallet) {
      maxPerWalletToast();
    } else {
      console.log(`balance, totalCost: ${balance?.formatted}, ${totalCost}`);
      mint?.();
      const resolveMint = new Promise((resolve => setTimeout(resolve, 10000)));
      toast.promise(
        resolveMint,
        {
          pending: 'Minting...',
          success: 'Mint Successful!',
          error: 'An error occurred while minting!'
        }
      );
    }
  };

  const handleInputChangeMint = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    if (numericValue !== inputValue) {
      onlyNumbersToast();
    } else if (inputValue === "") {
      setMintAmount("");
      setTotalCost("0");
    } else if (inputValue !== "") {
      const newMintAmount = numericValue; // Keep newMintAmount as a string for UI
      setMintAmount(newMintAmount);
      const totalCostBigInt = BigInt(_price) * BigInt(newMintAmount);
      console.log(`BigIntPrice ${BigInt(_price)}`);
      console.log(`BigIntMintAmount ${BigInt(newMintAmount)}`);
      setTotalCost(totalCostBigInt.toString()); // Convert back to string for UI
    }
  }

  const handlecheck = () => {
    if (!address) {
      noAddressToast();
    } else if (parseInt(remainingTime, 10) !== 0) {
      console.log(`Remaining time: ${remainingTime}`)
      hasMoreTimeToast();
    } else {
      check?.();
    }

  };

  const fetchPlayerData = useCallback(async () => {
    try {
      const response = await fetch('/api/get-player-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: address }),
      });

      const data = await response.json();
      console.log(data);

    } catch (error) {
      console.error('Error fetching player data', error);
    }
  }, [address]);


  async function getPreviousGameState() {
    try {
      const response = await fetch('/api/get-previous-game-state');
      const data = await response.json();
      if (data && data.previous) {
        console.log(`Previous game state found ${data.previous}`);
        return data?.previous;
      } else {
        console.error("No previous game state found");
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function fetchGameStateAndMore() {
    // Fetch the game state
    fetch('/api/get-game-state')
      .then(response => response.json())
      .then(data => {
        setGetGameState(data.current);
      })
      .catch(error => console.error(error));
  }




  /* 
   _______  ________ ________ _______  ________  ______  __    __ 
  |       \|        \        \       \|        \/      \|  \  |  \
  | ▓▓▓▓▓▓▓\ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓\ ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓\ ▓▓  | ▓▓
  | ▓▓__| ▓▓ ▓▓__   | ▓▓__   | ▓▓__| ▓▓ ▓▓__   | ▓▓___\▓▓ ▓▓__| ▓▓
  | ▓▓    ▓▓ ▓▓  \  | ▓▓  \  | ▓▓    ▓▓ ▓▓  \   \▓▓    \| ▓▓    ▓▓
  | ▓▓▓▓▓▓▓\ ▓▓▓▓▓  | ▓▓▓▓▓  | ▓▓▓▓▓▓▓\ ▓▓▓▓▓   _\▓▓▓▓▓▓\ ▓▓▓▓▓▓▓▓
  | ▓▓  | ▓▓ ▓▓_____| ▓▓     | ▓▓  | ▓▓ ▓▓_____|  \__| ▓▓ ▓▓  | ▓▓
  | ▓▓  | ▓▓ ▓▓     \ ▓▓     | ▓▓  | ▓▓ ▓▓     \\▓▓    ▓▓ ▓▓  | ▓▓
   \▓▓   \▓▓\▓▓▓▓▓▓▓▓\▓▓      \▓▓   \▓▓\▓▓▓▓▓▓▓▓ \▓▓▓▓▓▓ \▓▓   \▓▓
                                                                 
  */
  // EVENT LISTENERS

  // DARK MODE
  useEffect(() => {
    const localDarkMode = window.localStorage.getItem('darkMode');
    if (localDarkMode) {
      setDarkMode(JSON.parse(localDarkMode));
    }

    const intervalId = setInterval(() => {
      const divElement = divRef.current;
      divElement.scrollLeft = divElement.scrollWidth;
      console.log("An UNKNOWN PRODUCTION");
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [events]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      window.localStorage.setItem('darkMode', darkMode);
    }
  }, [darkMode]);

  //On Mount
  useEffect(() => {
    setMaxMintAmount(maxPerWallet);
    refetchPotatoTokenId();
    refetchGameState();
    refetchGetActiveTokenCount();
    refetchGetRoundMints();
    refetchGetActiveTokens();
    refetchUserHasPotatoToken();
    refetchHallOfFame();
    refetchTotalWins();
    refetchCurrentGeneration();
    refetchSuccessfulPasses();
    refetchMaxSupply();
    refetchPrice();
    if (address == _ownerAddress) {
      refetchowner();
    }
    console.log(`owner: ${_ownerAddress}`);
    console.log(`address: ${address}`);
    const roundMints = parseInt(getRoundMints, 10);
    if (!isNaN(roundMints)) {
      setRoundMints(roundMints);
    }
  }, []);

  useEffect(() => {
    if (roundWinner === undefined) {
      refetchHallOfFame();
      console.log("Hall of Fame refetched");
    }
    if (roundWinner === null) {
      refetchHallOfFame();
    }
  }, [roundWinner, refetchHallOfFame]);


  //GAME STATE
  useEffect(() => {

    if (!isNaN(_potatoTokenId)) {
      const localPotatoTokenId = localStorage.getItem('_potatoTokenId');
      if (!localPotatoTokenId) {
        const getPotatoTokenId = parseInt(potatoTokenId, 10);
        console.log(`Potato Token ID: ${getPotatoTokenId}`)
        setPotatoTokenId(getPotatoTokenId);
      } else {
        setPotatoTokenId(localPotatoTokenId);
      }
    }

  }, [_potatoTokenId, potatoTokenId]);

  useEffect(() => {
    // Retrieve remainingTime from localStorage when the component mounts
    const time = localStorage.getItem('remainingTime');
    if (time) {
      setRemainingTime(time);
    } else if (time == null) {
      setRemainingTime(explosionTime);
    }

    let timer;

    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime > 0) {
            const newTime = prevTime - 1;
            localStorage.setItem('remainingTime', newTime.toString());  // Update time in localStorage
            return newTime;
          } else {
            clearInterval(timer);
            localStorage.removeItem('remainingTime');  // Clear time from localStorage
            return 0;
          }
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [remainingTime, explosionTime]);
  /*
   __    __ ________ __       __ __             ______   ______   ______  
  |  \  |  \        \  \     /  \  \           /      \ /      \ /      \ 
  | ▓▓  | ▓▓\▓▓▓▓▓▓▓▓ ▓▓\   /  ▓▓ ▓▓          |  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\
  | ▓▓__| ▓▓  | ▓▓  | ▓▓▓\ /  ▓▓▓ ▓▓          | ▓▓   \▓▓ ▓▓___\▓▓ ▓▓___\▓▓
  | ▓▓    ▓▓  | ▓▓  | ▓▓▓▓\  ▓▓▓▓ ▓▓          | ▓▓      \▓▓    \ \▓▓    \ 
  | ▓▓▓▓▓▓▓▓  | ▓▓  | ▓▓\▓▓ ▓▓ ▓▓ ▓▓          | ▓▓   __ _\▓▓▓▓▓▓\_\▓▓▓▓▓▓\
  | ▓▓  | ▓▓  | ▓▓  | ▓▓ \▓▓▓| ▓▓ ▓▓_____     | ▓▓__/  \  \__| ▓▓  \__| ▓▓
  | ▓▓  | ▓▓  | ▓▓  | ▓▓  \▓ | ▓▓ ▓▓     \     \▓▓    ▓▓\▓▓    ▓▓\▓▓    ▓▓
   \▓▓   \▓▓   \▓▓   \▓▓      \▓▓\▓▓▓▓▓▓▓▓      \▓▓▓▓▓▓  \▓▓▓▓▓▓  \▓▓▓▓▓▓ 
                                                                     
  */

  return (
    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hodl, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <div className={`${darkMode ? 'bg-gradient-to-br from-amber-800 via-red-800 to-black text-white min-h-screen font-darumadrop' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 min-h-screen font-darumadrop'}`}>
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={
            darkMode ? 'dark' : 'light'
          }
        />
        <nav className="py-2 pt-10 px-5 md:px-10 flex justify-between items-center relative z-20">
          <Link href='/'>
            <Image src={blacklogo} width={150} alt="Logo" />
          </Link>
          <div className="lg:hidden xl:hidden 2xl:hidden 3xl:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-white hover:border-white">
              <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v15z" /></svg>
            </button>
            <div className={`fixed inset-0 flex justify-center items-center  bg-black bg-opacity-50 ${isOpen ? '' : 'hidden'}`}
              onClick={(e) => {
                if (!menuRef.current.contains(e.target)) {
                  setIsOpen(false)
                }
              }}>
              <ul ref={menuRef} className={`${darkMode ? 'bg-gray-700 text-white items-center p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl' : 'items-center bg-white p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl text-black'}`}>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="/play">Play</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="/leaderboard">Leaderboard</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://app.gitbook.com" target="_blank">Docs</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://opensea.io" target="_blank">Opensea</Link></li>
                <DarkModeSwitch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  size={30}
                />
                <Web3Button className='text-white bg-slate-800 p-2 rounded-lg' />
              </ul>
            </div>
          </div>
          <ul className='flex md:hidden sm:hidden space-x-12 md:space-x-12 text-xl md:text-2xl'>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/play">Play</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/leaderboard">Leaderboard</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://app.gitbook.com" target="_blank">Docs</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://opensea.io" target="_blank">Opensea</Link></li>
          </ul>
          <div className='flex gap-2 items-center sm:hidden md:hidden'>
            <DarkModeSwitch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              size={30}
            />
            <Web3Button className='text-white bg-slate-800 p-2 rounded-lg' />
          </div>
        </nav>

        <div className="p-4 sm:flex sm:flex-col md:flex md:flex-col grid grid-cols-8 gap-4 justify-center items-center">
          {!getGameState && (
            <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/5  hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={fetchGameStateAndMore}>Refresh Data</button>
          )}
          <div className={`${darkMode ? 'w-full col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-full col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`}>
            <h1 className={`${darkMode ? 'text-3xl md:text-4xl lg:text-5xl text-center font-bold mb-4' : "text-3xl md:text-4xl lg:text-5xl text-center font-bold mb-4"}`}>Hodl, Pass, Survive...</h1>
            <h2 className={`${darkMode ? 'text-xl font-bold mb-2 text-center' : "text-xl font-bold mb-2 text-center"}`}>

              Game State: {getGameState}
            </h2>
            {getGameState == "Minting" ?
              null :
              _currentGeneration == 0 ?
                null :
                <h2 className={`${darkMode ? 'text-xl text-center' : "text-xl text-center"}`}>
                  Round {_currentGeneration}
                </h2>
            }

          </div>
          <div className={`w-full flex flex-col justify-center items-center col-start-1 col-end-3 md:w-2/3 lg:w-1/2 shadow rounded-xl p-4 mb-8 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
            {!address ?
              <>
                <>
                  <h1 className={`text-4xl font-extrabold underline text-center text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'}`}>Connect First</h1>
                  <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Connect your wallet to view this page! Hope you join the fun soon...</h3>
                  <Image alt='Image' src={potato} width={200} height={200} />
                  {isWinner && _rewards != 0 &&
                    <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>

                  }
                </>
              </> :
              getGameState == "Playing" || getGameState == "Final Round" ?
                <>
                  <h2 className={`text-xl font-bold underline mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Statistics:</h2>
                  <p className={`text-sm text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Successful Passes: {!successfulPasses ? "Loading..." : passes}
                  </p>
                  <p className={`text-sm text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Total Wins: {!totalWins ? "Loading..." : wins}
                  </p>
                  {isWinner && _rewards != 0 &&
                    <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>

                  }
                </>
                : getGameState == "Queued" ?
                  <>
                    <Image alt='Image' src={potato} width={200} height={200} className='self-center' />
                    {isWinner && _rewards != 0 &&
                      <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>
                    }
                  </>
                  : getGameState == "Paused" ?
                    <>
                      <Image alt='Image' src={potato} width={200} height={200} />
                      {isWinner && _rewards != 0 &&
                        <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>
                      }
                    </>
                    : getGameState == "Minting" ?
                      <>
                        <h1 className={`text-3xl text-center font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Welcome to the oven!</h1>
                        <p className={`text-sm text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Ready up because this is about to get heated...</p>
                        <p className={`text-sm text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>mint now or cry later?</p>
                        <p className={`text-sm text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Got Heat?</p>
                        <div className='flex flex-row justify-center'>
                          <Image alt='Image' src={potato} width={100} height={200} />
                          <Image alt='Image' src={potato} width={100} height={200} />
                          <Image alt='Image' src={potato} width={100} height={200} />
                        </div>
                        {isWinner && _rewards != 0 &&
                          <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>
                        }
                      </>
                      : getGameState == "Ended" &&
                      <>
                        <Image alt='Image' src={potato} width={200} height={200} />
                        {isWinner && _rewards != 0 &&
                          <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>

                        }
                      </>
            }
          </div>

          <div className={`w-full flex flex-col justify-center items-center col-start-3 col-span-4 md:w-2/3 lg:w-1/2 shadow-lg rounded-xl p-6 mb-8 transition-transform duration-500 ease-in-out transform hover:scale-105 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
            {getGameState == "Playing" || getGameState == "Final Round" ?
              <>
                <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'}`}>
                  {loadingPotatoTokenId ? "Loading..." : `Token #${_potato_token} has the potato`}
                </h1>
                <p className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                  <span>
                    {loadingPotatoOwner ? "Loading..." :
                      <Link className='animate-pulse underline' href={`https://mumbai.polygonscan.com/address/${potatoOwner}`} target='_blank'>
                        Potato Holder
                      </Link>
                    }
                  </span>
                </p>
                <h2 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                  {loadingExplosionTime ? "Loading..." : `TIME REMAINING: ${remainingTime}`}
                </h2>
                <Image alt='Image' src={potato} width={200} height={200} />
                <button className={`mt-4 w-1/2 ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'} text-white px-4 py-3 rounded-lg shadow-lg text-lg font-bold transition-all duration-500 ease-in-out transform hover:scale-110`}
                  onClick={handlecheck}>
                  CHECK EXPLOSION
                </button>
                {loadingActiveTokens ? (
                  <p className={`text-xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</p>
                ) : (
                  <p className={`text-xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>{_activeTokens} Hands Remaining</p>)
                }
                <Link href="https://mumbai.polygonscan.com/" target='_blank' className="underline">
                  Smart Contract
                </Link>
              </>
              : getGameState == "Queued" ? (
                <>
                  <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'}`}>Round starting soon</h1>
                  <h3 className={`text-xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>The game is currently Queued, Come back soon for some sizzlin fun!</h3>
                  <Image alt='Image' src={potato} width={200} height={200} />
                  <div className='grid grid-cols-3 justify-center gap-4'>
                    <Link href="https://mumbai.polygonscan.com/" target='_blank' className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`}>
                      Discord
                    </Link>
                    <Link href="https://twitter.com" className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`}>Smart Contract</Link>
                    <Link className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`} href="https://app.gitbook.com">Twitter</Link>
                  </div>
                </>
              ) :
                getGameState == "Paused" ? (
                  <>
                    <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'}`}>Game Paused</h1>
                    <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>The game is currently paused. Please wait for further updates.</h3>
                    <Image alt='Image' src={potato} width={200} height={200} />
                    {loadingActiveTokens ? (
                      <p className={`text-xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</p>
                    ) : (
                      <p className={`text-xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>{activeTokens} Active Tokens Remaing</p>)
                    }
                    <Link href="https://mumbai.polygonscan.com/" target='_blank' className='underline'>
                      Smart Contract
                    </Link>
                  </>
                ) :
                  getGameState == "Ended" ? (
                    <>
                      <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'}`}>Game Ended</h1>
                      <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Thank you for participating. See you in the next game!</h3>
                      <Image alt='Image' src={potato} width={200} height={200} />
                      <h2 className={`text-xl text-center ${darkMode ? 'text-white' : 'text-black'}`}>And congratulations to our Winner:</h2>
                      {roundWinner === undefined ? (
                        <h1
                          className={`text-2xl sm:text-xs lg:text-base xl:text-base md:text-base font-extrabold underline text-center text-transparent bg-clip-text animate-pulse ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'}`}
                        >
                          Loading...
                        </h1>) : (
                        <Link
                          href={`https://mumbai.polygonscan.com/address/${roundWinner}`}
                          target='_blank'
                          className={`text-2xl sm:text-xs lg:text-base xl:text-base md:text-base font-extrabold underline text-center text-transparent bg-clip-text animate-pulse ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'}`}
                        >
                          {roundWinner}
                        </Link>
                      )
                      }
                    </>
                  ) :
                    getGameState == "Minting" && (
                      <>
                        <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'}`}>Jump in the Heat</h1>
                        {loadingCurrentGeneration ? (
                          <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</h3>
                        ) : (
                          <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Round {_currentGeneration}</h3>
                        )}

                        {loadingPrice ? (
                          <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>PRICE: Loading...</p>
                        ) : (
                          <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>PRICE: <span className={`text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'}`}>{price}</span> MATIC</p>
                        )}

                        {loadingMaxPerWallet ? (
                          <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>MAX PER WALLET: Loading...</p>
                        ) : (
                          <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>MAX PER WALLET: <span className={`text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'}`}>{maxPerWallet}</span></p>
                        )}


                        {address ?
                          <>
                            <input className="mt-4 w-3/4 bg-white hover:bg-gray-300 text-black px-4 py-2 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-500 ease-in-out transform hover:scale-105"
                              type="text"
                              value={mintAmount}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              onChange={handleInputChangeMint}
                              placeholder="Enter mint amount" />
                            <button className={`mt-4 w-1/2 ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white px-4 py-3 rounded-lg shadow-lg text-lg font-bold transition-all duration-500 ease-in-out transform hover:scale-110`}
                              onClick={handleMint}
                            >Join Round!</button>
                            <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>{totalMints}/{loadingMaxSupply ? 'Loading Max Supply...' : maxSupply} MINTED</p>
                          </>
                          :
                          <>
                            <p className={`text-3xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>{totalMints}/{loadingMaxSupply ? 'Loading Max Supply...' : maxSupply} MINTED</p>
                            <p1 className={`text-2xl md:text-xl lg:text-3xl text-center font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                              Connect first to join the fun!
                            </p1>
                          </>
                        }
                        <Link href="https://mumbai.polygonscan.com/" target='_blank' className='underline'>
                          Smart Contract
                        </Link>
                      </>

                    )}
            {/* Content when address does not exist */}
          </div>

          <div className={`w-full flex flex-col justify-center items-center p-4 mb-8 col-end-9 col-span-2  md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-black' : 'bg-white'} shadow rounded-xl`}>
            {!address ?
              <>
                <h1 className={`text-4xl font-extrabold underline text-center text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'}`}>Connect First</h1>
                <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>You must connect your wallet to view this page! Hope you join the fun soon...</h3>
                <Image alt='Image' src={potato} width={200} height={200} />
              </> :
              getGameState == "Playing" || getGameState == "Final Round" ?
                <>
                  <h1 className={`text-xl font-bold mb-2 underline ${darkMode ? 'text-white' : 'text-black'}`}>Your Tokens:</h1>
                  {loadingActiveTokenCount ? (
                    <h2 className="text-center font-bold mb-2">Loading Active Token(s)...</h2>
                  ) : isNaN(activeTokensCount) || activeTokensCount === 0 ? (
                    <h2 className={`text-base font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Active Token(s): 0</h2>
                  ) : (
                    <h2 className={`text-base font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Active Token(s): {activeTokensCount}</h2>
                  )}
                  {loadingHasPotato ? (
                    <h2 className="text-center font-bold mb-2">Loading Has Potato...</h2>
                  ) : (
                    <h2 className={`text-base font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Has Potato: {hasPotatoToken}</h2>
                  )}
                  <p className={`text-sm text-center ${darkMode ? 'text-white' : 'text-black'}`}>You can pass the potato if you are currently holding it.</p>
                  <div className="grid grid-rows-2 place-items-center justify-center items center">
                    <input className="mt-4 w-1/2  bg-white hover:bg-gray-300 text-black px-4 py-2 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-500 ease-in-out transform hover:scale-105"
                      type="text"
                      value={tokenId}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onChange={handleInputChangeToken}
                      placeholder="tokenId" />
                    <button className={`mt-4 w-full ${darkMode ? 'bg-gray-800 hover:hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow`}
                      onClick={handlePass}
                    >Pass Potato</button>
                  </div>
                </>
                : getGameState == "Queued" ?
                  <>
                    <Image alt='Image' src={potato} width={200} height={200} className='self-center' />
                    {isWinner && _rewards != 0 &&
                      <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>
                    }
                  </>
                  : getGameState == "Minting" ?
                    <>
                      <Image alt='Image' src={potato} width={200} height={200} />
                      <h3 className={`text-xl text-center ${darkMode ? 'text-white' : 'text-black'}`}>
                        I have 
                        <span className='font-extrabold underline text-center text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'>
                          {loadingActiveTokenCount ? ' Loading...' : isNaN(activeTokensCount) || activeTokensCount === 0 ? ` 0` : ` ${activeTokensCount} `}
                        </span>
                        {loadingActiveTokenCount ? '' : isNaN(activeTokensCount) || activeTokensCount === 1  ? ' pair' : ' pairs'} of hands to handle the heat this round
                      </h3>

                      <p className={`text-sm text-center ${darkMode ? 'text-white' : 'text-black'}`}>Pass the heat to your friends and family!!</p>
                      <div className="grid grid-rows-2 place-items-center justify-center items center">
                        <button
                          className={`mt-4 w-full ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow`}
                          onClick={() => {
                            const imageUrl = 'https://your-website.com/your-image.jpg'; // Replace with your image URL
                            const tweetText = `I have ${activeTokensCount} ${activeTokensCount === 1 ? 'pair' : 'pairs'} of hands to handle the heat this round!! Are you ready to pass the heat? Check out @0xHotPotato_ for more information on the project! #OnChainHotPotato`;
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                          }}
                        >
                          Tweet it!
                        </button>
                      </div>
                    </>
                    : getGameState == "Paused" ?
                      <>
                        <Image alt='Image' src={potato} width={200} height={200} />
                        {isWinner && _rewards != 0 &&
                          <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>
                        }                      </>
                      : getGameState == "Ended" &&
                      <>
                        <Image alt='Image' src={potato} width={200} height={200} />
                        {isWinner && _rewards != 0 &&
                          <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>
                        }                      </>
            }
          </div>


          <div
            ref={divRef}
            className={`hide-scrollbar w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-black' : 'bg-white'} shadow rounded-md overflow-x-auto`}
          >
            <div className="whitespace-nowrap h-full flex items-center space-x-4 pl-4">
              {events.map((event, index) => (
                <div key={index} className={darkMode ? 'text-white' : 'text-black'}>
                  {event}
                </div>
              ))}
            </div>
          </div>


          {getGameState !== 'Minting' && getGameState !== 'Queued' && loadingActiveTokenIds ? (
            <div className="text-center">
              <h1>Loading...</h1>
            </div>
          ) : (
            getGameState === 'Playing' || getGameState === 'Final Round' || getGameState === 'Paused' ? (
              <div className={`p-4 col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-black' : 'bg-white'} shadow rounded-md`}>
                <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'}`}>Active Tokens:</h1>
                <div className={`grid grid-cols-8 sm:grid-cols-4 md:grid-cols-4 gap-4 justify-center items-center`}>
                  {activeIds.map((tokenId, index) => (
                    <div key={index} className="border rounded-lg p-2 text-center justify-center items-center flex flex-col">
                      <TokenImage tokenId={tokenId} ABI={ABI} potatoTokenId={_potatoTokenId} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}



          {address === _ownerAddress &&
            <div className={`w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow rounded-xl overflow-x-auto`}>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 sm:grid-cols-3 gap-4">
                <button
                  className={`bg-black hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white rounded-lg px-4 py-3 md:col-span-3 sm:col-span-3`}
                  onClick={handleStartGame}
                >
                  Start Game
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white rounded-lg px-4 py-2 md:col-span-3 sm:col-span-3"
                  onClick={handleEndMinting}
                >
                  End Minting
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white rounded-lg px-4 py-2"
                  onClick={handlePauseGame}
                >
                  Pause Game
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white rounded-lg px-4 py-2"
                  onClick={handleResumeGame}
                >
                  Resume Game
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white rounded-lg px-4 py-2"
                  onClick={handleRestartGame}
                >
                  Restart Game
                </button>
              </div>
            </div>
          }



        </div>
      </div>
    </>
  )
}