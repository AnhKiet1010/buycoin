import "./App.css";
import CheckoutForm from "./components/CheckoutForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { PrivateRoute, PublicRoute } from "./helpers/router";
import AdminPage from "@/pages/Admin";
import SignInPage from "@/pages/SignIn";
import PageTitle from "@/components/PageTitle";
import Calendar from "@/pages/Admin/Calendar";
import Chart from "@/pages/Admin/Chart";
import FormElements from "@/pages/Admin/Form/FormElements";
import FormLayout from "@/pages/Admin/Form/FormLayout";
import Profile from "@/pages/Admin/Profile";
import Settings from "@/pages/Admin/Settings";
import Tables from "@/pages/Admin/Tables";
import Alerts from "@/pages/Admin/UiElements/Alerts";
import Buttons from "@/pages/Admin/UiElements/Buttons";
import Transactions from "@/pages/Admin/Transactions";
import SlipRates from "./pages/Admin/Settings/SlipRates";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<CheckoutForm />} />
          <Route path="/signin" element={<SignInPage />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<AdminPage />}>
            <Route
              path="transactions"
              element={
                <>
                  <PageTitle title="Transactions | Hewe.io" />
                  <Transactions />
                </>
              }
            />
            <Route
              path="calendar"
              element={
                <>
                  <PageTitle title="Calendar | Hewe.io" />
                  <Calendar />
                </>
              }
            />
            <Route
              path="profile"
              element={
                <>
                  <PageTitle title="Profile | Hewe.io" />
                  <Profile />
                </>
              }
            />
            <Route
              path="forms/form-elements"
              element={
                <>
                  <PageTitle title="Form Elements | Hewe.io" />
                  <FormElements />
                </>
              }
            />
            <Route
              path="forms/form-layout"
              element={
                <>
                  <PageTitle title="Form Layout | Hewe.io" />
                  <FormLayout />
                </>
              }
            />
            <Route
              path="tables"
              element={
                <>
                  <PageTitle title="Tables | Hewe.io" />
                  <Tables />
                </>
              }
            />
            <Route path="settings">
              <Route
                path="slip-rates"
                element={
                  <>
                    <PageTitle title="Slip Rates | Hewe.io" />
                    <SlipRates />
                  </>
                }
              />
            </Route>
            <Route
              path="chart"
              element={
                <>
                  <PageTitle title="Basic Chart | Hewe.io" />
                  <Chart />
                </>
              }
            />
            <Route
              path="ui/alerts"
              element={
                <>
                  <PageTitle title="Alerts | Hewe.io" />
                  <Alerts />
                </>
              }
            />
            <Route
              path="ui/buttons"
              element={
                <>
                  <PageTitle title="Buttons | Hewe.io" />
                  <Buttons />
                </>
              }
            />
          </Route>
        </Route>

        {/* Fallback for undefined routes */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
