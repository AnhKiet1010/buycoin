import { useEffect, useState } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";

import Loader from "@/common/Loader";
import DefaultLayout from "@/layout/DefaultLayout";

function AdminPage() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  );
}

export default AdminPage;
