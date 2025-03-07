import React from 'react'
import axios from 'axios'
import './Home.css';
import BodyFatTable from '../../components/BodyFatTable';
import MusclemassTable from '../../components/MusclemassTable';
import MusclemassChart from '../../components/MusclemassChart';
import BodyFatChart from '../../components/BodyFatChart';
import { BodyFat, MuscleMass } from '../../types';

interface HomeProps {
isLoggedIn: string | null;
darkMode: boolean;
};


const Home: React.FC<HomeProps> = ({isLoggedIn, darkMode}) => {

const Welcome: React.FC = () => {
  const [bodyfatData, setBodyfatData] = React.useState<BodyFat[]>([]);
  const [relevantBodyfatData, setRelevantBodyfatData] = React.useState<BodyFat[]>([]);
  const [musclemassData, setMusclemassData] = React.useState<MuscleMass[]>([]);
  const [relevantMusclemassData, setRelevantMusclemassData] = React.useState<MuscleMass[]>([]);
  const [bfFilter, setBFFilter] = React.useState<string>("month");
  const [mmFilter, setMMFilter] = React.useState<string>("month");
  const firstBFRef = React.useRef(true);
  const firstMMRef = React.useRef(true);
  const firstfilterRef = React.useRef(true);

  React.useEffect( () => {
      if(isLoggedIn) {         
          if (!sessionStorage.getItem('bodyfat')) {
              console.log("Retreiving bodyfat data from db...");
              axios.get(`${import.meta.env.VITE_APP_SERVER_PATH}/bodyfat/`, {withCredentials: true})
                  .then((response) => {
                  console.log("Bodyfat data retreived successfully");
                  
                  setBodyfatData(response.data.data as BodyFat[]);
                  console.log("Data: ", JSON.stringify(bodyfatData));
                  console.log('Body fat data retreived successfully');
              })
                  .catch((err) => {
                  if (err.response) console.error(`Error: ${JSON.stringify(err.response)}`);
                  else console.error(`Error: ${JSON.stringify(err)}`);
              });
          }
          
          else {
              firstBFRef.current = true;
              console.log('Retreiving body fat data from session store...');
              const bodyfatString = sessionStorage.getItem('bodyfat') as string;
              setBodyfatData(JSON.parse(bodyfatString) as BodyFat[]);
              console.log("Session store data: ", bodyfatString);
              console.log('Body fat data retreived successfully');
          }

          if (!sessionStorage.getItem('musclemass')) {
            console.log("Retreiving muscle mass data from db...");
            axios.get(`${import.meta.env.VITE_APP_SERVER_PATH}/musclemass/`, {withCredentials: true})
                .then((response) => {
                console.log("Muscle mass data retreived successfully");
                
                setMusclemassData(response.data.data as MuscleMass[]);
                console.log("Data: ", JSON.stringify(bodyfatData));
                console.log('Muscle mass fat data retreived successfully');
            })
                .catch((err) => {
                if (err.response) console.error(`Error: ${JSON.stringify(err.response)}`);
                else console.error(`Error: ${JSON.stringify(err)}`);
            });
        }
        
        else {
            firstMMRef.current = true;
            console.log('Retreiving muscle mass data from session store...');
            const musclemassString = sessionStorage.getItem('musclemass') as string;
            setMusclemassData(JSON.parse(musclemassString) as MuscleMass[]);
            console.log("Session store data: ", musclemassString);
            console.log('Muscle mass data retreived successfully');
        }
      }
  }, []);

  React.useEffect(() => {
      if (!firstBFRef.current) {
          sessionStorage.setItem('bodyfat', JSON.stringify(bodyfatData));
          console.log("bodyfat session stored", JSON.stringify(bodyfatData));
      }
      firstBFRef.current = false;
  }, [bodyfatData]);

  React.useEffect(() => {
    if (!firstMMRef.current) {
        sessionStorage.setItem('musclemass', JSON.stringify(musclemassData));
        console.log("musclemass session stored", JSON.stringify(musclemassData));
    }
    firstMMRef.current = false;
  }, [musclemassData]);

  React.useEffect(() => {
    if (firstfilterRef.current) {
      if (sessionStorage.getItem('bfFilter')) {
        setBFFilter(sessionStorage.getItem('bfFilter') as string);
      }
      if (sessionStorage.getItem('mmFilter')) {
        setMMFilter(sessionStorage.getItem('mmFilter') as string);
      }
      firstfilterRef.current = false;
    }
  }, []);
  React.useEffect(() => {}, [relevantMusclemassData]);

  function filterBFData(filter: string) {
    if (filter === 'month') {       
      setRelevantBodyfatData([...bodyfatData.filter((i) => {
      const currDate = new Date();
      const itemDate = new Date(i.date);

      return currDate.getMonth() === itemDate.getMonth() && currDate.getFullYear() === itemDate.getFullYear();
    })
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())]);
    }

    else if (filter === 'year') {
        setRelevantBodyfatData([...bodyfatData.filter((i) => {
            const currDate = new Date();
            const itemDate = new Date(i.date);

            return currDate.getFullYear() === itemDate.getFullYear();
        })]);
    }

    else setRelevantBodyfatData([...bodyfatData]);
  }

  function filterMMData(filter: string) {
    if (filter === 'month') {       
      setRelevantMusclemassData([...musclemassData.filter((i) => {
      const currDate = new Date();
      const itemDate = new Date(i.date);

      return currDate.getMonth() === itemDate.getMonth() && currDate.getFullYear() === itemDate.getFullYear();
    })
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())]);
    }

    else if (filter === 'year') {
        setRelevantMusclemassData([...musclemassData.filter((i) => {
            const currDate = new Date();
            const itemDate = new Date(i.date);

            return currDate.getFullYear() === itemDate.getFullYear();
        })]);
    }

    else setRelevantMusclemassData([...musclemassData]);
  }

  React.useEffect(() => {
    filterBFData(bfFilter);
    sessionStorage.setItem('bfFilter', bfFilter);
  }, [bodyfatData, bfFilter]);

  React.useEffect(() => {
    filterMMData(mmFilter);
    sessionStorage.setItem('mmFilter', mmFilter);
  }, [musclemassData, mmFilter]);

  function handleBFChange(e: React.ChangeEvent<HTMLSelectElement>) {
      setBFFilter(e.target.value);
  }

  function handleMMChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setMMFilter(e.target.value);
  }

  return (
    <>
      <h1 className='text-center text-5xl mb-5 font-bold text-blue-600 dark:text-orange-400 uppercase'>{isLoggedIn}</h1>
      
          <div className="flex flex-col w-full justify-center items-center">
            <div className="flex flex-col w-3/4 h-3/4 justify-between items-center bg-blue-500 dark:bg-purple-300 m-5 border-2 rounded border-black shadow-[0_0_70px] shadow-black">
              <div className="flex h-10 w-full justify-around items-center border-b-2 border-black bg-linear-to-br from-black to-gray-600 dark:to-black">
                <h2 className="text-blue-600 dark:text-purple-500 text-center text-4xl">BODYFAT</h2>
                <select className="bg-yellow-400 border-1 border-blue-600 dark:border-purple-500  dark:bg-orange-300 rounded-full text-center text-sm" value={bfFilter} name="filter" onChange={handleBFChange}>
                    <option value="month" style={{fontSize: "13px"}}>This month</option>
                    <option value="year" style={{fontSize: "13px"}}>This year</option>
                    <option value="all" style={{fontSize: "13px"}}>All time</option>
                </select>
              </div>
                <div className="flex flex-col md:flex-row w-full h-full items-start">
                  <div className="w-full md:w-2/3 h-full">
                    <BodyFatChart darkMode={darkMode} username={isLoggedIn} bodyfatData={relevantBodyfatData}/>
                  </div>
                  <div className="flex-1 h-full w-full">
                    <BodyFatTable bodyfatData={relevantBodyfatData} originalData={bodyfatData} setBodyfatData={setBodyfatData}/>
                  </div>
                </div>
            </div>

            <div className="flex flex-col w-3/4 h-3/4 justify-between items-center bg-blue-500 dark:bg-purple-300 m-5 border-2 rounded border-black shadow-[0_0_70px] shadow-black">
              <div className="flex h-10 w-full justify-around items-center border-b-2 border-black bg-linear-to-br from-black to-gray-600 dark:to-black">
                <h2 className="text-blue-600 dark:text-purple-500 text-center text-4xl">MUSCLE MASS</h2>
                <select className="bg-yellow-400 border-1 border-blue-600 dark:border-purple-500  dark:bg-orange-300 rounded-full text-center text-sm" name="filter" value={mmFilter} onChange={handleMMChange}>
                    <option value="month" style={{fontSize: "13px"}}>This month</option>
                    <option value="year" style={{fontSize: "13px"}}>This year</option>
                    <option value="all" style={{fontSize: "13px"}}>All time</option>
                </select>
              </div>
                <div className="flex flex-col md:flex-row w-full h-full items-start">
                  <div className="w-full md:w-2/3 h-full">
                    <MusclemassChart darkMode={darkMode} username={isLoggedIn} musclemassData={relevantMusclemassData}/>
                  </div>
                  <div className="flex-1 h-full w-full">
                    <MusclemassTable musclemassData={relevantMusclemassData} originalData={musclemassData} setMusclemassData={setMusclemassData}/>
                  </div>
                </div>
            </div>
          </div>
    </>
  );
};

const welcome = <h1 className='text-center z-10'>PLEASE LOG IN OR REGISTER TO CONTINUE</h1>;
const loggedIn = <Welcome />;

return (

  <>
  {
    (isLoggedIn) ?
    loggedIn:
    welcome
  }
  </>
);
}

export default Home;