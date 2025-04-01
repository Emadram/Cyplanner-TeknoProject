module.exports = ({ env }) => [
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      origin: ["http://localhost:5173"], // Allow Vite frontend
      methods: ["GET", "POST", "PUT", "DELETE"],
      headers: ["Content-Type", "Authorization"],
    },
  },
  'strapi::logger',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
