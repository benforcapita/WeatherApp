import React, { useState } from 'react';
import classes from './Conditions.module.css'

const Conditions = (props) => {

    let [canRender, SetCanRender] = useState(false);
    React.useEffect((canRender)=> {
          
            SetCanRender(canRender?true:
                (props.LocalizationResponseObj.hasOwnProperty("data")&&props.responseObjHourly.hasOwnProperty("data")&&props.responseObjDaily.hasOwnProperty("data")))
     }, [props.LocalizationResponseObj, props.responseObjHourly, props.responseObjDaily]);

    return (
        <div className={classes.Wrapper}>
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