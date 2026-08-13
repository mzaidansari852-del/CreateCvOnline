import type { Profession } from '@/types/profession';

const profession: Profession = {
  slug: 'teacher',
  role: 'Teacher',
  rolePlural: 'teachers',
  field: 'Public service & care',
  metaTitle: 'Teacher CV: Subject and Progress Evidence',
  metaDescription:
    'A teaching CV is read by a head of department in a hurry: subject and key stages, registration status, evidence pupils progressed, and what you carry beyond your timetable.',
  keywords: [
    'teacher cv',
    'teaching cv example',
    'nqt cv',
    'ect cv',
    'primary teacher cv',
    'secondary teacher cv',
  ],
  heading: 'How to write a teacher CV',
  intro:
    'Teaching CVs are read in a specific and unusual context: often by a head of department during a free period, against a closing date that is days away, alongside a personal statement that does most of the persuading. The CV’s job is to make the facts findable in under a minute.',
  overview: [
    'That reader has four questions. What can you teach, and to whom? Are you qualified and cleared to be in front of a class? Is there evidence that pupils learned more because you taught them? And will you carry anything beyond your own timetable — a form group, an intervention, a club, a department responsibility?',
    'Most teaching CVs answer the first two and stop. The third is where applications are actually decided, and it is where teachers are strangely reluctant to be specific — partly because attainment data is shared and contested, partly because the profession is uncomfortable with self-promotion. The way through is to name the benchmark alongside the figure, which turns a claim into a comparison a head of department can evaluate.',
  ],
  scanOrder: [
    {
      title: 'Subject and the age groups you have taught',
      description:
        'Subject specialisms, key stages or year groups, and exam boards where relevant. A head of department is filling a specific timetable gap, and this is the line that decides whether you can fill it. AQA and Edexcel are not interchangeable to someone rewriting a scheme of work in August.',
    },
    {
      title: 'Qualification and clearance status',
      description:
        'QTS or the equivalent for your jurisdiction, your training route, ECT status and how many terms are completed, and an enhanced DBS check where you hold one. These are compliance gates, and a CV that leaves them ambiguous creates work for the reader.',
    },
    {
      title: 'Evidence that pupils made progress',
      description:
        'Attainment or progress figures against a stated comparator: the previous cohort, the department average, the national picture for a similar intake. A number without a comparator is not evidence, and every experienced reader in education knows it.',
    },
    {
      title: 'What you carry beyond your own classes',
      description:
        'Form tutor, second in department, intervention lead, exam officer, trips, clubs, a curriculum rewrite, mentoring a trainee. Schools hire for the whole contribution, and this is often what decides between two similar candidates.',
    },
  ],
  metrics: [
    {
      name: 'Attainment or progress against a comparator',
      detail:
        'Grade 4+ or 5+ percentages, average point score, progress measures, phonics screening pass rates, reading age gains — always with the previous cohort, the department average or the prior-attainment baseline next to it.',
    },
    {
      name: 'Teaching load and range',
      detail:
        'Number of classes, total pupils, year groups, ability range and set. Teaching six classes across all key stages including a top set and a nurture group is a different job from teaching four middle sets, and only one of them shows range.',
    },
    {
      name: 'Intervention outcomes',
      detail:
        'Pupils targeted, how the group was selected, what the intervention was, and the movement in the group compared with pupils who did not receive it. This is the most persuasive kind of bullet a classroom teacher can write.',
    },
    {
      name: 'Responsibility scale',
      detail:
        'Size of the department or team you support, number of trainees or ECTs mentored, budget for a subject or trip, pupils in your form or year group.',
    },
  ],
  sectionPlan: {
    order: [
      {
        section: 'Contact and status line',
        note: 'Name, city, phone, email, plus QTS and DBS status in one short line. Availability from a stated date matters more in teaching than in most fields because of the recruitment calendar.',
      },
      {
        section: 'Profile — three or four lines',
        note: 'Subject, key stages, years of experience, and one thing you are known for. Keep it short: the personal statement is where the argument goes, and repeating it here wastes the page.',
      },
      {
        section: 'Qualifications',
        note: 'High on the page: QTS route and year, degree with subject and classification, PGCE or equivalent. In teaching these are checked early, unlike most professions where education drops to the bottom.',
      },
      {
        section: 'Teaching experience',
        note: 'Reverse chronological, each school with its type and context — comprehensive, academy, independent, sixth-form college, intake size, Ofsted or inspection category if it helps you — then your classes and results.',
      },
      {
        section: 'Responsibilities and whole-school contribution',
        note: 'Form tutoring, subject leadership, interventions, clubs, trips, CPD delivered, working parties. Group it rather than scattering it through the job entries.',
      },
      {
        section: 'Professional development',
        note: 'Safeguarding and Prevent training with dates, subject CPD, NPQ or middle-leadership programmes, exam board training and examiner work.',
      },
    ],
    drop: [
      {
        section: 'A restated personal statement',
        note: 'Most teaching applications require a separate supporting statement. Duplicating it on the CV costs you the space where your data should be.',
      },
      {
        section: 'Every school placement in detail',
        note: 'Once you have two years of post-qualification experience, training placements compress to one line each.',
      },
      {
        section: 'Generic classroom-management adjectives',
        note: '“Passionate about teaching”, “creates a positive learning environment”, “builds excellent relationships with pupils”. Universal claims, no evidence, and the reader has seen forty of them this week.',
      },
      {
        section: 'A photograph',
        note: 'Not conventional on UK teaching applications and adds nothing. Many local-authority and trust portals strip it anyway.',
      },
    ],
  },
  rewrites: [
    {
      before: 'Taught mathematics to students of all abilities and prepared them for exams.',
      after:
        'Taught GCSE and A-level mathematics across five classes (150 pupils, sets 1–4, AQA); redesigned the Year 11 intervention scheme and lifted grade 5+ attainment from 58% to 71% across two cohorts, against a departmental average of 62%.',
      change:
        'A percentage only becomes evidence when there is a benchmark beside it; the rewrite adds the exam board, the load, the ability range and a comparator, and shows the improvement was designed rather than inherited from a strong year group.',
    },
    {
      before: 'Planned and delivered engaging lessons in line with the national curriculum.',
      after:
        'Rewrote the Key Stage 3 science scheme of work around a knowledge-retrieval model, producing 36 lessons and a common assessment now used by all four teachers in the department; end-of-year assessment scores rose by an average of nine percentage points on the previous cohort.',
      change:
        'Planning lessons is the job, so the rewrite moves to what was produced, how widely it was adopted, and the measured effect — “engaging” has been replaced by something a head of department can verify by asking one question.',
    },
    {
      before: 'Supported pupils with special educational needs and worked with teaching assistants.',
      after:
        'Directed two teaching assistants across a class with nine pupils on the SEND register, co-writing scaffolded materials for four EHCP pupils; all four met or exceeded their end-of-year targets and the department adopted the scaffolding format for Key Stage 4.',
      change:
        'The original describes proximity to the work; the rewrite quantifies the need in the room, names your role in directing other adults, and reports both the pupil outcome and the fact that colleagues took up what you made.',
    },
  ],
  ats: {
    intro: [
      'Teaching recruitment is different from most professions in one important way: a large share of applications go through a school or trust application form rather than a CV upload, and many of those forms strip formatting entirely. Where a CV is accepted, it is often read alongside the form rather than instead of it.',
      'That has two consequences. Keep the file plain enough to survive being pasted into a text box, and make sure the terms a school searches on appear in your own wording: subject, key stages, exam boards, QTS route, safeguarding. Where a trust does use automated screening, these are the strings it will be looking for.',
    ],
    groups: [
      {
        group: 'Status and qualification',
        examples: ['QTS', 'ECT', 'PGCE', 'School Direct', 'Teach First', 'enhanced DBS', 'NPQ'],
      },
      {
        group: 'Curriculum and stages',
        examples: ['Key Stage 2', 'Key Stage 3', 'Key Stage 4', 'GCSE', 'A-level', 'BTEC', 'EYFS', 'national curriculum'],
      },
      {
        group: 'Exam boards',
        examples: ['AQA', 'Edexcel', 'OCR', 'WJEC', 'Cambridge International', 'IB'],
      },
      {
        group: 'Practice terms',
        examples: [
          'safeguarding',
          'SEND',
          'EHCP',
          'differentiation',
          'formative assessment',
          'behaviour management',
          'pupil premium',
          'phonics',
        ],
      },
    ],
    caveat:
      'No wording guarantees a shortlisting, and in teaching the supporting statement usually carries more weight than keyword matching. Treat this as a list of things a reader will look for and be unhappy not to find, rather than as a filter to satisfy.',
  },
  mistakes: [
    {
      title: 'No data anywhere',
      description:
        'The most common gap in teaching CVs. Attainment data is contested and imperfect, but a reader who sees none at all has nothing to distinguish you from every other applicant with the same subject and key stages.',
    },
    {
      title: 'Figures with no comparator',
      description:
        '“78% achieved a grade 4 or above” could be excellent or poor depending on the intake. Always attach the departmental average, the previous cohort or the prior-attainment baseline.',
    },
    {
      title: 'Omitting safeguarding and mandatory training',
      description:
        'Safeguarding training, Prevent, and the status of your DBS check are compliance facts a school has to establish. Leaving them off means somebody has to ask, and creating work for a busy recruiter is never neutral.',
    },
    {
      title: 'Not naming exam boards or specifications',
      description:
        'A department taking on a Year 11 class mid-specification cares a great deal whether you have taught their board. It costs four characters to say.',
    },
    {
      title: 'Hiding a career change or a return to teaching',
      description:
        'Career changers and returners are actively recruited in shortage subjects, but the CV has to explain the shape of the timeline rather than leaving a reader to reconstruct it. One clear line about what you were doing and why you came back is enough.',
    },
  ],
  templates: [
    {
      id: 'classic-02',
      reason:
        'Headings sit out in the left margin so every line of content shares one clean edge — ideal for a CV with a lot of short factual entries: classes, results, responsibilities and training.',
    },
    {
      id: 'classic-01',
      reason:
        'Centred capitals and ruled headings: the conventional shape most schools and local authorities expect, and a document that photocopies and prints without surprises.',
    },
    {
      id: 'ats-03',
      reason:
        'Stripped back to text alone. The right choice when a trust’s application portal is going to convert your file, because there is nothing in it that can be lost in the conversion.',
    },
  ],
  steps: [
    {
      name: 'Collect your data before you write',
      text: 'Attainment and progress figures for your classes, the comparators you are allowed to quote, intervention group results, and the number of pupils in each class. Ask a head of department for the departmental averages if you do not hold them.',
    },
    {
      name: 'Put the compliance facts in the header',
      text: 'QTS with the year and route, ECT terms completed, DBS status, and the date you are available from. One line, at the top, where nobody has to hunt for it.',
    },
    {
      name: 'Give every school a context line',
      text: 'Type of school, intake size, catchment, and the ability range you taught. The same results mean different things in different settings, and the reader will make an assumption if you do not tell them.',
    },
    {
      name: 'Write one intervention bullet per role',
      text: 'A group you targeted, why they were selected, what you did, and how they moved compared with pupils who did not get it. This is the bullet heads of department remember.',
    },
    {
      name: 'Group the whole-school contribution',
      text: 'Pull form tutoring, clubs, trips, CPD, mentoring and working parties into one block rather than scattering them, so the reader can see the whole contribution at once.',
    },
  ],
  us: {
    intro:
      'US school hiring uses different credentials, different structural vocabulary and a résumé rather than a CV, so a UK teaching CV needs genuine translation rather than reformatting.',
    points: [
      'Licensure is state by state: name the state, the licence type and the endorsement areas, plus Praxis results where you have them. QTS on its own is not a recognised credential in most US districts.',
      'Grade levels, not key stages: say “grades 9–12” rather than “Key Stage 4”, and translate GCSE and A-level into the nearest equivalents when describing what you taught.',
      'One to two pages as a résumé, with certifications high on the page and a short skills-and-endorsements block; the long supporting statement common in UK applications is usually replaced by a cover letter.',
      'Standardised assessment vocabulary differs by state — reference the specific assessments your district uses rather than assuming any UK measure will be understood.',
    ],
  },
  faq: [
    {
      question: 'How long should a teaching CV be?',
      answer:
        'Two pages, and two full pages is normal in this profession rather than a warning sign. Teachers accumulate genuinely relevant material — subjects, key stages, exam boards, responsibilities, training, safeguarding — and a school would rather read it than have to ask. What should not spill onto a third page is a restatement of your personal statement or a full account of your training placements once you are two years past them.',
    },
    {
      question: 'How do I present supply and cover work?',
      answer:
        'Group it rather than listing every school. “Supply teaching across eleven secondary schools in Greater Manchester, September 2023 – July 2024, mainly Key Stage 3 and 4 science, including two long-term placements of a term or more” reads as a deliberate period of work. Then give the long-term placements their own short entries with classes and outcomes, because those are the ones where you can show progress data. Supply work is common and unremarkable to a head of department; a vague year is what raises questions.',
    },
    {
      question: 'I am changing career into teaching. What goes on the CV?',
      answer:
        'Lead with the training route and the classroom experience you have, however short, then use your previous career as subject credibility rather than as the main event. An engineer training to teach physics should say so explicitly — industry experience is a genuine selling point in shortage subjects and schools will use it in their own marketing. Keep the previous career to one compressed block with the transferable specifics, and put your placements, key stages and any data you have above it.',
    },
    {
      question: 'Should the CV repeat what is in the supporting statement?',
      answer:
        'No. They do different jobs: the statement argues, the CV evidences. If your statement describes your approach to assessment, the CV should carry the assessment data, the schemes of work you wrote and the training you delivered — not the same paragraph in shorter form. A CV that duplicates the statement wastes the only place in the application where a reader can check facts quickly, and in teaching recruitment the reader is nearly always short of time.',
    },
  ],
  related: ['student', 'nurse', 'project-manager'],
};

export default profession;
