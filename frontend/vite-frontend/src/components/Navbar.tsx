import React from 'react'
import {Link} from 'react-router-dom'
import axios from 'axios'
import {Moon, Sun} from "lucide-react";
import { useCookies } from 'react-cookie';

interface NavbarProps {
    isLoggedIn: string | null;
    setLoggedIn: (loggedIn: string | null) => void
    darkMode: boolean;
    setDarkMode: (darkMode: boolean) => void;
};

const Navbar: React.FC<NavbarProps> = ({isLoggedIn, setLoggedIn, darkMode, setDarkMode}) => {
    const [cookies, setCookie] = useCookies(['theme']);

    React.useEffect(() => {
        if (cookies.theme === 'dark') {
          setDarkMode(true);
          document.documentElement.classList.add('dark');
        } else {
          setDarkMode(false);
          document.documentElement.classList.remove('dark');
        }
      }, []);
    
    React.useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            setCookie('theme', 'dark', {path: '/', maxAge: 365 * 24 * 60 * 60});
            console.log("Dark mode enabled");
        }
        else {
            document.documentElement.classList.remove("dark");
            setCookie('theme', 'light', {path: '/', maxAge: 365 * 24 * 60 * 60});
            console.log("Dark mode disabled");
        }
    }, [darkMode]);

    const logout = () => {
        console.log("Logging out...");
        axios.get(`${import.meta.env.VITE_APP_SERVER_PATH}/users/logout`, {withCredentials: true})
        .then((response) => {
            if (response.status === 200) {
                setLoggedIn(null);
                sessionStorage.clear();
                console.log("Logged out successfully");
            }
        }).catch((err) => {
            if (err.response) console.error(`Error: ${err.response}`);
            else console.error(`Error: ${JSON.stringify(err)}`);
        });
    }

    const navbarMargin = {margin: "5px"};

    const loginButton = <Link to={(isLoggedIn) ? "/" : "/login"} className="text-blue-600 dark:text-purple-500 border-1 border-blue-600 dark:border-purple-500 p-2 rounded hover:bg-blue-600 dark:hover:bg-white hover:text-gray-900" style={navbarMargin}>Login</Link>;
    const registerButton = <Link to="/register" className="text-yellow-400 dark:text-orange-300 border-1 border-yellow-400 dark:border-orange-300 p-2 rounded hover:bg-yellow-400 dark:hover:bg-orange-300 hover:text-gray-900" style={navbarMargin}>Register</Link>;

    const logoutButton = <Link to="/" onClick={logout} className="text-red-600 dark:text-orange-500 border-1 border-red-600 dark:border-orange-500 p-2 rounded hover:bg-red-600 dark:hover:bg-orange-500 hover:text-gray-900" style={navbarMargin}>Logout</Link>;

    return (
    <>
        <div className="bg-linear-to-br from-black to-gray-600 dark:to-black flex justify-between items-center h-14">
            <div>
                <Link to="/" className="text-xl" style={navbarMargin}>
                    <span className='text-blue-600 dark:text-purple-500'>FITNESS</span> <span className='text-yellow-400 dark:text-orange-300'>TRACKER</span>
                </Link>
            </div>

            <div className="flex items-center">
                <button onClick={() => setDarkMode(!darkMode)} 
                    className='border border-gray-950 dark:border-gray-300 relative w-14 h-8 md:w-18 flex items-center rounded-full bg-linear-to-br from-white to-blue-300 dark:bg-linear-to-bl dark:from-purple-200 dark:to-gray-800 p-1 mr-2 transition duration-300'>
                    <div className={`w-6 h-6 bg-white dark:bg-black rounded-full shadow-md transform
                        ${darkMode ? "translate-x-6 md:translate-x-10" : ""} transition duration-300`}></div>
                    <Sun className="absolute left-2 text-yellow-500 w-4 h-4" />
                    <Moon className="absolute right-2 text-gray-400 w-4 h-4" />
                </button>
                {
                    (isLoggedIn) ? 
                    
                    logoutButton

                    :
                    <>
                        {loginButton}
                        {registerButton}
                    </>
                }
            </div>
        </div>
    </>
    );
}

export default Navbar;