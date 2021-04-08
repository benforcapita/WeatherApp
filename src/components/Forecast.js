import React, { useState } from 'react';
import Conditions from './Conditions';
import axios from 'axios';



const Forecast = (props) => {
    const options1 = {
        url: process.env.REACT_APP_API_URL+process.env.REACT_APP_API_KEY+'&q='+props.cityName+'&language=en-us&details=true',
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      };
      const options_DAILY = function(cityLocation) {
          return{
            url: process.env.REACT_APP_API_DAILY_API_URL+cityLocation+"?apikey="+process.env.REACT_APP_API_KEY+"&language=en-us&details=true",
            method: 'GET',
            headers: {
              'Access-Control-Allow-Origin': '*'
            }
          }
      };
      const options_HOURLY = function(cityLocation) {
        return{
          url: process.env.REACT_APP_API_HOURLY_API_URL+cityLocation+"?apikey="+process.env.REACT_APP_API_KEY+"&language=en-us&details=true",
          method: 'GET',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
    };
    let [city, setCity] = useState('');
    let [unit, setUnit] = useState('metric');
    let [LocalizationResponseObj, setLocalizationResponseObj] = useState({});
    let [responseObjDaily, setResponseDailyObj] = useState({});
    let [responseObjHourly, setResponseHourlyObj] = useState({});
   function getForecast() {
    axios(options1).then(response => response)
    .then(response => {
        setLocalizationResponseObj(response);
        // setResponseObj(response)
         axios(options_DAILY(response["data"][0]["Key"])).then(response => response).then(response =>
            {  
                setResponseDailyObj(response)
            })
        axios(options_HOURLY(response["data"][0]["Key"])).then(response => response).then(response =>
                {  
                    setResponseHourlyObj(response)
                })
    })
   }

   return (
    <div>
        <h2>Find Current Weather Conditions</h2>
    <div>
        {/* {responseObj["data"][0]} */}
        <Conditions LocalizationResponseObj = {LocalizationResponseObj} responseObjDaily = {responseObjDaily} responseObjHourly = {responseObjHourly}/>
    </div>
        <button onClick={getForecast}>Get Forecast</button>
</div>
   )
}

export default Forecast;