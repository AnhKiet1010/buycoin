import React, { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import SlipRate from "@/api/slipRate";
import { formatPrice } from "@/utils";
import { ToastContainer, toast } from "react-toastify";
import Transaction from "@/api/transaction";

const CheckoutForm = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentPriceHewe, setCurrentPriceHewe] = useState(0);
  const [currentPriceAmc, setCurrentPriceAmc] = useState(0);
  const [currentSlipRate, setCurrentSlipRate] = useState([]);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      coin_symbol: "HEWE",
      coin_amount: 10,
      usd_amount: 0,
      wallet_address: "0x7AB38a5eEc793f8CdC770f365d573678005ad07B",
      cardholder_name: "John Doe",
      card_number: "4111111111111111",
      card_expiration: "12/25",
      card_type: "visa",
      cvv: "123",
      city: "New York",
      state: "NY",
      zip: "10001",
      address: "123 Elm St",
    },
  });

  const coinAmount = useWatch({ control, name: "coin_amount" });
  const coinSymbol = useWatch({ control, name: "coin_symbol" });

  useEffect(() => {
    const fetchSlipRate = async () => {
      try {
        let response = await SlipRate.getSlipRates();
        const { status, data } = response.data;
        if (status !== 200) {
        } else {
          setCurrentSlipRate(data.slipRates);
          setCurrentPriceAmc(data.amcPrice);
          setCurrentPriceHewe(data.hewePrice);
          setFetching(false);
        }
      } catch (error) {
        console.error("Error fetching Slip Rate:", error);
        toast.error("Internal error");
      }
    };

    Promise.all([fetchSlipRate()])
      .then(() => setLoading(false))
      .catch(() => setLoading(true));
  }, []);

  const getSlipRateByAmount = useCallback(
    (coinAmount, coinSymbol) => {
      // const slip = currentSlipRate.find(
      //   (rate) =>
      //     rate.coin_symbol === coinSymbol &&
      //     coinAmount >= rate.minCoins &&
      //     (coinAmount <= rate.maxCoins || rate.maxCoins === null)
      // );
      // return slip ? slip.slipRate : 0.001;
      return (coinAmount / 1000) * 0.001;
    },
    [currentSlipRate]
  );

  useEffect(() => {
    const slipRate = getSlipRateByAmount(coinAmount, coinSymbol);
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
      const expiry_month = data.card_expiration.split("/")[0];
      const expiry_year = data.card_expiration.split("/")[1];

      if (!expiry_month || !expiry_year) {
        throw new Error("card_expiration is not in the correct format.");
      }

      setLoading(true);

      try {
        const body = {
          cardholder_name: data.cardholder_name,
          card_number: data.card_number,
          card_type: data.card_type,
          coin_symbol: data.coin_symbol,
          coin_amount: data.coin_amount,
          total_amount: data.total_amount,
          base_price: coinSymbol === "HEWE" ? currentPriceHewe : currentPriceAmc,
          slip_rate: getSlipRateByAmount(data.coin_amount, data.coin_symbol),
          wallet_address: data.wallet_address,
          city: data.city,
          address: data.address,
          state: data.state,
          zip: data.zip,
          cvv: data.cvv,
          expiry_month,
          expiry_year,
        };

        let response = await Transaction.transfer(body);

        if (response.data) {
          setSuccess(true);
          // toast.success(response.data.message);
          reset();
          setLoading(false);
        }
      } catch (error) {
        toast.error(error.response.data.message);
        setLoading(false);
      }
    },
    [currentPriceHewe, currentPriceAmc, coinSymbol]
  );

  return (
    <>
      <ToastContainer />
      <div
        className={`flex justify-center w-screen h-screen overflow-y-auto overflow-x-hidden bg-center bg-no-repeat bg-cover
          bg-[url('/bg1.svg')]
        `}
      >
        <section className="w-full px-10 py-16 antialiased xl:px-0 xl:pt-20 max-w-180">
          <div className="flex flex-col items-center">
            <img src="/logo-text.png" alt="hewe.io" />
            {success ? (
              <div className="mt-4 space-y-2 text-center md:space-y-4 md:mt-20 text-main">
                <p className="text-xl font-bold md:text-5xl">Congratulations</p>
                <p className="text-xl font-bold md:text-5xl">You have successfully traded!</p>
                <p className="text-sm text-white md:text-md">
                  We will update the transaction information and notify you later.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full mt-6 space-y-4"
                autoComplete="off"
              >
                <div className="">
                  <p className="mb-3 text-lg font-bold text-main">Swap token</p>
                  <div className="relative flex gap-4 p-3 text-white bg-[#282C3C] rounded-xl custom-input">
                    <div className="flex-1">
                      <input
                        placeholder="0"
                        readOnly={fetching}
                        type="number"
                        {...register("coin_amount", {
                          required: "Coin amount is required",
                          min: { value: 1, message: "Amount must be at least 1000" },
                          max: {
                            value: 1000000000,
                            message: "Amount must not exceed 1 billion",
                          },
                        })}
                        className="text-sm text-white w-inherit bg-inherit hover:border-none focus:outline-none"
                      />
                      {errors.coin_amount && (
                        <span className="text-sm text-red-500">{errors.coin_amount.message}</span>
                      )}
                    </div>
                    <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                      <select
                        id="coin_symbol"
                        {...register("coin_symbol", { required: true })}
                        className="border text-sm text-main bg-inherit rounded-lg  block px-2.5 border-none placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="HEWE">HEWE</option>
                        <option value="AMC">AMC</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-center my-3">
                    <svg
                      width="39"
                      height="24"
                      viewBox="0 0 39 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_1_211)">
                        <path
                          d="M14.09 23.1198L18 19.2498C18.0937 19.1569 18.1681 19.0463 18.2189 18.9244C18.2697 18.8025 18.2958 18.6718 18.2958 18.5398C18.2958 18.4078 18.2697 18.2771 18.2189 18.1553C18.1681 18.0334 18.0937 17.9228 18 17.8298C17.9071 17.7361 17.7965 17.6617 17.6746 17.6109C17.5527 17.5602 17.422 17.534 17.29 17.534C17.158 17.534 17.0273 17.5602 16.9054 17.6109C16.7836 17.6617 16.673 17.7361 16.58 17.8298L13 21.3898L13 0.999832C13 0.734615 12.8947 0.480261 12.7071 0.292724C12.5196 0.105188 12.2652 -0.000168133 12 -0.000168122C11.7348 -0.00016811 11.4805 0.105188 11.2929 0.292724C11.1054 0.480261 11 0.734615 11 0.999832L11 21.4498L7.38002 17.8298C7.19405 17.6525 6.94696 17.5536 6.69002 17.5536C6.43308 17.5536 6.186 17.6525 6.00002 17.8298C5.90629 17.9228 5.8319 18.0334 5.78113 18.1553C5.73036 18.2771 5.70422 18.4078 5.70422 18.5398C5.70422 18.6718 5.73036 18.8025 5.78113 18.9244C5.8319 19.0463 5.90629 19.1569 6.00002 19.2498L9.85002 23.1198C10.4125 23.6816 11.175 23.9972 11.97 23.9972C12.765 23.9972 13.5275 23.6816 14.09 23.1198Z"
                          fill="#F4E096"
                        />
                      </g>
                      <g clipPath="url(#clip1_1_211)">
                        <path
                          d="M24.91 0.880167L21 4.75017C20.9062 4.84313 20.8319 4.95373 20.7811 5.07559C20.7303 5.19745 20.7042 5.32816 20.7042 5.46017C20.7042 5.59218 20.7303 5.72289 20.7811 5.84474C20.8319 5.9666 20.9062 6.0772 21 6.17017C21.0929 6.2639 21.2035 6.33829 21.3254 6.38906C21.4473 6.43983 21.578 6.46597 21.71 6.46597C21.842 6.46597 21.9727 6.43983 22.0946 6.38906C22.2164 6.33829 22.327 6.2639 22.42 6.17017L26 2.61017L26 23.0002C26 23.2654 26.1053 23.5197 26.2929 23.7073C26.4804 23.8948 26.7348 24.0002 27 24.0002C27.2652 24.0002 27.5195 23.8948 27.7071 23.7073C27.8946 23.5197 28 23.2654 28 23.0002L28 2.55017L31.62 6.17017C31.806 6.34746 32.053 6.44636 32.31 6.44636C32.5669 6.44636 32.814 6.34746 33 6.17017C33.0937 6.0772 33.1681 5.9666 33.2189 5.84474C33.2696 5.72289 33.2958 5.59218 33.2958 5.46017C33.2958 5.32816 33.2696 5.19745 33.2189 5.07559C33.1681 4.95373 33.0937 4.84313 33 4.75017L29.15 0.880168C28.5875 0.318366 27.825 0.00280738 27.03 0.00280734C26.235 0.00280731 25.4725 0.318366 24.91 0.880167Z"
                          fill="#F4E096"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_1_211">
                          <rect
                            width="24"
                            height="24"
                            fill="white"
                            transform="translate(0 24) rotate(-90)"
                          />
                        </clipPath>
                        <clipPath id="clip1_1_211">
                          <rect
                            width="24"
                            height="24"
                            fill="white"
                            transform="translate(39) rotate(90)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div className="relative flex gap-4 p-3 text-white bg-[#282C3C] rounded-xl custom-input">
                    <div className="flex-1">
                      <input
                        placeholder="0"
                        readOnly
                        type="number"
                        {...register("total_amount", {
                          required: true,
                          min: { value: 1, message: "Amount must be at least 1" },
                          max: {
                            value: 1000000000,
                            message: "Amount must not exceed 1 billion",
                          },
                        })}
                        className="text-sm text-white w-inherit bg-inherit hover:border-none focus:outline-none"
                      />
                      {errors.total_amount && (
                        <span className="text-sm text-red-500">{errors.total_amount.message}</span>
                      )}
                    </div>
                    <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                      <select className="border text-sm text-main bg-inherit rounded-lg  block px-2.5 border-none placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500">
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                </div>
                <p className="mb-3 text-lg font-bold text-main">Choose payment method</p>
                <div className="custom-input">
                  <input
                    value="Online Credit/Debit Card Payment"
                    readOnly
                    className="!pl-12 text-white text-sm hover:border-none focus:outline-none"
                  />
                  <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                    <img className="flex w-auto h-6" src="/card-payment.svg" alt="" />
                  </div>
                  <div className="absolute transform -translate-y-1/2 top-1/2 right-4  w-3 h-3 bg-[#F4E096] rounded-full"></div>
                </div>
                <div className="w-full">
                  <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2">
                    <div className="col-span-2 sm:col-span-1">
                      <label
                        htmlFor="wallet_address"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        Wallet address
                        {/* <span className="text-red-600">*</span> */}
                      </label>
                      <div className="custom-input">
                        <input
                          type="text"
                          id="wallet_address"
                          className="block w-full text-sm text-white outline-none"
                          placeholder="0x..."
                          {...register("wallet_address", {
                            required: "Wallet address is required",
                          })}
                        />
                      </div>
                      {errors.wallet_address && (
                        <span className="text-sm text-red-500">
                          {errors.wallet_address.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label
                        htmlFor="card_type"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        Card type
                        {/* <span className="text-red-600">*</span> */}
                      </label>
                      <div className="col-span-2 sm:col-span-1 custom-input">
                        <select
                          id="card_type"
                          {...register("card_type", { required: "Card type is required" })}
                          placeholder="Choose card type"
                          className="border text-sm rounded-md block w-full p-2.5 bg-gray-900 placeholder-gray-400 text-white border-none"
                        >
                          <option value="mastercard">Mastercard</option>
                          <option value="visa">Visa</option>
                          <option value="JCB">JCB</option>
                          <option value="Discover">Discover</option>
                          <option value="american express">American Express</option>
                          <option value="Diners Club">Diners Club</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label
                        htmlFor="cardholder_name"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        Name printed on card
                        {/* <span className="text-red-600">*</span> */}
                      </label>
                      <div className="custom-input">
                        <input
                          type="text"
                          id="cardholder_name"
                          className="block text-white hover:border-none focus:outline-none w-full rounded-md p-2.5 text-sm bg-gray-900"
                          placeholder="Name"
                          {...register("cardholder_name", {
                            required: "Name name is required",
                          })}
                        />
                      </div>
                      {errors.cardholder_name && (
                        <span className="text-sm text-red-500">
                          {errors.cardholder_name.message}
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label
                        htmlFor="card_number"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        Card No
                        {/* <span className="text-red-600">*</span> */}
                      </label>
                      <div className="custom-input">
                        <input
                          type="text"
                          id="card_number"
                          className="block text-white hover:border-none focus:outline-none w-full rounded-md p-2.5 text-sm bg-gray-900"
                          placeholder="Card number"
                          {...register("card_number", { required: "Card number is required" })}
                        />
                      </div>
                      {errors.card_number && (
                        <span className="text-sm text-red-500">{errors.card_number.message}</span>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label
                        htmlFor="card-expiration-input"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        Expiration date/month
                        {/* <span className="text-red-600">*</span> */}
                      </label>
                      <div className="relative">
                        <div className="custom-input">
                          <input
                            id="card-expiration-input"
                            {...register("card_expiration", {
                              required: "Card expiration is required",
                              validate: (value) => {
                                const pattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
                                return (
                                  pattern.test(value) || "Invalid format. Use MM/YY (e.g., 09/25)."
                                );
                              },
                            })}
                            type="text"
                            className="block text-white hover:border-none focus:outline-none w-full rounded-md bg-gray-900 p-2.5 ps-9 text-sm"
                            placeholder="00/00"
                          />
                        </div>
                        {errors.card_expiration && (
                          <span className="text-sm text-red-500">
                            {errors.card_expiration.message}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label
                        htmlFor="cvv"
                        className="flex items-center gap-1 mb-2 text-sm font-medium text-white"
                      >
                        CVV
                        {/* <span className="text-red-600">*</span> */}
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
                      <div className="custom-input">
                        <input
                          type="number"
                          id="cvv"
                          aria-describedby="helper-text-explanation"
                          className="block text-white w-full hover:border-none focus:outline-none rounded-md p-2.5 text-sm bg-gray-900"
                          placeholder="123"
                          {...register("cvv", { required: "Cvv is required" })}
                        />
                      </div>
                      {errors.cvv && (
                        <span className="text-sm text-red-500">{errors.cvv.message}</span>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="city" className="block mb-2 text-sm font-medium text-white">
                        City
                        {/* <span className="text-red-600">*</span> */}
                      </label>
                      <div className="custom-input">
                        <input
                          type="text"
                          id="city"
                          className="block hover:border-none focus:outline-none text-white w-full rounded-md p-2.5 text-sm bg-gray-900"
                          placeholder="New York"
                          {...register("city", { required: "City is required" })}
                        />
                      </div>
                      {errors.city && (
                        <span className="text-sm text-red-500">{errors.city.message}</span>
                      )}
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="state" className="block mb-2 text-sm font-medium text-white">
                        State
                        {/* <span className="text-red-600">*</span> */}
                      </label>
                      <div className="custom-input">
                        <input
                          type="text"
                          id="state"
                          className="block hover:border-none focus:outline-none text-white w-full rounded-md p-2.5 text-sm bg-gray-900"
                          placeholder="NY"
                          {...register("state", { required: "State is required" })}
                        />
                      </div>
                      {errors.state && (
                        <span className="text-sm text-red-500">{errors.state.message}</span>
                      )}
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label
                        htmlFor="address"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        Address
                        {/* <span className="text-red-600">*</span> */}
                      </label>
                      <div className="custom-input">
                        <input
                          type="text"
                          id="state"
                          className="block hover:border-none focus:outline-none text-white w-full rounded-md p-2.5 text-sm bg-gray-900"
                          placeholder="123 Elm St"
                          {...register("address", { required: "Address is required" })}
                        />
                      </div>
                      {errors.address && (
                        <span className="text-sm text-red-500">{errors.address.message}</span>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="zip" className="block mb-2 text-sm font-medium text-white">
                        Zip
                        {/* <span className="text-red-600">*</span> */}
                      </label>
                      <div className="custom-input">
                        <input
                          type="text"
                          id="state"
                          className="block hover:border-none focus:outline-none text-white w-full rounded-md p-2.5 text-sm bg-gray-900"
                          placeholder="10001"
                          {...register("zip", { required: "Zip is required" })}
                        />
                      </div>
                      {errors.zip && (
                        <span className="text-sm text-red-500">{errors.zip.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-8 opacity-50 custom-input">
                    <input
                      value="Crypto payment"
                      readOnly
                      className="text-white !pl-10 text-sm hover:border-none focus:outline-none"
                    />
                    <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                      <img className="flex w-auto h-4" src="/favicon.svg" alt="" />
                    </div>
                    <div className="absolute transform -translate-y-1/2 top-1/2 right-4  w-3 h-3 border border-[#F4E096] rounded-full"></div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || fetching}
                    className="flex w-full mb-20 items-center justify-center border border-main rounded-sm bg-transparent text-main px-5 py-2.5 text-sm  hover:text-black hover:bg-main focus:outline-none focus:ring-4"
                  >
                    {loading ? (
                      <svg
                        aria-hidden="true"
                        className="w-6 h-6 text-gray-200 animate-spin fill-gray-400"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                    ) : (
                      "Payment Confirm"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default CheckoutForm;
