import React, { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import SlipRate from "@/api/SlipRate";
import { getPriceHewe } from "@/api/hewe";
import { getPriceAmc } from "@/api/amc";
import { formatPrice } from "@/utils";
import { getApexTokenId, purchase } from "@/api/payment";
import { ToastContainer, toast } from "react-toastify";
import transactionModel from "@/api/Transaction";

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
      coin_amount: 10,
      usd_amount: 0,
      wallet_address: "0x7AB38a5eEc793f8CdC770f365d573678005ad07B",
      cardholder_name: "John Williams",
      card_number: "5146312620000045",
      card_expiration: "09/25",
      card_type: "mastercard",
      cvv: "111",
    },
  });
  const [paymentErrors, setPaymentErrors] = useState([]);

  const coinAmount = useWatch({ control, name: "coin_amount" });
  const coinSymbol = useWatch({ control, name: "coin_symbol" });

  useEffect(() => {
    const fetchPriceHewe = async () => {
      try {
        let response = await getPriceHewe();
        setCurrentPriceHewe(response.data.ticker.latest * 100);
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
      const exp_month = data.card_expiration.split("/")[0];
      const exp_year = data.card_expiration.split("/")[1];

      if (!exp_month || !exp_year) {
        throw new Error("card_expiration is not in the correct format.");
      }

      try {
        const { tokenId } = await getApexTokenId({
          card_number: data.card_number,
          expiry_month: exp_month,
          expiry_year: exp_year,
        });

        const payment = await purchase({
          amount: parseInt(data.total_amount * 100),
          cardholder_name: data.cardholder_name,
          token_id: tokenId,
          type: data.card_type,
        });
        console.log({ payment });

        const { payment_status, payment_transaction_id } = payment;

        if (payment_status === "Approved") {
          const body = {
            cardholder_name: data.cardholder_name,
            card_number: data.card_number,
            card_type: data.card_type,
            coin_symbol: data.coin_symbol,
            coin_amount: data.coin_amount,
            total_amount: data.total_amount * 100,
            base_price: coinSymbol === "HEWE" ? currentPriceHewe : currentPriceAmc,
            slip_rate: getSlipRateByAmount(data.coin_amount),
            payment_transaction_id,
            wallet_address: data.wallet_address,
          };

          let response = await transactionModel.transfer(body);
          console.log({ response });
        }
      } catch (error) {
        console.log({ error });
        let newErrors = [];
        if (error?.response?.data?.errors) {
          Object.keys(error.response.data.errors).forEach((key) => {
            newErrors.push(error.response.data.errors[key][0]);
          });
        } else if (error.response.data.Error?.messages) {
          console.log({ messages: error.response.data.Error.messages });
          error.response.data.Error.messages.forEach((message) => {
            newErrors.push(message.description);
          });
        } else {
          toast.error("Internal error");
        }
        setPaymentErrors(newErrors);
      }
    },
    [currentPriceHewe, currentPriceAmc, coinSymbol]
  );

  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-center w-screen h-screen px-0 pb-0 overflow-hidden bg-top bg-no-repeat bg-cover lg:justify-start ms:px-32 lg:px-64 bg-main">
        <section className="p-2 antialiased bg-gray-600 rounded-lg md:p-8">
          <div className="px-4 mx-auto lg:max-w-screen-xl 2xl:px-0">
            <div className="py-4 mx-auto lg:max-w-5xl">
              <h2 className="text-xl font-semibold text-center text-gray-900 uppercase dark:text-white sm:text-4xl">
                Payment Form
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" autoComplete="off">
                <div className="mt-6 grow sm:mt-8 lg:mt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex gap-4 px-4 pt-4 pb-10 text-white bg-gray-900 rounded-md">
                        <div className="w-[250px] md:w-full md:flex-1 bg-inherit">
                          <p className="mb-2 text-sm text-gray-300">Swap from</p>
                          <input
                            placeholder="1000"
                            type="number"
                            {...register("coin_amount", {
                              required: "Coin amount is required",
                              min: { value: 1, message: "Amount must be at least 1000" },
                              max: {
                                value: 1000000000,
                                message: "Amount must not exceed 1 billion",
                              },
                            })}
                            className="text-3xl font-medium text-white w-inherit bg-inherit hover:border-none focus:outline-none"
                          />
                          {errors.coin_amount && (
                            <span className="text-sm text-red-500">
                              {errors.coin_amount.message}
                            </span>
                          )}
                        </div>
                        <div className="">
                          <select
                            id="coin_symbol"
                            {...register("coin_symbol", { required: true })}
                            className="border text-sm rounded-lg  block px-2.5 bg-gray-900 border-none placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="HEWE">HEWE</option>
                            <option value="AMC">AMC</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-4 px-4 pt-4 pb-4 text-white bg-gray-900 rounded-md">
                        <div className="w-[250px] md:w-full md:flex-1 bg-inherit">
                          <p className="mb-2 text-sm text-gray-300">To</p>
                          <div className="flex flex-col">
                            <input
                              placeholder="0"
                              type="number"
                              readOnly
                              {...register("total_amount", {
                                required: true,
                                min: { value: 1, message: "Amount must be at least 1" },
                                max: {
                                  value: 1000000000,
                                  message: "Amount must not exceed 1 billion",
                                },
                              })}
                              className="text-3xl font-medium text-white bg-inherit hover:border-none focus:outline-none"
                            />
                            {errors.total_amount && (
                              <span className="text-sm text-red-500">
                                {errors.total_amount.message}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <select className="border text-sm rounded-lg  block w-full px-2.5 bg-gray-900 border-none placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500">
                            <option value="USD">USD</option>
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
                  </div>
                </div>
                <div className="w-full">
                  <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2">
                    <div className="col-span-2 sm:col-span-1">
                      <label
                        htmlFor="wallet_address"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        Wallet address <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="wallet_address"
                        className="block w-full rounded-md  p-2.5 pe-10 text-sm bg-gray-900 text-white outline-none"
                        placeholder="0x..."
                        {...register("wallet_address", { required: true })}
                      />
                      {errors.wallet_address && (
                        <span className="text-sm text-red-500">
                          {errors.wallet_address.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="card_type"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Card type <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="card_type"
                        {...register("card_type", { required: true })}
                        placeholder="Choose card type"
                        className="border text-sm rounded-md  block w-full p-2.5 bg-gray-900 placeholder-gray-400 text-white border-none"
                      >
                        <option value="mastercard">Mastercard</option>
                        <option value="visa">Visa</option>
                        <option value="JCB">JCB</option>
                        <option value="Discover">Discover</option>
                        <option value="american express">American Express</option>
                        <option value="Diners Club">Diners Club</option>
                      </select>
                    </div>
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
                        className="block text-white w-full rounded-md p-2.5 text-sm bg-gray-900"
                        placeholder="Cardholder name"
                        {...register("cardholder_name", { required: true })}
                      />
                      {errors.cardholder_name && (
                        <span className="text-sm text-red-500">
                          {errors.cardholder_name.message}
                        </span>
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
                        className="block text-white w-full rounded-md p-2.5 text-sm bg-gray-900"
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
                          className="block text-white w-full rounded-md bg-gray-900 p-2.5 ps-9 text-sm"
                          placeholder="12/25"
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
                        className="block text-white w-full rounded-md p-2.5 text-sm bg-gray-900"
                        placeholder="•••"
                        {...register("cvv", { required: true })}
                      />
                      {errors.cvv && (
                        <span className="text-sm text-red-500">{errors.cvv.message}</span>
                      )}
                    </div>
                  </div>

                  {paymentErrors && (
                    <div className="mb-10">
                      <div className="space-y-2">
                        {paymentErrors.map((err) => (
                          <div key={err}>
                            <p className="text-sm text-red-500">- {err}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-lg bg-primary-950 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-80 focus:outline-none focus:ring-4"
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

              <p className="mt-6 text-sm text-center text-gray-200 sm:mt-8 lg:text-left">
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
    </>
  );
};

export default CheckoutForm;