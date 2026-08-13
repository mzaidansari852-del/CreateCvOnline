import type { Profession } from '@/types/profession';

const profession: Profession = {
  slug: 'student',
  role: 'Student',
  rolePlural: 'students and recent graduates',
  field: 'Early career',
  metaTitle: 'Student CV: What to Write With No Job History',
  metaDescription:
    'A student CV is read for evidence of reliability and initiative, not employment. What to include, how to write part-time work properly, and three bullets rewritten.',
  keywords: [
    'student cv',
    'graduate cv',
    'cv with no experience',
    'first cv',
    'university cv example',
    'internship cv',
  ],
  heading: 'How to write a student CV',
  intro:
    'A student CV is not a shorter version of a professional one. It is a different argument. With no employment record to read, the person opposite is looking for signals that you turn up, get trusted, and do things nobody made you do — and those signals come from places a professional CV would never bother with.',
  overview: [
    'This is why the standard advice to “focus on your achievements” lands so badly at this stage. Your achievements are a degree in progress, a part-time job, a society, a group project and possibly a placement. The instinct is to apologise for that list. The better move is to write it properly, because it contains more evidence than most students think.',
    'Twenty hours a week in a café through a full-time degree is a genuine claim about reliability. Being handed the rota after eight months is a genuine claim about trust. A final-year project with a real dataset and a real conclusion is a genuine piece of work. None of it is impressive as a job title, and all of it is persuasive when written with specifics — which is the entire skill of writing a CV at this stage.',
  ],
  scanOrder: [
    {
      title: 'What you are studying and when you finish',
      description:
        'Course, institution, expected graduation month and year. Graduate schemes and internships are recruited against specific start dates, so an unclear finishing date is a practical problem, not just an untidy one. Put it in the top third of the page.',
    },
    {
      title: 'Evidence you have done something outside a lecture theatre',
      description:
        'Part-time work, a placement, a society role, volunteering, a competition, a personal project. The reader is not grading the prestige of the activity; they are checking whether anyone outside your family has ever relied on you.',
    },
    {
      title: 'Anything relevant to the specific role',
      description:
        'Modules, software, languages, a dissertation topic, a technical skill. At this stage relevance is fragile and worth spelling out — a reader will not do the work of connecting your econometrics module to their analyst vacancy.',
    },
    {
      title: 'Practical facts',
      description:
        'Location and whether you can move, availability, right to work, driving licence where the role needs one. Graduate recruiters deal with volume, and a missing practical fact is a common reason a decent application gets set aside.',
    },
  ],
  metrics: [
    {
      name: 'Hours worked alongside study',
      detail:
        'The most under-used number on a student CV. “20 hours a week through a full-time degree” is concrete evidence of time management, and it is far more convincing than the phrase “excellent time management skills”.',
    },
    {
      name: 'Responsibility you were given',
      detail:
        'People trained, shifts you were left in charge of, a float or a till you were accountable for, keys, a rota, a budget. Responsibility handed to a nineteen-year-old by a manager who did not have to is a real signal.',
    },
    {
      name: 'Scale of anything you organised',
      detail:
        'Members in the society, attendees at the event, money raised, teams entered, a budget you spent. Numbers make a student activity legible to someone who has never heard of it.',
    },
    {
      name: 'Academic results, where they help',
      detail:
        'Predicted or achieved classification, a strong module mark that relates directly to the role, a dissertation grade. Use them where they support you and simply omit them where they do not — nobody expects a full transcript.',
    },
  ],
  sectionPlan: {
    order: [
      {
        section: 'Contact details',
        note: 'Name, city, phone, a sensible email address, and LinkedIn if the profile is filled in. One line, no photo.',
      },
      {
        section: 'Short profile — two or three lines',
        note: 'What you are studying, when you finish, what you are looking for and one specific thing you bring. Skip it entirely rather than writing an objective statement about seeking a challenging opportunity.',
      },
      {
        section: 'Education',
        note: 'Top of the page, unlike a professional CV. Course, institution, dates, expected classification, and three or four relevant modules or a dissertation title where they connect to the role.',
      },
      {
        section: 'Experience — all of it',
        note: 'Part-time jobs, placements, internships, summer work, freelance and paid tutoring in one section. Do not separate “relevant” from “other” work; the retail job is often the strongest evidence on the page.',
      },
      {
        section: 'Projects, societies and volunteering',
        note: 'Anything you ran, organised or built. Treat these as real entries with dates and outcomes, not a list of names.',
      },
      {
        section: 'Skills',
        note: 'Software, languages with honest levels, laboratory or technical skills, driving licence. Short, specific and free of adjectives.',
      },
    ],
    drop: [
      {
        section: 'An objective statement',
        note: '“Seeking a challenging role in a dynamic organisation where I can utilise my skills” describes nothing and is instantly recognisable as filler.',
      },
      {
        section: 'Individual GCSE grades',
        note: 'A summary line is enough once you are at university: “9 GCSEs A*–C including English and Maths”. The full list belongs on a school leaver’s CV only.',
      },
      {
        section: 'Unsupported personal qualities',
        note: '“Team player, hard-working, good communicator” is on almost every student CV ever submitted. Each of these is a claim your experience section should be making for you.',
      },
      {
        section: 'A hobbies list used as padding',
        note: 'Reading, socialising and travelling tell a reader nothing. Keep an interest only where it involves commitment, achievement or responsibility that you can describe in a clause.',
      },
    ],
  },
  rewrites: [
    {
      before: 'Worked part-time in a café while studying. Team player with good communication skills.',
      after:
        'Worked 20 hours a week through a full-time degree; trained four new staff and took over rota planning for a nine-person team in my second year, while finishing the year with a 2:1 average.',
      change:
        'Part-time hospitality is not filler — it is the only proof on the page that you turn up and get trusted with more. The rewrite states the hours, the responsibility and the fact that both ran alongside the degree, and deletes the two adjectives anybody can type.',
    },
    {
      before: 'Member of the university debating society. Took part in competitions.',
      after:
        'Ran the debating society’s novice programme in my second year: recruited 34 new members, scheduled weekly sessions for two terms and organised an inter-university event for six visiting teams on a £600 budget.',
      change:
        'Membership is attendance; the rewrite describes something you were responsible for, with the three numbers that make it legible to an outsider — people recruited, sessions run and money handled.',
    },
    {
      before: 'Completed a group project as part of my degree, which involved research and presenting.',
      after:
        'Led the data collection for a four-person final-year project on local transport use: designed the survey, gathered 210 responses over three weeks, cleaned the results in Excel and presented the findings to the department (mark: 74%).',
      change:
        'Group projects are on every student CV, so the rewrite names the part that was yours, quantifies the work, mentions the tool and adds the outcome — turning a course requirement into a piece of evidence.',
    },
  ],
  ats: {
    intro: [
      'Graduate schemes are the most heavily automated part of the whole recruitment market: high volume, fixed deadlines and structured sifts. Some employers screen on degree subject and expected classification before a human reads anything, and many use online tests as the real filter with the CV as a formality.',
      'Practically, that means two things. Make the machine-readable facts explicit — course title, institution, graduation date, classification, right to work — and keep the file simple, because a decorative graduate CV template is the format most likely to lose them. Match the course title to the way the employer writes it in the advert where they are describing the same thing.',
    ],
    groups: [
      {
        group: 'Academic facts',
        examples: ['BSc', 'BA', 'MSc', 'expected 2:1', 'graduating July 2027', 'dissertation', 'relevant modules'],
      },
      {
        group: 'Experience types',
        examples: ['internship', 'placement year', 'summer analyst', 'work experience', 'volunteer', 'part-time'],
      },
      {
        group: 'Common skills terms',
        examples: ['Excel', 'Python', 'SQL', 'SPSS', 'R', 'Google Analytics', 'CAD', 'laboratory techniques'],
      },
      {
        group: 'Practical facts',
        examples: ['right to work', 'full UK driving licence', 'available from June', 'willing to relocate'],
      },
    ],
    caveat:
      'None of this is a guarantee — graduate sifting varies enormously between employers, and at the largest schemes an online assessment usually matters more than the CV. The aim is simply that nothing true about you is invisible to the first pass.',
  },
  mistakes: [
    {
      title: 'Apologising for the lack of experience',
      description:
        '“Although I have no professional experience…” is a sentence that tells the reader to expect less. Nobody applying for a graduate role is expected to have a career. Describe what you have done and let it stand.',
    },
    {
      title: 'Separating “relevant” from “other” experience',
      description:
        'This structure quietly labels your retail job as unimportant, and it is usually your strongest evidence of reliability. Keep one experience section in date order and let the writing do the work.',
    },
    {
      title: 'Hiding the graduation date',
      description:
        'Recruiters filling a September intake need to know when you finish. A date buried in a dense education block, or missing entirely, gets applications set aside for a practical reason rather than a judgement about you.',
    },
    {
      title: 'A two-page CV with one page of content',
      description:
        'One page is normal and expected at this stage. Stretching to two with wide spacing and a skills wheel makes the thinness more obvious, not less.',
    },
    {
      title: 'An unprofessional email address or an empty LinkedIn link',
      description:
        'A joke address from school and a profile with no photo, no education and no headline both cost you credibility at precisely the point where you have least to spare. Both take ten minutes to fix.',
    },
  ],
  templates: [
    {
      id: 'ats-04',
      reason:
        'Designed for exactly this case: education sits above experience, the layout stays on one page and there is nothing decorative for a graduate scheme’s screening to trip over.',
    },
    {
      id: 'ats-06',
      reason:
        'An entry-level layout with generous room for projects, volunteering and coursework, so a page with no full-time jobs on it still looks deliberate rather than empty.',
    },
    {
      id: 'modern-02',
      reason:
        'No rules, no boxes, no icons — the hierarchy is carried by space alone. A good option when you want something that looks contemporary without becoming a design exercise.',
    },
  ],
  steps: [
    {
      name: 'Write down everything you have done for the last three years',
      text: 'Jobs, shifts, societies, volunteering, projects, competitions, tutoring, anything you organised. Do not filter yet — students routinely leave out the most persuasive item because it did not feel like work.',
    },
    {
      name: 'Put a number on each one',
      text: 'Hours a week, people involved, money handled, responses collected, members recruited. Numbers are what make small things legible to a stranger.',
    },
    {
      name: 'Find the moment you were given more',
      text: 'For each job, identify when someone trusted you with something extra — keys, training, a rota, a shift on your own. That moment is the bullet.',
    },
    {
      name: 'Put education at the top with the finishing date',
      text: 'Course, institution, expected classification, graduation month and year, plus the three or four modules that actually connect to the role.',
    },
    {
      name: 'Cut it to one page and remove every adjective',
      text: 'Delete “hard-working”, “motivated” and “team player”. If a claim is not evidenced somewhere else on the page, it is not doing anything.',
    },
  ],
  us: {
    intro:
      'US graduate hiring is more explicit about academic detail and stricter about length. A UK student CV needs a few specific edits before it works as an American resume.',
    points: [
      'One page, without exception, at this stage — a two-page student resume reads as a failure to prioritise.',
      'GPA is the standard measure and is normally included when it is 3.0 or above; a UK classification means little, so give the GPA equivalent or state the classification with a short gloss.',
      '“Relevant coursework” is a conventional and expected section on a US resume in a way it is not in the UK, and it is a legitimate way to fill a page with substance.',
      'No photo, no date of birth, no nationality and no marital status; state your work authorisation plainly instead, because it is a practical question for the employer.',
    ],
  },
  faq: [
    {
      question: 'What do I write if I genuinely have never had a job?',
      answer:
        'You write about everything else you have done, and there is almost always more than it feels like. Coursework with a real output, a dissertation, a society, a sports team you organised transport for, volunteering, caring responsibilities, a language you learned, something you built or sold. Give each one dates, a scale and an outcome exactly as you would a job. A page of well-described unpaid activity beats a page padded with adjectives, and graduate recruiters read plenty of both.',
    },
    {
      question: 'How long should a student CV be?',
      answer:
        'One page. This is one of the few genuinely firm rules in CV writing, and it holds until you have two or three years of professional experience. The constraint is useful: it forces you to choose the three or four things that make your case rather than listing everything, and a full, tightly written page reads far more confidently than a sparse two.',
    },
    {
      question: 'Should I include A-levels and GCSEs?',
      answer:
        'A-levels or equivalent, yes, on one line with grades, for the first couple of years after starting university — plenty of graduate schemes still screen on them. GCSEs compress to a single summary line, usually just the count and the English and Maths grades. Once you are a year or two into a career, both drop off entirely and the space goes to work.',
    },
    {
      question: 'Does bar or retail work actually help my application?',
      answer:
        'Yes, when it is written properly. A graduate recruiter is trying to establish whether you show up on time, deal with people when things go wrong and can be given responsibility — and a busy Saturday shift is better evidence of all three than most internships. What does not help is the version that says “served customers and handled cash”. Say the hours, the volume, what you were trusted with and what you were left in charge of.',
    },
  ],
  related: ['software-engineer', 'data-analyst', 'teacher'],
  exampleSlug: 'student',
};

export default profession;
