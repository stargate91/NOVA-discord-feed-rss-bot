# Nova Bot – Adatbázis & Funkcióbővítési Terv (Feature Roadmap)

Ez a dokumentum a Nova Bot backend és adatbázis rétegének lehetséges bővítéseit tartalmazza, **UI (Kinézet) / UX (Felhasználói élmény) / ROI (Megtérülés & Monetizáció)** szempontok alapján rangsorolva.

---

## 📋 Összegző Rangsor & Prioritási Mátrix

| # | Funkció Neve | Főbb Érintett Táblák / Mezők | UI / UX Érték | Monetizációs ROI |
| :---: | :--- | :--- | :---: | :---: |
| **1.** | **🎨 Egyedi Webhook Identitás (White-Label)** | `monitors.webhook_name`, `webhook_avatar_url` | ⭐⭐⭐⭐⭐ | 🌟🌟🌟🌟🌟 *(Tier 2/3 Upsell)* |
| **2.** | **🧵 Automatikus Discord Thread Kibeszélő** | `monitors.auto_thread_enabled`, `thread_name_template` | ⭐⭐⭐⭐⭐ | 🌟🌟🌟🌟 *(Közösségi Engagement)* |
| **3.** | **🔍 Kulcsszó- és Negatív Szűrőrendszer** | `monitors.filter_include_keywords`, `filter_exclude_keywords` | ⭐⭐⭐⭐⭐ | 🌟🌟🌟🌟 *(Tier 1/2 Prémium)* |
| **4.** | **⏰ Csendes Időszak & DND Időzítő** | `guild_settings.quiet_hours_start`, `quiet_hours_end` | ⭐⭐⭐⭐ | 🌟🌟🌟🌟 *(Churn Csökkentés)* |
| **5.** | **📑 Napi / Heti Hírösszefoglaló (Digest Mód)** | `pending_digest_items`, `monitors.digest_mode_enabled` | ⭐⭐⭐⭐⭐ | 🌟🌟🌟🌟 *(B2B / Kripto Csomag)* |
| **6.** | **📊 Részletes Web Dashboard Analitika** | `feed_analytics` (`views, clicks, reactions`) | ⭐⭐⭐⭐⭐ | 🌟🌟🌟🌟 *(Tier 3 Vállalati)* |
| **7.** | **🔔 Interaktív Szerepkör Felvétel Gombok** | `monitor_role_buttons` (`role_id, label, emoji`) | ⭐⭐⭐⭐ | 🌟🌟🌟 *(Self-Service UX)* |
| **8.** | **👥 Dashboard Többfelhasználós Jogosultság**| `guild_collaborators` (`user_id, role, permissions`) | ⭐⭐⭐⭐ | 🌟🌟🌟🌟 *(Nagy Szerverek / B2B)* |
| **9.** | **🎯 Személyes Árfolyam Célár Riasztások** | `user_price_alerts` (`user_id, symbol, target_price`) | ⭐⭐⭐⭐ | 🌟🌟🌟 *(Mikrofizetés / Kripto)* |
| **10.**| **🌐 Egyedi Bejövő Webhook Motor (API)** | `custom_incoming_webhooks` (`token, secret, template`) | ⭐⭐⭐⭐⭐ | 🌟🌟🌟🌟🌟 *(Developer / API Tier)* |

---

## 🚀 Részletes Funkcióleírások & Adatbázis Séma Tervek

### 1. 🎨 Egyedi Webhook Identitás (White-Label Bot Name & Avatar)
* **Cél:** Lehetővé teszi, hogy a szerverek a saját arculatuknak megfelelő névvel és avatarral küldjék ki az értesítéseket (pl. "YouTube Alerter", "Steam Loot Hub").
* **Adatbázis módosítás:**
  ```sql
  ALTER TABLE monitors 
  ADD COLUMN IF NOT EXISTS webhook_name TEXT,
  ADD COLUMN IF NOT EXISTS webhook_avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS use_custom_identity BOOLEAN DEFAULT false;
  ```
* **UI / UX hatás:** Prémium megjelenés; a szervertagok nem egy általános botot látnak, hanem a szerver hivatalos rendszerét.
* **ROI:** Kiemelkedően magas konverziós ráta a szerveradminok körében, akik saját márkát (white-label) szeretnének.

---

### 2. 🧵 Automatikus Discord Fórum & Beszélgetési Szálak (Auto-Thread Creation)
* **Cél:** Minden új értesítéshez automatikusan nyit egy dedikált Discord Threadet (pl. *"🎬 Kibeszélő: Dűne 3"*).
* **Adatbázis módosítás:**
  ```sql
  ALTER TABLE monitors 
  ADD COLUMN IF NOT EXISTS auto_thread_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS thread_name_template TEXT DEFAULT '{title} - Kibeszélő',
  ADD COLUMN IF NOT EXISTS thread_auto_archive_mins INTEGER DEFAULT 1440;
  ```
* **UI / UX hatás:** Tisztán tartja a főcsatornát, azonnali teret ad a közösségi vitáknak és véleménycserének.
* **ROI:** Növeli a szerveren belüli aktivitást, ezzel nélkülözhetetlenné téve a botot.

---

### 3. 🔍 Intelligens Kulcsszó- és Negatív Szűrők (Content Filtering)
* **Cél:** Csak a releváns hírek átengedése és a spamek (pl. YouTube Shorts, szponzorált posztok) kiszűrése.
* **Adatbázis módosítás:**
  ```sql
  ALTER TABLE monitors 
  ADD COLUMN IF NOT EXISTS filter_include_keywords TEXT[],
  ADD COLUMN IF NOT EXISTS filter_exclude_keywords TEXT[],
  ADD COLUMN IF NOT EXISTS filter_regex TEXT;
  ```
* **UI / UX hatás:** Megszünteti az információs túlterheltséget nagy forgalmú hírforrásoknál.
* **ROI:** Kiválóan eladható Tier 1 / Tier 2 prémium alapfunkció.

---

### 4. ⏰ Csendes Időszak & Értesítési Időablak (Quiet Hours / DND Scheduler)
* **Cél:** Éjszakai pingek elnémítása vagy reggeli késleltetett kiküldés.
* **Adatbázis módosítás:**
  ```sql
  ALTER TABLE guild_settings 
  ADD COLUMN IF NOT EXISTS quiet_hours_start TIME,
  ADD COLUMN IF NOT EXISTS quiet_hours_end TIME,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS quiet_mode TEXT DEFAULT 'suppress_pings'; -- 'suppress_pings' | 'delay_delivery'
  ```
* **UI / UX hatás:** Nyugodt éjszakák a tagoknak, megelőzi a szerver lenémítását vagy a bot kidobását.
* **ROI:** Erős Churn Prevention (megtartási ráta növelése).

---

### 5. 📑 Napi / Heti Hírösszefoglaló Mód (Daily / Weekly Digest Mode)
* **Cél:** 20-30 különálló üzenet helyett egyetlen rendezett, összesített kártya küldése meghatározott időpontban.
* **Adatbázis módosítás:**
  ```sql
  CREATE TABLE IF NOT EXISTS pending_digest_items (
      id SERIAL PRIMARY KEY,
      guild_id BIGINT NOT NULL,
      monitor_id INTEGER REFERENCES monitors(id) ON DELETE CASCADE,
      item_data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ALTER TABLE monitors ADD COLUMN IF NOT EXISTS digest_mode_enabled BOOLEAN DEFAULT false;
  ```
* **UI / UX hatás:** Kompakt, átlátható napi/heti sajtószemle.
* **ROI:** Prémium funkció szakmai, üzleti és kripto közösségek számára.

---

### 6. 📊 Részletes Web Dashboard Analitika & Kattintáskövetés
* **Cél:** Interaktív hőtérképek és kattintási statisztikák biztosítása a webes felületen.
* **Adatbázis módosítás:**
  ```sql
  CREATE TABLE IF NOT EXISTS feed_analytics (
      id SERIAL PRIMARY KEY,
      guild_id BIGINT NOT NULL,
      monitor_id INTEGER REFERENCES monitors(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      views_count INTEGER DEFAULT 0,
      clicks_count INTEGER DEFAULT 0,
      reactions_count INTEGER DEFAULT 0,
      peak_hour INTEGER,
      UNIQUE (guild_id, monitor_id, date)
  );
  ```
* **UI / UX hatás:** Látványos grafikonok a legnépszerűbb hírekről és játékmegjelenésekről.
* **ROI:** Tier 3 / Vállalati szintű funkció a nagy szervertulajdonosoknak.

---

### 7. 🔔 Interaktív Szerepkör Felvétel Gombok (Self-Serve Notification Roles)
* **Cél:** Gomb az üzenet alatt, amivel a tagok magukra vehetik az értesítési rangot.
* **Adatbázis módosítás:**
  ```sql
  CREATE TABLE IF NOT EXISTS monitor_role_buttons (
      id SERIAL PRIMARY KEY,
      monitor_id INTEGER REFERENCES monitors(id) ON DELETE CASCADE,
      button_label TEXT DEFAULT 'Értesítést kérek',
      role_id BIGINT NOT NULL,
      emoji TEXT DEFAULT '🔔'
  );
  ```
* **UI / UX hatás:** 0 moderátori beavatkozást igénylő, kényelmes fel- és leiratkozás.
* **ROI:** Magasabb felhasználói elköteleződés és organikus aktivitás.

---

### 8. 👥 Dashboard Csapatkezelés (Multi-User Dashboard Access)
* **Cél:** Moderátorok meghívása a webes dashboardra meghatározott jogosultsági szintekkel.
* **Adatbázis módosítás:**
  ```sql
  CREATE TABLE IF NOT EXISTS guild_collaborators (
      id SERIAL PRIMARY KEY,
      guild_id BIGINT NOT NULL,
      user_id BIGINT NOT NULL,
      role TEXT DEFAULT 'editor', -- 'admin' | 'editor' | 'viewer'
      permissions JSONB,
      invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (guild_id, user_id)
  );
  ```
* **UI / UX hatás:** Csapatmunka jelszómegosztás vagy Discord tulajdonosi jogok átadása nélkül.
* **ROI:** B2B és Gaming hálózatok alapvető elvárása a prémium vásárláshoz.

---

### 9. 🎯 Személyre Szabott Árfolyam Célárak (User Price Alerts)
* **Cél:** Egyéni célár-figyelések beállítása (`/crypto alert BTC 100000`).
* **Adatbázis módosítás:**
  ```sql
  CREATE TABLE IF NOT EXISTS user_price_alerts (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      guild_id BIGINT NOT NULL,
      symbol TEXT NOT NULL,
      target_price NUMERIC NOT NULL,
      condition TEXT DEFAULT 'above', -- 'above' | 'below'
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
* **UI / UX hatás:** Személyre szabott közvetlen értesítések (DM vagy szál).
* **ROI:** Magas hozzáadott érték a pénzügyi és kripto közösségekben.

---

### 10. 🌐 Egyedi Bejövő Webhook Motor (Custom Inbound Webhook Engine)
* **Cél:** Bármilyen külső rendszerből (Shopify, GitLab, TradingView, egyedi weboldal) érkező JSON adatokból Discord Components V2 kártyák készítése.
* **Adatbázis módosítás:**
  ```sql
  CREATE TABLE IF NOT EXISTS custom_incoming_webhooks (
      id SERIAL PRIMARY KEY,
      token VARCHAR(64) UNIQUE NOT NULL,
      guild_id BIGINT NOT NULL,
      discord_channel_id BIGINT NOT NULL,
      name TEXT NOT NULL,
      secret_key TEXT,
      template_config JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
* **UI / UX hatás:** Korlátlan integrációs lehetőség saját fejlesztésű vagy céges rendszerekkel.
* **ROI:** Developer / Enterprise előfizetési csomag alapköve.
