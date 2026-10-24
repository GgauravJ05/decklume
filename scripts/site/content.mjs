/* Site copy and data. Every claim here must be true of the product. */

export const SITE = {
  name: "Decklume",
  base: "https://ggauravj05.github.io/decklume/",
  repo: "https://github.com/GgauravJ05/decklume",
  author: "GgauravJ05",
  install: ["/plugin marketplace add https://github.com/GgauravJ05/decklume", "/plugin install decklume@decklume"],
  manual: ["git clone https://github.com/GgauravJ05/decklume.git", "cp -R decklume/skills/decklume ~/.claude/skills/"],
};

/* The 33-slide showcase lecture, used for frame captions and alt text. */
export const SLIDES = [
  "Title — How sleep shapes memory", "Agenda — four questions", "Section — why do we forget?",
  "Definition — consolidation", "Quote — Jenkins & Dallenbach", "Section — what happens while we sleep?",
  "Steps — the four sleep stages", "Chart — half the night is stage N2", "Annotated — reading a hypnogram", "Chart story — REM across the night", "Diagram — the two-stage model",
  "Split — the brain rehearses the day", "Section — what is the evidence?", "Timeline — a century of findings",
  "Compare — all-nighter vs. a full night", "Big number — 1 in 3 adults", "Stats — sleep by the numbers",
  "Table — what each stage contributes", "Section — what should students do?", "Problem — late review fades",
  "Matrix — sleep is the cheapest study tool", "Tiers — pick a sleep plan", "Roadmap — a two-week exam plan",
  "List — study with sleep",
  "Cards — three small experiments", "Code — spacing your reviews", "Statement — end with going to bed",
  "Gallery — further reading", "People — teaching team", "Full bleed — tonight's homework", "Bento — the night at a glance", "Cover — the take-home issue", "Closing — thank you",
];

/* Hero contact sheet: [theme, slide] in reading order. Slide 1 of Folio is the keeper. */
export const HERO_FRAMES = [
  ["nocturne", 7], ["grid", 17], ["campus", 8], ["atlas", 18], ["aurora", 16], ["volt", 26],
  ["ma", 27], ["bloom", 25], ["folio", 1], ["chalk", 11],
  ["grid", 3], ["nocturne", 30], ["campus", 14], ["bloom", 28],
];
export const KEEPER_INDEX = 8;

export const SWITCH_SLIDES = [
  [1, "Title"], [7, "Process"], [8, "Chart"], [15, "Compare"], [17, "Numbers"], [25, "Cards"],
];

export const AUDIENCES = {
  students: {
    slug: "students",
    title: "AI Presentation Maker for Students — Free Claude Code Skill",
    description: "Make class presentations, project demos and thesis slides that look professionally designed. Decklume is a free Claude Code skill: outline first, thirteen designer themes, presenter notes and PDF export.",
    h1: "Class presentations that look designed, not rushed.",
    lede: "Give Claude your topic or notes. Decklume outlines the talk with you, shows your own slides in three styles, then builds a deck that passes a design check before you ever see it.",
    makes: [
      ["Class presentations", "Make a 10-minute presentation on the causes of World War I for my history class, speaker-led, with notes."],
      ["Group project demos", "Turn our project README into an 8-slide demo deck for the hackathon, dark and technical, ending with the live link."],
      ["Lab and seminar talks", "Present my lab report on enzyme kinetics in 12 slides with the results as charts and a methods diagram."],
      ["Thesis and capstone defenses", "Build a 15-minute capstone defense from ./thesis.md with one claim per slide and backup slides at the end."],
    ],
    themes: ["campus", "chalk", "volt", "bloom"],
    points: [
      ["Story before style", "Every slide gets a headline that states its point, so the talk makes sense even if you're nervous."],
      ["Presenter notes and a timer", "Press P to open a second window with your notes, the next slide and a clock."],
      ["Export for submission", "A vector PDF with selectable text, small enough to email or upload to a course portal."],
      ["Edit before class", "Press E in the browser to fix a word, then save. No software to install beyond Claude Code."],
    ],
    faq: [
      ["Is Decklume free for students?", "Yes. Decklume is free and open source under the MIT license. It runs inside Claude Code, which you need separately."],
      ["Can I submit the slides as a PDF?", "Yes. One command exports a vector PDF with selectable, searchable text and every build step shown, one page per slide."],
      ["Will it make up facts for my presentation?", "The skill is instructed never to invent statistics, quotes or sources. Numbers come from your notes or well-established facts, and the QA check flags placeholder text."],
      ["Can I present from a school computer?", "Yes. A Decklume deck is one HTML file that opens in any modern browser, on any operating system, with nothing to install."],
    ],
  },
  teachers: {
    slug: "teachers",
    title: "AI Lecture Slides Maker for Teachers — Free Claude Skill",
    description: "Turn lesson plans and notes into clear, designed lecture slides with definitions, timelines, diagrams and step-by-step builds. Free Claude Code skill with a classroom chalkboard theme.",
    h1: "Lecture slides from your lesson plan, ready before the bell.",
    lede: "Decklume turns notes, a syllabus or an old PowerPoint into a teaching deck with definitions, worked steps and reveal-one-point-at-a-time builds, in a theme built for reading from the back row.",
    makes: [
      ["Lectures from notes", "Turn my notes in week-5.md into a 40-minute lecture for first-year economics, with a recap slide every 10 minutes."],
      ["Revision decks", "Make a 15-slide revision deck on photosynthesis for 9th grade using the Chalk theme, one definition per slide."],
      ["Converted PowerPoints", "Convert lecture-04.pptx into a Campus-themed deck and keep all my speaker notes and charts."],
      ["Workshop and training", "Build a 90-minute teacher-training workshop deck with activities, timings and discussion prompts."],
    ],
    themes: ["chalk", "campus", "folio", "bloom"],
    points: [
      ["Definitions and formulas", "A dedicated definition layout with pronunciation, examples and native MathML for equations."],
      ["Reveal one point at a time", "Builds show points in order and dim earlier ones, so the class follows along."],
      ["Readable from the back", "Body text stays at 24 px or larger on the 1920×1080 canvas, and every theme passes WCAG AA contrast checks."],
      ["Reuse your PowerPoints", "Import .pptx files with bullet levels, tables, images, notes and native chart data intact."],
    ],
    faq: [
      ["Can Decklume convert my existing PowerPoint lectures?", "Yes. It extracts text with bullet levels, tables, images (including grouped ones), speaker notes and native chart data, then redesigns the deck in the theme you choose."],
      ["Do the slides work on a classroom projector?", "Yes. Slides stay at 16:9 on any screen and scale as a whole, so nothing reflows on a projector, laptop or phone."],
      ["Can students get a copy?", "Export a PDF handout, PNG images of each slide, or deploy the deck to a link that works on any device."],
      ["Is there a theme for younger students?", "Bloom is warm and playful, and Chalk looks like a classroom blackboard. Both pass the same accessibility checks as every other theme."],
    ],
  },
  researchers: {
    slug: "researchers",
    title: "Thesis Defense and Research Presentation Slides with AI",
    description: "Build thesis defenses, conference talks and lab-meeting slides with one claim per slide, charts from your data, numbered exhibits and vector PDF handouts. Free Claude Code skill.",
    h1: "Research talks where every slide makes one claim.",
    lede: "Decklume structures your talk as an argument: question, gap, method, results, contribution. Each result slide states its finding as the headline and backs it with a chart drawn from your data.",
    makes: [
      ["Thesis and dissertation defenses", "Build a 20-minute PhD defense from my abstract and chapter summaries, with backup slides for likely committee questions."],
      ["Conference talks", "Make a 12-minute conference talk from paper.pdf, speaker-led, with the main result as a single big-number slide."],
      ["Lab meetings", "Turn this week's results.csv into a 6-slide lab-meeting update with one chart per finding."],
      ["Poster-to-talk", "Turn my poster content into a 5-minute lightning talk in the Ma theme."],
    ],
    themes: ["campus", "atlas", "folio", "ma"],
    points: [
      ["Assertion headlines", "Results slides lead with the finding itself, such as \"Recall improves after a night of sleep\", rather than a label like \"Results\"."],
      ["Charts from your numbers", "Bar, line and donut charts drawn from data attributes, highlighting the value your claim is about."],
      ["Numbered exhibits", "The Atlas theme numbers every chart and table automatically, as in a report."],
      ["Handouts that stay small", "Vector PDFs keep text selectable; the 33-slide example lecture exports to 1.1 MB."],
    ],
    faq: [
      ["Can I use my own data for charts?", "Yes. Charts are declared with your labels and values and drawn as SVG in the theme's colours. Claude never invents data for them."],
      ["Does it support equations?", "Yes. Slides accept native MathML, which modern browsers render without extra libraries."],
      ["Can I cite sources on slides?", "Every chart, number and quote layout has a source line, and the skill is instructed never to fabricate citations."],
      ["How do I share slides with a committee?", "Export a vector PDF with selectable text, or deploy a link that works on any device."],
    ],
  },
  founders: {
    slug: "founders",
    title: "AI Pitch Deck Generator — Free and Open Source",
    description: "Build investor pitch decks, demo-day slides and product launches with a story-first outline, cinematic themes, Magic Move transitions and a presenter view. Free Claude Code skill.",
    h1: "Pitch decks with a story investors can follow.",
    lede: "Decklume outlines your pitch as problem, why now, solution, traction, market and ask, then builds it in a theme that fits the room, with Magic Move transitions and a presenter view for demo day.",
    makes: [
      ["Seed pitch decks", "Build a 12-slide seed pitch from our one-pager, Grid theme, ending with the raise and use of funds."],
      ["Demo-day decks", "Make a 3-minute demo-day deck in Aurora with one big traction number and the product screenshot full-bleed."],
      ["Product launches", "Launch deck for our v2 release with a before/after comparison and a live link on the closing slide."],
      ["Board and investor updates", "Turn this month's metrics into an investor update in Atlas with numbered exhibits."],
    ],
    themes: ["grid", "aurora", "nocturne", "atlas"],
    points: [
      ["A pitch arc built in", "The storyline follows the arc investors expect, and every slide states one claim."],
      ["Magic Move", "Your traction number or product shot glides from one slide to the next, Keynote-style."],
      ["Presenter view", "Notes, timer and the next slide in a second window, synced live, for demo day."],
      ["Send it anywhere", "One HTML file, a small vector PDF for email, or a live link that works on phones."],
    ],
    faq: [
      ["Can Decklume use our brand colours and logo?", "Yes. Ask for a custom theme from your logo or brand guide; it gets the same layouts and design checks as the built-in themes."],
      ["Will it invent traction numbers?", "No. The skill never fabricates metrics; it uses the numbers you provide and asks when one is missing."],
      ["Can investors open it on a phone?", "Yes. Decks keep their 16:9 layout on any screen and support swipe navigation. Deploy to a link in one command."],
      ["Do I need design skills?", "No. You choose between three styles rendered with your own slides; the layouts, typography and checks are handled for you."],
    ],
  },
};

export const FAQ_HOME = [
  ["How do I make a presentation with Claude?", "Install the Decklume skill in Claude Code, then describe the presentation you need, for example: “Make a 15-minute lecture on photosynthesis for first-year students.” Decklume agrees the outline with you, shows your slides in three styles, builds the deck and checks it with an automated design QA pass."],
  ["Is Decklume free?", "Yes. Decklume is free and open source under the MIT license. It runs inside Claude Code."],
  ["Can Decklume convert my PowerPoint?", "Yes. It reads .pptx files, including bullet levels, tables, images in groups, speaker notes and native chart data, and redesigns them as an animated HTML deck."],
  ["What do I get at the end?", "A single self-contained HTML file that runs in any browser, with a presenter view. Export it as a vector PDF with selectable text, PNG images per slide, or deploy it to a live link."],
  ["What does the design QA check?", "It renders every slide in a real browser and fails the deck on text overflowing its box, overlapping text, type below the minimum size, WCAG contrast failures, web fonts that did not load, leftover placeholder text, broken images and JavaScript errors."],
  ["Does it work outside Claude Code?", "The skill is Markdown plus Node scripts, so any coding agent with file and shell access can follow it. The command-line tools also work on their own."],
];

/* Example decks published on the site (built from examples/<slug>/<slug>.deck.html). */
export const EXAMPLES = [
  {
    slug: "sleep-and-memory", title: "How Sleep Shapes Memory", theme: "folio", audience: "students", slides: 33, frames: [1, 8, 17],
    kind: "University lecture",
    summary: "A 20-minute psychology lecture using all 30 layouts: definitions, a timeline, charts, builds, Magic Move and speaker notes.",
    motion: "Fade transitions, staggered entrances, step builds with dimming, a Magic Move between two slides.",
  },
  {
    slug: "url-to-pixels", title: "From URL to Pixels", theme: "volt", audience: "engineers", slides: 14, frames: [1, 5, 8],
    kind: "Engineering talk",
    summary: "What happens between pressing Enter and seeing a page: DNS, TCP, TLS, HTTP and rendering.",
    motion: "Push, wipe, flip, zoom and iris transitions, a self-drawing TCP handshake, count-up figures and code walkthroughs.",
  },
  {
    slug: "retrieval-practice-defense", title: "Does Retrieval Practice Beat Rereading?", theme: "campus", audience: "researchers", slides: 18, frames: [1, 11, 12],
    kind: "Thesis defense",
    summary: "A master's defense that cites real prior work with a fictional study whose data are labelled illustrative.",
    motion: "Rise transitions for sections, iris for the main result, a MathML effect-size formula, count-up and highlight builds.",
  },
  {
    slug: "orbit-notes-pitch", title: "Orbit Notes: Seed Pitch", theme: "aurora", audience: "founders", slides: 13, frames: [1, 6, 8],
    kind: "Startup pitch",
    summary: "A seed pitch for a fictional study app. The company, team and every figure are illustrative.",
    motion: "Push transitions with automatic Magic Move carrying the traction number between slides, plus count-ups.",
  },
];
