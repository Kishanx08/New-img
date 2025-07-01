const { createServer } = require('./index');
const app = createServer();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
}); 