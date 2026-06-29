import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {

  const navigate = useNavigate();

  const [fullname, setFullname] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      const response =
        await fetch(
          "http://127.0.0.1:5000/register",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              fullname,
              email,
              password

            })

          }
        );

      const data =
        await response.json();

      setMessage(
        data.message
      );

      if (data.success) {

        setFullname("");
        setEmail("");
        setPassword("");

        setMessage(
          "Registration Successful! Redirecting to Login..."
        );

        setTimeout(() => {

          navigate("/login");

        }, 1500);

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
          Register
        </h1>

        <form
          onSubmit={handleRegister}
        >

          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) =>
              setFullname(
                e.target.value
              )
            }
            required
          />

          <input
            type="email"
            placeholder="Enter Gmail Address"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            pattern=".+@gmail\.com"
            title="Please enter a Gmail address"
            required
          />

          <input
            type="password"
            placeholder="Password"
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
            Register
          </button>

        </form>

        <p
          style={{
            marginTop: "15px",
            textAlign: "center"
          }}
        >
          Already have an account?

          <span
            style={{
              marginLeft: "5px",
              cursor: "pointer",
              color: "#4f7f72",
              fontWeight: "600"
            }}
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </span>
        </p>

        {message && (

          <p
            style={{
              marginTop: "15px",
              textAlign: "center"
            }}
          >
            {message}
          </p>

        )}

      </div>

    </div>

  );

};

export default Register;