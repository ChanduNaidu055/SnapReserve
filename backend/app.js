const express = require("express");
const app = express();

const path = require("path");
const { title } = require("process");
const dbDirectory = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
const dbPath = path.join(dbDirectory, "studio.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log("Server is running on port ${PORT}");
    });
  } catch (e) {
    console.log(e.error_msg);
    process.exit(1);
  }
};

initializeDbAndServer();

// 1. photography package API
app.post("/api/packages", async (req, res) => {
  const { name, price, duration, services } = req.body;
  const addTodo = `insert into photography_packages (name, price, duration, services)
        values ('${name}', ${price}, '${duration}', '${services}');`;
  await db.run(addTodo);
  res.send("Photography package created successfully!");
});

// Get all photography packages
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
    console.error("Error fetching packages:", error);
    res.status(500).send("Error fetching packages");
  }
});

// Get all photographers for the Booking Dropdown API
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
    console.error("Error fetching photographers:", error);
    res.status(500).send("Error fetching photographers");
  }
});

// 2. Checking photographers availability API
app.get("/api/photographers/availability", async (req, res) => {
  const { date } = req.query;
  let getTodos;
  
  if (date) {
    getTodos = `select * from photographers 
                where availability_status = 'Available' 
                and id not in (select photographer_id from bookings where date = '${date}' and status != 'Cancelled')`;
  } else {
    getTodos = `select * from photographers where availability_status = 'Available'`;
  }
  
  const todos = await db.all(getTodos);
  res.send(todos);
});

// 3. Create booking API (UPDATED to include special_requests)
app.post("/api/bookings", async (req, res) => {
  // Added special_requests to the extraction
  const { customer_name, package_id, photographer_id, date, event_type, special_requests = "" } = req.body;

  const checkOverlap = `select * from bookings 
                        where photographer_id = ${photographer_id} 
                        and date = '${date}' 
                        and status != 'Cancelled'`;
  const existingBooking = await db.get(checkOverlap);
  
  if (existingBooking) {
    res.status(400).send("Photographer is already booked for this date!");
  } else {
    // Added special_requests to the SQL insert query
    const addTodo = `insert into bookings (customer_name, package_id, photographer_id, date, event_type, special_requests, status)
          values ('${customer_name}', ${package_id}, ${photographer_id}, '${date}', '${event_type}', '${special_requests}', 'Pending');`;
    await db.run(addTodo);
    res.send("Booking created successfully!");
  }
});

// 4. Show bookings API
app.get("/api/bookings", async (req, res) => {
  const { photographer_id, package_id, status, customer_name, limit = 10, offset = 0 } = req.query;
  
  let getTodos = `select * from bookings where 1=1`;
  
  if (photographer_id) {
    getTodos += ` and photographer_id = ${photographer_id}`;
  }
  if (package_id) {
    getTodos += ` and package_id = ${package_id}`;
  }
  if (status) {
    getTodos += ` and status = '${status}'`;
  }
  if (customer_name) {
    getTodos += ` and customer_name like '%${customer_name}%'`;
  }
  
  getTodos += ` limit ${limit} offset ${offset}`;
  
  const todos = await db.all(getTodos);
  res.send(todos);
});

// 5. Update booking status API
app.put("/api/bookings/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const deleteTodo = `update bookings set status = '${status}' where id = '${id}'`;
  await db.run(deleteTodo);
  res.send("Booking status updated successfully!");
});

// 6. Return booking metrics API
app.get("/api/dashboard/studio", async (req, res) => {
  const revenueQuery = `select sum(p.price) as total_revenue 
                        from bookings b join photography_packages p on b.package_id = p.id 
                        where b.status != 'Cancelled'`;
  const revenueData = await db.get(revenueQuery);
  
  const upcomingQuery = `select count(*) as upcoming_shoots from bookings where status = 'Confirmed' or status = 'Pending'`;
  const upcomingData = await db.get(upcomingQuery);
  
  const utilizationQuery = `select count(distinct photographer_id) as utilized_photographers from bookings where status != 'Cancelled'`;
  const utilizationData = await db.get(utilizationQuery);
  
  res.send({
    package_revenue: revenueData.total_revenue || 0,
    upcoming_shoots: upcomingData.upcoming_shoots || 0,
    photographer_utilization: utilizationData.utilized_photographers || 0
  });
});

// BONUS: GALLERY PREVIEW API
app.get("/api/gallery", async (req, res) => {
  let responded = false;

  const timeout = setTimeout(() => {
    if (!responded) {
      responded = true;
      return res.json(getFallbackGallery());
    }
  }, 3000);

  try {
    const dbQuery = db.all("SELECT * FROM gallery", [], (err, rows) => {
      if (responded) return;
      responded = true;
      clearTimeout(timeout);
      if (err) console.error("❌ DB Error:", err.message);
      res.json(!err && rows && rows.length > 0 ? rows : getFallbackGallery());
    });

    if (dbQuery instanceof Promise) {
      const rows = await dbQuery;
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        res.json(rows && rows.length > 0 ? rows : getFallbackGallery());
      }
    }
  } catch (err) {
    if (!responded) {
      responded = true;
      clearTimeout(timeout);
      console.error("❌ Crash caught:", err.message);
      res.json(getFallbackGallery());
    }
  }
});

// BONUS: REVENUE ANALYTICS API
app.get("/api/analytics/revenue", async (req, res) => {
  let responded = false;

  const timeout = setTimeout(() => {
    if (!responded) {
      responded = true;
      return res.json(getFallbackAnalytics());
    }
  }, 3000);

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
    const dbQuery = db.all("SELECT date, event_type, status FROM bookings WHERE date >= date('now', '-12 months')", [], (err, rows) => {
      if (responded) return;
      responded = true;
      clearTimeout(timeout);
      res.json(err ? getFallbackAnalytics() : processAnalytics(rows));
    });

    if (dbQuery instanceof Promise) {
      const rows = await dbQuery;
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        res.json(processAnalytics(rows));
      }
    }
  } catch (err) {
     if (!responded) {
        responded = true;
        clearTimeout(timeout);
        res.json(getFallbackAnalytics());
     }
  }
});

// BOOKING REMINDER NOTIFICATIONS API
app.get("/api/bookings/reminders", (req, res) => {
  const dbInstance = typeof db !== 'undefined' ? db : (typeof database !== 'undefined' ? database : null);
  if (!dbInstance) return res.json([]);

  dbInstance.all("SELECT id, customer_name, date, event_type, status FROM bookings", [], (err, rows) => {
    if (err) {
      console.error("❌ Reminders database error:", err.message);
      return res.json([]);
    }
    
    const reminders = [];
    if (rows) {
      rows.forEach(row => {
        if (row.status === "Pending") {
          reminders.push({ id: row.id, type: "warning", message: `Approval required for ${row.customer_name}` });
        }
      });
    }
    res.json(reminders);
  });
});

// HELPER FUNCTIONS
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