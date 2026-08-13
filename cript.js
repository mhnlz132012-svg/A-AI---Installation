/* A-AI v1.1 Offline Database Cache & Network Interception Engine (cript.js) */

const OFFLINE_DATABASE = {
  asc: {
    title: "A.S.C (A Sports Currency) — Official League Coin",
    status: "Under Development - Coming 2026-27",
    president: "Ziad Mohamed (President of the A Central Bank)",
    description: "A.S.C is the league's official digital currency created to manage every financial action between clubs. Teams will use it for buying players, arranging loan deals, and paying wages, making all transactions clear, organized, and easy to track.",
    taxRule: "A unique feature of A.S.C is its 10% tax added to every player a team buys. All collected tax goes into a shared pool, and every two weeks this pool is redistributed to all teams as a bonus wage fund, helping maintain balance across the league.",
    denominations: "A.S.C also comes in practical denominations — 1, 5, 10, and 20 — allowing teams to handle both large and small transactions smoothly.",
    launchDate: "Currently under development and set to launch next term (2026-27) as the foundation of the league's entire economic system."
  },
  donors: {
    title: "Top Website Donors (Annual Domain Payment Supporters)",
    note: "This page recognizes the supporters of A-AI and 2A Class Web development. Donations go directly to the annual web domain payment, not the developers.",
    list: [
      { rank: "1st Place", name: "Omar Elsayed", contribution: "Donated 105 EGP" },
      { rank: "2nd Place", name: "Youssef Tarek", contribution: "Donated 30 EGP" },
      { rank: "3rd Place", name: "ADHAM AL-HOSSAINI", contribution: "Donated 25 EGP" },
      { rank: "3rd Place", name: "YEHIA AMER", contribution: "Donated 25 EGP" },
      { rank: "4th Place", name: "YEHIA Mohamed", contribution: "Donated 5 EGP" },
      { rank: "4th Place", name: "OMAR METWALY", contribution: "Donated 5 EGP" }
    ],
    contact: "To donate and support, contact +20 104 0637 025. Major supporters receive a special note of appreciation!"
  },
  shirt: {
    title: "ASports 2026/27 'Midnight Phantom' V3 Black Edition Shirt",
    status: "Finalized Design - 13-1 Vote in favor of V3 Black Edition",
    price: "~200 EGP (Available this summer)",
    description: "Designed entirely in black with luxury gold detailing to deliver a premium and professional appearance. The previous yellowish gold finish was replaced with a deeper luxury gold tone to keep the design minimal, sharp, and high-end. No player names or numbers to preserve a timeless athletic aesthetic. Sponsored by Adidas and Spotify. Sleeves feature the iconic 'Visit AWeb' branding.",
    negotiations: "As part of ongoing negotiations with the school, the design has been updated to feature the school logo placed at the center of the shirt, replacing the previous Spotify sponsor position."
  },
  minecraft: {
    title: "AW MC Minecraft Fabric Java Server 2026",
    version: "Fabric 26.2 Java Edition",
    host: "Aternos",
    description: "Open for everyone in the class. Requires installing the custom server pack / modpack to make sure all players share the same custom blocks and client optimizations.",
    permissions: "Host permission rules: hosted on Aternos, any student can request start permissions from the administrators to activate the server anytime!"
  },
  dishparties: {
    title: "2A/P Community Dish Parties Schedule (2025/2026)",
    firstTerm: [
      { date: "Sunday, 12 Oct 2025" },
      { date: "Sunday, 21 Dec 2025" }
    ],
    secondTerm: [
      { date: "Sunday, 15 Feb 2026" },
      { date: "Sunday, 19 Apr 2026" }
    ],
    rules: "Bring your best energy and your favorite dishes to share. For questions, contact +20 104 0637 025."
  },
  esports: {
    title: "PMCS 2026 Tournament Brackets & Matches",
    winner: "PXE (80 points) - Champion of PMCS 2026 Season",
    runnerUp: "The Champions (66 points) - Runner-Up",
    matches: {
      quarterFinals: [
        "Quarter-final 1: ESB 80 - 63 Predators",
        "Quarter-final 2: PXE 61 - 38 Dragons",
        "Quarter-final 3: Icons 80 - 60 Elgayar",
        "Quarter-final 4: Champions won by forfeit over Ultraas"
      ],
      semiFinals: [
        "Semi-final 1: PXE 80 - 52 Icons",
        "Semi-final 2: Champions 80 - 43 ESB"
      ],
      finals: "Grand Finals Match: PXE 80 - 66 Champions"
    }
  },
  highlights: {
    title: "Weekly Student Highlights & Achievements",
    students: [
      { category: "Class Clown 😂", name: "Asser Ezz", traits: "Goofy, Silly, Funny", fact: "Makes silly faces for no reason" },
      { category: "Most Active 🔥", name: "Omar Elgendy", traits: "Trouble maker, Funny/Humor", fact: "Energy never ends" },
      { category: "Chill Student 🎧", name: "Yehia Amer", traits: "Being Chill, Funny", fact: "He is just our chill guy" }
    ]
  },
  versions: {
    title: "A-AI Application Version Inventory",
    website: "v5.6.11",
    mac: "v2.0.0",
    windows: "v2.0.0",
    ai: "v1.1 (Desktop Standard)"
  }
};

function playOfflineChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.warn("Audio Context blocked: ", e);
  }
}

window.searchOfflineDatabase = function(userQuery) {
  const query = (userQuery || "").toLowerCase().trim();
  playOfflineChime();
  
  if (query.includes("asc") || query.includes("currency") || query.includes("coin") || query.includes("money") || query.includes("bank") || query.includes("ziad")) {
    return `### ${OFFLINE_DATABASE.asc.title}\n` +
           `* **Status:** ${OFFLINE_DATABASE.asc.status}\n` +
           `* **Central Bank Head:** ${OFFLINE_DATABASE.asc.president}\n\n` +
           `**About A.S.C:** ${OFFLINE_DATABASE.asc.description}\n\n` +
           `**Economic Rules:** ${OFFLINE_DATABASE.asc.taxRule}\n\n` +
           `**Practical Details:** ${OFFLINE_DATABASE.asc.denominations}\n\n` +
           `**Launch Timeline:** ${OFFLINE_DATABASE.asc.launchDate}`;
  }
  
  if (query.includes("donor") || query.includes("donate") || query.includes("ranking") || query.includes("support") || query.includes("pay")) {
    let listStr = OFFLINE_DATABASE.donors.list.map(d => `* **${d.rank}:** ${d.name} (${d.contribution})`).join("\n");
    return `### ${OFFLINE_DATABASE.donors.title}\n` +
           `*Note: ${OFFLINE_DATABASE.donors.note}*\n\n` +
           `${listStr}\n\n` +
           `**Want to contribute?** ${OFFLINE_DATABASE.donors.contact}`;
  }
  
  if (query.includes("shirt") || query.includes("jersey") || query.includes("v3") || query.includes("black edition") || query.includes("midnight phantom")) {
    return `### ${OFFLINE_DATABASE.shirt.title}\n` +
           `* **Design Status:** ${OFFLINE_DATABASE.shirt.status}\n` +
           `* **Price:** ${OFFLINE_DATABASE.shirt.price}\n\n` +
           `**About the Kit:** ${OFFLINE_DATABASE.shirt.description}\n\n` +
           `**Logo & Sponsorship:** ${OFFLINE_DATABASE.shirt.negotiations}`;
  }
  
  if (query.includes("minecraft") || query.includes("mc") || query.includes("server") || query.includes("fabric") || query.includes("aternos")) {
    return `### ${OFFLINE_DATABASE.minecraft.title}\n` +
           `* **Server Environment:** ${OFFLINE_DATABASE.minecraft.version}\n` +
           `* **Hosting Provider:** ${OFFLINE_DATABASE.minecraft.host}\n\n` +
           `**Setup Guide:** ${OFFLINE_DATABASE.minecraft.description}\n\n` +
           `**Starting the server:** ${OFFLINE_DATABASE.minecraft.permissions}`;
  }
  
  if (query.includes("dish") || query.includes("party") || query.includes("dates") || query.includes("gathering") || query.includes("schedule")) {
    let firstTermStr = OFFLINE_DATABASE.dishparties.firstTerm.map(t => `* ${t.date}`).join("\n");
    let secondTermStr = OFFLINE_DATABASE.dishparties.secondTerm.map(t => `* ${t.date}`).join("\n");
    return `### ${OFFLINE_DATABASE.dishparties.title}\n` +
           `**First Term Gatherings:**\n${firstTermStr}\n\n` +
           `**Second Term Gatherings:**\n${secondTermStr}\n\n` +
           `**Requirements:** ${OFFLINE_DATABASE.dishparties.rules}`;
  }
  
  if (query.includes("esport") || query.includes("tournament") || query.includes("pmcs") || query.includes("match") || query.includes("winner") || query.includes("finals")) {
    let qf = OFFLINE_DATABASE.esports.matches.quarterFinals.map(m => `* ${m}`).join("\n");
    let sf = OFFLINE_DATABASE.esports.matches.semiFinals.map(m => `* ${m}`).join("\n");
    return `### ${OFFLINE_DATABASE.esports.title}\n` +
           `* **Official Champion:** ${OFFLINE_DATABASE.esports.winner}\n` +
           `* **Runner-Up:** ${OFFLINE_DATABASE.esports.runnerUp}\n\n` +
           `**Quarter-Final Results:**\n${qf}\n\n` +
           `**Semi-Final Results:**\n${sf}\n\n` +
           `**Grand Finals:** ${OFFLINE_DATABASE.esports.matches.finals}`;
  }
  
  if (query.includes("clown") || query.includes("highlights") || query.includes("asser") || query.includes("active") || query.includes("elgendy") || query.includes("yehia") || query.includes("chill")) {
    let listStr = OFFLINE_DATABASE.highlights.students.map(s => `* **${s.category}:** ${s.name} \n  * Known For: ${s.traits}\n  * Fun Fact: ${s.fact}`).join("\n");
    return `### ${OFFLINE_DATABASE.highlights.title}\n` +
           `${listStr}`;
  }
  
  if (query.includes("version") || query.includes("app") || query.includes("website") || query.includes("mac") || query.includes("windows")) {
    return `### ${OFFLINE_DATABASE.versions.title}\n` +
           `* **A-AI Assistant:** ${OFFLINE_DATABASE.versions.ai}\n` +
           `* **Windows App Version:** ${OFFLINE_DATABASE.versions.windows}\n` +
           `* **macOS App Version:** ${OFFLINE_DATABASE.versions.mac}\n` +
           `* **2A Website Deployment:** ${OFFLINE_DATABASE.versions.website}`;
  }
  
  return `### Offline Database Assistant\n` +
         `I am currently running in **Offline Database Cache** mode.\n` +
         `I didn't find specific matches for that in my local offline registry, but you can try looking up topics like:\n` +
         `* **ASC** (A Sports Currency details)\n` +
         `* **Donors** (Top Support contributions)\n` +
         `* **Shirt** (ASports V3 Black Edition)\n` +
         `* **Minecraft** (Server instructions)\n` +
         `* **Dish Parties** (School parties schedule)\n` +
         `* **Esports** (PMCS 2026 matches)\n` +
         `* **Highlights** (Weekly student honors)\n` +
         `* **Version** (App updates inventory)`;
};

function updateOnlineStatus() {
  const offlineBanner = document.getElementById("offline-banner");
  if (offlineBanner) {
    if (!navigator.onLine) {
      offlineBanner.classList.remove("hidden");
    } else {
      offlineBanner.classList.add("hidden");
    }
  }
}

// 🌐 MONKEY-PATCH FETCH API:
// Automatically intercepts web requests made by original script.js and answers from offline database if network is down!
(function() {
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    // Check if we are offline or if the fetch call is to our worker domain
    if (!navigator.onLine && typeof url === 'string' && (url.includes('workers.dev') || url.includes('a-ai'))) {
      let query = "";
      try {
        const options = args[1];
        if (options && options.body) {
          const bodyData = JSON.parse(options.body);
          if (bodyData.messages && bodyData.messages.length > 0) {
            const lastMessage = bodyData.messages[bodyData.messages.length - 1];
            if (lastMessage.role === 'user') {
              query = lastMessage.content;
            }
          }
        }
      } catch(e) {}
      
      const responseText = window.searchOfflineDatabase(query);
      
      // Return a simulated fetch response stream mimicking Groq/Cloudflare
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(responseText));
          controller.close();
        }
      });
      
      return new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
    
    // Otherwise fallback to real network fetch
    try {
      return await originalFetch.apply(this, args);
    } catch (err) {
      // If the fetch fails because of dns/network errors even if navigator.onLine is true
      if (typeof url === 'string' && (url.includes('workers.dev') || url.includes('a-ai'))) {
        let query = "";
        try {
          const options = args[1];
          if (options && options.body) {
            const bodyData = JSON.parse(options.body);
            if (bodyData.messages && bodyData.messages.length > 0) {
              const lastMsg = bodyData.messages[bodyData.messages.length - 1];
              query = lastMsg.content;
            }
          }
        } catch(e) {}
        
        const responseText = "⚠️ *Error connecting to A-AI server. Activating local offline database backup.*\n\n" + window.searchOfflineDatabase(query);
        const stream = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(responseText));
            controller.close();
          }
        });
        return new Response(stream, {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
      throw err;
    }
  };
})();

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

document.addEventListener('DOMContentLoaded', () => {
  updateOnlineStatus();
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  }, true); // Use capture phase to ensure it's locked down
});
