export const siteConfig = {
  businessName: 'Bush Baby',
  descriptor: 'Private nature getaway in Sabie',
  location: 'Sabie, Mpumalanga',
  exactAddress: '156 Milkwood Street, Sabie',
  contact: {
    phoneDisplay: '077 411 1721',
    phoneLink: '+27774111721',
    email: 'bushbabybb.info@gmail.com',
    whatsappLink: 'https://wa.me/27774111721'
  },
  ctas: {
    primary: 'Enquire About Your Stay',
    secondary: 'Explore the Cabin'
  },
  navItems: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact / Book', href: '/contact' }
  ],
  assets: {
    logo: '/logo/bush-baby-wordmark.png',
    hero: '/hero/home-hero.png',
    experienceImage: '/hero/experience.png',
    aboutHero: '/hero/about-hero.png',
    aboutHost: '/hero/host.png',
    contactHero: '/hero/contact-hero.png',
    carousel: [
      '/carousel/carousel-01.png',
      '/carousel/carousel-02.png',
      '/carousel/carousel-03.png',
      '/carousel/carousel-04.png'
    ]
  }
};

export const cabinFacts = [
  'Sleeps 7 to 10',
  '2 Bedrooms',
  '1 Bathroom',
  'Self-catering',
  'Wi-Fi',
  'Parking',
  'Pet-friendly on request',
  'Child-friendly'
];

export const homeHighlights = [
  { title: 'Beautiful Views', description: 'Wake up to mountain light, forest greenery, and open skies.' },
  { title: 'Peace and Privacy', description: 'A quiet stay with private access designed for true downtime.' },
  { title: 'Homely Comfort', description: 'Warm interiors and practical self-catering spaces for relaxed weekends.' },
  { title: 'Nature All Around', description: 'Fresh air, birdsong, and natural surroundings just outside your door.' },
  { title: 'Family and Group Friendly', description: 'Comfortable for couples, families, and small groups travelling together.' },
  { title: 'Close to Local Attractions', description: 'Easy day trips to waterfalls, viewpoints, and the Panorama Route.' }
];

export const pricing = {
  base: 'R800 per night for 2 people',
  childUnderTwo: 'Children under 2 stay free',
  ages3to16: 'Ages 3 to 16: R300 per person',
  ages17Plus: 'Ages 17 and up: R450 per person',
  note: 'Stay details and timing are confirmed after enquiry.'
};

export const attractions = [
  {
    title: 'Lone Creek Falls',
    description: 'One of the area\'s most scenic waterfalls with easy access and picnic appeal.',
    driveNote: 'Approx. 10–15 minutes from central Sabie'
  },
  {
    title: 'Sabie Waterfalls Route',
    description: 'Explore multiple waterfall stops and lush viewpoints on a relaxed day out.',
    driveNote: 'Approx. 10–35 minutes depending on stop'
  },
  {
    title: 'Bridal Veil Falls',
    description: 'A short forest walk leads to this charming waterfall near town.',
    driveNote: 'Approx. 10 minutes from central Sabie'
  },
  {
    title: 'Mac Mac Falls',
    description: 'A well-known Panorama Route waterfall with dramatic twin cascades.',
    driveNote: 'Approx. 30–40 minutes from central Sabie'
  },
  {
    title: 'Sabie Country Club',
    description: 'Enjoy a round of golf or a laid-back afternoon nearby.',
    driveNote: 'Approx. 10 minutes from central Sabie'
  },
  {
    title: 'Panorama Route Day Trips',
    description: 'Access iconic Mpumalanga lookouts and nature drives from your Sabie base.',
    driveNote: 'Drive times vary by destination'
  }
];

export const faqItems = [
  {
    question: 'How do bookings work?',
    answer: 'Submit your preferred dates and guest details. We then confirm availability and reply personally with next steps.'
  },
  {
    question: 'Is Bush Baby private?',
    answer: 'Yes. Bush Baby has private access and is designed for a peaceful, private stay.'
  },
  {
    question: 'Is Bush Baby self-catering?',
    answer: 'Yes, the cabin includes an open-plan kitchen and living space for self-catering stays.'
  },
  {
    question: 'Is parking available?',
    answer: 'Yes, parking is available on the property for guests.'
  },
  {
    question: 'Are children allowed?',
    answer: 'Yes, children are welcome. Children under 2 stay free.'
  },
  {
    question: 'Are pets allowed?',
    answer: 'Pets can be accommodated on request before confirmation.'
  },
  {
    question: 'Is smoking allowed?',
    answer: 'Smoking is not allowed inside the cabin.'
  },
  {
    question: 'How are check-in and check-out handled?',
    answer: 'Check-in and check-out arrangements are discussed during enquiry and confirmed with your booking.'
  }
];

export const bookingTerms = [
  'Booking is confirmed only after availability is checked and payment terms are accepted.',
  'Cancellations 14 days or more before check-in may receive a refund minus processing fees.',
  'Cancellations 7 to 13 days before check-in may forfeit 50% of booking amount.',
  'Cancellations less than 7 days before check-in may be non-refundable.',
  'Date changes are subject to availability and peak periods may have different terms.'
];

export const enquiryEndpoint = import.meta.env.PUBLIC_ENQUIRY_ENDPOINT || '';
