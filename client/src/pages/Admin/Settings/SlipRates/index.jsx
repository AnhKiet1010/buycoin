import React, { useEffect, useState } from "react";
import SlipRate from "@/api/slipRate";
import { toast, ToastContainer } from "react-toastify";

const SlipRates = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    const fetchSlipRates = async () => {
      try {
        let response = await SlipRate.getSlipRates();
        setData(response.data.data.slipRates);
      } catch (error) {
        console.error("Error fetching slip Rate:", error);
      }
    };

    fetchSlipRates();
  }, []);

  const handleInputChange = (key, field, value) => {
    setData((prevData) =>
      prevData.map((item, index) => (index === key ? { ...item, [field]: value } : item))
    );
  };

  const handleUpdate = async (item) => {
    try {
      setLoading((prev) => ({ ...prev, [id]: true }));
      const body = {
        minCoins: item.minCoins,
        maxCoins: item.maxCoins,
        slipRate: item.slipRate,
      };
      await SlipRate.updateSlipRate({ id: item._id, body });
      toast.success("Update successful!");
    } catch (error) {
      console.error("Error updating slip rate:", error);
      toast.error("Update failed!");
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="mt-4 rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">Slip Rates</h4>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left bg-gray-2 dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Coin
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Min
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Max
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Slip Rate
                </th>
                <th className="px-4 py-4 font-medium text-center text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, key) => (
                <tr key={key}>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">{item.coin_symbol}</h5>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      <input
                        type="text"
                        placeholder=""
                        value={item.minCoins}
                        onChange={(e) => handleInputChange(key, "minCoins", e.target.value)}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      <input
                        type="text"
                        placeholder=""
                        value={item.maxCoins ? item.maxCoins : ""}
                        onChange={(e) => handleInputChange(key, "maxCoins", e.target.value)}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      <input
                        type="text"
                        placeholder=""
                        value={item.slipRate}
                        onChange={(e) => handleInputChange(key, "slipRate", e.target.value)}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex justify-center items-center space-x-3.5">
                      <button
                        onClick={() => handleUpdate(item)}
                        className="inline-flex items-center justify-center px-10 py-3 font-medium text-center text-white rounded-md bg-primary hover:bg-opacity-90 lg:px-8 xl:px-10"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SlipRates;
