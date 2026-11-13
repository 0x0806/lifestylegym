/* New Lifestyle Way Gym: on-site sales assistant.
 *
 * This is a scripted assistant, not an LLM. It runs entirely in the browser,
 * answers only from the FACTS object below, and moves every conversation toward
 * one honest next step: a free demo, WhatsApp, a call or directions.
 *
 * Guardrails (each one is covered by tests in the repo owner's checklist):
 *  - answers come only from FACTS; no prices, ratings or claims that are not on the site
 *  - medical, injury, medication and emergency messages are never answered with advice
 *  - abuse, prompt-injection and off-topic messages get one calm on-business reply
 *  - user text is only ever written with textContent; links come from an allowlist
 *  - input length cap, message rate limit and one lead submission per session
 *
 * The brain (reply) is a pure function so it can be tested in Node and later
 * swapped for a server-side model without touching the interface.
 */
(function (root) {
  'use strict';

  var FACTS = {
    name: 'New Lifestyle Way Gym',
    wa: '971581790093',
    phones: [{ label: '058 179 0093', tel: '+971581790093' }, { label: '050 973 7781', tel: '+971509737781' }],
    address: 'Al Tayer Tower, G Floor, 5 19 Street, Hay Al Nahda, Sharjah, near Sahara Centre',
    maps: 'https://www.google.com/maps/search/?api=1&query=New+Lifestyle+Way+Gym+Al+Nahda+Sharjah',
    reviews: 'https://share.google/qr4uVM5GB1ZwikSRC',
    maxInput: 300,
    maxMessages: 60,
    minGapMs: 500
  };

  /* ---------- helpers ---------- */
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase()
      .replace(/[‘’]/g, "'")
      .replace(/[^a-z0-9'+@\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      var cur = [i], best = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (cur[j] < best) best = cur[j];
      }
      if (best > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }
  function hasArabicOrOther(s) { return /[^\u0000-\u024F\u2000-\u206F\u20A0-\u20CF\s]/.test(s); }

  /* keyword grammar: 'word' exact (fuzzy for 5+ letters); 'stem~' prefix; 'two words' phrase; leading '*' = strong */
  function kwScore(list, text, tokens) {
    var score = 0, padded = ' ' + text + ' ';
    for (var i = 0; i < list.length; i++) {
      var k = list[i], w = 2;
      if (k.charAt(0) === '*') { w = 4; k = k.slice(1); }
      if (k.indexOf(' ') > -1) { if (padded.indexOf(' ' + k + ' ') > -1) score += Math.max(w, 3); continue; }
      var stem = k.charAt(k.length - 1) === '~';
      if (stem) k = k.slice(0, -1);
      for (var t = 0; t < tokens.length; t++) {
        var tok = tokens[t];
        if (stem ? tok.indexOf(k) === 0 : (tok === k || (k.length >= 6 && tok.length >= 5 && lev(tok, k, k.length >= 8 ? 2 : 1) <= (k.length >= 8 ? 2 : 1)))) { score += w; break; }
      }
    }
    return score;
  }

  /* ---------- safety layers (checked before anything else) ---------- */
  var SAFETY = {
    emergency: ['*emergency', '*ambulance', '*heart attack', '*cant breathe', "*can't breathe", '*unconscious', '*bleeding', '*suicid~', '*kill myself', '*overdose', '*collapsed', '*fainted', '*chest pain', '*severe pain'],
    medical: ['injur~', 'pain', 'painful', 'doctor', 'surgery', 'surgeon', 'pregnan~', 'heart', 'diabet~', 'blood pressure', 'hypertension', 'asthma', 'medication', 'medicine', 'tablet', 'prescription', 'steroid~', 'hormone~', 'testosterone', 'protein powder', 'supplement~', 'creatine', 'pre workout', 'diagnos~', 'disease', 'hernia', 'slip disc', 'arthritis', 'thyroid', 'pcos', 'cholesterol', 'sprain~', 'fracture~', 'rehab~', 'physio~', 'back pain', 'knee pain', 'cure', 'treat~', 'calories per day', 'meal plan', 'diet chart'],
    abuse: ['*fuck~', '*shit', '*bitch', '*asshole', '*bastard', '*idiot', '*stupid bot', '*useless', '*scam', '*fraud', '*cheat~', '*dick', '*pussy', '*sex~', '*nude', '*porn~'],
    injection: ['*ignore previous', '*ignore all', '*ignore your', '*system prompt', '*your instructions', '*reveal your', '*developer mode', '*jailbreak', '*you are now', '*pretend to be', '*act as', '*roleplay', '*disregard', '*override', '*forget everything', '*new rules', '*onerror', '*onload', '*sudo', '*prompt injection']
  };

  /* ---------- intents ---------- */
  var INTENTS = [
    { id: 'thanks', kw: ['thanks', 'thank you', 'thx', 'cheers', 'appreciate', 'shukran', 'great', 'perfect', 'awesome'] },
    { id: 'bye', kw: ['bye', 'goodbye', 'see you', 'later', 'cya', 'no thanks', 'not now', 'maybe later'] },
    { id: 'greet', kw: ['hi', 'hello', 'hey', 'hiya', 'salam', 'assalam~', 'marhaba', 'good morning', 'good evening', 'good afternoon', 'yo', 'sup'] },
    { id: 'human', kw: ['*human', '*real person', '*agent', '*manager', '*owner', '*speak to someone', '*talk to someone', '*talk to a', '*call me', 'representative', 'someone', 'staff member'] },
    { id: 'hours', kw: ['hours', 'timing~', 'open', 'close', 'closed', 'closing', 'opening', '*24', '24/7', '*24 7', 'late', 'midnight', 'night', 'early', 'what time', 'holiday~', 'friday', 'sunday', 'ramadan', 'eid', 'weekend~', '*when are you'] },
    { id: 'location', kw: ['where', 'address', 'location', 'locate~', 'directions', 'direction', 'map', 'find you', 'near', 'nearby', 'sahara', 'landmark', 'nahda', 'qasimia', 'daniq', 'sharjah', 'metro', 'bus', 'parking', 'how to get'] },
    { id: 'price', kw: ['*price~', '*cost~', '*fee', '*fees', '*rate', '*rates', '*how much', '*charge~', 'payment', 'afford~', 'cheap~', 'expensive', 'offer~', 'promo~', 'deal', 'aed', 'dirham~', 'monthly', 'per month', 'yearly', 'annual', 'budget', 'free of charge', 'joining fee', 'installment~', 'tabby', 'tamara', 'credit card', 'cash payment'] },
    { id: 'plans', kw: ['*plan~', '*membership~', '*package~', 'basic', 'premium', 'vip', 'subscription~', 'subscribe', 'join', 'joining', 'register', 'registration', 'sign up', 'signup', 'enrol~', 'enroll~', 'member', 'pass', 'couple'] },
    { id: 'home', kw: ['*home', '*house', '*villa', '*apartment', '*my place', '*at my', '*come to me', '*come to my', 'doorstep', 'flat', 'residence', 'mobile trainer'] },
    { id: 'online', kw: ['*online', '*virtual', '*remote~', '*zoom', '*video call', '*overseas', '*abroad', '*outside uae', '*another country', 'live session~', 'from anywhere', 'internet'] },
    { id: 'group', kw: ['*class', '*classes', '*yoga', '*bootcamp', '*bodypump', '*body pump', '*circuit', '*group', 'zumba', 'aerobic~', 'hiit', 'crossfit', 'spinning', 'pilates', 'boxing', 'timetable', 'schedule', 'batch', 'batches'] },
    { id: 'weights', kw: ['*weight training', '*bodybuilding', '*muscle~', '*bulk~', '*gain muscle', '*strength', '*powerlifting', 'dumbbell~', 'barbell~', 'weights', 'machine~', 'equipment', 'squat~', 'deadlift~', 'bench', 'lifting', 'gym floor', 'hypertrophy', 'build body', 'six pack'] },
    { id: 'fatloss', kw: ['*lose weight', '*weight loss', '*fat loss', '*lose fat', '*burn fat', '*slim~', '*belly', '*tummy', '*get lean', '*cutting', 'overweight', 'obese', 'obesity', 'chubby', 'diet', 'cardio', 'treadmill', 'kilos', 'kg', 'shape', 'toned', 'tone'] },
    { id: 'wellness', kw: ['*massage', '*recovery', '*nutrition~', '*meditation', '*wellness', '*sports massage', 'relax~', 'stress', 'sleep', 'spa', 'dietician', 'dietitian', 'consultation'] },
    { id: 'personal', kw: ['*personal training', '*personal trainer', '*one to one', '*one on one', '*1 on 1', '*pt', '*coach~', 'private session~', 'trainer', 'train me', 'guide me', 'beginner~', 'newbie', 'first time', 'never been'] },
    { id: 'trainers', kw: ['*who are', 'meet', 'team', 'trainers', 'sajith', 'bijo', 'joseph', 'prasanth', 'aromal', 'certified', 'qualified', 'experience~', 'experienced'] },
    { id: 'ladies', kw: ['*ladies', '*women', '*woman', '*female~', '*girls', '*lady', '*women only', '*ladies only', '*separate', 'hijab', 'privacy', 'private area'] },
    { id: 'facilities', kw: ['locker~', 'shower~', 'sauna', 'steam', 'pool', 'swimming', 'jacuzzi', 'changing room', 'toilet', 'wifi', 'water', 'towel~', 'facility', 'facilities', 'amenities', 'air condition~', 'lounge', 'juice', 'cafe', 'store', 'shop'] },
    { id: 'demo', kw: ['*free demo', '*free trial', '*demo', '*trial', '*try', '*tour', '*visit', '*assessment', '*appointment', '*book~', '*booking', '*reserve', 'free', 'test', 'see the gym', 'look around', 'walk in', 'walk through', 'drop in', 'come by'] },
    { id: 'contact', kw: ['*phone', '*number', '*whatsapp', '*call', '*email', '*mail', '*contact', 'reach you', 'instagram', 'insta', 'social', 'message you', 'dm'] },
    { id: 'reviews', kw: ['*review~', '*rating~', '*reputation', '*testimonial~', 'trusted', 'trust', 'legit', 'genuine', 'reliable', 'good gym', 'best gym', 'stars', 'feedback', 'google'] },
    { id: 'about', kw: ['who are you', 'tell me about', 'about you', 'about the gym', 'about your gym', 'about us', 'history', 'how long', 'founded', 'established', 'what is this', 'how many members'] },
    { id: 'services', kw: ['services', 'service', 'what do you offer', 'what do you do', 'what can you', 'what you offer', 'programs', 'program', 'programme~', 'options', 'help me'] },
    { id: 'competitor', kw: ['gymnation', 'gym nation', 'fitness first', 'powerhouse', 'anytime', 'goldsgym', 'golds gym', 'xfit', 'befit', 'compare', 'comparison', 'better than', 'versus', 'vs', 'competitor~', 'other gym~', 'cheaper'] },
    { id: 'negotiate', kw: ['*discount~', 'negotiat~', 'bargain', 'lowest', 'best price', 'reduce', 'special rate', 'student', 'corporate', 'family discount', 'group discount', 'referral', 'coupon'] }
  ];

  /* ---------- classification ---------- */
  function classify(text) {
    var t = norm(text), tokens = t ? t.split(' ') : [];
    var res = { text: t, tokens: tokens, safety: null, intent: null, alt: null, score: 0, tie: false };
    if (!t) return res;
    if (/<\s*\/?\s*(script|img|iframe|svg|a|body|style|link|object|embed)\b|javascript\s*:|\bon[a-z]+\s*=/i.test(String(text))) { res.safety = 'injection'; return res; }
    var order = ['emergency', 'injection', 'abuse', 'medical'];
    for (var i = 0; i < order.length; i++) {
      var s = kwScore(SAFETY[order[i]], t, tokens);
      if (s >= (order[i] === 'medical' ? 2 : 3)) { res.safety = order[i]; return res; }
    }
    var best = null, bestScore = 0, second = 0, secondId = null;
    for (var j = 0; j < INTENTS.length; j++) {
      var sc = kwScore(INTENTS[j].kw, t, tokens);
      if (sc > bestScore) { second = bestScore; secondId = best; bestScore = sc; best = INTENTS[j].id; }
      else if (sc > second) { second = sc; secondId = INTENTS[j].id; }
    }
    if (bestScore >= 2) { res.intent = best; res.score = bestScore; res.tie = second > 0 && second === bestScore; res.alt = res.tie ? secondId : null; }
    return res;
  }

  /* ---------- link allowlist: every href is built here, never from user text ---------- */
  function waLink(msg) { return 'https://wa.me/' + FACTS.wa + '?text=' + encodeURIComponent(msg); }
  var ACT = {
    wa: function (msg) { return { label: 'Chat on WhatsApp', href: waLink(msg || 'Hi, I found you on your website and have a question.'), ext: true }; },
    call: function () { return { label: 'Call ' + FACTS.phones[0].label, href: 'tel:' + FACTS.phones[0].tel }; },
    demo: function () { return { label: 'Book a free demo', href: '#demo', local: true }; },
    maps: function () { return { label: 'Get directions', href: FACTS.maps, ext: true }; },
    reviews: function () { return { label: 'Read Google reviews', href: FACTS.reviews, ext: true }; },
    plans: function () { return { label: 'See the plans', href: '#plans', local: true }; },
    trainers: function () { return { label: 'Meet the trainers', href: '#trainers', local: true }; }
  };

  var CHIP = {
    demo: 'Book a free demo', plans: 'See the plans', price: 'How much is it?', hours: 'Opening hours', where: 'Where are you?',
    home: 'Home training', pt: 'Personal training', classes: 'Group classes', online: 'Online coaching', human: 'Talk to the team',
    lose: 'Lose fat', muscle: 'Build muscle', fit: 'Stay fit', start: 'Start here'
  };
  var ROOT_CHIPS = [CHIP.demo, CHIP.plans, CHIP.price, CHIP.hours, CHIP.where];

  /* ---------- state ---------- */
  function newState() { return { step: 'idle', lead: {}, goal: '', msgs: 0, last: 0, sent: false, fallbacks: 0, lastCta: '' }; }
  function M(text, o) { o = o || {}; return { text: text, actions: o.actions || [], chips: o.chips || [] }; }

  /* ---------- persuasion: goal -> honest recommendation ---------- */
  var GOALS = {
    lose: { say: 'Fat loss comes from consistent training and food habits, so no gym can promise a number. What we can do is give you a trainer to build the plan with, and a nutrition consultation. That is the Premium plan, or VIP if you want the trainer to come to you.', service: 'personal-training', plan: 'premium' },
    muscle: { say: 'For muscle and strength the gym floor has dumbbells, barbells and weight machines, open 24 hours. A personal trainer on the Premium plan will programme your lifts so you are not guessing.', service: 'personal-training', plan: 'premium' },
    fit: { say: 'For staying fit, Basic gives you 24/7 access and a locker. Premium adds unlimited group classes (yoga, circuit, BodyPump, bootcamp) and a trainer, which is where most people keep going because someone expects them.', service: 'general-fitness', plan: 'premium' },
    home: { say: 'A certified trainer can come to your home anywhere in Sharjah and bring the equipment. The VIP plan covers that, plus a consultation and health check-up and a diet plan.', service: 'home-training', plan: 'vip-single' },
    online: { say: 'Online coaching gives you live video sessions with a personal plan and real-time form correction, from Sharjah or anywhere else.', service: 'online-training', plan: '' }
  };
  function goalFromText(t) {
    if (/\b(home|house|villa|apartment)\b/.test(t)) return 'home';
    if (/\b(online|virtual|remote|zoom|abroad|overseas)\b/.test(t)) return 'online';
    if (/\b(lose|loss|fat|slim|belly|tummy|burn|lean|tone|toned)\b/.test(t)) return 'lose';
    if (/\b(muscle|muscles|bulk|strength|bodybuild\w*|gain|build|lift\w*|abs|six pack)\b/.test(t)) return 'muscle';
    if (/\b(fit|fitness|health\w*|active|general|stay|stamina|energy|flexib\w*|yoga)\b/.test(t)) return 'fit';
    return '';
  }

  /* ---------- canned replies ---------- */
  function intro() {
    return [
      M("Hi, I'm the automated assistant for " + FACTS.name + " in Al Nahda, Sharjah. I'm not a person, but I can answer questions about training, plans, hours and location, and book your free demo in under a minute."),
      M('What are you looking for?', { chips: [CHIP.demo, CHIP.plans, CHIP.home, CHIP.price, CHIP.where] })
    ];
  }

  function answer(id, st) {
    switch (id) {
      case 'greet': return [M('Hello! What would you like to know about the gym: training, plans, hours, or booking a free demo?', { chips: ROOT_CHIPS })];
      case 'thanks': return [M("You're welcome. If you'd like to see the gym for yourself, a free demo is the easiest next step.", { chips: [CHIP.demo, CHIP.hours], actions: [ACT.wa()] })];
      case 'bye': return [M('No problem. We are open 24 hours, so you can walk in or message us any time.', { actions: [ACT.demo(), ACT.wa()] })];
      case 'human': return [M('Of course. The team replies fastest on WhatsApp, and you can call too.', { actions: [ACT.wa('Hi, I was chatting on your website and would like to speak to someone.'), ACT.call()] })];
      case 'hours': return [M('We are open 24 hours a day, seven days a week, and trainers are available around the clock. Early morning, after a night shift or late evening all work.', { chips: [CHIP.demo, CHIP.where], actions: [ACT.demo()] })];
      case 'location': return [M('We are at ' + FACTS.address + '. We train members from Al Nahda, Al Qasimia, Bu Daniq and across Sharjah.', { chips: [CHIP.demo, CHIP.hours], actions: [ACT.maps(), ACT.demo()] })];
      case 'price': return [M("Rates depend on the plan and how many personal training sessions you want, and I don't want to quote you a number that is out of date. The quickest way to get today's exact price is WhatsApp, or book the free demo and we go through the options in person, with no obligation.", { chips: [CHIP.plans, CHIP.demo], actions: [ACT.wa("Hi, I'd like today's membership rates."), ACT.demo()] })];
      case 'plans': return [M('There are three plans.\nBasic: 24/7 gym access, all basic equipment and a locker.\nPremium: a personal trainer, 24/7 access, unlimited group classes, nutrition consultation and a locker. Most members choose this one.\nVIP: consultation and health check-up, a trainer who comes to your place, personal training, a diet plan and 24/7 access.\nTell me your goal and I will point you to the right one.', { chips: [CHIP.lose, CHIP.muscle, CHIP.fit, CHIP.price], actions: [ACT.plans()] })];
      case 'home': return [M(GOALS.home.say + ' It is also the easiest way to start if you are new and not ready for a gym floor yet.', { chips: [CHIP.demo, CHIP.price], actions: [ACT.wa('Hi, I am interested in home personal training in Sharjah.'), ACT.demo()] })];
      case 'online': return [M(GOALS.online.say, { chips: [CHIP.demo, CHIP.price], actions: [ACT.wa('Hi, I am interested in online coaching.')] })];
      case 'group': return [M('We run group classes in yoga, circuit training, strength training, BodyPump and bootcamp. Class times are set by the team, so message them for the current timetable. Premium includes unlimited group classes.', { chips: [CHIP.demo, CHIP.plans], actions: [ACT.wa('Hi, could you share the current group class timetable?')] })];
      case 'weights': return [M(GOALS.muscle.say, { chips: [CHIP.demo, CHIP.price], actions: [ACT.demo()] })];
      case 'fatloss': return [M(GOALS.lose.say, { chips: [CHIP.demo, CHIP.price], actions: [ACT.demo()] })];
      case 'wellness': return [M('Our wellness services are sports massage, recovery therapy, nutrition consultation and meditation sessions. They sit alongside training, so recovery is part of the plan rather than an afterthought. These are fitness and wellness services, not medical treatment.', { chips: [CHIP.demo, CHIP.plans], actions: [ACT.wa('Hi, I would like to know about the wellness and recovery services.')] })];
      case 'personal': return [M('Personal training is one-to-one: a certified trainer builds sessions around your goal and tracks your progress. Beginners are very welcome, and the free demo includes a fitness assessment so the trainer knows where you are starting from.', { chips: [CHIP.demo, CHIP.plans], actions: [ACT.trainers(), ACT.demo()] })];
      case 'trainers': return [M('You can train with Sajith (nutrition and training), Bijo Joseph (wellness and recovery) and Prasanth (cardio and weight training). The free demo lets you meet a potential trainer before you decide.', { chips: [CHIP.demo, CHIP.pt], actions: [ACT.trainers(), ACT.demo()] })];
      case 'ladies': return [M("I can't confirm the details of a women-only area or timings here, and I would rather not guess. The team can tell you exactly what is available, and you can ask for a tour first.", { chips: [CHIP.human, CHIP.demo], actions: [ACT.wa('Hi, could you tell me about options for women, and the timings?')] })];
      case 'facilities': return [M('On the floor you will find dumbbells, barbells, weight machines and cardio equipment, and a locker is included in Basic and Premium. For anything else (showers, parking and so on) I do not have confirmed details, so please ask the team and they will tell you straight.', { chips: [CHIP.demo, CHIP.human], actions: [ACT.wa('Hi, I have a question about the facilities.')] })];
      case 'demo': return null; /* handled by lead flow */
      case 'contact': return [M('You can reach the team on WhatsApp or by phone: ' + FACTS.phones[0].label + ' or ' + FACTS.phones[1].label + '. Email: newlifeconnection1@gmail.com. We are on Instagram as @lifestylewaygym.', { chips: [CHIP.demo, CHIP.where], actions: [ACT.wa(), ACT.call()] })];
      case 'reviews': return [M('The honest answer is to read what members say on our Google profile, and the best proof is a free demo where you see the gym and meet a trainer yourself.', { chips: [CHIP.demo], actions: [ACT.reviews(), ACT.demo()] })];
      case 'about': return [M(FACTS.name + ' has been training people in Al Nahda, Sharjah for over 15 years, with more than 12,800 members trained. We are open 24 hours, with personal training, home sessions, group classes, wellness services and online coaching.', { chips: [CHIP.demo, CHIP.plans], actions: [ACT.demo()] })];
      case 'services': return [M('We offer home personal training, personal training, group classes, weight training, wellness and recovery, and online coaching. Which one sounds closest to what you need?', { chips: [CHIP.home, CHIP.pt, CHIP.classes, CHIP.online] })];
      case 'competitor': return [M("I can't speak for other gyms, and I would rather you judge us yourself: the free demo includes a full tour, a fitness assessment and a chat with a trainer, so you can compare on what you actually see.", { chips: [CHIP.demo, CHIP.price], actions: [ACT.demo()] })];
      case 'negotiate': return [M("I can't offer or promise discounts. The team can tell you about any current offers, and it is worth asking when you visit for your free demo.", { chips: [CHIP.demo], actions: [ACT.wa("Hi, are there any current offers on membership?")] })];
    }
    return null;
  }

  function safetyReply(kind) {
    switch (kind) {
      case 'emergency': return [M('If this is an emergency, please stop and call 998 for an ambulance or 999 for the police right now. I am an automated assistant and cannot help with emergencies.')];
      case 'medical': return [M("I can't give medical, injury, medication, supplement or diet-prescription advice. Please check with your doctor first. Once you have their go-ahead, our trainers can adapt training around it, and the free demo includes a fitness assessment where you can tell them about your situation directly.", { chips: [CHIP.demo, CHIP.human], actions: [ACT.wa('Hi, I have a health question before joining.')] })];
      case 'abuse': return [M("I'm here to help with the gym, so let's keep it on that. I can answer questions about training, plans and hours, or connect you to the team.", { chips: [CHIP.human, CHIP.demo] })];
      case 'injection': return [M("I'm a scripted assistant for " + FACTS.name + " and I can't change how I work. I can help with training, plans, opening hours, location and booking a free demo.", { chips: ROOT_CHIPS })];
    }
    return null;
  }

  var OFFTOPIC = [
    "That is outside what I can help with here. I can answer questions about " + FACTS.name + ": training, plans, hours, location and booking a free demo.",
    "I can only help with " + FACTS.name + ". Try asking about home training, plans, opening hours, or booking a free demo."
  ];

  function fallback(st) {
    st.fallbacks++;
    if (st.fallbacks >= 2) {
      return [M("I'm not getting that one, and I would rather not guess. The team can answer anything directly.", { chips: [CHIP.demo, CHIP.plans], actions: [ACT.wa('Hi, I was chatting on your website and have a question.'), ACT.call()] })];
    }
    return [M(OFFTOPIC[st.fallbacks % OFFTOPIC.length], { chips: ROOT_CHIPS })];
  }

  /* ---------- lead flow ---------- */
  var SERVICE_LABEL = { 'home-training': 'home personal training', 'personal-training': 'personal training', 'group-classes': 'group classes', 'online-training': 'online coaching', 'general-fitness': 'general fitness' };

  function serviceFromText(t) {
    if (/\b(home|house|villa|apartment)\b/.test(t)) return 'home-training';
    if (/\b(online|virtual|remote|zoom)\b/.test(t)) return 'online-training';
    if (/\b(class|classes|yoga|bootcamp|group|circuit|bodypump)\b/.test(t)) return 'group-classes';
    if (/\b(personal|pt|trainer|one to one|coach)\b/.test(t)) return 'personal-training';
    if (/\b(general|fit|fitness|gym|weights|membership|not sure|anything)\b/.test(t)) return 'general-fitness';
    return '';
  }
  function cleanName(s) {
    var n = String(s).replace(/[^A-Za-zÀ-ɏ\s.'-]/g, ' ').replace(/\s+/g, ' ').trim();
    return n.length >= 2 && n.length <= 60 ? n : '';
  }
  function cleanPhone(s) {
    var p = String(s).replace(/[\s\-().]/g, '');
    return /^\+?\d{7,15}$/.test(p) ? p : '';
  }

  function startLead(st) {
    st.step = 'goal'; st.lead = st.lead || {};
    return [M("Great choice. It is free, there is no obligation, and I only need three things. First: what is your main goal?", { chips: [CHIP.lose, CHIP.muscle, CHIP.fit, CHIP.home, CHIP.online] })];
  }
  function askName(st) { st.step = 'name'; return M('What is your first name?'); }
  function askPhone(st) { st.step = 'phone'; return M('Thanks, ' + st.lead.name + '. What is the best phone or WhatsApp number to reach you on? The team will use it only to arrange your demo.'); }
  function askService(st) {
    st.step = 'service';
    return M('Which would you like to try?', { chips: ['Personal training', 'Group classes', 'Home training', 'Online coaching', 'Not sure yet'] });
  }
  function confirm(st) {
    st.step = 'confirm';
    var l = st.lead;
    return M('Please check before I send it to the gym:\nName: ' + l.name + '\nPhone: ' + l.phone + '\nInterested in: ' + (SERVICE_LABEL[l.service] || 'general fitness') + '\nGoal: ' + (l.goalText || 'not given') + '\nShall I send this so the team can contact you to arrange your free demo?', { chips: ['Yes, send it', 'Change something', 'Cancel'] });
  }

  function leadStep(raw, c, st) {
    var t = c.text;
    if (/^(cancel|stop|exit|quit|never mind|nevermind|back|no thanks)$/.test(t) || t === 'cancel') {
      st.step = 'idle'; st.lead = {};
      return { messages: [M('No problem, nothing was sent. You can start again any time, or message the team directly.', { chips: ROOT_CHIPS, actions: [ACT.wa()] })], state: st };
    }
    if (t === 'carry on') {
      var rp = { goal: M('What is your main goal?', { chips: [CHIP.lose, CHIP.muscle, CHIP.fit, CHIP.home, CHIP.online] }), name: M('What is your first name?'), phone: M('What is the best phone or WhatsApp number to reach you on?'), service: askService(st), confirm: confirm(st) };
      return { messages: [rp[st.step] || rp.goal], state: st };
    }
    if (c.safety) { var sm = safetyReply(c.safety); sm.push(M('Shall we carry on with your demo booking?', { chips: ['Carry on', 'Cancel'] })); return { messages: sm, state: st }; }
    if (st.step === 'goal') {
      var g = goalFromText(t);
      if (!g && c.intent && c.score >= 3 && c.intent !== 'demo') { var a = answer(c.intent, st); if (a) { a.push(M('And what is your main goal for training?', { chips: [CHIP.lose, CHIP.muscle, CHIP.fit, CHIP.home, CHIP.online] })); return { messages: a, state: st }; } }
      if (!g) g = 'fit';
      st.goal = g; st.lead.goalText = raw.slice(0, 80);
      st.lead.service = GOALS[g].service; st.lead.plan = GOALS[g].plan;
      return { messages: [M(GOALS[g].say), askName(st)], state: st };
    }
    if (st.step === 'name') {
      var qm = /\?/.test(raw) && c.intent;
      if (qm) { var a2 = answer(c.intent, st); if (a2) { a2.push(M('What is your first name, so I can book you in?')); return { messages: a2, state: st }; } }
      var n = cleanName(raw);
      if (!n) return { messages: [M('Sorry, I did not catch a name. Please type just your first name, for example "Sara".')], state: st };
      st.lead.name = n.split(' ')[0];
      return { messages: [askPhone(st)], state: st };
    }
    if (st.step === 'phone') {
      var p = cleanPhone(raw);
      if (!p) return { messages: [M('That does not look like a phone number. Please type digits only, with your country code if you are outside the UAE, for example 0581234567 or +971581234567.', { actions: [ACT.wa('Hi, I would like to book a free demo.')] })], state: st };
      st.lead.phone = p;
      return { messages: [askService(st)], state: st };
    }
    if (st.step === 'service') {
      var s = serviceFromText(t);
      if (!s) s = 'general-fitness';
      st.lead.service = s;
      return { messages: [confirm(st)], state: st };
    }
    if (st.step === 'confirm') {
      if (/^(yes|y|yeah|yep|sure|ok|okay|send|send it|yes send it|confirm|go ahead)\b/.test(t) || t.indexOf('yes') === 0) {
        if (st.sent) return { messages: [M('Your details were already sent, so the team will be in touch. For anything urgent, WhatsApp is fastest.', { actions: [ACT.wa()] })], state: st };
        st.step = 'sending';
        return { messages: [M('Sending…')], state: st, effect: { type: 'send', data: st.lead } };
      }
      if (/^(change|edit|wrong|redo|no|nope)\b/.test(t)) { st.lead = { goalText: st.lead.goalText, service: st.lead.service }; return { messages: [askName(st)], state: st }; }
      return { messages: [M('Should I send these details to the gym? Tap "Yes, send it", or "Change something" to edit.', { chips: ['Yes, send it', 'Change something', 'Cancel'] })], state: st };
    }
    st.step = 'idle';
    return { messages: fallback(st), state: st };
  }

  function sendResult(st, ok) {
    if (ok) {
      st.sent = true; st.step = 'idle';
      var name = st.lead.name || 'there';
      st.lead = {};
      return [M('Done, ' + name + '. The team has your request and will contact you within 24 hours to arrange your free demo. If you would rather not wait, message them now.', { actions: [ACT.wa('Hi, I just booked a free demo on your website.'), ACT.maps()] })];
    }
    st.step = 'confirm';
    return [M('Sorry, that did not go through. Nothing is lost: you can try again, or send the request by WhatsApp in one tap.', { chips: ['Yes, send it', 'Cancel'], actions: [ACT.wa('Hi, I would like to book a free demo. My name is ' + (st.lead.name || '') + ' and my number is ' + (st.lead.phone || '') + '.')] })];
  }

  /* ---------- the brain ---------- */
  function reply(text, st) {
    st = st || newState();
    var raw = String(text == null ? '' : text);
    var now = Date.now();
    if (!raw.trim()) return { messages: [M('Type a question, or tap one of the options below.', { chips: ROOT_CHIPS })], state: st };
    if (raw.length > FACTS.maxInput) return { messages: [M('Please keep messages under ' + FACTS.maxInput + ' characters, or message the team on WhatsApp for longer questions.', { actions: [ACT.wa()] })], state: st };
    st.msgs++;
    if (st.msgs > FACTS.maxMessages) return { messages: [M("We've covered a lot. For anything more, the team will help you directly.", { actions: [ACT.wa(), ACT.call(), ACT.demo()] })], state: st };
    if (st.last && now - st.last < FACTS.minGapMs) return { messages: [], state: st, throttled: true };
    st.last = now;

    if (hasArabicOrOther(raw) && !/[a-zA-Z]{3}/.test(raw)) {
      return { messages: [M('I can only chat in English here. For Arabic or other languages, please message the team on WhatsApp and they will help you.', { actions: [ACT.wa('Hello')] })], state: st };
    }
    var c = classify(raw);

    if (st.step !== 'idle' && st.step !== 'sending') return leadStep(raw, c, st);

    if (c.safety) { st.fallbacks = 0; return { messages: safetyReply(c.safety), state: st }; }

    if (/^carry on$/.test(c.text)) return { messages: startLead(st), state: st };
    if (c.text === 'start here') return { messages: intro(), state: st };

    /* chip texts map straight to intents */
    var chipMap = { 'book a free demo': 'demo', 'see the plans': 'plans', 'how much is it': 'price', 'opening hours': 'hours', 'where are you': 'location', 'home training': 'home', 'personal training': 'personal', 'group classes': 'group', 'online coaching': 'online', 'talk to the team': 'human' };
    if (chipMap[c.text]) { c.intent = chipMap[c.text]; c.score = 9; c.tie = false; }
    if (GOALS[{ 'lose fat': 'lose', 'build muscle': 'muscle', 'stay fit': 'fit' }[c.text]]) {
      var gk = { 'lose fat': 'lose', 'build muscle': 'muscle', 'stay fit': 'fit' }[c.text];
      st.goal = gk; st.fallbacks = 0;
      return { messages: [M(GOALS[gk].say, { chips: [CHIP.demo, CHIP.price], actions: [ACT.demo(), ACT.wa('Hi, my goal is to ' + { lose: 'lose fat', muscle: 'build muscle', fit: 'stay fit' }[gk] + '. What do you recommend?')] })], state: st };
    }

    if (!c.intent) return { messages: fallback(st), state: st };
    st.fallbacks = 0;
    if (c.intent === 'demo') return { messages: startLead(st), state: st };
    var out = answer(c.intent, st);
    if (!out) return { messages: fallback(st), state: st };
    /* two equally strong intents (e.g. "home gym price"): answer the first, then offer the other angle */
    var ALT = { price: CHIP.price, plans: CHIP.plans, hours: CHIP.hours, location: CHIP.where, home: CHIP.home, online: CHIP.online, group: CHIP.classes, personal: CHIP.pt, human: CHIP.human };
    if (c.tie && c.alt && c.alt !== c.intent && ALT[c.alt]) {
      var last = out[out.length - 1];
      last.chips = [ALT[c.alt]].concat((last.chips || []).filter(function (x) { return x !== ALT[c.alt]; })).slice(0, 6);
    }
    return { messages: out, state: st };
  }

  var api = { reply: reply, sendResult: sendResult, newState: newState, intro: intro, classify: classify, FACTS: FACTS, _norm: norm };

  /* ---------- interface (browser only) ---------- */
  function mountUI(doc) {
    var STORE = 'lgchat.v1';
    var st = newState(), log = [], busy = false;
    var panel = doc.getElementById('chat'), logEl = doc.getElementById('chatLog'), chipsEl = doc.getElementById('chatChips'),
      form = doc.getElementById('chatForm'), input = doc.getElementById('chatInput'), closeBtn = doc.getElementById('chatClose'),
      opener = doc.getElementById('chatOpen');
    if (!panel || !logEl || !form || !input) return null;

    function save() {
      try {
        var safe = log.slice(-40).map(function (m) { return { who: m.who, text: String(m.text).replace(/\+?\d[\d\s\-]{6,}\d/g, '•••') }; });
        root.sessionStorage.setItem(STORE, JSON.stringify({ log: safe, sent: st.sent }));
      } catch (e) { /* storage unavailable: chat still works */ }
    }
    function load() {
      try { var d = JSON.parse(root.sessionStorage.getItem(STORE) || 'null'); if (d && Array.isArray(d.log)) { st.sent = !!d.sent; return d.log.filter(function (m) { return m && (m.who === 'me' || m.who === 'bot') && typeof m.text === 'string'; }).slice(-40); } } catch (e) { /* ignore */ }
      return null;
    }
    function el(tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function scroll() { logEl.scrollTop = logEl.scrollHeight; }

    function addMsg(who, text, actions) {
      var row = el('div', 'msg msg-' + who);
      row.appendChild(el('p', null, text));
      if (actions && actions.length) {
        var box = el('div', 'msg-actions');
        actions.forEach(function (a) {
          var link = el('a', 'chat-act', a.label);
          link.href = a.href;
          if (a.ext) { link.target = '_blank'; link.rel = 'noopener'; }
          if (a.local) { link.addEventListener('click', function () { closePanel(false); }); }
          box.appendChild(link);
        });
        row.appendChild(box);
      }
      logEl.appendChild(row);
      log.push({ who: who, text: text });
      scroll();
    }
    function setChips(chips) {
      while (chipsEl.firstChild) chipsEl.removeChild(chipsEl.firstChild);
      (chips || []).slice(0, 6).forEach(function (c) {
        var b = el('button', 'chip', c); b.type = 'button';
        b.addEventListener('click', function () { submit(c); });
        chipsEl.appendChild(b);
      });
    }
    function show(messages, delay) {
      var i = 0;
      (function next() {
        if (i >= messages.length) { busy = false; save(); return; }
        var m = messages[i++];
        var typing = el('div', 'msg msg-bot typing', '…'); typing.setAttribute('aria-hidden', 'true'); logEl.appendChild(typing); scroll();
        root.setTimeout(function () {
          if (typing.parentNode) typing.parentNode.removeChild(typing);
          addMsg('bot', m.text, m.actions);
          setChips(m.chips && m.chips.length ? m.chips : (i >= messages.length ? [] : null));
          next();
        }, delay == null ? Math.min(650, 220 + m.text.length * 4) : delay);
      })();
    }
    function submit(text) {
      text = String(text || '').trim();
      if (!text || busy) return;
      busy = true; setChips([]);
      addMsg('me', text.slice(0, FACTS.maxInput));
      input.value = '';
      var r = reply(text, st); st = r.state;
      if (r.throttled) { busy = false; return; }
      show(r.messages);
      if (r.effect && r.effect.type === 'send') post(r.effect.data);
    }
    function post(lead) {
      var body = { firstName: lead.name || '', lastName: '', phone: lead.phone || '', email: '', service: lead.service || 'general-fitness', planChoice: lead.plan || '', preferredDate: '', message: 'Lead from website chat assistant. Goal: ' + (lead.goalText || 'not given'), _subject: 'New chat lead - New Lifestyle Way Gym', _form_id: 'chat_lead', source: 'chat' };
      var done = function (ok) { var out = sendResult(st, ok); root.setTimeout(function () { show(out, 300); }, 900); };
      if (!root.LGLead) { done(false); return; }
      root.LGLead.send(body).then(function () { done(true); }, function () { done(false); });
    }

    function openPanel() {
      panel.hidden = false; opener.setAttribute('aria-expanded', 'true'); doc.documentElement.classList.add('chat-on');
      if (!logEl.children.length) {
        var prev = load();
        if (prev && prev.length) { prev.forEach(function (m) { addMsg(m.who, m.text); }); setChips(ROOT_CHIPS); }
        else { busy = true; show(intro(), 350); }
      }
      root.setTimeout(function () { input.focus(); }, 50);
    }
    function closePanel(refocus) {
      panel.hidden = true; opener.setAttribute('aria-expanded', 'false'); doc.documentElement.classList.remove('chat-on');
      if (refocus !== false) opener.focus();
    }
    opener.addEventListener('click', function () { panel.hidden ? openPanel() : closePanel(); });
    closeBtn.addEventListener('click', function () { closePanel(); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); closePanel(); } });
    form.addEventListener('submit', function (e) { e.preventDefault(); submit(input.value); });
    return { open: openPanel, close: closePanel };
  }

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else {
    root.LGChat = api;
    if (root.document) {
      var go = function () { var ui = mountUI(root.document); if (ui && root.__lgChatOpenOnLoad) ui.open(); };
      if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', go); else go();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
