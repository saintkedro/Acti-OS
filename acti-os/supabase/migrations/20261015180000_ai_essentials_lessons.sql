-- Fill AI Essentials into a complete free course.
-- Safe to run more than once. Existing enrolments keep their progress.
-- New required lessons mean a course is complete only after all five are done.

insert into public.course_modules (id, course_id, title, summary, sort_order)
values (
  'a1e55000-0000-4000-8000-000000000012',
  'a1e55000-0000-4000-8000-000000000001',
  'Asking and checking',
  'How to brief a tool, review the draft, and protect private information.',
  2
)
on conflict (id) do update set
  title = excluded.title,
  summary = excluded.summary,
  sort_order = excluded.sort_order;

update public.short_courses set
  summary = 'A free introduction to using AI tools with care at work and in study.',
  description = 'AI Essentials is a short course on working with AI tools. You will see what they are useful for, where they go wrong, and how to keep the final judgement with you.

Five lessons cover the tool itself, the mistakes it makes, how to brief it, how to review a draft before it goes out, and what should never be pasted into a public tool. Each lesson includes a video from Google or IBM. The written lesson is what the check is based on.

Mark each lesson complete as you finish it, then take the check. The pass mark is 60 percent, and you have three attempts.',
  audience = 'Students, job seekers, and people who use AI tools in a small business or at work.',
  outcomes = array[
    'Explain what an AI tool can and cannot do in everyday work.',
    'Spot a confident answer that may still be wrong.',
    'Write an instruction that names the task, the audience, and what done looks like.',
    'Edit a draft before you treat it as a message you will send.',
    'Keep private customer, student, and account details out of a public tool.'
  ],
  duration_label = 'About 1 hour',
  estimated_minutes = 60,
  intro_video_url = 'https://www.youtube.com/watch?v=8BNo1sM7wFw',
  keywords = 'artificial intelligence, AI, workplace, introduction, free, prompting'
where id = 'a1e55000-0000-4000-8000-000000000001';

update public.course_modules set
  summary = 'What these tools are for, and where an answer still needs your judgement.'
where id = 'a1e55000-0000-4000-8000-000000000011';

insert into public.course_lessons (
  id, course_id, module_id, slug, title, summary, lesson_type, body,
  video_url, video_duration_seconds, transcript, estimated_minutes,
  is_required, sort_order, publication_status
) values
(
  'a1e55000-0000-4000-8000-000000000021',
  'a1e55000-0000-4000-8000-000000000001',
  'a1e55000-0000-4000-8000-000000000011',
  'what-ai-means-for-work',
  'What AI means for everyday work',
  'What these tools can take on, and what remains your responsibility.',
  'text_video',
  $body$You have likely already used a tool that drafts a reply, summarises a page, or creates an image from a sentence. That is the kind of AI this course covers.

The tool is not a colleague on the other side of the chat. It has been trained on a very large amount of text, and it predicts what is likely to come next. That is why an answer can sound assured and still be wrong.

In day-to-day work it is useful for a first draft: a customer message, a summary of notes you already have, a set of options for a lesson, or a cleaner version of something you wrote quickly.

It should not make the final decision. It does not know your customer, your timetable, or what happened in the business this morning. If you did not provide a fact, it may supply one that only sounds right.

The video on this page is from Google Cloud. It runs for about twenty minutes and introduces generative AI. The course check is based on this lesson, so watch the parts that help you and then come back to the page.

Three working habits:

• Ask for a draft, not a decision.
• Check names, numbers, dates, and prices against a source you trust.
• Keep private customer or student information out, unless your organisation has approved that specific tool.

The next lessons cover the mistakes these tools make, how to brief one, and how to review a draft before it is sent.$body$,
  'https://www.youtube.com/watch?v=cZaNf2rA30k',
  1322,
  $body$If the video will not play: these tools produce a likely answer from patterns in their training. They can start a draft. They do not know your workplace, and a confident tone is not the same as a verified fact.$body$,
  15,
  true,
  1,
  'published'
),
(
  'a1e55000-0000-4000-8000-000000000023',
  'a1e55000-0000-4000-8000-000000000001',
  'a1e55000-0000-4000-8000-000000000011',
  'what-the-tool-gets-wrong',
  'What the tool gets wrong',
  'A polished sentence can still be an invention.',
  'text_video',
  $body$A tool can produce a sentence that looks finished. The tone is polite. The date is specific. The name is spelled as you would expect. None of that makes the sentence true.

This is often called a hallucination. The tool has filled a gap with something that fits the pattern, not with something it has verified.

Take a real request. You ask when order 1842 will arrive, and you do not provide a date. The tool replies, "Your order will arrive on Thursday." Thursday was invented. If that message goes to a customer, the invention is now yours.

The same risk shows up in study. The tool may name a book that does not exist, or cite a rule you cannot find. If you cannot point to the source, it does not belong in your work.

The video on this page is from IBM. In about nine minutes it explains why these errors happen, and it offers techniques for reducing them. The later techniques are aimed at people who build AI systems. For this lesson, the point to take away is that a fluent answer can still be false.

When a detail looks too tidy:

• Check it against your records, an official source, or the person who actually knows.
• If you cannot verify it, remove it and say you will confirm.
• Do not add private information in the hope of making the draft more accurate. A wrong draft that contains real customer data is a more serious problem.

You will not catch every error. You are responsible for not passing one on as if you had checked it.$body$,
  'https://www.youtube.com/watch?v=ZFKvTIADp0k',
  534,
  $body$If the video will not play: a hallucination is a confident detail the tool invented. Check it against a source you trust, or delete it.$body$,
  12,
  true,
  2,
  'published'
),
(
  'a1e55000-0000-4000-8000-000000000022',
  'a1e55000-0000-4000-8000-000000000001',
  'a1e55000-0000-4000-8000-000000000012',
  'how-to-ask-for-a-useful-answer',
  'How to ask for a useful answer',
  'Name the task, who will read it, and what a finished draft includes.',
  'text_video',
  $body$A useful result starts with a clear brief. "Write something" produces something vague. A specific instruction gives the tool a job it can complete.

Put three parts in the brief. One paragraph is enough.

1. The task. What should it produce?
2. The audience. Who will read it?
3. The standard. Length, tone, and what must be included or left out.

A weak brief: "Reply to this customer."

A stronger brief: "Draft a reply to a customer who asked when order 1842 will arrive. They are already unhappy. Use five short sentences. Apologise once. Do not invent a delivery date. Say I will confirm the date today."

You have not handed over the decision. You have described the draft, and you have named the fact the tool must not invent.

The short video on this page is from Google Cloud. It uses a baking example to show what happens when the brief leaves out the details that matter. Watch it, then try the three-part brief on a message you actually need to write.

When the draft comes back, read it aloud. If you would not say a line to the person in front of you, change it or delete it.$body$,
  'https://www.youtube.com/watch?v=RywP7cCYUWE',
  null,
  $body$If the video will not play: name the task, who will read it, and what a finished answer includes. Tell the tool which facts it must not invent.$body$,
  12,
  true,
  1,
  'published'
),
(
  'a1e55000-0000-4000-8000-000000000024',
  'a1e55000-0000-4000-8000-000000000001',
  'a1e55000-0000-4000-8000-000000000012',
  'read-the-draft-before-you-send-it',
  'Read the draft before you send it',
  'Keep the lines you can stand behind, and cut the rest.',
  'text_video',
  $body$The draft is not the message you send. You are still the author.

Take the customer reply from the last lesson. Suppose the tool writes this:

"Dear customer, we are very sorry for the delay. Your order 1842 will arrive on Thursday by 2pm. Thank you for your patience. We value you."

Read it before it goes out, the way you would read a note from a new colleague.

• "Dear customer" is distant when you know the person's name. Use the name from your own records, not one the tool guessed.
• "Thursday by 2pm" was not in your brief. You asked it not to invent a date, and it did so anyway. Delete that sentence.
• One apology is enough. If it apologises three times, cut the extras.
• "We value you" adds nothing. If you would not say it at the counter, take it out.

A version you can send:

"Hello Ada, I am sorry your order is still on the way. I do not have a delivery time I can promise yet. I will check with the store and message you today."

The name stays because you know it. The date goes because you do not. That is the review.

The one-minute video on this page is from Google. It makes the same distinction: the tool can start the work, and you check anything presented as fact. You may already have seen it on the course page. Watch it here, then edit the example.

Before you mark this lesson complete, try it once. Put a rough note of your own into a tool your organisation allows, or rewrite the example by hand. Change every line you cannot stand behind.$body$,
  'https://www.youtube.com/watch?v=8BNo1sM7wFw',
  65,
  $body$If the video will not play: you remain the author. Remove any fact you did not supply and cannot verify, then send only the lines you would say in person.$body$,
  12,
  true,
  2,
  'published'
),
(
  'a1e55000-0000-4000-8000-000000000025',
  'a1e55000-0000-4000-8000-000000000001',
  'a1e55000-0000-4000-8000-000000000012',
  'what-you-should-not-paste-in',
  'What you should not paste in',
  'A chat on your screen is not a private channel.',
  'text_video',
  $body$A chat on your own screen can feel private. A public AI tool is not a private channel. If you would not pin the text on a noticeboard, do not paste it in.

Leave these out:

• A customer's name together with a phone number, address, or order history
• A student's name together with grades, health notes, or family details
• Passwords, bank details, and identity numbers
• Anything your organisation has marked confidential

You can still ask for a useful draft. Use a fictional example.

Instead of naming a real customer, their phone number, and the amount they owe, try: "Draft a polite reminder about an unpaid invoice. Do not include a real name, phone number, or amount. Leave a blank where I will add those myself."

Add the real details afterwards, in your own email or records.

The video on this page is from Google Cloud. It runs for about eight minutes and covers responsible use: privacy, fairness, and being able to account for what a tool did. The working rule is more direct. If your organisation has not approved that tool for private records, keep the records out.

Never put a password in a prompt. Not to help the tool sign in, not to test it, and not as an example.

When you have finished the five lessons, take the check. The pass mark is 60 percent, and you have three attempts.$body$,
  'https://www.youtube.com/watch?v=w_3L1Bf2P_g',
  null,
  $body$If the video will not play: do not paste customer records, student records, passwords, or confidential files into a public tool. Ask for a draft with a fictional example, then add the real details yourself.$body$,
  10,
  true,
  3,
  'published'
)
on conflict (id) do update set
  module_id = excluded.module_id,
  slug = excluded.slug,
  title = excluded.title,
  summary = excluded.summary,
  lesson_type = excluded.lesson_type,
  body = excluded.body,
  video_url = excluded.video_url,
  video_duration_seconds = excluded.video_duration_seconds,
  transcript = excluded.transcript,
  estimated_minutes = excluded.estimated_minutes,
  is_required = excluded.is_required,
  sort_order = excluded.sort_order,
  publication_status = excluded.publication_status;

insert into public.lesson_resources (id, lesson_id, title, external_url, sort_order)
values
  ('a1e55000-0000-4000-8000-000000000201', 'a1e55000-0000-4000-8000-000000000021', 'Open the video on YouTube: Introduction to Generative AI (Google Cloud)', 'https://www.youtube.com/watch?v=cZaNf2rA30k', 1),
  ('a1e55000-0000-4000-8000-000000000202', 'a1e55000-0000-4000-8000-000000000023', 'Open the video on YouTube: What AI gets wrong (IBM Technology)', 'https://www.youtube.com/watch?v=ZFKvTIADp0k', 1),
  ('a1e55000-0000-4000-8000-000000000203', 'a1e55000-0000-4000-8000-000000000022', 'Open the video on YouTube: How to ask for a better answer (Google Cloud)', 'https://www.youtube.com/watch?v=RywP7cCYUWE', 1),
  ('a1e55000-0000-4000-8000-000000000204', 'a1e55000-0000-4000-8000-000000000024', 'Open the video on YouTube: Five things to know before you rely on an answer (Google)', 'https://www.youtube.com/watch?v=8BNo1sM7wFw', 1),
  ('a1e55000-0000-4000-8000-000000000205', 'a1e55000-0000-4000-8000-000000000025', 'Open the video on YouTube: Introduction to Responsible AI (Google Cloud)', 'https://www.youtube.com/watch?v=w_3L1Bf2P_g', 1)
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  title = excluded.title,
  external_url = excluded.external_url,
  sort_order = excluded.sort_order;

update public.course_assessments set
  instructions = 'Answer all five questions. The pass mark is 60%, and you have up to 3 attempts. The lessons are the basis of the check. The videos are there to support them.',
  module_id = 'a1e55000-0000-4000-8000-000000000012'
where id = 'a1e55000-0000-4000-8000-000000000031';

insert into public.assessment_questions (
  id, assessment_id, prompt, question_type, explanation, points, sort_order
) values
(
  'a1e55000-0000-4000-8000-000000000044',
  'a1e55000-0000-4000-8000-000000000031',
  'An AI draft includes a delivery time you never gave it. What should you do?',
  'multiple_choice',
  'A specific detail can still be invented. If you cannot verify it, take it out. Asking the tool if it is sure is not a check.',
  1,
  4
),
(
  'a1e55000-0000-4000-8000-000000000045',
  'a1e55000-0000-4000-8000-000000000031',
  'Which of these is acceptable to put into a public AI tool?',
  'multiple_choice',
  'Use a fictional example when you need a draft. Add real names, numbers, and contact details yourself afterwards, in a place your organisation already trusts.',
  1,
  5
)
on conflict (id) do update set
  prompt = excluded.prompt,
  question_type = excluded.question_type,
  explanation = excluded.explanation,
  points = excluded.points,
  sort_order = excluded.sort_order;

insert into public.assessment_options (id, question_id, label, is_correct, sort_order) values
  ('a1e55000-0000-4000-8000-000000000131', 'a1e55000-0000-4000-8000-000000000044', 'Send it, because a specific time sounds reliable.', false, 1),
  ('a1e55000-0000-4000-8000-000000000132', 'a1e55000-0000-4000-8000-000000000044', 'Remove the time and only keep words you can stand behind.', true, 2),
  ('a1e55000-0000-4000-8000-000000000133', 'a1e55000-0000-4000-8000-000000000044', 'Paste the customer''s home address so the next draft is more accurate.', false, 3),
  ('a1e55000-0000-4000-8000-000000000134', 'a1e55000-0000-4000-8000-000000000044', 'Ask the tool whether it is sure, and send the message if it says yes.', false, 4),
  ('a1e55000-0000-4000-8000-000000000141', 'a1e55000-0000-4000-8000-000000000045', 'A student''s name and grades.', false, 1),
  ('a1e55000-0000-4000-8000-000000000142', 'a1e55000-0000-4000-8000-000000000045', 'Your account password, so the tool can check a login problem.', false, 2),
  ('a1e55000-0000-4000-8000-000000000143', 'a1e55000-0000-4000-8000-000000000045', 'A customer''s phone number and order history.', false, 3),
  ('a1e55000-0000-4000-8000-000000000144', 'a1e55000-0000-4000-8000-000000000045', 'A made-up example with no real names, numbers, or contact details.', true, 4)
on conflict (id) do update set
  question_id = excluded.question_id,
  label = excluded.label,
  is_correct = excluded.is_correct,
  sort_order = excluded.sort_order;
