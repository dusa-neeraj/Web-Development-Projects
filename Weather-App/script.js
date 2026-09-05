const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const messageDiv = document.getElementById('message');
const weatherCard = document.getElementById('weatherCard');
const themeToggle = document.getElementById('themeToggle');
const forecastDiv = document.getElementById('forecast');
const hourlySection = document.getElementById('hourlySection');
const hourlyChartCanvas = document.getElementById('hourlyChart');

const cityName = document.getElementById('cityName');
const dateNow = document.getElementById('dateNow');
const iconBig = document.getElementById('iconBig');
const temp = document.getElementById('temp');
const condition = document.getElementById('condition');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const feelsLike = document.getElementById('feelsLike');

let hourlyChart = null;

const weatherCodes = {
  0: { text: "Clear sky", icon: "☀️" },
  1: { text: "Mainly clear", icon: "🌤️" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Fog", icon: "🌫️" },
  48: { text: "Fog", icon: "🌫️" },
  51: { text: "Light drizzle", icon: "🌦️" },
  61: { text: "Rain", icon: "🌧️" },
  63: { text: "Moderate rain", icon: "🌧️" },
  65: { text: "Heavy rain", icon: "🌧️" },
  71: { text: "Snow", icon: "❄️" },
  80: { text: "Rain showers", icon: "🌧️" },
  95: { text: "Thunderstorm", icon: "⛈️" }
};

function getWeatherInfo(code) {
  return weatherCodes[code] || { text: "Unknown", icon: "🌡️" };
}

// ---------- Theme ----------
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  themeToggle.textContent = saved === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', next);

  // Redraw chart so line color matches new theme
  if (hourlyChart) {
    const style = getComputedStyle(document.documentElement);
    hourlyChart.data.datasets[0].borderColor = style.getPropertyValue('--line-color').trim();
    hourlyChart.data.datasets[0].pointBackgroundColor = style.getPropertyValue('--line-color').trim();
    hourlyChart.options.scales.x.ticks.color = style.getPropertyValue('--text-secondary').trim();
    hourlyChart.options.scales.y.ticks.color = style.getPropertyValue('--text-secondary').trim();
    hourlyChart.update();
  }
});

initTheme();

// ---------- Events ----------
searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') getWeather();
});
locationBtn.addEventListener('click', getWeatherByLocation);

// ---------- Search by city ----------
async function getWeather() {
  const city = cityInput.value.trim();
  messageDiv.textContent = '';
  weatherCard.style.display = 'none';
  hourlySection.style.display = 'none';
  forecastDiv.innerHTML = '';

  if (!city) {
    messageDiv.textContent = 'Please enter a city name';
    return;
  }

  messageDiv.textContent = 'Loading...';

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`
    );

    if (!geoRes.ok) {
      messageDiv.textContent = `Geocoding error: ${geoRes.status}`;
      return;
    }

    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      messageDiv.textContent = `"${city}" not found. Try a bigger nearby city.`;
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    await fetchAndDisplayWeather(latitude, longitude, `${name}, ${country}`);

  } catch (error) {
    messageDiv.textContent = 'Network error. Check your internet connection.';
    console.error(error);
  }
}

// ---------- Use current location ----------
function getWeatherByLocation() {
  messageDiv.textContent = '';
  weatherCard.style.display = 'none';
  hourlySection.style.display = 'none';
  forecastDiv.innerHTML = '';

  if (!navigator.geolocation) {
    messageDiv.textContent = 'Geolocation not supported by your browser.';
    return;
  }

  messageDiv.textContent = 'Detecting location...';

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const reverseRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const reverseData = await reverseRes.json();
        const place = reverseData.city || reverseData.locality || "Your Location";
        const country = reverseData.countryName || "";

        await fetchAndDisplayWeather(latitude, longitude, `${place}, ${country}`);
      } catch (error) {
        messageDiv.textContent = 'Could not detect your city.';
        console.error(error);
      }
    },
    (error) => {
      messageDiv.textContent = 'Location access denied or unavailable.';
      console.error(error);
    }
  );
}

// ---------- Fetch current + hourly + 5-day forecast ----------
async function fetchAndDisplayWeather(latitude, longitude, label) {
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature` +
    `&hourly=temperature_2m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=6`
  );

  if (!weatherRes.ok) {
    messageDiv.textContent = `Weather API error: ${weatherRes.status}`;
    return;
  }

  const data = await weatherRes.json();
  const current = data.current;
  const info = getWeatherInfo(current.weather_code);

  messageDiv.textContent = '';

  // Current weather
  cityName.textContent = label;
  dateNow.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  });
  iconBig.textContent = info.icon;
  temp.textContent = `${Math.round(current.temperature_2m)}°C`;
  condition.textContent = info.text;
  humidity.textContent = `${current.relative_humidity_2m}%`;
  wind.textContent = `${current.wind_speed_10m} km/h`;
  feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;

  weatherCard.style.display = 'block';

  // Hourly forecast graph (next 24 hours from now)
  renderHourlyChart(data.hourly, current.time);

  // 5-day forecast (skip today, index 0)
  forecastDiv.innerHTML = '';
  const days = data.daily.time.slice(1, 6);

  days.forEach((dateStr, i) => {
    const idx = i + 1;
    const dayInfo = getWeatherInfo(data.daily.weather_code[idx]);
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    const max = Math.round(data.daily.temperature_2m_max[idx]);
    const min = Math.round(data.daily.temperature_2m_min[idx]);

    const card = document.createElement('div');
    card.className = 'forecast-day';
    card.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-icon">${dayInfo.icon}</div>
      <div class="day-temp">${max}° <span class="low">${min}°</span></div>
    `;
    forecastDiv.appendChild(card);
  });
}

// ---------- Hourly chart ----------
function renderHourlyChart(hourly, currentTimeISO) {
  // Find index of current hour in the hourly.time array
  let startIdx = hourly.time.findIndex(t => t === currentTimeISO);
  if (startIdx === -1) startIdx = 0;

  // Take next 24 hours from now
  const labels = hourly.time.slice(startIdx, startIdx + 24).map(t => {
    const hour = new Date(t).getHours();
    return hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`;
  });
  const temps = hourly.temperature_2m.slice(startIdx, startIdx + 24);

  const style = getComputedStyle(document.documentElement);
  const lineColor = style.getPropertyValue('--line-color').trim();
  const textColor = style.getPropertyValue('--text-secondary').trim();

  hourlySection.style.display = 'block';

  if (hourlyChart) {
    hourlyChart.destroy();
  }

  hourlyChart = new Chart(hourlyChartCanvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        data: temps,
        borderColor: lineColor,
        backgroundColor: 'transparent',
        pointBackgroundColor: lineColor,
        pointRadius: 3,
        tension: 0.4,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.parsed.y}°C`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { size: 9 }, maxTicksLimit: 6 },
          grid: { display: false }
        },
        y: {
          ticks: { color: textColor, font: { size: 9 } },
          grid: { color: 'rgba(128,128,128,0.1)' }
        }
      }
    }
  });
}