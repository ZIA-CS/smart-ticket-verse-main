export type AppRole = "admin" | "staff" | "user";

export interface AppUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: AppRole;
}

export interface AppTicket {
  id: string;
  eventId: string;
  userId: string;
  ticketCode: string;
  status: string;
  usedAt: string | null;
  createdAt: string;
}

export interface AppEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string;
  capacity: number;
  createdBy: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const TOKEN_KEY = "pulsepass_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : {};

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data as T;
};

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: AppUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: { email: string; password: string; firstName?: string; lastName?: string }) =>
    request<{ token: string; user: AppUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => request<{ user: AppUser }>("/auth/me"),

  getUsers: () => request<AppUser[]>("/users"),

  updateUser: (id: string, payload: Partial<AppUser>) =>
    request<AppUser>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  getEvents: () => request<AppEvent[]>("/events"),

  createEvent: (payload: Partial<AppEvent>) =>
    request<AppEvent>("/events", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateEvent: (id: string, payload: Partial<AppEvent>) =>
    request<AppEvent>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteEvent: (id: string) =>
    request<{ message: string }>(`/events/${id}`, {
      method: "DELETE",
    }),

  getTickets: () => request<AppTicket[]>("/tickets"),

  createTicket: (payload: { eventId: string; userId: string }) =>
    request<AppTicket>("/tickets", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  scanTicket: (id: string) =>
    request<{ message: string; ticket: AppTicket }>(`/tickets/${id}/scan`, {
      method: "PUT",
    }),

  deleteTicket: (id: string) =>
    request<{ message: string }>(`/tickets/${id}`, {
      method: "DELETE",
    }),
};
