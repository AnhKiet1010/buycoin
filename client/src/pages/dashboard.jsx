import React, { useEffect, useState } from "react";
import Transaction from "@/api/transaction";
import { shortenWalletAddress } from "../utils";
import Pagination from "../components/Pagination";
import { useDispatch } from "react-redux";
import { LOGOUT } from "@/slices/auth";
import { useHistory } from "react-router-dom";

const Dashboard = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const perPage = 2;

  useEffect(() => {
    const fetchTrans = async () => {
      try {
        let response = await Transaction.getList({ currentPage, perPage });
        console.log({ response });
        setTransactions(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        console.error("Error fetching list trans:", error);
      }
    };

    fetchTrans();
  }, [currentPage]);

  const onPageChange = (newPage) => {
    if (newPage === currentPage) return;

    setCurrentPage(newPage);
  };

  const handleLogout = () => {
    dispatch(LOGOUT());
    history.push("/");
  };

  return (
    <main className="p-6 space-y-6 sm:p-10">
      <div className="flex flex-col justify-between space-y-6 md:space-y-0 md:flex-row">
        <div className="mr-6">
          <h1 className="mb-2 text-4xl font-semibold">Dashboard</h1>
          {/* <h2 className="text-gray-600 ml-0.5">Mobile UX/UI Design course</h2> */}
        </div>
        <div className="flex flex-wrap items-start justify-end -mb-3">
          {/* <button className="inline-flex px-5 py-3 mb-3 text-purple-600 border border-purple-600 rounded-md hover:text-purple-700 focus:text-purple-700 hover:bg-purple-100 focus:bg-purple-100">
            <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="flex-shrink-0 h-5 w-5 -ml-1 mt-0.5 mr-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Manage dashboard
          </button> */}
          <button
            onClick={handleLogout}
            className="inline-flex px-5 py-3 mb-3 ml-6 text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:bg-purple-700"
          >
            {/* <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="flex-shrink-0 w-6 h-6 mr-2 -ml-1 text-white"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg> */}
            Logout
          </button>
        </div>
      </div>
      {/* <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center p-8 bg-white rounded-lg shadow">
          <div className="inline-flex items-center justify-center flex-shrink-0 w-16 h-16 mr-6 text-purple-600 bg-purple-100 rounded-full">
            <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <span className="block text-2xl font-bold">62</span>
            <span className="block text-gray-500">Students</span>
          </div>
        </div>
        <div className="flex items-center p-8 bg-white rounded-lg shadow">
          <div className="inline-flex items-center justify-center flex-shrink-0 w-16 h-16 mr-6 text-green-600 bg-green-100 rounded-full">
            <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div>
            <span className="block text-2xl font-bold">6.8</span>
            <span className="block text-gray-500">Average mark</span>
          </div>
        </div>
        <div className="flex items-center p-8 bg-white rounded-lg shadow">
          <div className="inline-flex items-center justify-center flex-shrink-0 w-16 h-16 mr-6 text-red-600 bg-red-100 rounded-full">
            <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          </div>
          <div>
            <span className="inline-block text-2xl font-bold">9</span>
            <span className="inline-block text-xl font-semibold text-gray-500">(14%)</span>
            <span className="block text-gray-500">Underperforming students</span>
          </div>
        </div>
        <div className="flex items-center p-8 bg-white rounded-lg shadow">
          <div className="inline-flex items-center justify-center flex-shrink-0 w-16 h-16 mr-6 text-blue-600 bg-blue-100 rounded-full">
            <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <span className="block text-2xl font-bold">83%</span>
            <span className="block text-gray-500">Finished homeworks</span>
          </div>
        </div>
      </section> */}
      <section>
        <div className="flex flex-col">
          <div className="overflow-x-auto ">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-gray-300 rounded-lg">
                <table className="min-w-full rounded-xl">
                  <thead>
                    <tr className="bg-gray-50">
                      <th
                        scope="col"
                        className="p-5 text-sm font-semibold leading-6 text-left text-gray-900 capitalize"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="p-5 text-sm font-semibold leading-6 text-left text-gray-900 capitalize"
                      >
                        Card Number
                      </th>
                      <th
                        scope="col"
                        className="p-5 text-sm font-semibold leading-6 text-left text-gray-900 capitalize"
                      >
                        Coin
                      </th>
                      <th
                        scope="col"
                        className="p-5 text-sm font-semibold leading-6 text-left text-gray-900 capitalize"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="p-5 text-sm font-semibold leading-6 text-left text-gray-900 capitalize"
                      >
                        Receive Wallet
                      </th>
                      <th
                        scope="col"
                        className="p-5 text-sm font-semibold leading-6 text-left text-gray-900 capitalize"
                      >
                        Blockhash
                      </th>
                      <th
                        scope="col"
                        className="p-5 text-sm font-semibold leading-6 text-left text-gray-900 capitalize"
                      >
                        Time
                      </th>
                      <th
                        scope="col"
                        className="p-5 text-sm font-semibold leading-6 text-left text-gray-900 capitalize"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300 ">
                    {transactions.map((item) => (
                      <tr key={item._id}>
                        <td className="p-5 text-sm font-medium leading-6 text-gray-900 whitespace-nowrap ">
                          {item.cardholder_name}
                        </td>
                        <td className="p-5 text-sm font-medium leading-6 text-gray-900 whitespace-nowrap">
                          {item.card_number}
                        </td>
                        <td className="p-5 text-sm font-medium leading-6 text-gray-900 whitespace-nowrap">
                          {item.coin_symbol}
                        </td>
                        <td className="p-5 text-sm font-medium leading-6 text-gray-900 whitespace-nowrap">
                          {item.total_amount.toFixed(2)} USDT
                        </td>
                        <td className="p-5 text-sm font-medium leading-6 text-gray-900 whitespace-nowrap">
                          {shortenWalletAddress(item.wallet_address)}
                        </td>
                        <td className="p-5 text-sm font-medium leading-6 text-gray-900 whitespace-nowrap">
                          {shortenWalletAddress(item.block_hash, 20)}
                        </td>
                        <td className="p-5 text-sm font-medium leading-6 text-gray-900 whitespace-nowrap">
                          {item.created_at}
                        </td>
                        <td className="p-5 text-sm font-medium leading-6 text-gray-900 whitespace-nowrap">
                          <div
                            className={`border text-center rounded-lg ${
                              item.status === "Pending"
                                ? "bg-red-200 text-red-700"
                                : "bg-green-200 text-green-700"
                            }`}
                          >
                            {item.status}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="mx-auto">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
