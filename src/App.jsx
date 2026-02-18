import { useEffect, useState } from "react"
import "./App.css"

const defaultCities = [
  "Kolkata",
  "Hong Kong",
  "New York"
];

const iconMap = {
  "01d": "/icons/sun.png",
  "01n": "/icons/moon.png",

  "02d": "/icons/partly-sunny.png",
  "02n": "/icons/cloud.png", // you don't have cloud-moon.png

  "03d": "/icons/cloud.png",
  "03n": "/icons/cloud.png",

  "04d": "/icons/cloud.png",
  "04n": "/icons/cloud.png",

  "09d": "/icons/rain.png",
  "09n": "/icons/rain.png",

  "10d": "/icons/rain.png",  // you don't have rain-sun.png
  "10n": "/icons/rain.png",

  "11d": "/icons/thunder.png",
  "11n": "/icons/thunder.png",

  "13d": "/icons/snow.png",
  "13n": "/icons/snow.png",

  "50d": "/icons/mist.png",
  "50n": "/icons/mist.png",
};




function App() {
  const API_KEY = "0e70981083dbc22754fea3bb33e1eb65";
  const [city, setCity] = useState("")
  const [defaultWeather, setDefaultWeather] = useState([])
  const [searchedWeather, setSearchedWeather] = useState([])


  const fetchWeatherByCoords = async (lat, lon) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    )
    const data = await response.json()
    return data
  }


  const fetchWeather = async (cityName) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
    )
    const data = await response.json()
    return data
  }

  // Load default cities
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        // Load predefined cities
        const defaultResults = await Promise.all(
          defaultCities.map((city) => fetchWeather(city))
        )

        // Try to get user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              const userCity = await fetchWeatherByCoords(latitude, longitude)

              if (userCity.main) {
                setDefaultWeather([userCity, ...defaultResults])
              } else {
                setDefaultWeather(defaultResults)
              }
            },
            () => {
              // If user denies permission
              setDefaultWeather(defaultResults)
            }
          )
        } else {
          setDefaultWeather(defaultResults)
        }
      } catch (error) {
        console.error("Error loading cities:", error)
      }
    }

    loadDefaults()
  }, [])


  const handleSearch = async () => {
    if (!city) return
    const data = await fetchWeather(city)

    if (data.main) {
      setSearchedWeather((prev) => [...prev, data])
    }

    setCity("")
  }
  const removeCity = (indexToRemove) => {
    setSearchedWeather((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    )
  }


  const getCountryName = (countryCode) => {
    if (!countryCode) return ""

    const regionNames = new Intl.DisplayNames(["en"], {
      type: "region",
    })

    return regionNames.of(countryCode)
  }


  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <h1>Weather Sphere</h1>

        <img src="/image.png" alt="Weather App Logo" />



        <div className="search-box">
          <input
            type="text"
            placeholder="Search city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </header>

      {/* DEFAULT CITIES */}
      <section className="section">
        <h2>Major Cities</h2>
        <div className="city-grid">
          {defaultWeather.map((weather, index) =>
            weather.main ? (
              <div className="city-card" key={index}>
                <h3>
                  {weather.name}, {getCountryName(weather.sys?.country)}
                </h3>

                {/* 🌤 Weather Icon */}
                <h4 className="iconPlusTem">
                  <img
                    className="weather-icon"
                    src={iconMap[weather.weather[0].icon]}
                    alt={weather.weather[0].description}
                  />

                  <p className="temp">{weather.main.temp}°C</p>
                </h4>

                <p className="description">
                  {weather.weather[0].description}
                </p>

                <div className="weather-details">
                  <p><strong>Feels Like:</strong> {weather.main.feels_like}°C</p>
                  <p><strong>Min:</strong> {weather.main.temp_min}°C</p>
                  <p><strong>Max:</strong> {weather.main.temp_max}°C</p>
                  <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
                  <p><strong>Pressure:</strong> {weather.main.pressure} hPa</p>
                  <p><strong>Wind:</strong> {weather.wind.speed} m/s</p>
                  <p><strong>Visibility:</strong> {weather.visibility / 1000} km</p>
                  <p>
                    <strong>Timezone:</strong> UTC{" "}
                    {weather.timezone / 3600 >= 0 ? "+" : ""}
                    {weather.timezone / 3600}
                  </p>
                </div>
              </div>
            ) : null
          )}
        </div>

      </section>

      {/* SEARCH RESULTS */}
      {searchedWeather.length > 0 && (
        <section className="section">
          <h2>Search Results</h2>
          <div className="city-grid">
            {searchedWeather.map((weather, index) => (
              <div className="city-card highlight" key={index}>
                <button
                  className="remove-btn"
                  onClick={() => removeCity(index)}
                >
                  <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.4" y="0.4" width="25.6" height="25.6" rx="12.8" stroke="#000" strokeWidth="0.8" />
                    <path
                      d="M16.0006 9.59961L9.60059 15.9996M9.60059 9.59961L16.0006 15.9996" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <h3>
                  {weather.name}, {getCountryName(weather.sys?.country)}
                </h3>

                <h4 className="iconPlusTem">
                  <img
                    className="weather-icon"
                    src={iconMap[weather.weather[0].icon]}
                    alt={weather.weather[0].description}
                  />

                  <p className="temp">{weather.main.temp}°C</p>
                </h4>
                <p className="description">
                  {weather.weather[0].description}
                </p>

                <div className="weather-details">
                  <p><strong>Feels Like:</strong> {weather.main.feels_like}°C</p>
                  <p><strong>Min:</strong> {weather.main.temp_min}°C</p>
                  <p><strong>Max:</strong> {weather.main.temp_max}°C</p>
                  <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
                  <p><strong>Pressure:</strong> {weather.main.pressure} hPa</p>
                  <p><strong>Wind:</strong> {weather.wind.speed} m/s</p>
                  <p><strong>Visibility:</strong> {weather.visibility / 1000} km</p>
                  <p>
                    <strong>Timezone:</strong> UTC{" "}
                    {weather.timezone / 3600 >= 0 ? "+" : ""}
                    {weather.timezone / 3600}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
  //


}

export default App;
