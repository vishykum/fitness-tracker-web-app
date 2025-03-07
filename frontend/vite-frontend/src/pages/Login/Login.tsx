import React  from 'react'
import axios from 'axios'
import './Login.css';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  isLoggedIn: string | null;
  setLoggedIn: (value: string | null) => void;
};


const Login: React.FC<LoginProps> = ({isLoggedIn, setLoggedIn}) => {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const navigate = useNavigate();

    //Redirects to home page if already logged in
    React.useEffect(() => {
      if (isLoggedIn) {
        navigate('/');
      }
    }, [isLoggedIn]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      console.log("Sending login details...");
      axios.post(`${import.meta.env.VITE_APP_SERVER_PATH as string}/users/login`, {username, password}, {withCredentials: true})
      .then((response) => {
        if (response.status === 200) {
          setLoggedIn(response.data.data.username);
          console.log("User credentials authenticated successfully: ", isLoggedIn);
          navigate("/");
        }

        else {
          console.error("Server error: ", JSON.stringify(response));
        }
      }).catch((err) => {
        if (err.response) console.error(`Error: ${JSON.stringify(err.response)}`);
        else console.error(`Error: ${JSON.stringify(err)}`);
      });
    }

    return (

      <>
        <div className='flex flex-col h-full justify-center items-center'>
          <div className="bg-gradient-to-r from-yellow-200 to-blue-200 dark:from-gray-700 dark:to-orange-300 w-5/8 mt-30 h-max md:mt-0 md:w-3/8 xl:w-1/4 border-2 rounded border-black shadow-[0_0_70px] shadow-black">
            <div className='border-b-2 border-black bg-linear-to-br from-black to-gray-600 dark:to-black'>
              <h2 className='text-center text-4xl'><span className='text-blue-600 dark:text-purple-500'>LOG</span><span className='text-yellow-400 dark:text-orange-300'>IN</span></h2>
            </div>
            <div className="flex flex-col items-center m-23">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <input required type="text" className='shadow-md shadow-gray-500 dark:shadow-gray-700 border border-black p-1 rounded bg-gradient-to-br from-white to-gray-200 dark:from-purple-700 dark:to-gray-700 text-black dark:text-white w-50 md:w-2xs' placeholder='username'  name="username" onChange={(e) => setUsername(e.target.value)}></input>
                </div>
                <div className="my-4">
                  <input required type="password" className="shadow-md shadow-gray-500 dark:shadow-gray-700 border border-black p-1 rounded bg-gradient-to-br from-white to-gray-200 dark:from-purple-700 dark:to-gray-700 w-50 md:w-2xs text-black dark:text-white" placeholder='password' name="password" onChange={(e) => setPassword(e.target.value)}></input>
                </div>
                  <div className='text-center'>
                    <button type="submit" style={{margin: "10px", }} className='shadow-md shadow-gray-500 dark:shadow-gray-700 border p-2 rounded-full text-blue-600 dark:text-white bg-gray-800 border-blue-600 dark:border-white hover:bg-yellow-400 dark:hover:bg-purple-500 dark:hover:text-white active:bg-green-700 dark:active:bg-white active:text-white dark:active:text-gray-700' id="formsubmit">LOGIN</button>
                  </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
}

export default Login;