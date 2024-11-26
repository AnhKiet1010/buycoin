import "./App.css";
import CheckoutForm from "./components/CheckoutForm";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { PrivateRoute, PublicRoute } from "./helpers/router";
import Dashboard from "./pages/dashboard";
import LoginPage from "./pages/login";

function App() {
  return (
    <Router>
      <Switch>
        <PublicRoute exact path="/" component={CheckoutForm} />
        <PublicRoute exact path="/login" component={LoginPage} />
        <PrivateRoute exact path="/dashboard" component={Dashboard} />
      </Switch>
    </Router>
  );
}

export default App;
