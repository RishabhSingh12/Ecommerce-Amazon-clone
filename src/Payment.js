import React, { useState } from "react";
import "./Payment.css";
import { useStateValue } from "./StateProvider";
import CheckoutProduct from "./CheckoutProduct";
import { Link, useHistory } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CurrencyFormat from "react-currency-format";
import { getBasketTotal } from "./reducer";
// import axios from "./axios";
import { db } from "./firebase";

function Payment() {
  const [{ basket, user }, dispatch] = useStateValue();
  const history = useHistory();

  const stripe = useStripe();
  const elements = useElements();

  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState("");

  //   useEffect(() => {
  //     // generate the special stripe secret which allows us to charge a customer
  //     const getClientSecret = async () => {
  //       const response = await fetch(
  //         `/.netlify/functions/create-payment-intent?amount= ${
  //           getBasketTotal(basket) * 100
  //         }`,
  //         {
  //           method: "post",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({ amount: getBasketTotal(basket) * 100 }),
  //         }
  //       ).then((res) => {
  //         return res.json();
  //       });

  //       const clientSecret = response.paymentIntent.client_secret;
  //       console.log(clientSecret);
  //       setClientSecret(clientSecret);
  //     };

  //     getClientSecret();
  //   }, [basket]);

  if (!user) {
    history.push("/login");
  }

  const handleSubmit = async (event) => {
    // do all the fancy stripe stuff...
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const response = await fetch("/.netlify/functions/create-payment-intent", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: getBasketTotal(basket) * 100 }),
    }).then((res) => res.json());

    const clientsecret = response.paymentIntent;
    // console.log(clientSecret);
    setClientSecret(clientsecret);

    // const payload = await stripe.confirmCardPayment(clientSecret, {
    //   payment_method: {
    //     card: elements.getElement(CardElement),
    //     billing_details: {
    //       name: "Guest",
    //     },
    //   },
    // });

    // console.log(payload);

    // if (payload.paymentIntent.status === "succeeded")
    // paymentIntent = payment confirmation

    db.collection("users")
      .doc(user?.uid)
      .collection("orders")
      .doc(response.paymentIntent.id)
      .set({
        basket: basket,
        amount: response.paymentIntent.amount,
        created: response.paymentIntent.created,
      });

    setSucceeded(true);
    setError(null);
    setProcessing(false);

    dispatch({
      type: "EMPTY_BASKET",
    });

    history.replace("/orders");
  };

  // console.log("THE SECRET IS >>>", clientSecret);
  console.log("👱", user);

  const handleChange = (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  return (
    <div className="payment">
      <div className="payment__container">
        <h1>
          Checkout (<Link to="/checkout">{basket?.length} items</Link>)
        </h1>

        {/* Payment section - delivery address */}
        <div className="payment__section">
          <div className="payment__title">
            <h3>Delivery Address</h3>
          </div>
          <div className="payment__address">
            <p>{user?.email}</p>
            <p>123 React Lane</p>
            <p>Los Angeles, CA</p>
          </div>
        </div>

        {/* Payment section - Review Items */}
        <div className="payment__section">
          <div className="payment__title">
            <h3>Review items and delivery</h3>
          </div>
          <div className="payment__items">
            {basket.map((item, idx) => (
              <CheckoutProduct
                key={idx}
                id={item.id}
                title={item.title}
                image={item.image}
                price={item.price}
                rating={item.rating}
              />
            ))}
          </div>
        </div>

        {/* Payment section - Payment method */}
        <div className="payment__section">
          <div className="payment__title">
            <h3>Payment Method</h3>
          </div>
          <div className="payment__details">
            {/* Stripe magic will go */}

            <form onSubmit={handleSubmit}>
              <CardElement onChange={handleChange} />

              <div className="payment__priceContainer">
                <CurrencyFormat
                  renderText={(value) => <h3>Order Total: {value}</h3>}
                  decimalScale={2}
                  value={getBasketTotal(basket)}
                  displayType={"text"}
                  thousandSeparator={true}
                  prefix={"$"}
                />
                <button disabled={processing || disabled || succeeded}>
                  <span>
                    {user && processing ? <p>Processing</p> : "Buy Now"}
                  </span>
                </button>
              </div>

              {/* Errors */}
              {error && <div>{error}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
