// src/services/api.js → VERSION CORRIGÉE & FIABLE
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --------------------------------------
// SESSION HANDLER
// --------------------------------------
const getSession = () => {
  try {
    const raw = localStorage.getItem('esprim_session');
    if (!raw) return null;

    const session = JSON.parse(raw);

    if (session.expiresAt < Date.now()) {
      localStorage.removeItem('esprim_session');
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

// --------------------------------------
// GENERIC API REQUEST
// --------------------------------------
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const session = getSession();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token && { Authorization: `Bearer ${session.token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Erreur ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error("API Error:", err.message);
    throw err;
  }
};

// Simulation backend
const mockDelay = () => new Promise(res => setTimeout(res, 700));

// --------------------------------------
// AUTH API (MOCK)
// --------------------------------------
export const authAPI = {
  login: async (credentials) => {
    await mockDelay();

    // Ton tableau testUsers à partir de ta demande
    const mockUsers = {
      "ahmed.bensalem@esprim.tn": {
        role: "student",
        name: "Ahmed Ben Salem",
        password: "student123",
        requires2FA: false
      },
      "ahmed.bensalem.teacher@esprim.tn": {
        role: "teacher",
        name: "Dr Ahmed Ben Salem",
        password: "teacher123",
        requires2FA: true
      },
      "fatma.gharbi@esprim.tn": {
        role: "teacher",
        name: "Fatma Gharbi",
        password: "teacher456",
        requires2FA: true
      },
      "admin.system@esprim.tn": {
        role: "admin",
        name: "Admin System",
        password: "admin123",
        requires2FA: true
      },
      "hanen.benmanaa@esprim.tn": {
        role: "student",
        name: "Hanen Benmanaa",
        password: "student456",
        requires2FA: false
      }
      
    };

    const user = mockUsers[credentials.email];

    if (!user || credentials.password !== user.password) {
      throw new Error("Identifiants incorrects");
    }

    // Création session
    const session = {
      userRole: user.role,
      userName: user.name,
      userEmail: credentials.email,
      expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes
    };

    localStorage.setItem("esprim_session", JSON.stringify(session));

    return {
      user: {
        email: credentials.email,
        role: user.role,
        name: user.name
      },
      requiresTwoFactor: user.requires2FA
    };
  },

  verify2FA: async () => {
    await mockDelay();
    return { success: true };
  }
};

// --------------------------------------
// DASHBOARD API (mock)
// --------------------------------------
export const dashboardAPI = {
  getStudentDashboard: async () => {
    await mockDelay();
    return {
      stats: { submissions: 3, validated: 1, pending: 1 }
    };
  }
};

// --------------------------------------
// CATALOG API (mock)
// --------------------------------------
export const catalogAPI = {
  getAll: async () => {
    await mockDelay();
    return { reports: [] };
  }
};

export default { authAPI, dashboardAPI, catalogAPI };
