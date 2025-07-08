import { createServer } from "./server/index.ts";

const app = createServer();
const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
  console.log(`🌐 Subdomain images: https://{username}.x02.me/api/i/{filename}`);
}); 