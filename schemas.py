from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=64)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=64)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ItineraryCreate(BaseModel):
    destination: str = Field(..., min_length=2, max_length=120)
    budget: float = Field(..., gt=0)
    start_date: date
    end_date: date
    travelers: int = Field(..., ge=1, le=20)
    interests: list[str] = Field(default_factory=list)

    @field_validator("interests")
    @classmethod
    def validate_interests(cls, values: list[str]) -> list[str]:
        clean = [value.strip() for value in values if value.strip()]
        return clean

    @field_validator("end_date")
    @classmethod
    def validate_date_range(cls, end_date: date, info):
        start_date = info.data.get("start_date")
        if start_date and end_date < start_date:
            raise ValueError("end_date must be greater than or equal to start_date")
        return end_date


class DayPlan(BaseModel):
    day: int
    title: str
    description: str


class ItineraryOutput(BaseModel):
    destination: str
    hotels: list[dict]
    transport_options: list[dict]
    restaurants: list[dict]
    activities: list[dict]
    day_wise_plan: list[DayPlan]


class ItineraryResponse(BaseModel):
    id: int
    destination: str
    budget: float
    start_date: date
    end_date: date
    travelers: int
    interests: list[str]
    hotels: list[dict]
    transport_options: list[dict]
    restaurants: list[dict]
    activities: list[dict]
    day_wise_plan: list[DayPlan]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserPreferenceIn(BaseModel):
    budget_style: str = Field(default="medium", min_length=3, max_length=50)
    interests: list[str] = Field(default_factory=list)
    hotel_type: str = Field(default="boutique", min_length=3, max_length=80)
    food_preferences: list[str] = Field(default_factory=list)


class UserPreferenceOut(UserPreferenceIn):
    user_id: int
    updated_at: datetime


class DestinationRecommendation(BaseModel):
    name: str
    info: str
    image: str


class RecommendationBundle(BaseModel):
    destinations: list[DestinationRecommendation]
    hotels: list[dict]
    transport_options: list[dict]
    restaurants: list[dict]
    activities: list[dict]
    day_wise_plan: list[dict]


class WeatherOut(BaseModel):
    destination: str
    temperature_c: float | None = None
    wind_speed_kmh: float | None = None
    weather_code: int | None = None
    weather_label: str = "Unavailable"


class DayPlanReorderIn(BaseModel):
    day_wise_plan: list[dict]


class BudgetBreakdownOut(BaseModel):
    itinerary_id: int
    hotel_total: float
    food_total: float
    travel_total: float
    activity_total: float
    grand_total: float


class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
