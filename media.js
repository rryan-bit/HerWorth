/* =============================================
   HERWORTH — MEDIA / ARTICLES JS
   Articles are stored as JSON — easy to replace
   with a CMS or backend API in the future.
   ============================================= */

/* ---- ARTICLES DATA (mock CMS) ---- */
const ARTICLES = [
  {
    id: 1,
    title: "5 Simple Ways to Save Money Each Month",
    excerpt: "Small, consistent changes to your daily habits can compound into thousands of dollars saved over the year. These five strategies are easy to implement today.",
    category: "Saving",
    emoji: "💰",
    gradient: "linear-gradient(135deg, #f8c8dc 0%, #f2b0ce 100%)",
    date: "March 20, 2026",
    readTime: "4 min read",
    featured: true,
    body: `
      <p>Saving money doesn't have to mean dramatic lifestyle changes. The most sustainable savings habits are small, consistent, and painless. Here are five strategies that genuinely work.</p>
      <h3>1. Automate your savings first</h3>
      <p>The moment your salary hits your account, set up an automatic transfer to your savings account. Even $50 a week adds up to $2,600 a year. Pay yourself first — before spending on anything else.</p>
      <h3>2. Audit your subscriptions</h3>
      <p>The average person pays for 8–12 subscriptions, often forgetting half of them. Open your bank statement right now and go line by line. Cancel anything you haven't used in 30 days.</p>
      <h3>3. Cook one extra meal per week at home</h3>
      <p>The average takeaway meal costs $20–$35. Cooking at home for the same meal costs $4–$8. Swapping just one meal per week saves roughly $1,000 per year with zero sacrifice.</p>
      <h3>4. Use the 48-hour rule for non-essential purchases</h3>
      <p>Before buying anything over $50 that isn't essential, wait 48 hours. You'll find that most impulse purchases disappear entirely after the initial excitement fades.</p>
      <h3>5. Track every dollar for 30 days</h3>
      <p>Awareness is the most powerful financial tool. Most people who start tracking their spending discover 2–3 categories where they're overspending by hundreds of dollars monthly without realising it.</p>
      <p><strong>The bottom line:</strong> Pick just one of these strategies and implement it this week. Small wins build momentum, and momentum builds wealth.</p>
    `
  },
  {
    id: 2,
    title: "How to Build a Budget That Actually Works",
    excerpt: "Most budgets fail because they're too restrictive. A good budget gives you freedom, not a straitjacket. Here's how to build one that you'll actually stick to.",
    category: "Budgeting",
    emoji: "📊",
    gradient: "linear-gradient(135deg, #b8ddf0 0%, #90c5e8 100%)",
    date: "March 15, 2026",
    readTime: "6 min read",
    featured: false,
    body: `
      <p>The word "budget" makes most people think of restriction, deprivation, and spreadsheets. But a well-designed budget is actually the opposite — it's a plan that tells your money where to go so you can spend on what matters without guilt.</p>
      <h3>The 50/30/20 framework</h3>
      <p>A simple starting point: allocate 50% of your after-tax income to needs (rent, food, bills), 30% to wants (dining out, entertainment, shopping), and 20% to savings and debt repayment.</p>
      <h3>Track before you budget</h3>
      <p>Before setting limits, spend 2–4 weeks tracking what you actually spend. Most people are shocked to discover how different their real spending is from what they think they spend.</p>
      <h3>Build in a fun fund</h3>
      <p>Budgets that leave zero room for enjoyment fail within weeks. Always include a guilt-free spending allowance — even $50–$100/month — so you don't feel deprived and abandon the whole plan.</p>
      <h3>Review monthly, adjust quarterly</h3>
      <p>Your budget isn't a contract — it's a living document. Life changes, and your budget should too. Set a monthly 15-minute budget review date with yourself to check in and adjust.</p>
      <p><strong>Remember:</strong> the best budget is the one you'll actually use. Start simple and add complexity only if it helps you.</p>
    `
  },
  {
    id: 3,
    title: "Understanding Your Spending Habits",
    excerpt: "Your money behaviours are deeply rooted in psychology. Understanding the 'why' behind your spending is the first step to changing it — without willpower alone.",
    category: "Mindset",
    emoji: "🧠",
    gradient: "linear-gradient(135deg, #d4b8f0 0%, #b898e0 100%)",
    date: "March 10, 2026",
    readTime: "5 min read",
    featured: false,
    body: `
      <p>We'd like to think our financial decisions are rational. But research consistently shows that emotions, social pressure, and cognitive biases drive most of our spending — often without our awareness.</p>
      <h3>The emotional spending trap</h3>
      <p>Many people shop when stressed, bored, lonely, or anxious. Retail therapy is real — buying something creates a brief dopamine hit. The problem is the relief is temporary but the expense is permanent.</p>
      <h3>Social comparison and lifestyle inflation</h3>
      <p>As income rises, spending tends to rise to match it — and often exceed it. This "lifestyle inflation" is amplified by social media, where we're constantly exposed to curated versions of others' lives.</p>
      <h3>How to become aware of your patterns</h3>
      <ul>
        <li>Note what you're feeling before every non-essential purchase for two weeks</li>
        <li>Identify your top 3 emotional spending triggers</li>
        <li>Create a "pause ritual" — 5 deep breaths before any impulse buy</li>
        <li>Find alternative responses to your triggers that don't involve spending</li>
      </ul>
      <h3>Reframe your relationship with money</h3>
      <p>Money is a tool, not a measure of worth, success, or happiness. When we separate our self-image from our spending, financial decisions become clearer and less emotionally charged.</p>
    `
  },
  {
    id: 4,
    title: "Why Tracking Expenses Changes Everything",
    excerpt: "Data doesn't lie. When you see exactly where every dollar goes, your financial blind spots disappear — and the path forward becomes crystal clear.",
    category: "Habits",
    emoji: "📱",
    gradient: "linear-gradient(135deg, #f0d4b8 0%, #e8c098 100%)",
    date: "March 5, 2026",
    readTime: "4 min read",
    featured: false,
    body: `
      <p>Most people have a vague sense of where their money goes. Tracking makes it precise. And precision is where financial change happens.</p>
      <h3>The observer effect on spending</h3>
      <p>Simply being aware that you're tracking your spending changes your behaviour. Studies show that people who track expenses consistently spend 15–20% less in the first month — without consciously trying to cut back.</p>
      <h3>What to track</h3>
      <ul>
        <li>Every transaction, no matter how small (yes, that $4 coffee)</li>
        <li>Category, date, and amount</li>
        <li>How you felt before and after large purchases (optional but powerful)</li>
      </ul>
      <h3>What you'll discover</h3>
      <p>After 30 days of tracking, most people identify at least one category where they're spending 2–3x more than they thought. Common surprises: dining out, online shopping, and app subscriptions.</p>
      <h3>Making tracking sustainable</h3>
      <p>The best tracking system is one you'll actually use. HerWorth is designed to make this as frictionless as possible — a few taps to log an expense and you're done. Consistency over perfection.</p>
    `
  },
  {
    id: 5,
    title: "The Beginner's Guide to Financial Freedom",
    excerpt: "Financial freedom isn't about being rich — it's about having choices. Here's the roadmap to get there, one step at a time, no matter where you're starting from.",
    category: "Mindset",
    emoji: "🌸",
    gradient: "linear-gradient(135deg, #b8f0d4 0%, #90e0b8 100%)",
    date: "February 28, 2026",
    readTime: "7 min read",
    featured: false,
    body: `
      <p>Financial freedom means different things to different people. For some it's retiring early. For others it's simply being able to say no to a job they hate without panic. What they share: choices.</p>
      <h3>The four stages of financial freedom</h3>
      <ul>
        <li><strong>Stage 1:</strong> Financial stability — an emergency fund, manageable debt</li>
        <li><strong>Stage 2:</strong> Financial security — passive income covers basic needs</li>
        <li><strong>Stage 3:</strong> Financial independence — investments cover your lifestyle</li>
        <li><strong>Stage 4:</strong> Financial abundance — wealth that outlasts you</li>
      </ul>
      <h3>Start where you are</h3>
      <p>Your starting point doesn't determine your destination — your direction does. Even starting with $25/week invested consistently can build significant wealth over time through compounding.</p>
      <h3>The three levers</h3>
      <p>You can increase income, decrease expenses, or invest the difference. Most people only focus on one lever. The fastest path is pulling all three simultaneously — even modestly.</p>
      <h3>Protect yourself first</h3>
      <p>Before investing, build an emergency fund of 3–6 months of expenses. This is your financial immune system. Without it, any unexpected event — job loss, medical bill, car repair — derails your progress.</p>
      <p><strong>The journey of a thousand miles begins with a single step.</strong> Open HerWorth, set one goal today, and start.</p>
    `
  },
  {
    id: 6,
    title: "How to Cut Unnecessary Subscriptions",
    excerpt: "Subscription creep is real — the average household wastes $600+ per year on services they barely use. Here's a systematic approach to auditing and cutting what you don't need.",
    category: "Saving",
    emoji: "✂️",
    gradient: "linear-gradient(135deg, #f8c8dc 0%, #e8a8c8 100%)",
    date: "February 20, 2026",
    readTime: "3 min read",
    featured: false,
    body: `
      <p>Subscriptions are designed to be easy to sign up for and easy to forget about. Companies count on this. Your job is to count them — and cut the dead weight.</p>
      <h3>How to audit your subscriptions</h3>
      <ul>
        <li>Go through your last 3 months of bank statements</li>
        <li>Highlight every recurring charge</li>
        <li>For each one, ask: "Did I use this in the last 30 days?"</li>
        <li>If no — cancel immediately</li>
      </ul>
      <h3>Common subscriptions to audit</h3>
      <ul>
        <li>Streaming (Netflix, Disney+, Stan, Binge, Paramount+)</li>
        <li>Music (Spotify, Apple Music, Tidal)</li>
        <li>Cloud storage (Dropbox, iCloud, Google One)</li>
        <li>Software (Adobe, Microsoft 365, productivity apps)</li>
        <li>Fitness (gym, apps, meal planning services)</li>
        <li>News and magazines</li>
        <li>Gaming (Game Pass, PlayStation Plus)</li>
      </ul>
      <h3>The rotation strategy</h3>
      <p>Instead of subscribing to multiple streaming services simultaneously, rotate monthly. One month Netflix, next month Disney+. You never run out of content and cut your costs by 60–75%.</p>
      <p><strong>Average savings:</strong> Most people cancel $40–$80/month in unused subscriptions on their first audit. That's $480–$960 back in your pocket every year.</p>
    `
  },
  {
    id: 7,
    title: "Saving vs Investing: What's Right for You?",
    excerpt: "Saving and investing both grow your wealth — but they serve different purposes and carry different risks. Knowing when to do which is one of the most important financial decisions you'll make.",
    category: "Investing",
    emoji: "📈",
    gradient: "linear-gradient(135deg, #c8e8f8 0%, #a8d0f0 100%)",
    date: "February 15, 2026",
    readTime: "6 min read",
    featured: false,
    body: `
      <p>Saving puts money aside for security. Investing puts money to work for growth. Both are essential — but they serve different goals and timelines.</p>
      <h3>When to save</h3>
      <ul>
        <li>Emergency fund (3–6 months of expenses)</li>
        <li>Goals within 1–3 years (holiday, car, house deposit)</li>
        <li>Any money you can't afford to lose in value</li>
      </ul>
      <h3>When to invest</h3>
      <ul>
        <li>Goals 5+ years away (retirement, generational wealth)</li>
        <li>Money beyond your emergency fund</li>
        <li>Any money you want to beat inflation with over time</li>
      </ul>
      <h3>The inflation problem with pure saving</h3>
      <p>Money sitting in a bank account earning 2% interest while inflation runs at 3–4% is actually losing purchasing power. Long-term wealth requires investing.</p>
      <h3>Getting started with investing in Australia</h3>
      <p>Options include index funds (ETFs), superannuation top-ups, property, and shares. ETFs are often recommended for beginners: low fees, instant diversification, and no stock-picking required.</p>
      <p><strong>Important:</strong> This is general information only, not financial advice. Consider speaking with a licensed financial advisor before making investment decisions.</p>
    `
  },
  {
    id: 8,
    title: "How to Stay Consistent With Your Financial Goals",
    excerpt: "Setting a financial goal is easy. Sticking to it when life gets hard is where most people fall off. These strategies turn consistency from willpower into a system.",
    category: "Habits",
    emoji: "🎯",
    gradient: "linear-gradient(135deg, #f0c8e0 0%, #e0a8c8 100%)",
    date: "February 10, 2026",
    readTime: "5 min read",
    featured: false,
    body: `
      <p>Research on habit formation shows that motivation is unreliable — it spikes when we set a goal and plummets when obstacles appear. Systems, not willpower, are what create lasting financial change.</p>
      <h3>Make the right behaviour the easy behaviour</h3>
      <p>Automate as much as possible: savings transfers, bill payments, investment contributions. When the good behaviour happens automatically, it doesn't rely on you being in the right headspace.</p>
      <h3>Use implementation intentions</h3>
      <p>Research by Peter Gollwitzer shows that "if-then" planning dramatically increases goal completion. Instead of "I'll save more," try "If it's the 1st of the month, then I'll transfer $200 to savings."</p>
      <h3>Track your streaks</h3>
      <p>Jerry Seinfeld famously used a calendar to maintain his writing habit — marking each day with a big X and "not breaking the chain." Apply this to your financial habits.</p>
      <h3>Plan for setbacks before they happen</h3>
      <p>You will overspend some months. You will miss a savings target. The question isn't whether it will happen — it's what you'll do when it does. Decide now: "When I have a bad spending month, I will review it, adjust, and continue — not give up."</p>
      <h3>Celebrate small wins</h3>
      <p>Each time you hit a milestone — first $1,000 saved, debt paid off, budget followed for 30 days — acknowledge it. Celebration reinforces the identity shift: "I am someone who manages money well."</p>
    `
  }
];

/* ---- STATE ---- */
let activeCategory = 'all';
let activeSearch = '';
let currentArticleId = null;

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  renderFeatured();
  renderArticles();
});

function renderFeatured() {
  const featured = ARTICLES.find(a => a.featured);
  if (!featured) return;
  const section = document.getElementById('featuredSection');
  section.innerHTML = `
    <div class="featured-card" onclick="openArticle(${featured.id})">
      <div class="featured-img" style="background:${featured.gradient};">
        <span style="position:relative;z-index:1;">${featured.emoji}</span>
      </div>
      <div class="featured-body">
        <div class="featured-label"><span></span> Featured</div>
        <div class="featured-cat">${featured.category}</div>
        <div class="featured-title">${featured.title}</div>
        <div class="featured-excerpt">${featured.excerpt}</div>
        <div class="featured-meta">
          <span>✦ HerWorth</span>
          <span>${featured.date}</span>
          <span>${featured.readTime}</span>
        </div>
        <button class="btn-primary btn-sm" onclick="event.stopPropagation(); openArticle(${featured.id})">Read Article →</button>
      </div>
    </div>`;
}

function renderArticles() {
  const grid = document.getElementById('articlesGrid');
  let articles = ARTICLES.filter(a => !a.featured);

  if (activeCategory !== 'all') articles = articles.filter(a => a.category === activeCategory);
  if (activeSearch) {
    const q = activeSearch.toLowerCase();
    articles = articles.filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  }

  if (articles.length === 0) {
    grid.innerHTML = '<div class="no-articles">No articles found. Try a different search or filter.</div>';
    return;
  }

  grid.innerHTML = articles.map(a => `
    <div class="article-card" onclick="openArticle(${a.id})">
      <div class="article-card-img" style="background:${a.gradient};">${a.emoji}</div>
      <div class="article-card-body">
        <span class="article-tag">${a.category}</span>
        <div class="article-title">${a.title}</div>
        <div class="article-excerpt">${a.excerpt}</div>
        <div class="article-footer">
          <div>
            <div class="article-date">${a.date}</div>
            <div class="article-read-time">${a.readTime}</div>
          </div>
          <button class="article-read-btn" onclick="event.stopPropagation(); openArticle(${a.id})">Read more →</button>
        </div>
      </div>
    </div>`).join('');
}

function openArticle(id) {
  const a = ARTICLES.find(x => x.id === id);
  if (!a) return;
  currentArticleId = id;
  document.getElementById('modalCat').textContent = a.category;
  document.getElementById('modalTitle').textContent = a.title;
  document.getElementById('modalDate').textContent = a.date;
  document.getElementById('modalReadTime').textContent = a.readTime;
  document.getElementById('modalImg').style.background = a.gradient;
  document.getElementById('modalImg').innerHTML = `<span style="font-size:4rem;">${a.emoji}</span>`;
  document.getElementById('modalBody').innerHTML = a.body;
  document.getElementById('articleModal').style.display = 'flex';
  window.scrollTo(0, 0);
}

function setCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.media-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderArticles();
}

function filterArticles(q) {
  activeSearch = q;
  renderArticles();
  // Also filter featured section visibility
  const featured = ARTICLES.find(a => a.featured);
  if (featured && q) {
    const matches = featured.title.toLowerCase().includes(q.toLowerCase()) || featured.excerpt.toLowerCase().includes(q.toLowerCase());
    document.getElementById('featuredSection').style.display = matches ? 'block' : 'none';
  } else {
    document.getElementById('featuredSection').style.display = 'block';
  }
}

function shareArticle() {
  const a = ARTICLES.find(x => x.id === currentArticleId);
  if (!a) return;
  if (navigator.share) {
    navigator.share({ title: a.title, text: a.excerpt, url: window.location.href });
  } else {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!');
  }
}
