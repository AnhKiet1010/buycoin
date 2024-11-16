import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import SlipRate from "../../api/SlipRate";
import { getPriceHewe } from "../../api/hewe";
import { getPriceAmc } from "../../api/amc";
import { formatPrice } from "../../utils";
import axios from "axios";
import Transaction from "../../api/Transaction";
import { getApexTokenId } from "../../api/apexToken";

const CheckoutForm = () => {
  const [loading, setLoading] = useState(false);
  const [currentPriceHewe, setCurrentPriceHewe] = useState(0);
  const [currentPriceAmc, setCurrentPriceAmc] = useState(0);
  const [currentSlipRate, setCurrentSlipRate] = useState([]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      coin_symbol: "HEWE",
      coin_amount: 1000,
      usd_amount: 0,
    },
  });

  const coinAmount = useWatch({ control, name: "coin_amount" });
  const coinSymbol = useWatch({ control, name: "coin_symbol" });

  useEffect(() => {
    const fetchPriceHewe = async () => {
      try {
        let response = await getPriceHewe();
        setCurrentPriceHewe(response.data.ticker.latest);
      } catch (error) {
        console.error("Error fetching HEWE price:", error);
      }
    };

    const fetchPriceAmc = async () => {
      try {
        let response = await getPriceAmc();
        if (response.data.result.length >= 1) {
          setCurrentPriceAmc(response.data.result[0].p);
        } else {
          throw new Error("Error fetching AMC price");
        }
      } catch (error) {
        console.error("Error fetching AMC price:", error);
      }
    };

    const fetchSlipRate = async () => {
      try {
        let response = await SlipRate.getSlipRates();
        const { status, data } = response.data;
        if (status !== 200) {
        } else {
          console.log({ slipRates: data.slipRates });
          setCurrentSlipRate(data.slipRates);
        }
      } catch (error) {
        console.error("Error fetching Slip Rate:", error);
      }
    };

    Promise.all([fetchPriceHewe(), fetchPriceAmc(), fetchSlipRate()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  const getSlipRateByAmount = useCallback(
    (coinAmount) => {
      const slip = currentSlipRate.find(
        (rate) =>
          coinAmount >= rate.minCoins && (coinAmount <= rate.maxCoins || rate.maxCoins === null)
      );
      return slip ? slip.slipRate : 0.1;
    },
    [currentSlipRate]
  );

  useEffect(() => {
    const slipRate = getSlipRateByAmount(coinAmount);
    console.log({ currentPriceHewe, currentPriceAmc, slipRate, coinAmount });
    if (coinSymbol === "HEWE") {
      setValue("usd_amount", formatPrice(currentPriceHewe * coinAmount));
      setValue("total_amount", formatPrice(currentPriceHewe * (1 + slipRate) * coinAmount));
    } else if (coinSymbol === "AMC") {
      setValue("usd_amount", formatPrice(currentPriceAmc * coinAmount));
      setValue("total_amount", formatPrice(currentPriceAmc * (1 + slipRate) * coinAmount));
    }
  }, [coinAmount, coinSymbol, currentSlipRate, currentPriceHewe, currentPriceAmc]);

  const onSubmit = useCallback(
    async (data) => {
      // console.log({ data });
      // try {
      //   const exp_month = data.card_expiration.split("/")[0];
      //   const exp_year = data.card_expiration.split("/")[1];
      //   if (!exp_month || !exp_year) {
      //     throw new Error("card_expiration is not in the correct format.");
      //   }

      //   const body = {
      //     ...data,
      //     exp_month,
      //     exp_year,
      //     base_price: coinSymbol === "HEWE" ? currentPriceHewe : currentPriceAmc,
      //     slip_rate: getSlipRateByAmount(data.coin_amount),
      //   };

      //   let response = await Transaction.transfer(body);
      //   console.log({ response });
      // } catch (error) {
      //   console.error("Error fetching HEWE price:", error);
      // }

      const exp_month = data.card_expiration.split("/")[0];
      const exp_year = data.card_expiration.split("/")[1];

      const { tokenId } = await getApexTokenId({
        card_number: data.card_number,
        expiry_month: exp_month,
        expiry_year: exp_year,
      });

      console.log({ tokenId });

      const response = await axios.post(
        "https://apexapi.sandbox.go-afs.com/v1/transactions/Purchase?api-version=1.0",
        {
          amount: "1699",
          currency: "USD",
          payment_details: {
            method: "credit_card",
            credit_card: {
              type: "mastercard",
              cardholder_name: "John Williams",
              token_id: tokenId,
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "e0b60cc87e714e3fb85f000d323c817c64dd6cebb3f04b859240fbe74a08e5a4",
          },
        }
      );
      console.log({ payment: response.data });
      // Trả về phần response cần thiết
      const { payment_status, payment_transaction_id } = response.data;
    },
    [currentPriceHewe, currentPriceAmc, coinSymbol]
  );

  return (
    <div className="flex items-center justify-center pt-24 pb-48 bg-top bg-no-repeat bg-cover bg-main">
      <section className="p-8 antialiased bg-gray-900 rounded-lg bg-opacity-90 md:p-16">
        <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white sm:text-4xl">
              Payment Form
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" autoComplete="off">
              <div className="mt-6 grow sm:mt-8 lg:mt-0">
                <div className="p-6 space-y-4 border border-gray-100 rounded-lg bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <div className="relative space-y-2">
                    <div className="flex gap-4 px-4 pt-4 pb-10 text-white bg-gray-700 rounded-xl">
                      <div className="bg-inherit">
                        <p className="mb-2 text-sm text-gray-300">Swap from</p>
                        <input
                          placeholder="1000"
                          type="number"
                          {...register("coin_amount", {
                            required: "Coin amount is required",
                            min: { value: 1000, message: "Amount must be at least 1000" },
                            max: { value: 1000000000, message: "Amount must not exceed 1 billion" },
                          })}
                          className="text-3xl font-medium text-white bg-inherit hover:border-none focus:outline-none"
                        />
                        {errors.coin_amount && (
                          <span className="text-sm text-red-500">{errors.coin_amount.message}</span>
                        )}
                      </div>
                      <div>
                        <select
                          {...register("coin_symbol", { required: true })}
                          className="px-2 py-1 border bg-inherit rounded-xl"
                        >
                          <option value="AMC">AMC</option>
                          <option value="HEWE">HEWE</option>
                        </select>
                      </div>
                    </div>
                    <button className="absolute p-2 transform -translate-x-1/2 translate-y-1/2 bg-gray-700 border-8 border-gray-800 rounded-full left-1/2 border-6 bottom-1/2">
                      <svg
                        width="36px"
                        height="36px"
                        viewBox="0 0 1024 1024"
                        xmlns="http://www.w3.org/2000/svg"
                        className="rotate-90 "
                      >
                        <path
                          fill="#ddd"
                          d="M847.9 592H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h605.2L612.9 851c-4.1 5.2-.4 13 6.3 13h72.5c4.9 0 9.5-2.2 12.6-6.1l168.8-214.1c16.5-21 1.6-51.8-25.2-51.8zM872 356H266.8l144.3-183c4.1-5.2.4-13-6.3-13h-72.5c-4.9 0-9.5 2.2-12.6 6.1L150.9 380.2c-16.5 21-1.6 51.8 25.1 51.8h696c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"
                        />
                      </svg>
                    </button>
                    <div className="flex gap-4 px-4 pt-10 pb-4 text-white bg-gray-700 rounded-xl">
                      <div className="bg-inherit">
                        <p className="mb-2 text-sm text-gray-300">To</p>
                        <input
                          placeholder="0"
                          type="number"
                          readOnly
                          {...register("total_amount", {
                            required: true,
                            min: { value: 1, message: "Amount must be at least 1" },
                            max: { value: 1000000000, message: "Amount must not exceed 1 billion" },
                          })}
                          className="text-3xl font-medium text-white bg-inherit hover:border-none focus:outline-none"
                        />
                        {errors.total_amount && (
                          <span className="text-sm text-red-500">
                            {errors.total_amount.message}
                          </span>
                        )}
                      </div>
                      <div>
                        <select className="px-2 py-1 border bg-inherit rounded-xl">
                          <option value="AMC">USD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* <dl className="flex items-center justify-between gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <dt className="text-lg font-bold text-gray-900 dark:text-white">Total</dt>
                    <dd className="text-lg font-bold text-gray-900 dark:text-white">
                      ${totalAmount}
                    </dd>
                  </dl> */}
                  <div className="col-span-2 sm:col-span-1">
                    <label
                      htmlFor="wallet_address"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Wallet address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="wallet_address"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pe-10 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                      placeholder="0x..."
                      {...register("wallet_address", { required: true, length: 16 })}
                    />
                    {errors.wallet_address && (
                      <span className="text-sm text-red-500">{errors.wallet_address.message}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6 lg:max-w-xl lg:p-8">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2 sm:col-span-1">
                    <label
                      htmlFor="cardholder_name"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Full name (as displayed on card) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="cardholder_name"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                      placeholder="Cardholder name"
                      {...register("cardholder_name", { required: true })}
                    />
                    {errors.cardholder_name && (
                      <span className="text-sm text-red-500">{errors.cardholder_name.message}</span>
                    )}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label
                      htmlFor="card_number"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Card number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="card_number"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pe-10 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                      placeholder="Card number"
                      {...register("card_number", { required: true, length: 16 })}
                    />
                    {errors.card_number && (
                      <span className="text-sm text-red-500">{errors.card_number.message}</span>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="card-expiration-input"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Card expiration <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
                        <svg
                          className="w-4 h-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <input
                        id="card-expiration-input"
                        {...register("card_expiration", { required: true })}
                        type="text"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-9 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        placeholder="12/23"
                      />
                      {errors.card_expiration && (
                        <span className="text-sm text-red-500">
                          {errors.card_expiration.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="cvv"
                      className="flex items-center gap-1 mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      CVV <span className="text-red-600">*</span>
                      <button
                        data-tooltip-target="cvv-desc"
                        data-tooltip-trigger="hover"
                        className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
                      >
                        <svg
                          className="w-4 h-4"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <div
                        id="cvv-desc"
                        role="tooltip"
                        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
                      >
                        The last 3 digits on back of card
                        <div className="tooltip-arrow" data-popper-arrow></div>
                      </div>
                    </label>
                    <input
                      type="number"
                      id="cvv"
                      aria-describedby="helper-text-explanation"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                      placeholder="•••"
                      {...register("cvv", { required: true })}
                    />
                    {errors.cvv && (
                      <span className="text-sm text-red-500">{errors.cvv.message}</span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4  focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Pay now
                </button>
                <div className="flex items-center justify-center gap-8 mt-6">
                  <img
                    className="w-auto h-8 dark:hidden"
                    src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/visa.svg"
                    alt=""
                  />
                  <img
                    className="hidden w-auto h-8 dark:flex"
                    src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/visa-dark.svg"
                    alt=""
                  />
                  <img
                    className="w-auto h-8 dark:hidden"
                    src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/mastercard.svg"
                    alt=""
                  />
                  <img
                    className="hidden w-auto h-8 dark:flex"
                    src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/mastercard-dark.svg"
                    alt=""
                  />
                </div>
              </div>
            </form>

            <p className="mt-6 text-center text-gray-500 dark:text-gray-400 sm:mt-8 lg:text-left">
              Payment processed by{" "}
              <a
                href="#"
                title=""
                className="font-medium underline text-primary-700 hover:no-underline dark:text-primary-500"
              >
                Paddle
              </a>{" "}
              for{" "}
              <a
                href="#"
                title=""
                className="font-medium underline text-primary-700 hover:no-underline dark:text-primary-500"
              >
                Flowbite LLC
              </a>
              - United States Of America
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CheckoutForm;
