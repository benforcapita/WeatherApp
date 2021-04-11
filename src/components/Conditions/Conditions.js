import React, { useState } from 'react';
import classes from './Conditions.module.css'

const Conditions = (props) => {

    let [canRender, SetCanRender] = useState(false);
    React.useEffect((canRender)=> {
          
            let result =(props.LocalizationResponseObj.hasOwnProperty("data")&&props.responseObjHourly.hasOwnProperty("data")&&props.responseObjDaily.hasOwnProperty("data")) 
            SetCanRender(canRender?true:result)
            if(result)
            {
                localStorage.setItem(props.LocalizationResponseObj["data"][0]["LocalizedName"], JSON.stringify({'Degrees':Math.round(((props.responseObjHourly["data"][0].Temperature.Value)-32)*5/9),'Desc':props.responseObjDaily["data"]["Headline"]["Text"]}));
            }
                
     }, [props.LocalizationResponseObj, props.responseObjHourly, props.responseObjDaily]);

    return (
        <div className={classes.Wrapper}>
           {props.error && <small className={classes.Small} >Please enter a valid city.</small>}
           {props.loading && <div className={classes.Loader}>Loading...</div>}
            {canRender?
            <div>
                <p>
                    <strong>
                        {props.LocalizationResponseObj["data"][0]["LocalizedName"]}
                    </strong>
                </p>
                <p> It is currently {Math.round(((props.responseObjHourly["data"][0].Temperature.Value)-32)*5/9)} degrees out with {props.responseObjDaily["data"]["Headline"]["Text"] }.
                </p>
            </div>:
            null   
        }
        </div>
    )

}

export default Conditions;