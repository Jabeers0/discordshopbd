const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5000;

// Your Discord webhook URL here:
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN";

app.use(cors());
app.use(express.json());

app.post("/api/orders", async (req, res) => {
  const { name, whatsapp, discord, products } = req.body;

  if (!name || !whatsapp || !discord || !products || !products.length) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  const productListText = products
    .map(p => `**${p.productName}** x${p.quantity}`)
    .join("\n");

  const discordMessage = {
    content: `📦 **New Order Received!**

**Name:** ${name}
**WhatsApp:** ${whatsapp}
**Discord:** ${discord}
**Order:**
${productListText}

Thank you!`,
  };

  try {
    const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordMessage),
    });

    if (!discordRes.ok) {
      return res.status(500).json({ error: "Failed to send Discord message" });
    }

    res.json({ message: "Order received and sent to Discord" });
  } catch (error) {
    console.error("Error sending Discord message:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
