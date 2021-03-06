import React, { useState } from 'react';
import Conditions from '../Conditions/Conditions.js';
import axios from 'axios';
import classes from './Forecast.module.css';

const Forecast = (props) => {
   
    let [city, setCity] = useState('');
    let [unit, setUnit] = useState('metric');
    let [error, setError] = useState(false);
    let [loading, setLoading] = useState(false);
    let [LocalizationResponseObj, setLocalizationResponseObj] = useState({});
    let [responseObjDaily, setResponseDailyObj] = useState({});
    let [responseObjHourly, setResponseHourlyObj] = useState({});
    const API = {'API_URL':'http://dataservice.accuweather.com/locations/v1/cities/search?apikey=','HOURLY_API_URL':'http://dataservice.accuweather.com/forecasts/v1/hourly/1hour/','DAILY_API_URL':'http://dataservice.accuweather.com/forecasts/v1/daily/5day/'}
    const API_KEY = 'ecKqGR09esbXGRNOLZJA59DpCdOmvHvt'
    const options_localization_code = {
      url: API['API_URL']+API_KEY+'&q='+city+'&language=en-us&details=true',
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    };
    const options_DAILY = function(cityLocation) {
        return{
          url: API['DAILY_API_URL']+cityLocation+"?apikey="+API_KEY+"&language=en-us&details=true",
          method: 'GET',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
    };
    const options_HOURLY = function(cityLocation) {
      return{
        url: API['HOURLY_API_URL']+cityLocation+"?apikey="+API_KEY+"&language=en-us&details=true",
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
  };
   function getForecast(e) {
    e.preventDefault();
    if (!city) {
      return setError(true);
  }
    axios(options_localization_code).then(response => response)
    .then(response => {
      if (response.data.length === 0) {
        throw new Error()
    }
      setError(false);
        setLocalizationResponseObj(response);
         axios(options_DAILY(response["data"][0]["Key"])).then(response => response).then(response =>
            {
              if (response.data.length === 0) {
                throw new Error()
            }

                setResponseDailyObj(response)
            }).catch(err => {
              setError(true);
              setLoading(false);
              console.log(err.message);
          });
        axios(options_HOURLY(response["data"][0]["Key"])).then(response => response).then(response =>
                {  
                  if (response.status !== 200) {
                    throw new Error()
                }
                    setResponseHourlyObj(response)
                }).catch(err => {
                  setError(true);
                  setLoading(false);
                  console.log(err.message);
              });
    }).catch(err => {
      setError(true);
      setLoading(false);
      console.log(err.message);
  });
   }

   return (
    <div>
        <h2>Find Current Weather Conditions</h2>
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
                <button disabled={!city} className={(!city)?classes.Button_disabled:classes.Button} type="submit" >Get Forecast</button>
            </form>
            <div>
        <Conditions LocalizationResponseObj = {LocalizationResponseObj} responseObjDaily = {responseObjDaily} responseObjHourly = {responseObjHourly} error={error} loading={loading} />
    </div>
</div>
   )
}

export default Forecast;