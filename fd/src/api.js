import axios from "axios";

// ================= API INSTANCE =================

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL,

  withCredentials: true,
});

// ================= REQUEST INTERCEPTOR =================

API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(
      error
    );
  }
);

// ================= RESPONSE INTERCEPTOR =================

API.interceptors.response.use(
  (response) => response,

  (error) => {
    // TOKEN EXPIRED / UNAUTHORIZED

    if (
      error.response?.status ===
      401
    ) {
      localStorage.removeItem(
        "token"
      );

      // OPTIONAL AUTO REDIRECT

      if (
        window.location.pathname !==
        "/"
      ) {
        window.location.href =
          "/";
      }
    }

    console.log(
      "API ERROR =>",
      error.response?.data ||
        error.message
    );

    return Promise.reject(
      error
    );
  }
);

export default API;