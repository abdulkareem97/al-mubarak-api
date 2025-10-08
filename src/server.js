import app from "./app.js";
import { PORT } from "./config/env.js";


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});