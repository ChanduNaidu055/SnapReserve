const cors = require("cors");
const express = require("express");
const app = express();
const path = require("path");

const dbDirectory = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
const dbPath = path.join(dbDirectory, "studio.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use(cors({
  origin: ["http://localhost:3000", "https://snap-reserve-xi.vercel.app"],
  credentials: true
}));

app.use(express.json());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'customer');`,
      
      `CREATE TABLE IF NOT EXISTS event_categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);`,
      
      `CREATE TABLE IF NOT EXISTS photography_packages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL, duration TEXT NOT NULL, services TEXT NOT NULL);`,
      
      `CREATE TABLE IF NOT EXISTS photographers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, availability_status TEXT DEFAULT 'Available');`,
      
      `CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_name TEXT NOT NULL, package_id INTEGER, photographer_id INTEGER, date TEXT NOT NULL, event_type TEXT, special_requests TEXT DEFAULT '', status TEXT DEFAULT 'Pending', FOREIGN KEY (package_id) REFERENCES photography_packages(id), FOREIGN KEY (photographer_id) REFERENCES photographers(id));`,
      
      `CREATE TABLE IF NOT EXISTS booking_status_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, booking_id INTEGER NOT NULL, old_status TEXT, new_status TEXT, changed_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (booking_id) REFERENCES bookings(id));`,
      
      `CREATE TABLE IF NOT EXISTS gallery (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT, src TEXT, title TEXT);`
    ];

    for (let query of tableQueries) {
      await db.run(query);
    }

    const pkgCount = await db.get(`SELECT count(*) as count FROM photography_packages`);
    if (pkgCount.count === 0) {
      await db.run(`
        INSERT INTO photography_packages (name, price, duration, services) VALUES
        ('Essential Portrait Session', 199, '1 Hour', 'Basic editing, 20 digital photos'),
        ('Premium Wedding Collection', 1499, '8 Hours', 'Full day coverage, album, 2 photographers'),
        ('Commercial Product Shoot', 599, '4 Hours', 'Product photography, white background, editing'),
        ('Family Mini-Session', 149, '30 Minutes', '10 edited photos, online gallery')
      `);
    }

    const photoCount = await db.get(`SELECT count(*) as count FROM photographers`);
    if (photoCount.count === 0) {
      await db.run(`
        INSERT INTO photographers (name, availability_status) VALUES
        ('Alex Stone', 'Available'),
        ('Sarah Jenkins', 'Available'),
        ('David Chen', 'Available')
      `);
    }

    const catCount = await db.get(`SELECT count(*) as count FROM event_categories`);
    if (catCount.count === 0) {
      await db.run(`
        INSERT INTO event_categories (name) VALUES
        ('Wedding'), ('Portrait'), ('Commercial'), ('Family'), ('Birthday'), ('Corporate')
      `);
    }

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (e) {
    console.log(`Database initialization failed: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.post("/api/packages", async (req, res) => {
  try {
    const { name, price, duration, services } = req.body;
    const addTodo = `INSERT INTO photography_packages (name, price, duration, services) VALUES (?, ?, ?, ?);`;
    await db.run(addTodo, [name, price, duration, services]);
    res.send("Photography package created successfully!");
  } catch (error) {
    console.error("Error creating package:", error.message);
    res.status(500).send("Error creating package");
  }
});

app.get("/api/packages", async (req, res) => {
  try {
    const packages = await db.all(`SELECT * FROM photography_packages`);
    
    if (packages.length === 0) {
      return res.status(200).json([
        { id: 1, name: "Essential Portrait Session", price: 199 },
        { id: 2, name: "Premium Wedding Collection", price: 1499 },
        { id: 3, name: "Commercial Product Shoot", price: 599 },
        { id: 4, name: "Family Mini-Session", price: 149 }
      ]);
    }
    
    res.status(200).json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error.message);
    res.status(500).send("Error fetching packages");
  }
});


app.get("/api/photographers", async (req, res) => {
  try {
    const photographers = await db.all(`SELECT * FROM photographers`);
    
    if (photographers.length === 0) {
      return res.status(200).json([
        { id: 1, name: "Alex Stone (Lead Photographer)" },
        { id: 2, name: "Sarah Jenkins (Wedding Specialist)" },
        { id: 3, name: "David Chen (Commercial & Drone)" }
      ]);
    }
    
    res.status(200).json(photographers);
  } catch (error) {
    console.error("Error fetching photographers:", error.message);
    res.status(500).send("Error fetching photographers");
  }
});

app.get("/api/photographers/availability", async (req, res) => {
  try {
    const { date } = req.query;
    let todos;
    
    if (date) {
      const getTodos = `SELECT * FROM photographers 
                        WHERE availability_status = 'Available' 
                        AND id NOT IN (SELECT photographer_id FROM bookings WHERE date = ? AND status != 'Cancelled')`;
      todos = await db.all(getTodos, [date]);
    } else {
      todos = await db.all(`SELECT * FROM photographers WHERE availability_status = 'Available'`);
    }
    res.send(todos);
  } catch (error) {
    console.error("Error checking availability:", error.message);
    res.status(500).send("Error checking availability");
  }
});


app.post("/api/bookings", async (req, res) => {
  try {
    const { customer_name, package_id, photographer_id, date, event_type, special_requests = "" } = req.body;

    const checkOverlap = `SELECT * FROM bookings 
                          WHERE photographer_id = ? 
                          AND date = ? 
                          AND status != 'Cancelled'`;
    const existingBooking = await db.get(checkOverlap, [photographer_id, date]);
    
    if (existingBooking) {
      return res.status(400).send("Photographer is already booked for this date!");
    }

    const addTodo = `INSERT INTO bookings (customer_name, package_id, photographer_id, date, event_type, special_requests, status)
                     VALUES (?, ?, ?, ?, ?, ?, 'Pending');`;
    await db.run(addTodo, [customer_name, package_id, photographer_id, date, event_type, special_requests]);
    res.send("Booking created successfully!");
  } catch (error) {
    console.error("Error creating booking:", error.message);
    res.status(500).send("Error creating booking");
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const { photographer_id, package_id, status, customer_name, limit = 10, offset = 0 } = req.query;

    let getTodos = `SELECT * FROM bookings WHERE 1=1`;
    const params = [];

    if (photographer_id) {
      getTodos += ` AND photographer_id = ?`;
      params.push(photographer_id);
    }
    if (package_id) {
      getTodos += ` AND package_id = ?`;
      params.push(package_id);
    }
    if (status) {
      getTodos += ` AND status = ?`;
      params.push(status);
    }
    if (customer_name) {
      getTodos += ` AND customer_name LIKE ?`;
      params.push(`%${customer_name}%`);
    }

    getTodos += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const todos = await db.all(getTodos, params);
    res.send(todos);
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    res.status(500).send("Error fetching bookings");
  }
});

app.put("/api/bookings/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updateTodo = `UPDATE bookings SET status = ? WHERE id = ?`;
    await db.run(updateTodo, [status, id]);
    res.send("Booking status updated successfully!");
  } catch (error) {
    console.error("Error updating status:", error.message);
    res.status(500).send("Error updating status");
  }
});


app.get("/api/dashboard/studio", async (req, res) => {
  try {
    const revenueQuery = `SELECT sum(p.price) as total_revenue 
                          FROM bookings b JOIN photography_packages p ON b.package_id = p.id 
                          WHERE b.status != 'Cancelled'`;
    const revenueData = await db.get(revenueQuery);
    
    const upcomingQuery = `SELECT count(*) as upcoming_shoots FROM bookings WHERE status = 'Confirmed' OR status = 'Pending'`;
    const upcomingData = await db.get(upcomingQuery);
    
    const utilizationQuery = `SELECT count(distinct photographer_id) as utilized_photographers FROM bookings WHERE status != 'Cancelled'`;
    const utilizationData = await db.get(utilizationQuery);
    
    res.send({
      package_revenue: revenueData.total_revenue || 0,
      upcoming_shoots: upcomingData.upcoming_shoots || 0,
      photographer_utilization: utilizationData.utilized_photographers || 0
    });
  } catch (error) {
    console.error("Error compiling dashboard metrics:", error.message);
    res.status(500).send("Error generating dashboard data");
  }
});

app.get("/api/gallery", async (req, res) => {
  try {
    if (!db) return res.json(getFallbackGallery());
    const rows = await db.all("SELECT * FROM gallery");
    res.json(rows && rows.length > 0 ? rows : getFallbackGallery());
  } catch (err) {
    console.error("❌ Gallery DB Error:", err.message);
    res.json(getFallbackGallery());
  }
});

app.get("/api/analytics/revenue", async (req, res) => {
  const processAnalytics = (rows) => {
    const pricingMatrix = { "Wedding": 3000, "Portrait": 500, "Commercial": 1500 };
    const packageMap = { "Weddings": 0, "Portraits": 0, "Commercial": 0 };
    const monthlyMap = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0 };

    if (rows) {
      rows.forEach(row => {
        if (row.status === 'Cancelled') return;
        const price = pricingMatrix[row.event_type] || 500;
        if (row.event_type === "Wedding") packageMap["Weddings"] += price;
        else if (row.event_type === "Portrait") packageMap["Portraits"] += price;
        else packageMap["Commercial"] += price;

        if (row.date) {
          const monthIndex = new Date(row.date).getMonth();
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
          if (monthIndex >= 0 && monthIndex < 6) monthlyMap[months[monthIndex]] += price;
        }
      });
    }

    return {
      monthlyRevenue: Object.keys(monthlyMap).map(m => ({ month: m, revenue: monthlyMap[m] })),
      packageBreakdown: Object.keys(packageMap).map(k => ({ name: k, value: packageMap[k] }))
    };
  };

  try {
    if (!db) return res.json(getFallbackAnalytics());
    const rows = await db.all("SELECT date, event_type, status FROM bookings WHERE date >= date('now', '-12 months')");
    res.json(processAnalytics(rows));
  } catch (err) {
    console.error("❌ Analytics DB Error:", err.message);
    res.json(getFallbackAnalytics());
  }
});

app.get("/api/bookings/reminders", async (req, res) => {
  try {
    if (!db) return res.json([]);
    const rows = await db.all("SELECT id, customer_name, date, event_type, status FROM bookings");
    
    const reminders = [];
    if (rows) {
      rows.forEach(row => {
        if (row.status === "Pending") {
          reminders.push({ 
            id: row.id, 
            type: "warning", 
            message: `Approval required for ${row.customer_name}` 
          });
        }
      });
    }
    res.json(reminders);
  } catch (err) {
    console.error("❌ Reminders database error:", err.message);
    res.json([]);
  }
});

//HELPERS 
function getFallbackGallery() {
  return [
    { id: 1, category: "Wedding", src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80", title: "The Johnson Wedding" },
    { id: 2, category: "Portrait", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80", title: "Corporate Headshots" },
    { id: 3, category: "Commercial", src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", title: "Commercial Spaces" }
  ];
}

function getFallbackAnalytics() {
  return {
    monthlyRevenue: [{ month: "Jan", revenue: 4000 }, { month: "Feb", revenue: 3500 }, { month: "Mar", revenue: 6000 }],
    packageBreakdown: [{ name: "Weddings", value: 8000 }, { name: "Portraits", value: 2000 }, { name: "Commercial", value: 3500 }]
  };
}