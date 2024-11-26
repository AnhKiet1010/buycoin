import React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import Auth from "@/api/Auth";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { LOGIN } from "@/slices/auth";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();

  const onSubmit = async (data) => {
    const { email, password } = data;
    console.log({ data });
    setLoading(true);
    await Auth.login({ email, password })
      .then((response) => {
        setLoading(false);
        dispatch(LOGIN(response.data));
        history.push("/dashboard");
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error ? error.response.data.error : error.message;
        toast.error(message);
        setLoading(false);
      });
  };

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col justify-center items-center bg-white h-[100vh]">
        <div className="mx-auto flex w-full flex-col justify-center px-5 pt-0 md:h-[unset] md:max-w-[50%] lg:h-[100vh] min-h-[100vh] lg:max-w-[50%] lg:px-6">
          <a className="mt-10 w-fit text-zinc-950 " href="/">
            <div className="flex items-center w-fit lg:pl-0 lg:pt-0 xl:pt-0">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 320 512"
                className="mr-3 h-[13px] w-[8px] text-zinc-950 "
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"></path>
              </svg>
              <p className="ml-0 text-sm text-zinc-950 ">Back to the website</p>
            </div>
          </a>
          <div className="my-auto mb-auto mt-8 flex flex-col md:mt-[70px] w-[350px] max-w-[450px] mx-auto md:max-w-[450px] lg:mt-[130px] lg:max-w-[450px]">
            <p className="text-[32px] font-bold text-zinc-950 ">Sign In</p>
            <p className="mb-2.5 mt-2.5 font-normal text-zinc-950">
              Enter your email and password to sign in!
            </p>
            <div className="relative my-4">
              <div className="relative flex items-center py-1">
                <div className="border-t grow border-zinc-200"></div>
                <div className="border-t grow border-zinc-200"></div>
              </div>
            </div>
            <div>
              <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <label className="text-zinc-950 " htmlFor="email">
                      Email
                    </label>
                    <input
                      className="mr-2.5 mb-2 h-full min-h-[44px] w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-0"
                      id="email"
                      {...register("email", {
                        required: "Email is required",
                      })}
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      name="email"
                    />
                    <label className="mt-2 text-zinc-950 " htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      {...register("password", {
                        required: "Password is required",
                        pattern: {
                          value: /^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/,
                          message: "Password must contain at least 8 characters and a number",
                        },
                      })}
                      placeholder="Password"
                      type="password"
                      autoComplete="current-password"
                      className="mr-2.5 mb-2 h-full min-h-[44px] w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-0"
                      name="password"
                    />
                  </div>
                  <button
                    className="whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary mt-2 flex h-[unset] w-full items-center justify-center rounded-lg px-4 py-4 text-sm font-medium"
                    type="submit"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
