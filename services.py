import json
import math
from datetime import timedelta
from urllib.parse import quote
from urllib.request import urlopen

from schemas import ItineraryCreate

DESTINATION_CATALOG = [
    {
        "name": "Kyoto, Japan",
        "theme": "culture",
        "info": "Temples, tea houses, and premium cultural stays.",
        "image": "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1500&q=80",
    },
    {
        "name": "Santorini, Greece",
        "theme": "romance",
        "info": "Cliffside luxury with sunset sea views.",
        "image": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1500&q=80",
    },
    {
        "name": "Swiss Alps",
        "theme": "nature",
        "info": "Panoramic mountain escapes and scenic routes.",
        "image": "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1500&q=80",
    },
    {
        "name": "Bali, Indonesia",
        "theme": "relaxation",
        "info": "Private villas, beaches, and wellness retreats.",
        "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1500&q=80",
    },
    {
        "name": "Paris, France",
        "theme": "food",
        "info": "Fine dining, fashion streets, and classic art.",
        "image": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1500&q=80",
    },
]

WEATHER_CODE_MAP = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    51: "Light drizzle",
    61: "Rain",
    71: "Snow",
    95: "Thunderstorm",
}


def _safe_json_get(url: str) -> dict | None:
    try:
        with urlopen(url, timeout=5) as response:  # nosec B310 - trusted public API URL construction
            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return None


def geocode_destination(destination: str) -> dict:
    query = quote(destination)
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={query}&count=1&language=en&format=json"
    data = _safe_json_get(url)
    if not data or not data.get("results"):
        return {"latitude": 40.7128, "longitude": -74.0060, "name": destination}

    result = data["results"][0]
    return {
        "latitude": float(result.get("latitude", 40.7128)),
        "longitude": float(result.get("longitude", -74.0060)),
        "name": result.get("name", destination),
    }


def get_weather_for_destination(destination: str) -> dict:
    geo = geocode_destination(destination)
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={geo['latitude']}&longitude={geo['longitude']}&current=temperature_2m,weather_code,wind_speed_10m"
    )
    data = _safe_json_get(url)
    current = (data or {}).get("current", {})
    weather_code = current.get("weather_code")
    return {
        "destination": destination,
        "temperature_c": current.get("temperature_2m"),
        "wind_speed_kmh": current.get("wind_speed_10m"),
        "weather_code": weather_code,
        "weather_label": WEATHER_CODE_MAP.get(weather_code, "Unavailable"),
    }


def personalized_recommendations(preferences: dict | None, destination_hint: str | None = None) -> dict:
    preferences = preferences or {}
    interest_set = {item.lower() for item in preferences.get("interests", [])}
    if destination_hint:
        chosen = [item for item in DESTINATION_CATALOG if destination_hint.lower() in item["name"].lower()]
    else:
        chosen = []

    if not chosen:
        chosen = [
            item
            for item in DESTINATION_CATALOG
            if item["theme"] in interest_set or "food" in interest_set and item["theme"] in {"food", "culture"}
        ]

    if len(chosen) < 3:
        chosen = (chosen + DESTINATION_CATALOG)[:3]

    hotel_type = preferences.get("hotel_type", "Boutique")
    food_preferences = preferences.get("food_preferences", ["Fusion"])

    target_destination = chosen[0]["name"]
    hotels = [
        {"name": f"{target_destination} {hotel_type.title()} Suites", "rating": 4.8, "price": "$240/night"},
        {"name": f"Grand {target_destination} Residences", "rating": 4.7, "price": "$210/night"},
        {"name": f"{target_destination} Skyline Stay", "rating": 4.6, "price": "$190/night"},
    ]
    restaurants = [
        {"name": f"{target_destination} {food_preferences[0] if food_preferences else 'Chef'} Atelier", "cuisine": "Curated", "avg_cost": 36},
        {"name": f"Harbor Table {target_destination}", "cuisine": "Seafood", "avg_cost": 42},
        {"name": f"Old Town Cellar {target_destination}", "cuisine": "Local", "avg_cost": 28},
    ]
    activities = [
        {"title": f"{target_destination} Signature Walking Tour", "duration": "2.5h", "price": 35},
        {"title": f"{target_destination} Sunset Cruise", "duration": "2h", "price": 45},
        {"title": f"{target_destination} Culinary Workshop", "duration": "3h", "price": 50},
    ]

    transport_options = [
        {"mode": "Flight", "eta": "Fastest", "estimated_cost": 280},
        {"mode": "Train", "eta": "Scenic", "estimated_cost": 160},
        {"mode": "Bus", "eta": "Budget", "estimated_cost": 90},
        {"mode": "Rental Car", "eta": "Flexible", "estimated_cost": 180},
    ]

    day_wise_plan = [
        {"day": 1, "title": "Arrival + Orientation", "description": f"Settle in and explore {target_destination} central district."},
        {"day": 2, "title": "Highlights Day", "description": f"Visit top landmarks and curated restaurant picks in {target_destination}."},
        {"day": 3, "title": "Experience Day", "description": f"Enjoy premium activities and cultural immersion in {target_destination}."},
    ]

    return {
        "destinations": chosen[:3],
        "hotels": hotels,
        "transport_options": transport_options,
        "restaurants": restaurants,
        "activities": activities,
        "day_wise_plan": day_wise_plan,
    }


def build_itinerary_payload(payload: ItineraryCreate, preferences: dict | None = None) -> dict:
    destination = payload.destination
    preference_interests = (preferences or {}).get("interests", [])
    interests = payload.interests or preference_interests
    interests = interests or ["Local Highlights"]

    budget_multiplier = {"low": 0.85, "medium": 1.0, "high": 1.2}.get((preferences or {}).get("budget_style", "medium").lower(), 1.0)
    adjusted_budget = payload.budget * budget_multiplier

    hotel_style = (preferences or {}).get("hotel_type", "Boutique")
    food_pref = ((preferences or {}).get("food_preferences") or ["Fusion"])[0]

    trip_days = max((payload.end_date - payload.start_date).days + 1, 1)
    per_night_base = adjusted_budget * 0.42 / trip_days

    hotels = [
        {
            "name": f"{destination} {hotel_style.title()} Suites",
            "rating": 4.8,
            "price_per_night": round(per_night_base * 1.1, 2),
            "style": hotel_style.title(),
        },
        {
            "name": f"{destination} Grand Vista Hotel",
            "rating": 4.5,
            "price_per_night": round(per_night_base * 0.95, 2),
            "style": "Business",
        },
        {
            "name": f"{destination} Urban Nest",
            "rating": 4.2,
            "price_per_night": round(per_night_base * 0.75, 2),
            "style": "Boutique",
        },
    ]

    transport_options = [
        {"mode": "Flight", "eta": "Fastest", "estimated_cost": round(adjusted_budget * 0.18, 2)},
        {"mode": "Train", "eta": "Scenic", "estimated_cost": round(adjusted_budget * 0.12, 2)},
        {"mode": "Bus", "eta": "Budget", "estimated_cost": round(adjusted_budget * 0.08, 2)},
        {"mode": "Rental Car", "eta": "Flexible", "estimated_cost": round(adjusted_budget * 0.15, 2)},
    ]

    restaurants = [
        {"name": f"{destination} {food_pref} Atelier", "cuisine": f"{food_pref} Fusion", "avg_cost": 28},
        {"name": f"The Harbor Table {destination}", "cuisine": "Seafood", "avg_cost": 34},
        {"name": f"Bloom & Basil {destination}", "cuisine": "Vegetarian", "avg_cost": 22},
    ]

    activities = [
        {"title": f"{interests[0]} Discovery Tour", "duration": "3 hours", "price": 40},
        {"title": f"Sunset Panorama in {destination}", "duration": "2 hours", "price": 30},
        {"title": f"Street Stories of {destination}", "duration": "2.5 hours", "price": 25},
    ]

    day_wise_plan = []
    for idx in range(trip_days):
        day_date = payload.start_date + timedelta(days=idx)
        interest = interests[idx % len(interests)]
        day_wise_plan.append(
            {
                "day": idx + 1,
                "title": f"{interest} Experience",
                "description": f"{day_date.isoformat()}: Explore {destination} with curated {interest.lower()} activities and local food stops.",
            }
        )

    return {
        "destination": destination,
        "hotels": hotels,
        "transport_options": transport_options,
        "restaurants": restaurants,
        "activities": activities,
        "day_wise_plan": day_wise_plan,
    }


def compute_budget_breakdown(itinerary) -> dict:
    total_days = max((itinerary.end_date - itinerary.start_date).days + 1, 1)
    travelers = max(itinerary.travelers, 1)

    hotel_total = round(sum(item.get("price_per_night", 0) for item in itinerary.hotels) / max(len(itinerary.hotels), 1) * total_days, 2)
    food_total = round(sum(item.get("avg_cost", 0) for item in itinerary.restaurants) * total_days * travelers / max(len(itinerary.restaurants), 1), 2)
    travel_total = round(sum(item.get("estimated_cost", 0) for item in itinerary.transport_options) / max(len(itinerary.transport_options), 1), 2)
    activity_total = round(sum(item.get("price", 0) for item in itinerary.activities) * travelers, 2)
    grand_total = round(hotel_total + food_total + travel_total + activity_total, 2)

    return {
        "itinerary_id": itinerary.id,
        "hotel_total": hotel_total,
        "food_total": food_total,
        "travel_total": travel_total,
        "activity_total": activity_total,
        "grand_total": grand_total,
    }


def build_map_points(destination: str, hotels: list, restaurants: list, activities: list) -> list[dict]:
    geo = geocode_destination(destination)
    base_lat = geo["latitude"]
    base_lng = geo["longitude"]

    points = []
    entries = [("hotel", hotels), ("restaurant", restaurants), ("activity", activities)]
    offset_index = 0

    for category, items in entries:
        for item in items[:4]:
            offset_index += 1
            lat_offset = math.sin(offset_index) * 0.02
            lng_offset = math.cos(offset_index) * 0.02
            points.append(
                {
                    "category": category,
                    "name": item.get("name") or item.get("title", "Point"),
                    "lat": round(base_lat + lat_offset, 6),
                    "lng": round(base_lng + lng_offset, 6),
                }
            )

    return points
