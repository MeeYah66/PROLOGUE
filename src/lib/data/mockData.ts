/**
 * DEV SEED DATA — never injected automatically into the live app.
 *
 * To populate your local workspace for development, open the browser console
 * and run:  window.__seedPrologue?.()
 * This is wired up in src/app/dev-seed/page.tsx (dev route only).
 *
 * GENRES is the only export used by the production app (book creation form).
 */
import type { Book } from "@/lib/types";

export const mockBooks: Book[] = [
  {
    id: "book-1",
    title: "The Ember Throne",
    subtitle: "A Chronicle of the Ashwood Kingdom",
    genre: "Fantasy",
    blurb:
      "In the dying light of the Ashwood Kingdom, a disgraced knight must choose between loyalty to a corrupt throne and the ember of a revolution that could save — or consume — everything she loves.",
    authorName: "E. L. Vance",
    status: "ongoing",
    cover: {
      style: "ethereal",
      titleColor: "#f5f0e8",
      authorColor: "#c9a84c",
      alignment: "left",
      backgroundColor: "#1a1410",
      overlayOpacity: 0.55,
      imageUrl:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
    },
    targetWordCount: 90000,
    lastEditedChapterId: "ch-1-3",
    createdAt: "2025-11-04T09:00:00Z",
    updatedAt: "2026-03-18T14:32:00Z",
    chapters: [
      {
        id: "ch-1-1",
        number: 1,
        title: "The Last Vigil",
        status: "final",
        wordCount: 3240,
        summary:
          "Sera stands watch at the burning gate of Ashhold, the final fortress of the eastern reaches. She receives news that changes everything.",
        povCharacter: "Sera Ashvane",
        sceneLabel: "Opening",
        createdAt: "2025-11-04T09:00:00Z",
        updatedAt: "2026-01-10T11:00:00Z",
        content: `The fire had been burning for three days.

Sera Ashvane stood at the parapet of Ashhold's eastern tower, her gauntlet resting against the cold stone, watching the distant hills glow amber against a sky that had forgotten the color of stars. The smoke made everything taste of iron. She had stopped noticing it by the second day.

Below her, the last of the garrison moved through the courtyard with the careful urgency of people who knew they were being watched — not by enemies, but by the weight of history. Every step on those cobblestones felt like a verdict.

"Knight-Commander." Aldric's voice came from behind her, soft as ash. She didn't turn.

"Report."

"The eastern relief column isn't coming." A pause. She could hear him swallow. "Lord Cassel has recalled them to the capital."

The fire on the hills didn't care. It kept burning.

Sera closed her eyes. She had known, in the way you know a thing before the words arrive, that this moment was coming. The intelligence had pointed to it for weeks: the slow withdrawal of imperial resources from the frontier, the silence from the Throne's correspondence office, the way even Cassel's most devoted messengers had stopped meeting her gaze.

"How many men do we have left in fighting condition?"

"Two hundred and eleven, Commander. Perhaps two-thirty if we arm the servants."

Two hundred against the Ashborn horde that had broken the walls at Ferren's Gate. She did the arithmetic without needing to. The answer was not a number. It was a sentence.

"Send word to the village heads," she said, finally turning from the flames. "Anyone who can walk has until dawn to move north." She unclipped her cloak and let the wind take it. "We're not defending a fortress tonight. We're buying time."

Aldric didn't argue. That, she thought, was perhaps the most frightening thing of all.`,
      },
      {
        id: "ch-1-2",
        number: 2,
        title: "Court of Embers",
        status: "revised",
        wordCount: 2870,
        summary:
          "Recalled to the capital under murky orders, Sera navigates the political minefield of the Ember Court and meets the reformist Prince Aldric.",
        povCharacter: "Sera Ashvane",
        sceneLabel: "Rising Action",
        createdAt: "2025-11-12T10:00:00Z",
        updatedAt: "2026-02-14T16:20:00Z",
        content: `The capital smelled of money and pretense.

After six years on the eastern front, Sera had forgotten how loud Varenhal could be — the vendors and the courtiers and the constant, performative laughter that echoed off marble halls designed specifically to make it carry. Everything here was a surface. Everything here was arranged.

She had come through the servants' entrance, as instructed. That particular indignity still burned.

"They're worried you'll make a scene," said the woman who met her at the bottom of the back stair. She was perhaps forty, dressed in the quiet grey of a court administrator, with eyes that had seen everything and forgiven very little of it. "Given recent events."

"Recent events." Sera repeated the phrase like she was tasting poison.

"Ashhold." The woman's voice carried no apology. "The capital's official position is that the fortress was lost due to insufficient preparation and poor tactical decision-making by its commanding officer."

Sera said nothing. The hallway was narrow and smelled of beeswax candles. Somewhere above them, a string quartet was playing something decorative.

"I'm Lady Mireth of the Reformist Council," the woman continued, as if they were discussing the weather. "And we believe you're owed a considerably different explanation." She paused at a plain wooden door and glanced back. "What do you know about Prince Edoran's intentions regarding the eastern territories?"

The question landed like a stone in still water.

Sera looked at the door, then at Lady Mireth, then at the space between them where trust had not yet been established and perhaps never would be.

"I know enough," she said carefully, "to listen."

The door opened onto a small study lit by a single lamp. Around the table sat four people who looked, to Sera's trained eye, like people who had decided to be dangerous.`,
      },
      {
        id: "ch-1-3",
        number: 3,
        title: "The Cartographer's Secret",
        status: "draft",
        wordCount: 1440,
        summary:
          "A mysterious map leads Sera and her new allies to a buried ruin beneath the capital — evidence that the Throne has been lying for a century.",
        povCharacter: "Sera Ashvane",
        sceneLabel: "Discovery",
        createdAt: "2026-01-03T08:00:00Z",
        updatedAt: "2026-03-18T14:32:00Z",
        content: `The map was wrong in all the right ways.

Sera spread it across the table, anchoring the corners with whatever came to hand — a candlestick, a brass inkpot, Mireth's coffee cup, a dagger she'd placed there without ceremony. The parchment was old enough that it crackled like a warning when she flattened it.

"This was made before the Reclamation," said the young man across from her. His name was Pen — short for something he claimed he'd never been asked to spell correctly — and he was apparently the best cartographic analyst the Reformist Council had. He looked like he'd been assembled from leftover academic components: ink-stained fingers, a perpetual slight squint, the kind of energy that only emerged when someone was talking about something they genuinely cared about. "See the coastline here?" He pointed. "The Bay of Sorrows doesn't exist on this map. It was created during the Reclamation's flood protocols — thirty years of deliberate tidal redirection to erase what was underneath."

"And what was underneath?" Sera asked.

Pen looked up. For a moment, he seemed to recalibrate whether to trust her.

"The old city," he said. "The one the Throne has spent a hundred years pretending never existed."`,
      },
      {
        id: "ch-1-4",
        number: 4,
        title: "Beneath the Bay",
        status: "draft",
        wordCount: 880,
        summary:
          "The descent into the drowned city begins. What they find there will reshape Sera's understanding of the war she has been fighting.",
        povCharacter: "Sera Ashvane",
        sceneLabel: "Descent",
        createdAt: "2026-02-20T09:00:00Z",
        updatedAt: "2026-02-28T11:15:00Z",
        content: `Water and darkness and the sound of their own breathing.

The tunnel had been carved, not built — gouged into the rock by something patient and methodical, with tools or methods or purposes that Pen hadn't yet explained to her satisfaction. Sera kept one hand on the rough wall and counted her steps out of habit. Two hundred and twelve paces from the entrance. The air tasted cold and old, the way rooms taste when they haven't been opened in a generation.

"How do you know it's still structurally sound?" she asked, her voice low.

"I don't," Pen said cheerfully, from somewhere behind her. "But the scouts came back, so that's encouraging."

"The scouts came back nervous," Mireth noted.

"Nervously and alive. There's a distinction."

Sera's boot found the first submerged step before her lamp did. The water was cold enough to matter, rising to her knee by the fourth step, and then the tunnel opened — abruptly, without warning — into something vast.

She raised her lamp.

The light found columns first. Then a ceiling. Then the carved profiles of faces she didn't recognize, stretching in long friezes along walls that curved upward into darkness. The city hadn't been destroyed. It had been sealed. Preserved. Waiting.

On the nearest column, at eye level, someone had carved a phrase in Old Ashen — a dialect she'd last seen in a history text.

*The throne is borrowed. The fire is ours.*`,
      },
    ],
    notes: {
      arc: "Three-act structure: Act I — the frontier collapse and political awakening (Ch 1–6). Act II — the underground network and growing resistance (Ch 7–15). Act III — the reckoning at the Ember Throne (Ch 16–22).",
      timeline:
        "Year 847 of the Imperial Reckoning. Ashhold falls: Month 3. Capital arrival: Month 3, Week 2. Bay descent: Month 4, Week 1.",
      characters: [
        {
          id: "char-1",
          name: "Sera Ashvane",
          role: "Protagonist",
          description:
            "Disgraced knight-commander of the eastern front. Pragmatic, fiercely principled, carries the specific exhaustion of someone who has been right in all the wrong ways.",
          traits: ["tactical", "guarded", "loyal", "morally inflexible"],
          age: "34",
          appearance:
            "Dark-haired, brown-skinned, carries a scar along her jaw from the Battle of Ferren's Gate. Usually dressed plainly — she finds ostentation professionally insulting.",
        },
        {
          id: "char-2",
          name: "Lady Mireth",
          role: "Ally / Mentor",
          description:
            "Senior figure in the Reformist Council. Cool, precise, with a long memory for injustice and a shorter one for sentiment.",
          traits: ["intelligent", "strategic", "weary", "principled"],
          age: "47",
          appearance: "Grey-clad, grey-haired by choice. Unremarkable by design.",
        },
        {
          id: "char-3",
          name: 'Pen (Penric Ashmore)',
          role: "Ally / Comic Relief",
          description:
            "Cartographic analyst and accidental revolutionary. Enthusiastic about maps, ancient languages, and structural engineering. Less enthusiastic about physical danger.",
          traits: ["brilliant", "nervous", "genuinely kind", "talkative"],
          age: "26",
          appearance: "Ink stains. Always ink stains.",
        },
        {
          id: "char-4",
          name: "Lord Cassel",
          role: "Antagonist (Indirect)",
          description:
            "The Throne's chief political operator. Doesn't consider himself a villain — he considers himself a realist.",
          traits: ["calculating", "charming", "amoral", "patient"],
          age: "58",
          appearance: "Immaculate. Designed to be trusted.",
        },
      ],
      world: [
        {
          id: "world-1",
          title: "Ashhold Fortress",
          content:
            "Last eastern fortification of the Ashwood Kingdom. Strategically critical, politically inconvenient. Now fallen.",
          category: "location",
        },
        {
          id: "world-2",
          title: "The Ember Throne",
          content:
            "Ceremonial seat of the Ashwood Kings, allegedly forged from the heart of the original great fire. Its symbolic power is enormous; its actual power depends on who's sitting in it.",
          category: "lore",
        },
        {
          id: "world-3",
          title: "The Reclamation",
          content:
            "Imperial historical event (~Year 717) that officially 'reclaimed' the eastern territories from the Ashborn. The actual history is considerably more complicated and deliberately obscured.",
          category: "lore",
        },
      ],
      arcs: [
        {
          id: "arc-1",
          title: "The Fall of the East",
          description: "Ashhold falls, Sera is recalled, the deception begins to unravel.",
          color: "#c9a84c",
          chapterIds: ["ch-1-1", "ch-1-2", "ch-1-3", "ch-1-4"],
        },
      ],
    },
  },
  {
    id: "book-2",
    title: "After the Last Train",
    subtitle: "",
    genre: "Literary Fiction",
    blurb:
      "Two strangers meet at a nearly deserted station on a night the last train has already gone. What unfolds over the next eight hours is a quiet collision of lives that were each, separately, falling apart.",
    authorName: "E. L. Vance",
    status: "draft",
    cover: {
      style: "minimal",
      titleColor: "#1a1a1a",
      authorColor: "#6b6b6b",
      alignment: "center",
      backgroundColor: "#e8e4df",
      overlayOpacity: 0,
    },
    targetWordCount: 60000,
    lastEditedChapterId: "ch-2-1",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-03-10T09:45:00Z",
    chapters: [
      {
        id: "ch-2-1",
        number: 1,
        title: "Platform Three",
        status: "revised",
        wordCount: 2100,
        summary:
          "James, 41, misses the last train home on purpose. He meets Nora, who didn't intend to miss hers.",
        povCharacter: "James",
        sceneLabel: "Inciting Incident",
        createdAt: "2026-01-15T10:00:00Z",
        updatedAt: "2026-03-10T09:45:00Z",
        content: `The last train had gone at 11:47, which James knew because he had watched it go.

He had been standing at the platform entrance — close enough to reach the train if he'd chosen to run, far enough that not running had felt like a decision rather than a failure. The tail lights had rounded the bend. The platform had gone quiet in that particular way that stations do after midnight, when the architecture stops trying to process human movement and simply exists.

James walked out onto the platform and sat on the single remaining bench.

The announcement board still said CANCELLED — DELAYED — CANCELLED down the line, though there were no more lines tonight. A maintenance crew somewhere was doing something that involved intermittent metallic clanging. The cold was the specific, honest cold of early March, which doesn't pretend to be anything other than what it is.

He was aware, without giving it much thought, that he had no particular plan for what came next.

"Is there actually another train?"

He looked up. She was perhaps his age, perhaps a few years younger — it was hard to tell in fluorescent light — and she was looking at the board with the expression of someone who had been hoping to be wrong about something and wasn't.

"No," he said. "Last one was twenty minutes ago."

She absorbed this. Then she sat down on the bench, at the far end, at a distance that communicated both the absence of alternatives and the presence of reasonable personal space.

"I thought I had fifteen minutes," she said.

"So did I," he said, which was not entirely true.

They sat in silence for a moment. The maintenance clanging continued somewhere beneath the platform, patient and methodical.

"I'm Nora," she said, not as an invitation, exactly — more as an acknowledgement that they were going to be here a while and names were the minimum viable information.

"James," he said.`,
      },
      {
        id: "ch-2-2",
        number: 2,
        title: "The Station Café",
        status: "draft",
        wordCount: 1650,
        summary:
          "The only café still open serves bad coffee. James and Nora talk in the way people talk when they have nothing to lose.",
        povCharacter: "James",
        sceneLabel: "Development",
        createdAt: "2026-02-01T11:00:00Z",
        updatedAt: "2026-02-15T15:30:00Z",
        content: `The café was technically closed, which the man behind the counter communicated not with words but with the very specific form of non-acknowledgement that means *I see you but I haven't seen you yet.*

James approached the counter with the quiet confidence of someone who has nothing particular to lose from a refusal.

"Any chance," he said.

The man looked at them both. He was in his sixties, with the particular tiredness of someone at the end of a long shift, and the particular clarity of someone who had long since stopped caring about rules that didn't make sense.

"Coffee's bad," he said.

"That's fine," Nora said, from just behind James's shoulder.

The man nodded once, which was apparently an agreement, and turned to the machine.

They took a table by the window. The platform was visible through the glass — empty and overlit, the kind of light that makes everything look slightly criminal.

"Are you trying to get somewhere, or away from somewhere?" Nora asked. She was wrapping her hands around the paper cup as if she needed something to hold onto.

James considered the question.

"I'm not sure there's a difference," he said.

She nodded slowly, in the way of someone who recognizes an evasion but respects it. "I have a job interview tomorrow morning," she said. "In the city. I was going to stay with a friend, but the friend—" She stopped. "It became complicated."

"What kind of job?"

"Architecture," she said. "Restoration, specifically. Old buildings." She looked out at the platform. "Things that were made to last and didn't."`,
      },
    ],
    notes: {
      arc: "Single night, real time. The story is about two people learning to be honest about what they've each been avoiding. It ends before they know what happens next — that's the point.",
      timeline: "March 4th, 2024. 11:47 PM to 7:12 AM.",
      characters: [
        {
          id: "char-2-1",
          name: "James Calloway",
          role: "Protagonist",
          description:
            "41, architect. Missed the train intentionally because going home felt impossible. He and his wife have been in the quiet, mutual grief of a failing marriage for two years.",
          traits: ["reserved", "observant", "self-aware but stuck", "dry"],
          age: "41",
        },
        {
          id: "char-2-2",
          name: "Nora Finch",
          role: "Co-Protagonist",
          description:
            "38, architectural restorer. The friend she was staying with is an ex she hasn't stopped loving, which she won't admit until roughly page 140.",
          traits: ["direct", "intelligent", "privately chaotic", "warm"],
          age: "38",
        },
      ],
      world: [],
      arcs: [
        {
          id: "arc-2-1",
          title: "The Night",
          description: "One night, two people, eight hours of honest conversation.",
          color: "#7a9e87",
          chapterIds: ["ch-2-1", "ch-2-2"],
        },
      ],
    },
  },
  {
    id: "book-3",
    title: "Salt and Starlight",
    subtitle: "The Tideborn Trilogy, Book One",
    genre: "Romance",
    blurb:
      "Marine biologist Cass Moreno returns to her coastal hometown for one summer and expects nothing more than salt air and solitude. She does not expect to fall in love with the lighthouse keeper who has been maintaining her family's property — and her grandmother's secrets — for the past three years.",
    authorName: "E. L. Vance",
    status: "completed",
    cover: {
      style: "classic",
      titleColor: "#ffffff",
      authorColor: "#c9e4f0",
      alignment: "center",
      backgroundColor: "#1a3a52",
      overlayOpacity: 0.4,
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    },
    targetWordCount: 75000,
    lastEditedChapterId: "ch-3-2",
    createdAt: "2025-06-01T08:00:00Z",
    updatedAt: "2026-01-20T17:00:00Z",
    chapters: [
      {
        id: "ch-3-1",
        number: 1,
        title: "The Return",
        status: "final",
        wordCount: 3800,
        summary: "Cass arrives at Tideborn Cove, estranged from the town and from herself.",
        povCharacter: "Cass",
        sceneLabel: "Setup",
        createdAt: "2025-06-01T08:00:00Z",
        updatedAt: "2025-10-12T14:00:00Z",
        content: `Some places hold you even when you're not there.

Cass Moreno had driven twelve hours with her windows down and the radio off, which was the kind of decision that made sense at 3 AM when she'd finally packed the car and left the apartment. By the time she pulled off the coast highway and saw the grey-green shimmer of the bay below, she had arrived somewhere between numb and something she couldn't name yet.

Tideborn Cove looked exactly the same. She didn't know why that surprised her.

The town ran along the base of a bluff in that characteristically coastal way — everything slightly salt-beaten, slightly angled toward the water, as if the buildings had been trying to orient themselves by something other than north. The harbour sat low and quiet in the early morning. A few fishing boats. The old cannery, which had become something artisanal at some point in the years she'd been away. The lighthouse on the far headland, white and clean against the August sky.

Her grandmother's house was up the coast road, past the last of the town proper. She had the key in her pocket — given to her by her grandmother's lawyer, who had handed it over with the careful neutrality of someone who knew there was a complicated family story attached to the property and had chosen not to inquire.

She parked at the bottom of the gravel drive and sat there for a moment.

The house looked — tended. That was the word. The garden wasn't wild in the way she'd expected. The porch railing had been repaired. Someone had recently painted the shutters.

The lawyer had mentioned a caretaker. She'd filed that information away and not thought about it again.

A figure emerged from the side gate — tall, moving without urgency — and stopped when he saw the car. He tilted his head slightly, the way people do when they're recalibrating a situation.

Cass got out of the car.

"You're Cass," he said. Not a question.

"You're the caretaker," she said.

He had the look of someone who spent most of his time outdoors — weathered in a way that was less about age and more about genuine exposure to elements. Late thirties, maybe. She found herself noting, in the objective scientific way of someone who spent considerable time observing animals in their habitats, that he was extremely good-looking.

"Eli Ward," he said. He didn't offer his hand, which she found she respected. "Your grandmother said you might come this summer."

"She said that?" Cass looked at the house. "She died eight months ago."

"I know," he said, gently. "She said it before that."`,
      },
      {
        id: "ch-3-2",
        number: 2,
        title: "Low Tide",
        status: "final",
        wordCount: 3600,
        summary: "The uncomfortable logistics of sharing a property. Cass begins her research. Eli is quietly, frustratingly competent at everything.",
        povCharacter: "Cass",
        sceneLabel: "Setup",
        createdAt: "2025-06-15T09:00:00Z",
        updatedAt: "2025-11-08T16:00:00Z",
        content: `The caretaker's cottage was technically separate from the main house, which meant that living arrangements were, technically, fine.

Cass told herself this while unpacking her field equipment onto her grandmother's kitchen table, which was large enough for research materials and still carried the faint smell of rosemary and something baked that she was probably imagining.

Eli Ward had offered to show her around the property, which she'd declined. He had then offered to explain the particular quirks of the plumbing, which she'd also declined. He had then — without being asked — left a handwritten note on the kitchen counter detailing the quirks of the plumbing anyway, along with information about which local shops were worth using and which weren't, and a somewhat detailed summary of the garden's current state.

She read the note three times.

The handwriting was unexpectedly good.

She went out to the beach at six in the morning with her sampling equipment and her waterproof notebook and the particular focused quiet she'd been developing for years as a method of not thinking about anything she didn't want to think about. The cove was extraordinary — she'd known this as a child, in the unreflective way of children, but seeing it now through a researcher's eye was different.

The intertidal zone alone was worth a paper.

She was in the middle of documenting a particularly interesting mussel aggregation when she became aware of another presence on the beach. She looked up.

Eli was running along the waterline, unhurriedly, in that efficient way of people for whom exercise is functional rather than performed. He ran past without appearing to notice her, which she found was somehow more irritating than being noticed would have been.`,
      },
    ],
    notes: {
      arc: "Classic romance arc with coastal setting. Slow burn, secrets about the grandmother's past, and a subplot involving the town's historic lighthouse.",
      timeline: "August through September of a single summer.",
      characters: [
        {
          id: "char-3-1",
          name: "Cass Moreno",
          role: "Protagonist",
          description: "Marine biologist, 35. Quietly avoiding her life. Uses work as structure.",
          traits: ["methodical", "independent", "secretly longing for roots", "wry"],
          age: "35",
        },
        {
          id: "char-3-2",
          name: "Eli Ward",
          role: "Love Interest",
          description: "Lighthouse keeper and property caretaker. Steady, unhurried, holds a secret he didn't choose.",
          traits: ["calm", "perceptive", "unexpectedly warm", "private"],
          age: "38",
        },
      ],
      world: [
        {
          id: "world-3-1",
          title: "Tideborn Cove",
          content: "Small coastal town, slightly out of time, with a strong fishing heritage and a growing artisanal economy that locals are still deciding how to feel about.",
          category: "location",
        },
      ],
      arcs: [
        {
          id: "arc-3-1",
          title: "The Summer",
          description: "Cass arrives, resists, discovers the secrets, and falls in love.",
          color: "#4a90b8",
          chapterIds: ["ch-3-1", "ch-3-2"],
        },
      ],
    },
  },
];

export const GENRES = [
  "Fantasy",
  "Science Fiction",
  "Literary Fiction",
  "Romance",
  "Mystery",
  "Thriller",
  "Historical Fiction",
  "Horror",
  "Young Adult",
  "Middle Grade",
  "Memoir",
  "Creative Nonfiction",
  "Other",
];

// ─── Dev-only seed helper ─────────────────────────────────────────────────

/**
 * Seeds mock books into a user's localStorage slot.
 * Call from a dev route or browser console — never from production code.
 */
export function seedDevData(userId: string): void {
  const key = `prologue_books_${userId}`;
  const seeded = mockBooks.map((b) => ({ ...b, id: `seed-${b.id}` }));
  localStorage.setItem(key, JSON.stringify(seeded));
  console.info(`[Prologue Dev] Seeded ${seeded.length} books for user ${userId}`);
}
