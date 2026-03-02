import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip
} from "chart.js";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import api from "../api";
import DayPlannerDnd from "../components/DayPlannerDnd";
import InteractiveMap from "../components/InteractiveMap";
import PreferencesModal from "../components/PreferencesModal";
import ToastStack from "../components/ToastStack";
import { useI18n } from "../i18n";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

function Dashboard({ darkMode, onToggleTheme }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [stats, setStats] = useState({ totalUsers: 0, recentTrips: 0, topDestination: "N/A" });
  const [destinations, setDestinations] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedItineraryId, setSelectedItineraryId] = useState(null);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [notifications, setNotifications] = useState({ unread_count: 0, items: [] });
  const [toasts, setToasts] = useState([]);

  const [form, setForm] = useState({
    destination: "",
    budget: "1500",
    start_date: "",
    end_date: "",
    travelers: "2",
    interests: "Adventure, Culture, Food"
  });

  useEffect(() => {
    document.title = "Destina Admin – Destina AI";
    fetchDashboardData();
    fetchPreferences();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!selectedItineraryId) return;
    fetchItineraryDetails(selectedItineraryId);
  }, [selectedItineraryId]);

  const pushToast = (title, toastMessage) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message: toastMessage }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const fetchDashboardData = async () => {
    try {
      const [usersRes, destinationRes, budgetRes, recentRes] = await Promise.all([
        api.get("/stats/users"),
        api.get("/stats/destinations"),
        api.get("/stats/budgets"),
        api.get("/itineraries/recent")
      ]);

      const destinationData = destinationRes.data?.data || [];
      const recentData = recentRes.data?.data || [];

      setStats({
        totalUsers: usersRes.data?.data?.total_users || 0,
        recentTrips: recentData.length,
        topDestination: destinationData[0]?.destination || "N/A"
      });
      setDestinations(destinationData);
      setBudgets(budgetRes.data?.data || []);
      setItineraries(recentData);
      if (!selectedItineraryId && recentData[0]?.id) {
        setSelectedItineraryId(recentData[0].id);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("destina_token");
        localStorage.removeItem("destina_user_name");
        navigate("/login");
        return;
      }
      setError("Unable to load dashboard data right now.");
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await api.get("/preferences");
      setPreferences(response.data?.data);
    } catch {
      setPreferences(null);
    }
  };

  const savePreferences = async (payload) => {
    try {
      const response = await api.put("/preferences", payload);
      setPreferences(response.data?.data);
      setPreferencesOpen(false);
      pushToast("Preferences", "Preferences updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save preferences.");
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data?.data || { unread_count: 0, items: [] });
    } catch {
      setNotifications({ unread_count: 0, items: [] });
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch {
      // ignore mark-read failures
    }
  };

  const fetchItineraryDetails = async (id) => {
    try {
      const detailsRes = await api.get(`/itineraries/${id}`);
      setSelectedItinerary(detailsRes.data?.data || null);
      const budgetRes = await api.get(`/itineraries/${id}/budget`);
      setBudgetInfo(budgetRes.data?.data || null);
    } catch {
      setSelectedItinerary(null);
      setBudgetInfo(null);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await api.post("/create-itinerary", {
        destination: form.destination,
        budget: Number(form.budget),
        start_date: form.start_date,
        end_date: form.end_date,
        travelers: Number(form.travelers),
        interests: form.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      });

      setMessage("Itinerary created successfully.");
      pushToast("Itinerary", "A new itinerary has been generated.");
      const newId = response.data?.data?.id;
      fetchDashboardData();
      fetchNotifications();
      if (newId) setSelectedItineraryId(newId);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || "Failed to create itinerary.");
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/download-itinerary/${id}`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `destina_itinerary_${id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Unable to download itinerary PDF.");
    }
  };

  const handleSaveDayPlan = async (id, dayPlan) => {
    try {
      await api.put(`/itineraries/${id}/day-plan`, { day_wise_plan: dayPlan });
      pushToast("Planner", "Day plan order saved.");
      fetchNotifications();
      fetchItineraryDetails(id);
    } catch {
      setError("Unable to save day plan order.");
    }
  };

  const lineData = useMemo(
    () => ({
      labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
      datasets: [
        {
          label: "User Growth",
          data: [
            Math.max(stats.totalUsers - 25, 1),
            Math.max(stats.totalUsers - 20, 1),
            Math.max(stats.totalUsers - 15, 1),
            Math.max(stats.totalUsers - 10, 1),
            Math.max(stats.totalUsers - 5, 1),
            Math.max(stats.totalUsers, 1)
          ],
          borderColor: "#0EA5E9",
          backgroundColor: "rgba(99,102,241,0.22)",
          fill: true,
          tension: 0.35
        }
      ]
    }),
    [stats.totalUsers]
  );

  const pieData = useMemo(
    () => ({
      labels: destinations.map((item) => item.destination),
      datasets: [{ data: destinations.map((item) => item.count), backgroundColor: ["#6366F1", "#0EA5E9", "#F59E0B", "#10B981", "#8B5CF6", "#F43F5E"] }]
    }),
    [destinations]
  );

  const barData = useMemo(
    () => ({
      labels: budgets.map((item) => item.range),
      datasets: [{ label: "Trips", data: budgets.map((item) => item.count), backgroundColor: ["#0EA5E9", "#6366F1", "#F59E0B"] }]
    }),
    [budgets]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: darkMode ? "#cbd5e1" : "#334155" } } },
    scales: {
      x: { ticks: { color: darkMode ? "#cbd5e1" : "#334155" }, grid: { color: darkMode ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.08)" } },
      y: { ticks: { color: darkMode ? "#cbd5e1" : "#334155" }, grid: { color: darkMode ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.08)" } }
    }
  };

  return (
    <main className="min-h-screen py-6">
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))} />
      <PreferencesModal open={preferencesOpen} onClose={() => setPreferencesOpen(false)} initial={preferences} onSave={savePreferences} />

      <section className="app-container">
        <header className="glass mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white md:text-3xl light:text-slate-900">Destina Admin – Destina AI</h1>
            <p className="text-sm text-slate-300 light:text-slate-600">Premium analytics and itinerary control center</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setPreferencesOpen(true)} className="rounded-full border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-semibold text-accent">{t("preferences")}</button>
            <button className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white light:text-slate-700" onClick={fetchNotifications}>
              {t("notifications")} ({notifications.unread_count})
            </button>
            <button onClick={onToggleTheme} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white light:border-slate-300 light:bg-white light:text-slate-800">
              {darkMode ? "Light" : "Dark"}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("destina_token");
                localStorage.removeItem("destina_user_name");
                navigate("/login");
              }}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Registered Users", value: stats.totalUsers },
            { title: "Recent Itineraries", value: stats.recentTrips },
            { title: "Top Destination", value: stats.topDestination }
          ].map((card, index) => (
            <motion.article key={card.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.07 }} className="glass rounded-2xl bg-metallic p-5">
              <p className="text-sm text-slate-300 light:text-slate-600">{card.title}</p>
              <h2 className="mt-2 font-heading text-3xl font-bold text-white light:text-slate-900">{card.value}</h2>
            </motion.article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <section className="glass rounded-2xl p-4">
            <h3 className="font-heading text-lg font-semibold text-white light:text-slate-900">Create Itinerary</h3>
            <form onSubmit={handleCreate} className="mt-3 space-y-3">
              <input required placeholder="Destination" value={form.destination} onChange={(event) => setForm((prev) => ({ ...prev, destination: event.target.value }))} className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-secondary light:border-slate-300 light:bg-white light:text-slate-900" />
              <input required type="number" min="100" placeholder="Budget" value={form.budget} onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))} className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-secondary light:border-slate-300 light:bg-white light:text-slate-900" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="date" value={form.start_date} onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))} className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-secondary light:border-slate-300 light:bg-white light:text-slate-900" />
                <input required type="date" value={form.end_date} onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))} className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-secondary light:border-slate-300 light:bg-white light:text-slate-900" />
              </div>
              <input required type="number" min="1" max="20" placeholder="Travelers" value={form.travelers} onChange={(event) => setForm((prev) => ({ ...prev, travelers: event.target.value }))} className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-secondary light:border-slate-300 light:bg-white light:text-slate-900" />
              <input required placeholder="Interests (comma separated)" value={form.interests} onChange={(event) => setForm((prev) => ({ ...prev, interests: event.target.value }))} className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-secondary light:border-slate-300 light:bg-white light:text-slate-900" />
              <button className="w-full rounded-xl bg-gradient-to-r from-primary via-secondary to-accent py-2.5 text-sm font-semibold text-white">Generate Plan</button>
              {message && <p className="text-sm text-emerald-400">{message}</p>}
              {error && <p className="text-sm text-red-400">{error}</p>}
            </form>
          </section>

          <section className="glass rounded-2xl p-4 xl:col-span-2">
            <h3 className="mb-3 font-heading text-lg font-semibold text-white light:text-slate-900">User Growth</h3>
            <div className="h-[260px] md:h-[300px]">
              <Line data={lineData} options={chartOptions} />
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="glass rounded-2xl p-4">
            <h3 className="mb-3 font-heading text-lg font-semibold text-white light:text-slate-900">Popular Destinations</h3>
            <div className="h-[260px] md:h-[300px]">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: darkMode ? "#cbd5e1" : "#334155" } } } }} />
            </div>
          </section>
          <section className="glass rounded-2xl p-4">
            <h3 className="mb-3 font-heading text-lg font-semibold text-white light:text-slate-900">Budget Distribution</h3>
            <div className="h-[260px] md:h-[300px]">
              <Bar data={barData} options={chartOptions} />
            </div>
          </section>
        </div>

        <section className="glass mt-6 overflow-hidden rounded-2xl p-4">
          <h3 className="mb-3 font-heading text-lg font-semibold text-white light:text-slate-900">Recent Itineraries</h3>
          <div className="mb-3 grid gap-2 md:grid-cols-2">
            <select
              value={selectedItineraryId || ""}
              onChange={(event) => setSelectedItineraryId(Number(event.target.value))}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
            >
              {itineraries.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.destination} ({item.start_date} to {item.end_date})
                </option>
              ))}
            </select>
            {budgetInfo && (
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 light:text-slate-700">
                Estimated Total: <span className="font-semibold text-accent">${budgetInfo.grand_total}</span>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/15 text-xs uppercase tracking-wider text-slate-300 light:text-slate-600">
                  <th className="px-3 py-2">Destination</th>
                  <th className="px-3 py-2">Budget</th>
                  <th className="px-3 py-2">Travelers</th>
                  <th className="px-3 py-2">Dates</th>
                  <th className="px-3 py-2">PDF</th>
                </tr>
              </thead>
              <tbody>
                {itineraries.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-slate-300 light:text-slate-600" colSpan={5}>No itineraries yet.</td>
                  </tr>
                )}
                {itineraries.map((item) => (
                  <tr key={item.id} className="border-b border-white/10 text-slate-100 hover:bg-white/5 light:text-slate-700 light:hover:bg-slate-100/70">
                    <td className="px-3 py-2">{item.destination}</td>
                    <td className="px-3 py-2">${item.budget}</td>
                    <td className="px-3 py-2">{item.travelers}</td>
                    <td className="px-3 py-2">{item.start_date} to {item.end_date}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => handleDownload(item.id)} className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary">Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <DayPlannerDnd itineraryId={selectedItinerary?.id} items={selectedItinerary?.day_wise_plan} onSave={handleSaveDayPlan} />
        <InteractiveMap points={selectedItinerary?.map_points} />

        <section className="glass mt-6 rounded-2xl p-4">
          <h3 className="font-heading text-lg font-semibold text-white light:text-slate-900">Recent Notifications</h3>
          <div className="mt-3 space-y-2">
            {notifications.items.length === 0 && <p className="text-sm text-slate-300 light:text-slate-600">No notifications yet.</p>}
            {notifications.items.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`block w-full rounded-xl border px-3 py-2 text-left text-sm ${item.is_read ? "border-white/10 bg-white/5 text-slate-300" : "border-accent/35 bg-accent/10 text-slate-100"}`}
              >
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs opacity-85">{item.message}</p>
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
