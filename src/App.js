import './App.css';
import Forecast from "./components/Forecast/Forecast";
import Navbar from "./components/Navbar/Navbar";

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <Navbar/>
        <h1>Weather App</h1>
      </header>
      <main>
       <Forecast cityName="tel-Aviv"/>
      </main>
      <footer>
        Page created by Ben
      </footer>
...
    </div>
  );
}

export default App;
