import { useEffect, useState, useCallback } from 'react';
import { useCart } from 'hooks'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import image from '../components/pay.png'
import {
    useConnection,
    useWallet,
} from '@solana/wallet-adapter-react';
import {
    WalletMultiButton,
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import styleClasses from '../components/ReservationDetails/ReservationTotals/ReservationTotals.module.scss'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import './sol.css'
import { get } from 'lodash';
import { TransactionInstruction } from '@solana/web3.js';
import { Modal } from 'react-bootstrap'
const shopAddress = new PublicKey('HekSQzW1Yx7hiGqk41iSy8bcELLHvWn34fUe5ukyDya1')
function SolanaPay() {
    const [solanaRate, setSolanaRate] = useState('')
    const { totals, cart } = useCart();
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const totalAmount = totals.total.toFixed(2);
    const key = localStorage.getItem('value');
    const [show, setShow] = useState(false);
    const [tID, setTID] = useState('');
    const [closed, setClosed] = useState(false);
    let id;

    useEffect(() => {
        if (closed) {
            localStorage.clear();
            window.location.href('/')
        }
    }, [closed])
    const hotels = [{ hotel_name: "PALMVERSE Tamarindo, Costa Rica", city: "Tamarido" },
    { hotel_name: "PALMVERSE Nosara, Costa Rica", city: "Nosara", },
    { hotel_name: "PALMVERSE Santa Teresa, Costa Rica", city: "Santa Teresa" },
    { hotel_name: "PALMVERSE Miami, USA", city: "Miami" }]

    const hotel = hotels[key - 1];
    console.log(hotel);
    let amount = totalAmount / solanaRate;
    let roomPrice = totals.room / solanaRate;
    const pay = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: shopAddress,
                lamports: LAMPORTS_PER_SOL * amount.toFixed(3),
            })
        );



        const signature = await sendTransaction(transaction, connection).then((res) => {
            id = res;
            setTID(res);
            setShow(true);

        }).catch(err => {
            // alert('Something went wrong')
            console.error(err);
        })

        await connection.confirmTransaction(signature, 'processed');
    }, [publicKey, sendTransaction, connection]);



    useEffect(() => {
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd", requestOptions)
            .then(response => response.json())
            .then(result => setSolanaRate(result.solana.usd))
            .catch(error => console.log('error', error));
    }, [])

    return (
        <div className='solcontainer' >
            <Modal show={show} onHide={() => {
                setShow(false);
                setClosed(true)
                window.location.href = "/"
            }}  >
                <Modal.Header closeButton >Successful Transaction!</Modal.Header>
                <Modal.Title style={{ fontSize: "20px", marginLeft: "6px", padding: "20px 10px" }} >Thank you for your reservation at Palmverse !</Modal.Title>
                <div className='code' style={{ width: "95%" }} >

                <Modal.Body className='code2' style={{ overflowX: "scroll" }} >Your transaction ID is :<code> {tID}</code> </Modal.Body>
                </div>
                <button style={{ backgroundColor: "skyblue", width: "fit-content", margin: "auto", padding: "6px", borderRadius: "4px", marginBottom: "16px" }} onClick={() => {
                    navigator.clipboard.writeText(tID);
                    alert('Transaction ID copied to your clipboard')
                }} >Copy Transaction ID</button>

                <Modal.Footer>You can check your recently made transaction on <a href="https://solscan.io" target='_blank' >www.solscan.io</a> </Modal.Footer>
            </Modal>
            <div className='head'>

                <h1>
                    Pay via Solana
                </h1>
            </div>
            <div className='body' >

                <h2>Amount in USD : ${parseInt(totalAmount)}</h2>
                <h2>Amount in Sol : {amount.toFixed(3)} SOL</h2>
                <button
                    onClick={() => pay()}
                    style={{ border: 'none', outline: 'none', padding: 0, marginTop: "2rem" }}
                >
                    <img src={image} />
                </button>
                <button className='phantom' >

                    <WalletModalProvider>
                        <WalletMultiButton />
                    </WalletModalProvider>
                </button>

                <div className="details">
                    <li className={styleClasses['reservation-details__totals']}>
                        <div
                            className={styleClasses['reservation-details__totals__item']}
                        >
                            <span
                                className={
                                    styleClasses['reservation-details__totals__title']
                                }
                            >
                                Hotel name
                            </span>
                            <span
                                className={
                                    styleClasses['reservation-details__totals__value']
                                }
                            >
                                {hotel.hotel_name}
                            </span>
                        </div>
                        <div
                            className={styleClasses['reservation-details__totals__item']}
                        >
                            <span
                                className={
                                    styleClasses['reservation-details__totals__title']
                                }
                            >
                                City
                            </span>
                            <span
                                className={
                                    styleClasses['reservation-details__totals__value']
                                }
                            >
                                {hotel.city}
                            </span>
                        </div>
                        <div
                            className={styleClasses['reservation-details__totals__item']}
                        >
                            <span
                                className={
                                    styleClasses['reservation-details__totals__title']
                                }
                            >
                                Room price
                            </span>
                            <span
                                className={
                                    styleClasses['reservation-details__totals__value']
                                }
                            >
                                {roomPrice.toFixed(3)} SOL
                            </span>
                        </div>

                        <div
                            className={styleClasses['reservation-details__totals__item']}
                        >
                            <span
                                className={
                                    styleClasses['reservation-details__totals__title']
                                }
                            >
                                Accomodation{' '}
                            </span>
                            <span className={
                                styleClasses['reservation-details__totals__value']
                            }>
                                {cart.days} {cart.days && +cart.days > 1 ? 'Days' : 'Day'}
                            </span>

                        </div>
                    </li>
                </div>
            </div>
        </div>

    )
}

export default SolanaPay