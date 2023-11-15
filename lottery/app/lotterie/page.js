'use client'
import Image from 'next/image'
import ThemeSwitch from '@/components/ThemeSwitch'
import MetaMaskTatumButton from '@/components/MetaMaskTatumButton'
import { useEffect, useState } from 'react'
import Web3 from 'web3'
// import lotteryContract from '@/blockchain/connexion-lottery'
import lotteryContract from '@/blockchain/connexion-lottery'

export default function Home() {
  const [web3, setWeb3] = useState()
  const [address, setAddress] = useState()
  const [lcContract, setLcContract] = useState()
  const [lotteryPot, setLotteryPot] = useState()
  const [lotteryPlayers, setPlayers] = useState([])
  const [lotteryHistory, setLotteryHistory] = useState([])
  const [lotteryId, setLotteryId] = useState()
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    updateState()
  }, [lcContract])

  const updateState = () => {
    if (lcContract) getPot()
    if (lcContract) getPlayers()
    if (lcContract) getLotteryId()
  }

  const getPot = async () => {
    const pot = await lcContract.methods.getBalance().call()
    setLotteryPot(web3.utils.fromWei(pot, 'ether'))
    console.log(`pot : ${lotteryPot}`)
  }

  const getPlayers = async () => {
    const players = await lcContract.methods.getPlayers().call()
    setPlayers(players)

  }
  const getHistory = async (id) => {
    setLotteryHistory([])
    for (let i = parseInt(id); i > 0; i--) {
      const winnerAddress = await lcContract.methods.lotteryHistory(i).call()
      const historyObj = {}
      historyObj.id = i
      historyObj.address = winnerAddress
      setLotteryHistory(lotteryHistory => [...lotteryHistory, historyObj])
    }
  }

  const getLotteryId = async () => {
    const lotteryId = await lcContract.methods.lotteryId().call()
    setLotteryId(lotteryId)
    await getHistory(lotteryId)
  }

  const enterLotteryHandler = async () => {
    setError('')
    setSuccessMsg('')
    try {
      await lcContract.methods.enter().send({
        from: address,
        value: '11000000000000000',
        gas: 300000,
        gasPrice: null
      })
      updateState()
      console.log('enter lottery réussi')
    } catch(err) {
      setError(err.message)
    }
    
  }

  const pickWinnerHandler = async () => {
    setError('')
    setSuccessMsg('')
    console.log(`address from pick winner :: ${address}`)
    try {
      await lcContract.methods.pickWinner().send({
        from: address,
        gas: 300000,
        gasPrice: null
      })
    } catch(err) {
      setError(err.message)
    }
  }

  const payWinnerHandler = async () => {
    setError('')
    setSuccessMsg('')
    try {
      await lcContract.methods.payWinner().send({
        from: address,
        gas: 300000,
        gasPrice: null
      })
      console.log(`lottery id :: ${lotteryId}`)
      const winnerAddress = await lcContract.methods.lotteryHistory(lotteryId).call()
      setSuccessMsg(`The winner is ${winnerAddress}`)
      updateState()
    } catch(err) {
      setError(err.message)
    }
  }

  const connectWalletHandler = async () => {
    setError('')
    setSuccessMsg('')
    /* check if MetaMask is installed */
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        /* request wallet connection */
        await window.ethereum.request({ method: "eth_requestAccounts"})
        /* create web3 instance & set to state */
        const web3 = new Web3(window.ethereum)
        /* set web3 instance in React state */
        setWeb3(web3)
        /* get list of accounts */
        const accounts = await web3.eth.getAccounts()
        /* set account 1 to React state */
        setAddress(accounts[0])

        /* create local contract copy */
        const lc = lotteryContract(web3)
        setLcContract(lc)

        window.ethereum.on('accountsChanged', async () => {
          const accounts = await web3.eth.getAccounts()
          console.log(accounts[0])
          /* set account 1 to React state */
          setAddress(accounts[0])
        })
      } catch(err) {
        setError(err.message)
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask")
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

      {/* Header */}
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            By
            EtherBay
          </a>
        </div>
        <div className="flex flex-row gap-5">
          {/* Bouton pour se connecter au wallet metamask */}

          {/* <MetaMaskTatumButton/> */}
            {/* <button onClick={connectWalletHandler} className="flex flex-row justify-center px-6 py-3 bg-[#780BF7] hover:bg-[#6200D3] rounded text-xl font-semibold text-[#ffff]">
                Connect Wallet
            </button> */}
          <ThemeSwitch />
        </div>
      </div>
      
      {/* Milieu */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
          <svg className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] light:invert" width="auto" height="auto" viewBox="0 0 1608 265" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.367188 213.998V0.398438H71.852C140.774 0.398438 167.545 13.4992 167.545 51.9473C167.545 76.7248 143.622 93.2432 109.446 100.363C150.742 106.629 180.076 123.717 180.076 153.336C180.076 198.619 153.59 213.998 75.8392 213.998H0.367188ZM49.9224 97.5153H65.3016C98.6232 97.5153 117.99 84.984 117.99 56.504C117.99 33.4353 108.876 24.6064 70.9976 24.6064H49.9224V97.5153ZM49.9224 189.506H77.548C119.129 189.506 130.521 180.107 130.521 149.064C130.521 118.875 102.895 104.635 71.5672 104.635H49.9224V189.506Z" fill="white"/>
            <path d="M293.01 175.266L290.162 213.998C277.346 213.998 266.524 213.998 262.252 213.998C223.234 213.998 206.146 190.645 206.146 157.323L205.861 0.398438H253.993V145.362C253.993 166.722 251.999 181.816 267.663 181.816C273.359 181.816 281.334 179.822 293.01 175.266Z" fill="white"/>
            <path d="M302.687 142.798C302.687 89.8256 330.312 67.3264 382.146 67.3264C433.98 67.3264 464.453 89.8256 464.453 142.798C464.453 195.771 433.98 218.27 382.146 218.27C330.312 218.27 302.687 195.771 302.687 142.798ZM350.248 143.653C350.248 173.557 354.52 194.917 382.716 194.917C413.189 194.917 416.322 173.557 416.322 143.653C416.322 107.198 410.911 90.68 383 90.68C355.375 90.68 350.248 107.198 350.248 143.653Z" fill="white"/>
            <path d="M479.296 142.798C479.296 95.5216 509.485 67.3264 560.749 67.3264C583.248 67.3264 621.696 70.1745 632.519 116.597L588.375 119.445C591.223 99.5089 576.983 90.9648 561.603 90.9648C540.528 90.9648 526.573 109.192 526.573 142.798C526.573 176.69 539.104 194.632 562.743 194.632C580.97 194.632 591.223 182.955 588.375 166.152L632.519 169C621.696 215.422 583.248 218.27 560.749 218.27C509.485 218.27 479.296 190.075 479.296 142.798Z" fill="white"/>
            <path d="M701.774 0.398438V135.963C737.374 132.546 711.457 54.7952 772.12 54.7952C800.03 54.7952 817.118 71.0288 817.118 95.5216C817.118 135.109 772.404 141.944 736.804 142.798L826.516 213.998H753.608L708.324 142.514C706.046 142.514 703.768 142.514 701.774 142.514V213.998H653.643V0.398438H701.774ZM714.875 138.242C741.931 138.526 771.835 136.818 771.835 114.318C771.835 103.496 765 94.6672 752.184 94.6672C729.4 94.6672 733.672 125.995 714.875 135.678V138.242Z" fill="white"/>
            <path d="M927.97 175.266L925.122 213.998C912.306 213.998 901.483 213.998 897.211 213.998C858.194 213.998 841.106 190.645 841.106 157.323L840.821 0.398438H888.952V145.362C888.952 166.722 886.958 181.816 902.622 181.816C908.318 181.816 916.293 179.822 927.97 175.266Z" fill="white"/>
            <path d="M996.885 218.84C960.145 218.84 945.905 201.182 945.905 158.747V71.5984H993.752V158.178C993.752 182.67 999.448 194.062 1017.67 194.062C1029.35 194.062 1052.99 184.094 1052.99 71.5984H1101.98V213.998H1058.12L1059.83 101.218H1057.26C1054.13 208.302 1025.08 218.84 996.885 218.84Z" fill="white"/>
            <path d="M1127.05 142.798C1127.05 95.5216 1157.24 67.3264 1208.5 67.3264C1231 67.3264 1269.45 70.1745 1280.27 116.597L1236.13 119.445C1238.98 99.5089 1224.74 90.9648 1209.36 90.9648C1188.28 90.9648 1174.33 109.192 1174.33 142.798C1174.33 176.69 1186.86 194.632 1210.5 194.632C1228.72 194.632 1238.98 182.955 1236.13 166.152L1280.27 169C1269.45 215.422 1231 218.27 1208.5 218.27C1157.24 218.27 1127.05 190.075 1127.05 142.798Z" fill="white"/>
            <path d="M1349.53 0.398438V135.963C1385.13 132.546 1359.21 54.7952 1419.87 54.7952C1447.78 54.7952 1464.87 71.0288 1464.87 95.5216C1464.87 135.109 1420.16 141.944 1384.56 142.798L1474.27 213.998H1401.36L1356.08 142.514C1353.8 142.514 1351.52 142.514 1349.53 142.514V213.998H1301.4V0.398438H1349.53ZM1362.63 138.242C1389.68 138.526 1419.59 136.818 1419.59 114.318C1419.59 103.496 1412.75 94.6672 1399.94 94.6672C1377.15 94.6672 1381.42 125.995 1362.63 135.678V138.242Z" fill="white"/>
            <path d="M1599.97 71.5984H1607.09L1543.3 264.123H1536.18L1552.69 213.998H1529.91L1467.54 71.5984H1515.39L1562.38 184.379L1599.97 71.5984Z" fill="white"/>
          </svg>
        </div>
        <div className='flex flex-col items-center gap-2 mb-3'>
          <h2 className='text-sm opacity-50'>
            Temps restant avant le lancement de la lotterie :
          </h2>
          <h1 className='text-5xl font-semibold'>
            01:01:42
          </h1>
        </div>
        <button onClick={enterLotteryHandler} className="flex flex-row justify-center px-6 py-3 bg-[#780BF7] hover:bg-[#6200D3] rounded text-xl font-semibold text-[#ffff]">
            Participer
        </button>
      </div>

    {/* Cards */}
      <div className="mb-32 grid justify-center text-center gap-4 lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <a
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-xl font-semibold`}>
            Ticket
          </h2>
          <p className={`mb-3 max-w-[30ch] text-sm opacity-50`}>
            Acheter votre ticket pour participer au tirage au sort.
          </p>
          <h2 className={`mb-3 text-2xl font-semibold`}>
            0.001 ETH
          </h2>
        </a>

        <a
          className="group relative flex flex-col rounded-lg border border-transparent px-5 py-4 transition-colors border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-xl font-semibold`}>
            Balance de la lotterie
          </h2>
          <p className={`mb-8 max-w-[30ch] text-sm opacity-50`}>
            La lotterie est actuellement à :
          </p>
          <h2 className={`mb-3 text-2xl font-semibold`}>
            {lotteryPot} ETH
          </h2>
        </a>

        <a
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-xl font-semibold`}>
            Participants
          </h2>
          <p className={`mb-3 max-w-[30ch] text-sm opacity-50`}>
            Nombre de personnes participant à la lotterie :
          </p>
          <h2 className={`mb-3 text-2xl font-semibold`}>
            {lotteryPlayers.length}
          </h2>
        </a>
      </div>
    </main>
  )
}
