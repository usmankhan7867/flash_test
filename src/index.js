const express = require('express');
const addressRoutes = require('./routes/addresses');
const app = express();
const cors = require('cors');
require('./controllers/config/database')
const corsOptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());
app.use('/api', addressRoutes);
app.get("/", (req, res) => {
    res.send("Hello, Solana Address Storer!");
});
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
