from collections import Counter
from datetime import datetime
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import authenticate_user, create_access_token, get_current_user, hash_password
from database import Base, engine, get_db
from models import Itinerary, Notification, User, UserPreference
from schemas import DayPlanReorderIn, ItineraryCreate, UserLogin, UserPreferenceIn, UserRegister
from services import (
    build_itinerary_payload,
    build_map_points,
    compute_budget_breakdown,
    get_weather_for_destination,
    personalized_recommendations,
)

app = FastAPI(title="Destina AI Backend", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/")
def health_check():
    return {"success": True, "message": "Destina AI API is running"}


@app.exception_handler(HTTPException)
def http_exception_handler(_: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail, "data": None},
    )


@app.exception_handler(RequestValidationError)
def validation_exception_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "message": "Validation error", "data": exc.errors()},
    )


@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize default preferences for all users.
    defaults = UserPreference(
        user_id=user.id,
        budget_style="medium",
        interests=["culture", "food"],
        hotel_type="boutique",
        food_preferences=["fusion"],
        updated_at=datetime.utcnow(),
    )
    db.add(defaults)
    db.commit()

    return {
        "success": True,
        "message": "User registered successfully",
        "data": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "created_at": user.created_at,
        },
    }


@app.post("/login")
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.email)
    return {
        "success": True,
        "message": "Login successful",
        "data": {"access_token": token, "token_type": "bearer", "user_name": user.full_name},
    }


@app.get("/preferences")
def get_preferences(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    preference = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not preference:
        preference = UserPreference(
            user_id=current_user.id,
            budget_style="medium",
            interests=["culture", "food"],
            hotel_type="boutique",
            food_preferences=["fusion"],
            updated_at=datetime.utcnow(),
        )
        db.add(preference)
        db.commit()
        db.refresh(preference)

    return {
        "success": True,
        "data": {
            "user_id": preference.user_id,
            "budget_style": preference.budget_style,
            "interests": preference.interests,
            "hotel_type": preference.hotel_type,
            "food_preferences": preference.food_preferences,
            "updated_at": preference.updated_at,
        },
    }


@app.put("/preferences")
def upsert_preferences(
    payload: UserPreferenceIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preference = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not preference:
        preference = UserPreference(user_id=current_user.id)
        db.add(preference)

    preference.budget_style = payload.budget_style.lower()
    preference.interests = payload.interests
    preference.hotel_type = payload.hotel_type
    preference.food_preferences = payload.food_preferences
    preference.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(preference)

    db.add(
        Notification(
            user_id=current_user.id,
            title="Preferences updated",
            message="Your travel preferences were saved and will personalize recommendations.",
            is_read=False,
        )
    )
    db.commit()

    return {
        "success": True,
        "message": "Preferences saved",
        "data": {
            "user_id": preference.user_id,
            "budget_style": preference.budget_style,
            "interests": preference.interests,
            "hotel_type": preference.hotel_type,
            "food_preferences": preference.food_preferences,
            "updated_at": preference.updated_at,
        },
    }


@app.get("/recommendations")
def get_recommendations(
    destination: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preference = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    preference_data = {
        "budget_style": preference.budget_style if preference else "medium",
        "interests": preference.interests if preference else [],
        "hotel_type": preference.hotel_type if preference else "boutique",
        "food_preferences": preference.food_preferences if preference else [],
    }
    data = personalized_recommendations(preference_data, destination_hint=destination)
    return {"success": True, "data": data}


@app.get("/weather/{destination}")
def get_weather(destination: str, current_user: User = Depends(get_current_user)):
    _ = current_user
    weather = get_weather_for_destination(destination)
    return {"success": True, "data": weather}


@app.post("/create-itinerary", status_code=status.HTTP_201_CREATED)
def create_itinerary(
    payload: ItineraryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preference = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    preference_data = {
        "budget_style": preference.budget_style if preference else "medium",
        "interests": preference.interests if preference else [],
        "hotel_type": preference.hotel_type if preference else "boutique",
        "food_preferences": preference.food_preferences if preference else [],
    }
    itinerary_data = build_itinerary_payload(payload, preferences=preference_data)

    itinerary = Itinerary(
        user_id=current_user.id,
        destination=payload.destination,
        budget=payload.budget,
        start_date=payload.start_date,
        end_date=payload.end_date,
        travelers=payload.travelers,
        interests=", ".join(payload.interests),
        hotels=itinerary_data["hotels"],
        transport_options=itinerary_data["transport_options"],
        restaurants=itinerary_data["restaurants"],
        activities=itinerary_data["activities"],
        day_wise_plan=itinerary_data["day_wise_plan"],
    )

    db.add(itinerary)
    db.commit()
    db.refresh(itinerary)

    db.add(
        Notification(
            user_id=current_user.id,
            title="New itinerary created",
            message=f"Your itinerary for {itinerary.destination} is ready.",
            is_read=False,
        )
    )
    db.commit()

    budget_breakdown = compute_budget_breakdown(itinerary)

    return {
        "success": True,
        "message": "Itinerary created successfully",
        "data": {
            "id": itinerary.id,
            "destination": itinerary.destination,
            "hotels": itinerary.hotels,
            "transport_options": itinerary.transport_options,
            "restaurants": itinerary.restaurants,
            "activities": itinerary.activities,
            "day_wise_plan": itinerary.day_wise_plan,
            "budget_breakdown": budget_breakdown,
        },
    }


@app.get("/itineraries/recent")
def get_recent_itineraries(
    limit: int = 8,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    itineraries = (
        db.query(Itinerary)
        .filter(Itinerary.user_id == current_user.id)
        .order_by(Itinerary.created_at.desc())
        .limit(limit)
        .all()
    )
    data = [
        {
            "id": item.id,
            "destination": item.destination,
            "budget": item.budget,
            "start_date": item.start_date,
            "end_date": item.end_date,
            "travelers": item.travelers,
            "created_at": item.created_at,
            "budget_breakdown": compute_budget_breakdown(item),
        }
        for item in itineraries
    ]
    return {"success": True, "data": data}


@app.get("/itineraries/{itinerary_id}")
def get_itinerary_details(
    itinerary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    itinerary = (
        db.query(Itinerary)
        .filter(Itinerary.id == itinerary_id, Itinerary.user_id == current_user.id)
        .first()
    )
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    map_points = build_map_points(
        itinerary.destination,
        itinerary.hotels,
        itinerary.restaurants,
        itinerary.activities,
    )

    return {
        "success": True,
        "data": {
            "id": itinerary.id,
            "destination": itinerary.destination,
            "budget": itinerary.budget,
            "start_date": itinerary.start_date,
            "end_date": itinerary.end_date,
            "travelers": itinerary.travelers,
            "interests": itinerary.interests,
            "hotels": itinerary.hotels,
            "transport_options": itinerary.transport_options,
            "restaurants": itinerary.restaurants,
            "activities": itinerary.activities,
            "day_wise_plan": itinerary.day_wise_plan,
            "map_points": map_points,
            "budget_breakdown": compute_budget_breakdown(itinerary),
        },
    }


@app.put("/itineraries/{itinerary_id}/day-plan")
def update_day_plan_order(
    itinerary_id: int,
    payload: DayPlanReorderIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    itinerary = (
        db.query(Itinerary)
        .filter(Itinerary.id == itinerary_id, Itinerary.user_id == current_user.id)
        .first()
    )
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    itinerary.day_wise_plan = payload.day_wise_plan
    db.commit()

    db.add(
        Notification(
            user_id=current_user.id,
            title="Day plan reordered",
            message=f"Updated activity order for {itinerary.destination}.",
            is_read=False,
        )
    )
    db.commit()

    return {"success": True, "message": "Day-wise plan updated", "data": itinerary.day_wise_plan}


@app.get("/itineraries/{itinerary_id}/budget")
def get_budget_breakdown(
    itinerary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    itinerary = (
        db.query(Itinerary)
        .filter(Itinerary.id == itinerary_id, Itinerary.user_id == current_user.id)
        .first()
    )
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    return {"success": True, "data": compute_budget_breakdown(itinerary)}


@app.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )
    unread_count = sum(0 if item.is_read else 1 for item in notifications)
    return {
        "success": True,
        "data": {
            "unread_count": unread_count,
            "items": [
                {
                    "id": item.id,
                    "title": item.title,
                    "message": item.message,
                    "is_read": item.is_read,
                    "created_at": item.created_at,
                }
                for item in notifications
            ],
        },
    }


@app.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    return {"success": True, "message": "Notification marked as read", "data": {"id": notification.id}}


@app.get("/stats/users")
def get_user_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _ = current_user
    total_users = db.query(func.count(User.id)).scalar() or 0
    return {"success": True, "data": {"total_users": total_users}}


@app.get("/stats/destinations")
def get_destination_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _ = current_user
    rows = db.query(Itinerary.destination).all()
    counts = Counter(row[0] for row in rows)
    formatted = [{"destination": key, "count": value} for key, value in counts.most_common(8)]
    return {"success": True, "data": formatted}


@app.get("/stats/budgets")
def get_budget_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _ = current_user
    itineraries = db.query(Itinerary).all()
    buckets = {"Low (<1000)": 0, "Medium (1000-3000)": 0, "High (>3000)": 0}
    for item in itineraries:
        if item.budget < 1000:
            buckets["Low (<1000)"] += 1
        elif item.budget <= 3000:
            buckets["Medium (1000-3000)"] += 1
        else:
            buckets["High (>3000)"] += 1

    data = [{"range": key, "count": value} for key, value in buckets.items()]
    return {"success": True, "data": data}


@app.get("/download-itinerary/{itinerary_id}")
def download_itinerary(
    itinerary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    itinerary = (
        db.query(Itinerary)
        .filter(Itinerary.id == itinerary_id, Itinerary.user_id == current_user.id)
        .first()
    )
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    output_dir = Path("/tmp")
    output_dir.mkdir(parents=True, exist_ok=True)
    file_path = output_dir / f"destina_itinerary_{itinerary.id}.pdf"

    pdf = canvas.Canvas(str(file_path), pagesize=A4)
    width, height = A4
    y = height - 20 * mm

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(20 * mm, y, f"Destina AI Itinerary - {itinerary.destination}")
    y -= 10 * mm

    pdf.setFont("Helvetica", 11)
    lines = [
        f"Travelers: {itinerary.travelers}",
        f"Budget: ${itinerary.budget}",
        f"Dates: {itinerary.start_date} to {itinerary.end_date}",
        f"Interests: {itinerary.interests}",
        "",
        "Day-wise Plan:",
    ]

    for line in lines:
        pdf.drawString(20 * mm, y, line)
        y -= 7 * mm

    for day in itinerary.day_wise_plan:
        text = f"Day {day['day']}: {day['title']} - {day['description']}"
        if y < 20 * mm:
            pdf.showPage()
            y = height - 20 * mm
            pdf.setFont("Helvetica", 11)
        pdf.drawString(20 * mm, y, text[:120])
        y -= 7 * mm

    breakdown = compute_budget_breakdown(itinerary)
    if y < 30 * mm:
        pdf.showPage()
        y = height - 20 * mm
        pdf.setFont("Helvetica", 11)
    pdf.drawString(20 * mm, y, "")
    y -= 7 * mm
    pdf.drawString(20 * mm, y, "Budget Breakdown:")
    y -= 7 * mm
    pdf.drawString(20 * mm, y, f"Hotel Total: ${breakdown['hotel_total']}")
    y -= 7 * mm
    pdf.drawString(20 * mm, y, f"Food Total: ${breakdown['food_total']}")
    y -= 7 * mm
    pdf.drawString(20 * mm, y, f"Travel Total: ${breakdown['travel_total']}")
    y -= 7 * mm
    pdf.drawString(20 * mm, y, f"Activity Total: ${breakdown['activity_total']}")
    y -= 7 * mm
    pdf.drawString(20 * mm, y, f"Grand Total: ${breakdown['grand_total']}")

    pdf.save()

    return FileResponse(
        str(file_path),
        media_type="application/pdf",
        filename=f"destina_itinerary_{itinerary.id}.pdf",
    )
