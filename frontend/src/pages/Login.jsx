import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const response =
        await fetch(
          "http://127.0.0.1:5000/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              email,
              password

            })

          }
        );

      const data =
        await response.json();

      console.log(data);

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {

        setMessage(
          data.message
        );

      }

    } catch (error) {

      console.log(error);

      setMessage(
        "Server Error"
      );

    }

  };

  return (

    <div className="container section">

      <div className="auth-form">

        <h1>
          Login
        </h1>

        <form
          onSubmit={
            handleLogin
          }
        >

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            required
          />

          <button
            className="btn"
            type="submit"
          >
            Login
          </button>

        </form>

        {message && (

          <p
            style={{
              marginTop: "15px",
              textAlign: "center",
              color: "red"
            }}
          >
            {message}
          </p>

        )}

      </div>

    </div>

  );

};

export default Login;