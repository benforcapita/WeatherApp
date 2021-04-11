import React from 'react';

const Favorites = (props) => {

   const listItems =(localStorage.length>0)?<ul>{Object.keys(localStorage).map((key) =>  <li key ={key}>{key} {localStorage[key]}</li>)}</ul>:<div></div>
   return (
    <div>
       {listItems}
    </div>
   )
}

export default Favorites;