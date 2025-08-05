import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT as number, '0.0.0.0' ,() => {
  console.log(`IRIS Backend API is running on http://localhost:${PORT}`);
});