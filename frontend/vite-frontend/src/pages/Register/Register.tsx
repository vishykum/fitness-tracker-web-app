import React, {useRef}  from 'react'
import axios from 'axios'
import './Register.css';
import { useNavigate } from 'react-router-dom';

interface RegisterProps {
  isLoggedIn: string | null;
  setLoggedIn: (value: string | null) => void;
};


const Register: React.FC<RegisterProps> = ({isLoggedIn, setLoggedIn}) => {
    const [username, setUsername] = React.useState("");
    const [pass, setPass] = React.useState("");
    const [confirmPass, setconfirmPass] = React.useState("");
    const [showError, setShowError] = React.useState(false);
    const [error, setError] = React.useState("");
    const navigate = useNavigate();
    const formRef = useRef<HTMLFormElement | null>(null);
    
    //Redirects to home page if already logged in
    React.useEffect(() => {
      console.log(isLoggedIn);
      if (isLoggedIn) {
        navigate('/');
      }
    }, [isLoggedIn]);
    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (showError) setShowError(false);

      if (pass !== confirmPass) {
        setError("Passwords do not match");
        setShowError(true);
        
        if (formRef.current) formRef.current.reset();

        return;
      }


      console.log("Registering user...");
      axios.post(`${import.meta.env.VITE_APP_SERVER_PATH}/users/register`, {"username": username, "password": pass}, {withCredentials: true})
      .then((response) => {
        if (response.status === 200) {
            console.log("User registration complete");
            console.log("Logging in...");
            console.log("Sending login details...");
            axios.post(`${import.meta.env.VITE_APP_SERVER_PATH}/users/login`, {"username": username, "password": pass}, {withCredentials: true})
                .then((response) => {
                    if (response.status === 200) {
                        setLoggedIn(response.data.data.username);
                        console.log("User credentials authenticated successfully");
                        navigate("/");
                    }
            
                    else {
                        console.error("Server error: ", JSON.stringify(response));
                    }
                }).catch((err) => {
                    if (err.response) console.error(`Error: ${JSON.stringify(err.response.data)}`);
                    else console.error(`Error: ${JSON.stringify(err)}`);
            });
        }

        else {
          console.error("Server error: ", JSON.stringify(response));
        }
      }).catch((err) => {
        if (err.response){
            if (err.response.data.message) {
                if (err.response.data.message === "username already exists") {
                    setShowError(true);
                    setError("Username already exists");
                }
            }
            else console.error(`Error: ${JSON.stringify(err.response)}`);
        }
        
        else console.error(`Error: ${JSON.stringify(err)}`);
      });
    }

    return (

      <>
        <div className="flex flex-col h-full justify-center items-center">
          <div className="bg-gradient-to-r from-yellow-200 to-blue-200 dark:from-gray-700 dark:to-orange-300 w-5/8 mt-30 h-max md:mt-0 md:w-3/8 lg:w-1/4 border-2 rounded border-black shadow-[0_0_70px] shadow-black">
            <div className="border-b-2 border-black bg-linear-to-br from-black to-gray-600 dark:to-black">
              <h2 className='text-center text-4xl'><span className='text-blue-600 dark:text-purple-500'>REGI</span><span className='text-yellow-400 dark:text-orange-300'>STER</span></h2>
            </div>
            <div className="flex flex-col items-center m-23">
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="mb-4">
                  <input required type="text"className='shadow-md shadow-gray-500 dark:shadow-gray-700 border border-black p-1 rounded bg-gradient-to-br from-white to-gray-200 dark:from-purple-700 dark:to-gray-700 text-black dark:text-white w-2xs' placeholder='username'  name="username" onChange={(e) => setUsername(e.target.value)}></input>
                </div>
                <div className="my-4">
                  <input required type="password" className='shadow-md shadow-gray-500 dark:shadow-gray-700 border border-black p-1 rounded bg-gradient-to-br from-white to-gray-200 dark:from-purple-700 dark:to-gray-700 text-black dark:text-white w-2xs' placeholder='password' name="password" onChange={(e) => setPass(e.target.value)}></input>
                </div>
                <div className="my-4">
                  <input required type="password" className='shadow-md shadow-gray-500 dark:shadow-gray-700 border border-black p-1 rounded bg-gradient-to-br from-white to-gray-200 dark:from-purple-700 dark:to-gray-700 text-black dark:text-white w-2xs' placeholder='re-type password' name="retype-password" onChange={(e) => setconfirmPass(e.target.value)}></input>
                </div>
                    <span style={{color: "red", display: (showError) ? "block" : "none"}}>{error}</span>
                    <div className='text-center'>
                        <button type="submit" style={{margin: "10px", }} className='shadow-md shadow-gray-500 dark:shadow-gray-700 border p-2 rounded-full text-blue-600 dark:text-white bg-gray-800 border-blue-600 dark:border-white hover:bg-yellow-400 dark:hover:bg-purple-500 dark:hover:text-white active:bg-green-700 dark:active:bg-white active:text-white dark:active:text-gray-700' id="formsubmit">REGISTER</button>
                    </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
}

export default Register;