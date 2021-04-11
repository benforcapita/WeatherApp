import React from 'react';
import Forecast from "../Forecast/Forecast";
import Favorites from "../Favorites/Favorites"
import classes from './MyRouter.module.css';
import {BrowserRouter as Router,Switch,Route,Link} from 'react-router-dom';
function MyRouter(props){ 
            return(
                <Router>
                       <div className={classes.App_header}>
                            <h1>Weather App </h1>
                            <ul>
                        <li>
                            <Link to="/" onClick ={props.mapDispatchToProps} >main</Link>
                        </li>
                        <li>
                            <Link to="/Favorites">Favorites</Link>
                        </li>
                    </ul>
                </div>
                    
                    <Switch>
                        <Route exact path="/">
                            <Forecast/>
                        </Route>
                        <Route exact path="/Favorites">
                            <Favorites/>
                        </Route>
                    </Switch>
                </Router>
            
            );}
export default MyRouter