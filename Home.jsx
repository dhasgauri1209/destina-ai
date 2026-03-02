import { useEffect, useState } from "react";
import api from "../api";
import ActivitySection from "../components/ActivitySection";
import DayPlanSection from "../components/DayPlanSection";
import DestinationSection from "../components/DestinationSection";
import FoodSection from "../components/FoodSection";
import Hero from "../components/Hero";
import HotelSection from "../components/HotelSection";
import TravelSection from "../components/TravelSection";

function Home() {
  const [recommendations, setRecommendations] = useState(null);
  const [weatherByDestination, setWeatherByDestination] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("destina_token");
    if (!token) return;

    const loadRecommendations = async () => {
      try {
        const response = await api.get("/recommendations");
        const data = response.data?.data;
        setRecommendations(data);

        const weatherEntries = await Promise.all(
          (data?.destinations || []).slice(0, 3).map(async (item) => {
            try {
              const weatherRes = await api.get(`/weather/${encodeURIComponent(item.name)}`);
              return [item.name, weatherRes.data?.data];
            } catch {
              return [item.name, null];
            }
          })
        );

        setWeatherByDestination(Object.fromEntries(weatherEntries.filter(([_, value]) => value)));
      } catch {
        setRecommendations(null);
      }
    };

    loadRecommendations();
  }, []);

  return (
    <main>
      <Hero />
      <DestinationSection items={recommendations?.destinations} weatherByDestination={weatherByDestination} />
      <HotelSection items={recommendations?.hotels} />
      <TravelSection items={recommendations?.transport_options} />
      <FoodSection items={recommendations?.restaurants} />
      <ActivitySection items={recommendations?.activities} />
      <DayPlanSection items={recommendations?.day_wise_plan} />
    </main>
  );
}

export default Home;
