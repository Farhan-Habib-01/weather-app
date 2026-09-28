
    /* =====================================
       CONFIG
    ===================================== */

    const API = "https://api.open-meteo.com/v1/forecast";

    const GEOCODING_API =
      "https://geocoding-api.open-meteo.com/v1/search";


    /* =====================================
       STATE
    ===================================== */

    let currentCity = "Delhi";

    let currentLatitude = 28.6139;

    let currentLongitude = 77.2090;

    let fahrenheit = false;


    /* =====================================
       DOM
    ===================================== */

    const loader =
      document.getElementById("loader");

    const errorBox =
      document.getElementById("error");

    const cityInput =
      document.getElementById("cityInput");

    const searchForm =
      document.getElementById("searchForm");

    const locationName =
      document.getElementById("locationName");

    const temperature =
      document.getElementById("temperature");

    const unitLabel =
      document.getElementById("unitLabel");

    const weatherIcon =
      document.getElementById("weatherIcon");

    const weatherDescription =
      document.getElementById("weatherDescription");

    const feelsLike =
      document.getElementById("feelsLike");

    const humidity =
      document.getElementById("humidity");

    const windSpeed =
      document.getElementById("windSpeed");

    const sunrise =
      document.getElementById("sunrise");

    const sunset =
      document.getElementById("sunset");

    const rainChance =
      document.getElementById("rainChance");

    const windDirection =
      document.getElementById("windDirection");

    const hourly =
      document.getElementById("hourly");

    const forecast =
      document.getElementById("forecast");

    const unitBtn =
      document.getElementById("unitBtn");


    /* =====================================
       WEATHER CODES
    ===================================== */

    function getWeatherInfo(code) {

      const weather = {

        0: ["☀️", "Clear sky"],

        1: ["🌤️", "Mainly clear"],
        2: ["⛅", "Partly cloudy"],
        3: ["☁️", "Overcast"],

        45: ["🌫️", "Fog"],
        48: ["🌫️", "Depositing rime fog"],

        51: ["🌦️", "Light drizzle"],
        53: ["🌦️", "Moderate drizzle"],
        55: ["🌧️", "Dense drizzle"],

        61: ["🌦️", "Slight rain"],
        63: ["🌧️", "Moderate rain"],
        65: ["🌧️", "Heavy rain"],

        71: ["🌨️", "Slight snow"],
        73: ["❄️", "Moderate snow"],
        75: ["❄️", "Heavy snow"],

        80: ["🌦️", "Rain showers"],
        81: ["🌧️", "Moderate showers"],
        82: ["⛈️", "Violent showers"],

        95: ["⛈️", "Thunderstorm"],
        96: ["⛈️", "Thunderstorm with hail"],
        99: ["⛈️", "Heavy thunderstorm"]

      };

      return weather[code] || ["🌤️", "Unknown"];

    }


    /* =====================================
       FORMAT TIME
    ===================================== */

    function formatTime(dateString) {

      const date = new Date(dateString);

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

    }


    /* =====================================
       FORMAT DAY
    ===================================== */

    function formatDay(dateString, index) {

      if (index === 0) {
        return "Today";
      }

      if (index === 1) {
        return "Tomorrow";
      }

      return new Date(dateString)
        .toLocaleDateString([], {
          weekday: "long"
        });

    }


    /* =====================================
       TEMPERATURE
    ===================================== */

    function formatTemperature(value) {

      if (fahrenheit) {

        return Math.round(
          (value * 9) / 5 + 32
        );

      }

      return Math.round(value);

    }


    /* =====================================
       SHOW LOADING
    ===================================== */

    function showLoading() {

      loader.classList.add("active");

    }


    function hideLoading() {

      loader.classList.remove("active");

    }


    /* =====================================
       ERROR
    ===================================== */

    function showError(message) {

      errorBox.textContent = message;

      errorBox.classList.add("show");

    }


    function hideError() {

      errorBox.classList.remove("show");

    }


    /* =====================================
       GET CITY
    ===================================== */

    async function getCity(city) {

      const url =
        `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

      const response =
        await fetch(url);

      if (!response.ok) {
        throw new Error("Unable to search city.");
      }

      const data =
        await response.json();

      if (!data.results || !data.results.length) {
        throw new Error(
          `City "${city}" was not found.`
        );
      }

      return data.results[0];

    }


    /* =====================================
       GET WEATHER
    ===================================== */

    async function getWeather(
      latitude,
      longitude
    ) {

      const params = new URLSearchParams({

        latitude,

        longitude,

        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m",

        hourly:
          "temperature_2m,weather_code,precipitation_probability",

        daily:
          "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max",

        timezone: "auto",

        forecast_days: "7"

      });

      const response =
        await fetch(`${API}?${params}`);

      if (!response.ok) {
        throw new Error(
          "Unable to fetch weather data."
        );
      }

      return response.json();

    }


    /* =====================================
       LOAD WEATHER
    ===================================== */

    async function loadWeather(city) {

      try {

        showLoading();

        hideError();

        const location =
          await getCity(city);

        currentCity =
          location.name;

        currentLatitude =
          location.latitude;

        currentLongitude =
          location.longitude;

        const weather =
          await getWeather(
            currentLatitude,
            currentLongitude
          );

        locationName.textContent =
          `${location.name}, ${location.country}`;

        renderCurrentWeather(weather);

        renderHourly(weather);

        renderForecast(weather);

      } catch (error) {

        console.error(error);

        showError(
          error.message ||
          "Something went wrong."
        );

      } finally {

        hideLoading();

      }

    }


    /* =====================================
       CURRENT WEATHER
    ===================================== */

    function renderCurrentWeather(data) {

      const current =
        data.current;

      const [
        icon,
        description
      ] =
        getWeatherInfo(
          current.weather_code
        );

      weatherIcon.textContent =
        icon;

      weatherDescription.textContent =
        description;

      temperature.textContent =
        `${formatTemperature(
          current.temperature_2m
        )}°`;

      feelsLike.textContent =
        `Feels like ${formatTemperature(
          current.apparent_temperature
        )}°`;

      humidity.textContent =
        `${current.relative_humidity_2m}%`;

      windSpeed.textContent =
        `${Math.round(
          current.wind_speed_10m
        )} km/h`;

      windDirection.textContent =
        `${Math.round(
          current.wind_direction_10m
        )}°`;

      const todayRain =
        data.daily
          .precipitation_probability_max[0];

      rainChance.textContent =
        `${todayRain}%`;

      sunrise.textContent =
        formatTime(
          data.daily.sunrise[0]
        );

      sunset.textContent =
        formatTime(
          data.daily.sunset[0]
        );

      unitLabel.textContent =
        fahrenheit
          ? "Fahrenheit"
          : "Celsius";

      unitBtn.textContent =
        fahrenheit
          ? "°C"
          : "°F";

    }


    /* =====================================
       HOURLY FORECAST
    ===================================== */

    function renderHourly(data) {

      hourly.innerHTML = "";

      const currentHour =
        new Date().getHours();

      const start =
        data.hourly.time.findIndex(
          time =>
            new Date(time).getHours() ===
            currentHour
        );

      const startIndex =
        start >= 0 ? start : 0;

      for (
        let i = startIndex;
        i < startIndex + 24 &&
        i < data.hourly.time.length;
        i++
      ) {

        const [
          icon,
          description
        ] =
          getWeatherInfo(
            data.hourly.weather_code[i]
          );

        const card =
          document.createElement("div");

        card.className =
          "hour-card";

        card.innerHTML = `

        <div class="hour-time">
          ${i === startIndex
            ? "Now"
            : formatTime(
              data.hourly.time[i]
            )
          }
        </div>

        <div class="hour-icon">
          ${icon}
        </div>

        <div class="hour-temp">
          ${formatTemperature(
            data.hourly.temperature_2m[i]
          )}°
        </div>

        <div class="rain">
          💧 ${data.hourly
            .precipitation_probability[i]
          }%
        </div>

      `;

        hourly.appendChild(card);

      }

    }


    /* =====================================
       7 DAY FORECAST
    ===================================== */

    function renderForecast(data) {

      forecast.innerHTML = "";

      for (
        let i = 0;
        i < 7;
        i++
      ) {

        const [
          icon,
          description
        ] =
          getWeatherInfo(
            data.daily.weather_code[i]
          );

        const card =
          document.createElement("div");

        card.className =
          "forecast-card";

        card.innerHTML = `

        <div class="forecast-day">
          ${formatDay(
          data.daily.time[i],
          i
        )}
        </div>

        <div class="forecast-weather">

          <span class="forecast-icon">
            ${icon}
          </span>

          <span class="forecast-condition">
            ${description}
          </span>

        </div>

        <div class="rain">
          💧 ${data.daily
            .precipitation_probability_max[i]
          }%
        </div>

        <div class="forecast-temp">

          ${formatTemperature(
            data.daily.temperature_2m_max[i]
          )}°

          /

          ${formatTemperature(
            data.daily.temperature_2m_min[i]
          )}°

        </div>

      `;

        forecast.appendChild(card);

      }

    }


    /* =====================================
       SEARCH
    ===================================== */

    searchForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const city =
          cityInput.value.trim();

        if (!city) {

          showError(
            "Please enter a city name."
          );

          return;

        }

        loadWeather(city);

        cityInput.value = "";

      }
    );


    /* =====================================
       POPULAR CITIES
    ===================================== */

    document
      .querySelectorAll(".city-card")
      .forEach(card => {

        card.addEventListener(
          "click",
          () => {

            loadWeather(
              card.dataset.city
            );

            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });

          }
        );

      });


    /* =====================================
       UNIT SWITCH
    ===================================== */

    unitBtn.addEventListener(
      "click",
      async () => {

        fahrenheit =
          !fahrenheit;

        try {

          showLoading();

          const weather =
            await getWeather(
              currentLatitude,
              currentLongitude
            );

          renderCurrentWeather(
            weather
          );

          renderHourly(
            weather
          );

          renderForecast(
            weather
          );

        } catch (error) {

          showError(
            "Unable to change temperature unit."
          );

        } finally {

          hideLoading();

        }

      }
    );


    /* =====================================
       REFRESH
    ===================================== */

    document
      .getElementById("refreshBtn")
      .addEventListener(
        "click",
        () => {

          loadWeather(
            currentCity
          );

        }
      );


    /* =====================================
       GEOLOCATION
    ===================================== */

    document
      .getElementById("locationBtn")
      .addEventListener(
        "click",
        () => {

          if (
            !navigator.geolocation
          ) {

            showError(
              "Geolocation is not supported by your browser."
            );

            return;

          }

          showLoading();

          navigator.geolocation.getCurrentPosition(

            async position => {

              try {

                currentLatitude =
                  position.coords.latitude;

                currentLongitude =
                  position.coords.longitude;

                const weather =
                  await getWeather(
                    currentLatitude,
                    currentLongitude
                  );

                locationName.textContent =
                  "Your Current Location";

                renderCurrentWeather(
                  weather
                );

                renderHourly(
                  weather
                );

                renderForecast(
                  weather
                );

              } catch {

                showError(
                  "Unable to get your local weather."
                );

              } finally {

                hideLoading();

              }

            },

            () => {

              hideLoading();

              showError(
                "Location permission was denied."
              );

            }

          );

        }
      );


    /* =====================================
       INITIAL WEATHER
    ===================================== */

    loadWeather("Delhi");
