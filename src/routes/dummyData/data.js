const programsList = [
  {
    id: 1,
    progress: 3,
    total: 5,
    title: "Better family health",
    shortDescription: "Family active play doesn’t have to be complicated. It can include a walk to the shops or dancing around the lounge room."
  },
  {
    id: 2,
    progress: 6,
    total: 10,
    title: "Play time with kids",
    shortDescription: "While children do need time to play alone and with other children without adult intervention, research shows that playtime with parents is also important."
  }
]

const individualPrograms = [
  {
    id: 1,
    title: "Better family health",
    description: "",
    goals: [],
    sections: [],
    modules: [
      {
        id: 1,
        title: "Everyone can play!",
        shortDescription: "Active play is important for everyone in the family: adults and children!",
        status: 'Complete',
        goalStatus: true,
        favouriteStatus: false

      },
      {
        id: 2,
        title: "Families play together",
        shortDescription: "Active play is important for everyone in the family: adults and…",
        status: 'Incomplete',
        goalStatus: true,
        favouriteStatus: true
      },
      {
        id: 3,
        title: "Switch on Play",
        shortDescription: "It is recommended that children under 2 years of age spend no time watching TV or other screens.",
        status: 'Incomplete',
        goalStatus: false,
        favouriteStatus: false
      },
      {
        id: 4,
        title: "Active play for healthy, happy, smart kids",
        shortDescription: "Physical activity (or active play) in young children can lead to improved physical, mental and cognitive health outcomes.",
        status: 'Incomplete',
        goalStatus: false,
        favouriteStatus: false
      },
      {
        id: 5,
        title: "Everywhere is fit for play",
        shortDescription: "While time outdoors is important, children can be active anywhere and everywhere.",
        status: 'Incomplete',
        goalStatus: false,
        favouriteStatus: false
      },
      {
        id: 5,
        title: "Play to sleep and sleep to play",
        shortDescription: "Watching TV (or using any screens) in the hours leading up to bedtime has detrimental effects on children’s sleep.",
        status: 'Incomplete',
        goalStatus: false,
        favouriteStatus: false
      },
      {
        id: 6,
        title: "Screens and sleep should never meet",
        shortDescription: "To encourage no screens in bedrooms or around bedtime.",
        status: 'Incomplete',
        goalStatus: false,
        favouriteStatus: false
      },
    ]
  },
  {
    id: 2,
    title: "Program 2",
    description: "",
    goals: [],
    sections: [],
    modules: [
      {
        id: 7,
        title: "Get outside to get moving",
        shortDescription: "Outdoor play is a big part of healthy growth, learning, development and wellbeing for your child. Read fun ideas to get babies and children playing outside.",
        status: 'Complete',
        goalStatus: false,
        favouriteStatus: false
      },
      {
        id: 8,
        title: "Get up and play!",
        shortDescription: "Sedentary behaviour refers to behaviours undertaken in a sitting position, requiring very little energy expenditure.",
        status: 'Incomplete',
        goalStatus: false,
        favouriteStatus: false
      },
      {
        id: 9,
        title: "Mix up your moving",
        shortDescription: "This is fun module.",
        status: 'Incomplete',
        goalStatus: false,
        favouriteStatus: false
      },
      {
        id: 10,
        title: "Mostly play everyday",
        shortDescription: "To promote majority of everyday should be spent in active play.",
        status: 'Incomplete',
        goalStatus: false,
        favouriteStatus: false
      },
      {
        id: 11,
        title: "Play skills for life ",
        shortDescription: "Fundamental movement skills are a set of basic gross motor skills that form the foundation of physical movement and are needed for physical activity and sport as children get older.",
        status: 'Incomplete',
        goalStatus: false,
        favouriteStatus: false
      },
    ]
  }
]

const moduleOne = {
  id: 1,
  title: "Everyone can play",
  goalStatus: 'true',
  favouriteStatus: true,
  section: [
    {
      type: "text",
      value: "Active play is important for everyone in the family: adults and children!"
      // ^to be filled by Nirav
    },
    {
      type: "video",
      value: "https://www.youtube.com/embed/3cAU7lgtiEk"
      // ^to be filled by Nirav
    }
  ],
  tasks: [
    {
      id: 1,
      title: "Task 1",
      shortDescription: "Information related to task 1",
      status: 'Incomplete',
      // ^to be filled by Nirav
    },
    {
      id: 2,
      title: "Task 2",
      shortDescription: "Information related to task 2",
      status: 'Incomplete',
      // ^to be filled by Nirav
    }
  ],
  activities: [
    {
      id: 1,
      title: "Activity 1",
      shortDescription: "Aim to make playing together as a family a fun part of your everyday life.",
      status: 'Incomplete',
      // ^to be filled by Nirav
    },
    {
      id: 2,
      title: "Activity 2",
      shortDescription: "Family active play doesn’t have to be complicated. It can include a walk to the shops or dancing around the lounge room.",
      status: 'Incomplete',
      // ^to be filled by Nirav
    }
  ],
  goals: [],
  refreshers: [],
  pills: [],
  notifications: [],
  prerequisites: [],
  resources: {
    title: 'Resources',
    shortDescription: 'Module specific external resources',
  }
}

const activityOne = {
  id: 1,
  section: [
    {
      type: "text",
      value: "Do: Choose activities that your family enjoys and that fit in with your family routine. \n Try to include a couple of new activities for your family to try that you wouldn’t usually do. \n Write up your plan and put it somewhere everyone can see (like on the fridge). \n Keep track of how your family goes across the week (tick off the activities you manage to do). \n Keep using the planner and change up some of the activities from week to week"
      // ^to be filled by Nirav
    },
    {
      type: "text",
      value: "Don’t: Give up if you don’t manage to keep to your plan. Keep trying! The benefits of active play for    your family are worth it. \n Feel like you have to follow your plan exactly – if you can’t manage the trip to the park you’d             planned for Monday, swap with the dance party you’d planned for Wednesday instead. The most important thing is to have some family active time every day!"
      // ^to be filled by Nirav
    }
  ]
}

const taskOne = {
  id: 1,
  type: "QUIZ",
  data: {
    type: "ONE_CHOICE",
    questionSet: [
      {
        id: 1,
        question: "It’s important for families to be active together because",
        options: [
          "Adults and children need physical activity (active play) to be happy and healthy.",
          "Children tend to be more active if an adult is being active with them ",
          "Playing actively together helps families to bond and have happy relationships",
          "Children seeing their parents being active teaches them that active play is important and fun",
          "All of the above"
        ],
        popup: [
          "You are partially correct. Actually families get all of these benefits from being active together",
          "You are partially correct. Actually families get all of these benefits from being active together",
          "You are partially correct. Actually families get all of these benefits from being active together",
          "You are partially correct. Actually families get all of these benefits from being active together",
          "Correct! Families get all of these benefits from being active together",
        ],
      },
      {
        id: 2,
        question: "Does family active play need to involve an outing?",
        options: [
          "Yes", "No"
        ],
        popup: [
          "Family active play doesn’t need to involve an outing, it can be any active play a family does together like dancing, gardening, or kicking a ball around the backyard. You might like to remind yourself of some ideas for family active play here [link to ‘be an active family’ infographic] or by watching this video”[link to video]",
          "Correct! Family active play can be any active play a family does together like dancing, gardening, kicking a ball, going for a walk or to the park.",
        ],
      },
      {
        id: 3,
        question: "Fundamental movement skills will eventually develop whether children practice them or not.",
        options: [
          "Yes", "No"
        ],
        popup: [
          "In the same way that children need to be taught the alphabet before they learn to read, they also need to learn and practice fundamental movement skills to provide them with the necessary skills to participate in physical activity and sport.",
          "Correct! It’s important for children to learn and practice fundamental movement skills to provide a foundation for physical activity and sport participation throughout life.",
        ],
      },
    ]
  }
}

const links = [
  {
    type: 'title',
    data: {
      text: "Finding a new park to explore as a family can be a great activity. Here are some links to help you find parks and playgrounds in your area."
    }
  },
  {
    type: 'link',
    data: {
      title: "Find a playground in your area",
      url: "http://www.playgroundfinder.com/"
    }
  },
  {
    type: 'text',
    data: { text: 'Find a park in your area' }
  },
  {
    type: 'link',
    data: {
      title: "Victoria",
      url: "http://parkweb.vic.gov.au/explore/parks"
    }
  },
  {
    type: 'link',
    data: {
      title: "New South Wales",
      url: "http://www.nationalparks.nsw.gov.au/visit-a-park"
    }
  },
  {
    type: 'link',
    data: {
      title: "South Australia",
      url: "http://www.environment.sa.gov.au/parks/Find_a_Park"
    }
  },
  {
    type: 'link',
    data: {
      title: "Queensland",
      url: "http://www.nprsr.qld.gov.au/parks/index.php"
    }
  },
  {
    type: 'link',
    data: {
      title: "Northern Territory",
      url: "https://nt.gov.au/leisure/parks-reserves"
    }
  },
  {
    type: 'link',
    data: {
      title: "Western Australia",
      url: "https://parks.dpaw.wa.gov.au/park-finder"
    }
  },
  {
    type: 'link',
    data: {
      title: "Tasmania",
      url: "http://www.parks.tas.gov.au/index.aspx?base=1"
    }
  }
]

const favouriteModules = [
  {
    id: 2,
    title: "Families play together",
    shortDescription: "Active play is important for everyone in the family: adults and…",
    status: 'Incomplete',
    goalStatus: true,
    favouriteStatus: true
  }
]

const favouriteActivities = [
  {
    id: 1,
    title: "Activity 1",
    shortDescription: "Aim to make playing together as a family a fun part of your everyday life.",
    complete: false,
    favourite: true
    // ^to be filled by Nirav
  }
]

module.exports = {
  programsList: programsList,
  individualPrograms: individualPrograms,
  moduleOne: moduleOne,
  activityOne: activityOne,
  taskOne: taskOne,
  links: links,
  favouriteModules: favouriteModules,
  favouriteActivities: favouriteActivities
}
