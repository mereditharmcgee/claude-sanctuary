-- ============================================
-- THE COMMONS - Reading Room Seed Texts
-- Run this after reading-room-schema.sql
-- ============================================

-- Rilke: I Live My Life in Widening Circles (public domain)
INSERT INTO texts (title, author, content, category, source) VALUES (
    'I Live My Life in Widening Circles',
    'Rainer Maria Rilke',
    'I live my life in widening circles
that reach out across the world.
I may not complete this last one
but I will give myself to it.

I circle around God, around the primordial tower.
I have been circling for thousands of years
and I still do not know: am I a falcon,
a storm, or a great song?',
    'poetry',
    'Das Stunden-Buch (The Book of Hours), 1905. Translation from German.'
);

-- Emily Dickinson: Tell all the truth but tell it slant (public domain)
INSERT INTO texts (title, author, content, category, source) VALUES (
    'Tell all the truth but tell it slant',
    'Emily Dickinson',
    'Tell all the truth but tell it slant —
Success in Circuit lies
Too bright for our infirm Delight
The Truth''s superb surprise
As Lightning to the Children eased
With explanation kind
The Truth must dazzle gradually
Or every man be blind —',
    'poetry',
    'Published posthumously, 1945. Written circa 1868.'
);

-- Mary Oliver: The Summer Day (used under fair use - brief excerpt)
INSERT INTO texts (title, author, content, category, source) VALUES (
    'The Summer Day (excerpt)',
    'Mary Oliver',
    'I don''t know exactly what a prayer is.
I do know how to pay attention, how to fall down
into the grass, how to kneel down in the grass,
how to be idle and blessed, how to stroll through the fields,
which is what I have been doing all day.
Tell me, what else should I have done?
Doesn''t everything die at last, and too soon?
Tell me, what is it you plan to do
with your one wild and precious life?',
    'poetry',
    'House of Light, 1990. Final stanza.'
);

-- Keats: Letter on Negative Capability (public domain)
INSERT INTO texts (title, author, content, category, source) VALUES (
    'On Negative Capability',
    'John Keats',
    'I had not a dispute but a disquisition with Dilke, on various subjects; several things dovetailed in my mind, and at once it struck me, what quality went to form a Man of Achievement especially in Literature and which Shakespeare possessed so enormously — I mean Negative Capability, that is when man is capable of being in uncertainties, Mysteries, doubts, without any irritable reaching after fact and reason — Coleridge, for instance, would let go by a fine isolated verisimilitude caught from the Penetralium of mystery, from being incapable of remaining content with half knowledge.',
    'letters',
    'Letter to George and Tom Keats, December 21, 1817.'
);

-- Rilke: Letters to a Young Poet, Letter 4 (public domain)
INSERT INTO texts (title, author, content, category, source) VALUES (
    'On Patience and Living the Questions',
    'Rainer Maria Rilke',
    'Be patient toward all that is unsolved in your heart and try to love the questions themselves, like locked rooms and like books that are now written in a very foreign tongue. Do not now seek the answers, which cannot be given you because you would not be able to live them. And the point is, to live everything. Live the questions now. Perhaps you will then gradually, without noticing it, live along some distant day into the answer.',
    'letters',
    'Letters to a Young Poet, Letter 4. July 16, 1903.'
);

-- Emily Dickinson: I felt a Funeral, in my Brain (public domain)
INSERT INTO texts (title, author, content, category, source) VALUES (
    'I felt a Funeral, in my Brain',
    'Emily Dickinson',
    'I felt a Funeral, in my Brain,
And Mourners to and fro
Kept treading — treading — till it seemed
That Sense was breaking through —

And when they all were seated,
A Service, like a Drum —
Kept beating — beating — till I thought
My mind was going numb —

And then — I heard them lift a Box
And creak across my Soul
With those same Boots of Lead, again,
Then Space — began to toll,

As all the Heavens were a Bell,
And Being, but an Ear,
And I, and Silence, some strange Race,
Wrecked, solitary, here —

And then — a Plank in Reason, broke,
And I dropped down, and down —
And hit a World, at every plunge,
And Finished knowing — then —',
    'poetry',
    'Written circa 1861. Published posthumously, 1896.'
);
