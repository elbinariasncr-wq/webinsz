module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Method tidak diizinkan. Gunakan POST."
    });
  }

  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({
        ok: false,
        message: "TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum disetting di Environment Variables."
      });
    }

    const { username, link, boost, paket } = req.body || {};

    if (!username || !boost || !paket) {
      return res.status(400).json({
        ok: false,
        message: "Data tidak lengkap."
      });
    }

    if (!String(username).trim().startsWith("@")) {
      return res.status(400).json({
        ok: false,
        message: 'Username wajib diawali "@".'
      });
    }

    const boostText = String(boost).trim();
    const paketText = String(paket).trim();
    const usernameText = String(username).trim();
    const linkText = String(link || "").trim();

    const needLinkBoosts = ["likes", "views", "favorites", "shares"];
    const selectedBoosts = boostText
      .split(",")
      .map(item => item.trim().toLowerCase());

    const needVideoLink = selectedBoosts.some(item => needLinkBoosts.includes(item));

    if (needVideoLink) {
      if (!linkText) {
        return res.status(400).json({
          ok: false,
          message: "Link VT TikTok wajib diisi untuk Likes, Views, Favorites, atau Shares."
        });
      }

      if (!linkText.startsWith("https://vt.tiktok.com/")) {
        return res.status(400).json({
          ok: false,
          message: "Link VT TikTok wajib diawali https://vt.tiktok.com/"
        });
      }
    }

    const waktu = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Pontianak",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(new Date());

    const message =
`🚀 Boost Berhasil! 🚀

Waktu : ${waktu}
Username : ${usernameText}
${linkText ? `Link VT : ${linkText}\n` : ""}Jenis Boost : ${boostText}
Paket : ${paketText}

Made by iEelXyz & SaveAPI`;

    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const tgResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        disable_web_page_preview: true
      })
    });

    const tgData = await tgResponse.json();

    if (!tgResponse.ok || !tgData.ok) {
      return res.status(500).json({
        ok: false,
        message: tgData.description || "Gagal mengirim pesan ke Telegram."
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Pesan berhasil dikirim ke Telegram."
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Terjadi error server."
    });
  }
};
