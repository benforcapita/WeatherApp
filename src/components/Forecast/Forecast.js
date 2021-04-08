import React, { useState } from 'react';
import Conditions from '../Conditions';
import axios from 'axios';
import classes from './Forecast.module.css';

const Forecast = (props) => {
   
    let [city, setCity] = useState('');
    let [unit, setUnit] = useState('metric');
    const uriEncodedCity = encodeURIComponent(city);
    let [LocalizationResponseObj, setLocalizationResponseObj] = useState({});
    let [responseObjDaily, setResponseDailyObj] = useState({});
    let [responseObjHourly, setResponseHourlyObj] = useState({});
    const options_localization_code = {
      url: process.env.REACT_APP_API_URL+process.env.REACT_APP_API_KEY+'&q='+city+'&language=en-us&details=true',
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
   function getForecast(e) {
    e.preventDefault();
    axios(options_localization_code).then(response => response)
    .then(response => {
        setLocalizationResponseObj(response);
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
        <Conditions LocalizationResponseObj = {LocalizationResponseObj} responseObjDaily = {responseObjDaily} responseObjHourly = {responseObjHourly}/>
    </div>
    <form onSubmit={getForecast}>
                <input
                    type="text"
                    placeholder="Enter City"
                    maxLength="50"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={classes.textInput}
                    />
                <label className={classes.Radio} >
                    <input
                        type="radio"
                        name="units"
                        checked={unit === "imperial"}
                        value="imperial"
                        onChange={(e) => setUnit(e.target.value)}
                        />
                    Fahrenheit
                </label>
                <label className={classes.Radio}>
                    <input
                        type="radio"
                        name="units"
                        checked={unit === "metric"}
                        value="metric"
                        onChange={(e) => setUnit(e.target.value)}
                        />
                    Celcius
                </label>
                <button className={classes.Button} type="submit"  >Get Forecast</button>
            </form>
</div>
   )
}

export default Forecast;