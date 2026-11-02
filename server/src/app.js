
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";
import { rateLimit } from "express-rate-limit";
import { pool } from "./db.js";
import Stripe from "stripe";


const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.set("trust proxy", 1);

console.log(
  "Stripe secret key loaded:",
  Boolean(process.env.STRIPE_SECRET_KEY)
);

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing from server/.env");
}

const PgSession = connectPgSimple(session);

// --------------------------------------------------
// EXPRESS MIDDLEWARE
// --------------------------------------------------

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// STRIPE WEBHOOK — must be before express.json()
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error("Stripe webhook signature error:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object;

      // Only activate a membership after Stripe confirms payment
      if (checkoutSession.payment_status !== "paid") {
        return res.json({ received: true });
      }

      const orderId = checkoutSession.metadata?.orderId;

      if (!orderId) {
        console.error("Missing orderId in Stripe metadata.");
        return res.status(400).json({ error: "Missing order ID." });
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Lock the order to prevent duplicate activation
        const orderResult = await client.query(
          `SELECT id, user_id, status
           FROM orders
           WHERE id = $1
           FOR UPDATE`,
          [orderId]
        );

        if (orderResult.rows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({ error: "Order not found." });
        }

        const order = orderResult.rows[0];

        // Webhooks can be delivered more than once
        if (order.status === "paid") {
          await client.query("COMMIT");
          return res.json({ received: true });
        }

        // Get the plan from the order
        const itemResult = await client.query(
          `SELECT oi.plan_id, mp.duration_days
           FROM order_items oi
           JOIN membership_plans mp ON mp.id = oi.plan_id
           WHERE oi.order_id = $1
           LIMIT 1`,
          [orderId]
        );

        if (itemResult.rows.length === 0) {
          throw new Error("No membership plan found for this order.");
        }

        const plan = itemResult.rows[0];

        // Mark the order as paid
        await client.query(
          `UPDATE orders
           SET status = 'paid',
               stripe_payment_intent_id = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [checkoutSession.payment_intent, orderId]
        );

        // Cancel previous active memberships
        await client.query(
          `UPDATE user_memberships
           SET status = 'cancelled'
           WHERE user_id = $1 AND status = 'active'`,
          [order.user_id]
        );

        // Activate the newly purchased membership
        await client.query(
          `INSERT INTO user_memberships
           (user_id, plan_id, starts_at, ends_at, status)
           VALUES (
             $1,
             $2,
             NOW(),
             NOW() + ($3 * INTERVAL '1 day'),
             'active'
           )`,
          [order.user_id, plan.plan_id, plan.duration_days]
        );

        await client.query("COMMIT");

        console.log(`Order ${orderId} paid. Membership activated.`);
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Webhook processing error:", error);
        return res.status(500).json({ error: "Webhook processing failed." });
      } finally {
        client.release();
      }
    }

    res.json({ received: true });
  }
);

app.use(express.json());

app.use(session({
  store: new PgSession({
    pool,
    tableName: "session",
  }),
  name: "pulse.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
     httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// Limit repeated authentication attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

// Helper: regenerate a session before logging a user in
function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

// Helper: save the session before responding
function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

// --------------------------------------------------
// AUTHENTICATION middleware

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({
      error: "Please log in first.",
    });
  }

  next();
}



// --------------------------------------------------
// REGISTER
app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (
      typeof full_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        error: "Please provide your name, email and password.",
      });
    }

    const cleanName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length > 120) {
      return res.status(400).json({
        error: "Name is required and must be at most 120 characters.",
      });
    }

    if (
      cleanEmail.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({ error: "Please provide a valid email." });
    }

    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        error: "Password must be at least 8 characters and at most 72 bytes.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, role`,
      [cleanName, cleanEmail, passwordHash]
    );

    const user = result.rows[0];

    await regenerateSession(req);
    req.session.userId = user.id;
    await saveSession(req);

    res.status(201).json({
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    console.error("Registration failed:", error.message);
    res.status(500).json({ error: "Registration failed." });
  }
});

// LOGIN
app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, full_name, email, password_hash, role
       FROM users
       WHERE email = $1`,
      [cleanEmail]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    await regenerateSession(req);
    req.session.userId = user.id;
    await saveSession(req);

    res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    res.status(500).json({ error: "Login failed." });
  }
});

// GET CURRENT SIGNED-IN USER
app.get("/api/auth/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not signed in." });
    }

    const result = await pool.query(
      `SELECT id, full_name, email, role
       FROM users
       WHERE id = $1`,
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found." });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Could not retrieve current user:", error.message);
    res.status(500).json({ error: "Could not retrieve user." });
  }
});

// LOGOUT
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout failed:", error.message);
      return res.status(500).json({ error: "Logout failed." });
    }

    res.clearCookie("pulse.sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    });

    res.json({ message: "Logged out successfully." });
  });
});

// --------------------------------------------------
// CLASSES
// --------------------------------------------------

app.get("/api/classes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        category,
        description,
        duration_minutes,
        class_number,
        schedule,
        coach_name,
        goal
      FROM classes
      WHERE active = TRUE
      ORDER BY id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch classes:", error.message);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// --------------------------------------------------
// TRAINERS
// --------------------------------------------------

app.get("/api/trainers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, role, image, description
      FROM trainers
      WHERE active = TRUE
      ORDER BY id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch trainers:", error.message);
    res.status(500).json({ error: "Failed to fetch trainers" });
  }
});

// --------------------------------------------------
// MEMBERSHIP PLANS
// --------------------------------------------------

app.get("/api/plans", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        description,
        price,
        duration_days,
        monthly_class_limit,
        plan_number,
        features,
        featured
      FROM membership_plans
      WHERE active = TRUE
      ORDER BY id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch plans:", error.message);
    res.status(500).json({ error: "Failed to fetch membership plans" });
  }
});

// --------------------------------------------------

// Subscribe to a membership plan
app.post("/api/memberships/subscribe", requireAuth, async (req, res) => {
  const client = await pool.connect();

  try {
    const { plan_id } = req.body;

    if (!Number.isInteger(Number(plan_id)) || Number(plan_id) <= 0) {
      return res.status(400).json({
        error: "Invalid membership plan.",
      });
    }

    await client.query("BEGIN");

    // Check whether the selected plan exists
    const planResult = await client.query(
      `SELECT id, name, duration_days
       FROM membership_plans
       WHERE id = $1 AND active = true`,
      [Number(plan_id)]
    );

    if (planResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Membership plan not found.",
      });
    }

    // Cancel the user's previous active membership
    await client.query(
      `UPDATE user_memberships
       SET status = 'cancelled'
       WHERE user_id = $1 AND status = 'active'`,
      [req.session.userId]
    );

    // Create the new membership
    const result = await client.query(
      `INSERT INTO user_memberships
        (user_id, plan_id, starts_at, ends_at, status)
       VALUES (
         $1,
         $2,
         NOW(),
         NOW() + ($3 * INTERVAL '1 day'),
         'active'
       )
       RETURNING id, plan_id, starts_at, ends_at, status`,
      [
        req.session.userId,
        Number(plan_id),
        planResult.rows[0].duration_days,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Membership activated successfully.",
      membership: {
        ...result.rows[0],
        name: planResult.rows[0].name,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Subscribe error:", error);

    res.status(500).json({
      error: "Could not subscribe to this plan.",
    });
  } finally {
    client.release();
  }
});

//--------------

// Get the logged-in user's memberships
app.get("/api/memberships/my", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         um.id,
         um.plan_id,
         um.status,
         um.starts_at,
         um.ends_at,
         mp.name,
         mp.price,
         mp.duration_days
       FROM user_memberships um
       JOIN membership_plans mp
         ON mp.id = um.plan_id
       WHERE um.user_id = $1
       ORDER BY um.created_at DESC`,
      [req.session.userId]
    );

    res.json({
      memberships: result.rows,
    });
  } catch (error) {
    console.error("Get memberships error:", error);

    res.status(500).json({
      error: "Could not load your memberships.",
    });
  }
});


// Create Stripe Checkout session
//-----------------------------------------------------

app.post("/api/payments/checkout", requireAuth, async (req, res) => {
  const { plan_id } = req.body;

  try {
    // 1. Validate the plan ID
    if (!plan_id || !Number.isInteger(Number(plan_id))) {
      return res.status(400).json({ error: "Invalid membership plan." });
    }

    // 2. Get the plan from the database
    const planResult = await pool.query(
      `SELECT id, name, price, duration_days
       FROM membership_plans
       WHERE id = $1 AND active = true`,
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: "Membership plan not found." });
    }

    const plan = planResult.rows[0];
    const priceInCents = Math.round(Number(plan.price) * 100);

    if (!Number.isFinite(priceInCents) || priceInCents <= 0) {
      return res.status(400).json({ error: "Invalid plan price." });
    }

    // 3. Create a pending order
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, total_amount, currency)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [req.session.userId, plan.price, "usd"]
    );

    const orderId = orderResult.rows[0].id;

    // 4. Add the selected plan to the order
    await pool.query(
      `INSERT INTO order_items
       (order_id, plan_id, item_name, unit_price, quantity, line_total)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, plan.id, plan.name, plan.price, 1, plan.price]
    );

    // 5. Create Stripe Checkout session
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",


      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.name} Membership`,
              description: `${plan.duration_days} days membership`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],

      success_url: `${clientUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/?checkout=cancelled`,

      client_reference_id: String(orderId),

      metadata: {
        orderId: String(orderId),
        userId: String(req.session.userId),
        planId: String(plan.id),
      },
    });

    // 6. Save the Stripe session ID
    await pool.query(
      `UPDATE orders
       SET stripe_checkout_session_id = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [checkoutSession.id, orderId]
    );

    res.status(201).json({
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error("Checkout error:", error.message);

    res.status(500).json({
      error: "Unable to create checkout session.",
    });
  }
});




// --------------------------------------------------
// START SERVER
// --------------------------------------------------

export default app;

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}


// const PORT = process.env.PORT || 4000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });