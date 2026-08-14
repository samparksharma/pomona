const weirdFacts = [
  {
    tag: "WEIRD HISTORY",
    text: "Pineapples became symbols of wealth in 17th- and 18th-century Europe because growing one in a cold climate required expensive heated greenhouses."
  },

  {
    tag: "BOTANICAL ODDITY",
    text: "Strawberries are not botanically berries, while bananas are classified as berries."
  },

  {
    tag: "CULTURAL ODDITY",
    text: "Pomegranates have been associated with fertility, abundance, death, and the underworld in different cultural traditions."
  },

  {
    tag: "BOTANICAL HORROR",
    text: "Ackee can be dangerous when eaten before it naturally opens because unripe fruit contains high levels of hypoglycin A, a toxin associated with severe hypoglycemia."
  },

  {
    tag: "WEIRD HISTORY",
    text: "Pineapples were once so prized in Britain that people could rent them simply to display at parties rather than actually eat them."
  },

  {
    tag: "CULTURAL ODDITY",
    text: "The pomegranate's enormous number of seeds helped make it a symbol of fertility and abundance in several traditions."
  },

  {
    tag: "NATURE IS STRANGE",
    text: "A banana plant is not actually a tree. What looks like a trunk is a tightly packed structure made from leaf bases."
  },

  {
    tag: "BOTANICAL ODDITY",
    text: "The cashew nut grows outside the fleshy cashew apple rather than inside it."
  },

  {
    tag: "WEIRD HISTORY",
    text: "The pineapple became such a strong symbol of hospitality and status that pineapple shapes appeared in European architecture and decorative objects."
  },

  {
    tag: "CULTURAL ODDITY",
    text: "The pomegranate appears in stories connected with Persephone and the Greek underworld, giving the fruit an unusually strong connection with both life and death."
  },

  {
    tag: "NATURE IS STRANGE",
    text: "Figs contain tiny flowers that develop inside the structure we commonly think of as the fruit."
  },

  {
    tag: "BOTANICAL ODDITY",
    text: "A fig's relationship with fig wasps is so specialized that many fig species depend on particular wasp species for pollination."
  },

  {
    tag: "WEIRD HISTORY",
    text: "Mangoes have been cultivated in South Asia for thousands of years and later travelled widely through trade, migration, and colonial networks."
  },

  {
    tag: "CULTURAL ODDITY",
    text: "Mangoes have held religious, artistic, and royal significance across parts of South Asia, where the fruit has been associated with prosperity and abundance."
  },

  {
    tag: "BOTANICAL HORROR",
    text: "Some plants in the nightshade family produce potent chemical defenses, even though other members of the same family are major food crops."
  },

  {
    tag: "NATURE IS STRANGE",
    text: "The durian's notorious smell is produced by a mixture of many volatile sulfur-containing compounds rather than by one single chemical."
  },

  {
    tag: "WEIRD HISTORY",
    text: "The smell of durian is so culturally famous that the fruit has been restricted or banned in some enclosed public spaces and forms of transport in parts of Southeast Asia."
  },

  {
    tag: "BOTANICAL ODDITY",
    text: "Avocados are botanically fruits, and more specifically are classified as berries."
  },

  {
    tag: "CULTURAL ODDITY",
    text: "The coconut has travelled with humans across enormous stretches of the tropics, making its natural history unusually intertwined with human movement."
  },

  {
    tag: "NATURE IS STRANGE",
    text: "Some coconuts can travel across oceans because their fibrous husks help protect the seed while the fruit floats."
  },

  {
    tag: "WEIRD HISTORY",
    text: "Bananas sold in modern supermarkets are usually from a cultivar called Cavendish, which replaced the once-dominant Gros Michel after disease devastated plantations."
  },

  {
    tag: "BOTANICAL HORROR",
    text: "Some wild and traditional fruit varieties contain chemical defenses that make them edible only after specific preparation or ripening."
  },

  {
    tag: "CULTURAL ODDITY",
    text: "Apples have appeared in stories about temptation, immortality, knowledge, and magical transformation across different traditions."
  },

  {
    tag: "NATURE IS STRANGE",
    text: "The fleshy part of a pineapple is formed from many flowers and their associated tissues fusing together into one structure."
  },

  {
    tag: "BOTANICAL ODDITY",
    text: "A pineapple is therefore not a simple single-fruit structure in the same way that a peach is; it is a multiple fruit formed from an entire flower cluster."
  },

  {
    tag: "WEIRD HISTORY",
    text: "Pineapples were used as luxurious decorative symbols long after Europeans first encountered them because actually growing them locally remained difficult."
  },

  {
    tag: "CULTURAL ODDITY",
    text: "Pomegranates have appeared in religious art, royal symbolism, literature, and funerary traditions because their appearance can evoke both abundance and mortality."
  },

  {
    tag: "NATURE IS STRANGE",
    text: "Some fungi can manipulate the behavior of insects before killing them, turning the insect into part of the fungus's reproductive strategy."
  },

  {
    tag: "BOTANICAL HORROR",
    text: "The fruit of ackee can be perfectly edible when properly ripened, while the same fruit can become dangerous when eaten prematurely."
  },

  {
    tag: "WEIRD HISTORY",
    text: "Before modern refrigeration and global shipping, preserving fruit through drying, fermentation, or cooking was often essential to surviving seasonal shortages."
  },

  {
    tag: "CULTURAL ODDITY",
    text: "Dates were important enough in several ancient societies to appear in trade networks, agriculture, religious traditions, and descriptions of prosperity."
  },

  {
    tag: "NATURE IS STRANGE",
    text: "Some berries rely on animals to swallow their seeds and transport them elsewhere, effectively turning the digestive systems of animals into part of their dispersal strategy."
  },

  {
    tag: "BOTANICAL ODDITY",
    text: "The bright colors of many ripe fruits are partly an evolutionary advertisement: plants benefit when animals notice them and carry their seeds away."
  },

  {
    tag: "WEIRD HISTORY",
    text: "Fruit has repeatedly been used in art as a shorthand for wealth because rare, imported, or difficult-to-grow produce could reveal the status of the person who owned it."
  },

  {
    tag: "CULTURAL ODDITY",
    text: "The same fruit can symbolize completely different things in different cultures, including love, death, fertility, prosperity, temptation, or immortality."
  },

  {
    tag: "NATURE IS STRANGE",
    text: "Some fruits ripen dramatically after being picked, while others depend heavily on remaining attached to the plant until they reach a particular stage of maturity."
  },

  {
    tag: "BOTANICAL HORROR",
    text: "A plant does not need teeth or claws to defend itself: chemical compounds in fruits, seeds, leaves, and sap can discourage animals from eating the wrong part."
  },

  {
    tag: "WEIRD HISTORY",
    text: "Exotic fruits were once valuable diplomatic gifts in some societies because obtaining them required long-distance trade and specialized cultivation."
  },

  {
    tag: "CULTURAL ODDITY",
    text: "Fruit symbolism has even influenced architecture, decorative patterns, paintings, clothing, and royal emblems."
  },

  {
    tag: "NATURE IS STRANGE",
    text: "Some fruit seeds are designed to survive being swallowed by animals, passing through the digestive tract before being deposited far from the parent plant."
  },

  {
    tag: "BOTANICAL ODDITY",
    text: "What humans call a 'fruit' and what botanists call a fruit are not always the same thing; pumpkins, tomatoes, cucumbers, and peppers are botanical fruits."
  },

  {
    tag: "WEIRD HISTORY",
    text: "The history of fruit is partly a history of human migration: people repeatedly carried plants, seeds, cuttings, and cultivation techniques far beyond their original ranges."
  },

  {
    tag: "CULTURAL ODDITY",
    text: "Fruits have been placed in graves, offerings, festivals, and religious ceremonies because food was often treated as a bridge between the living world and the spiritual world."
  },

  {
    tag: "NATURE IS STRANGE",
    text: "Some plants produce fruits specifically adapted to particular animals, creating surprisingly specialized relationships between a plant and the creatures that disperse its seeds."
  },

  {
    tag: "BOTANICAL HORROR",
    text: "A fruit can be edible in one stage of development and dangerous in another, which is why traditional knowledge about harvesting and preparation has sometimes been a matter of survival."
  },

  {
    tag: "WEIRD HISTORY",
    text: "Before supermarkets made exotic produce ordinary, simply being able to serve a tropical fruit could demonstrate that a household had access to distant trade networks."
  },

  {
    tag: "CULTURAL ODDITY",
    text: "Pomegranates are especially strange as symbols because their red juice, hard outer shell, and countless seeds have all been interpreted in completely different ways."
  },

  {
    tag: "NATURE IS STRANGE",
    text: "Plants and animals are locked in an evolutionary negotiation: fruits reward animals with food while using those animals to transport the next generation."
  },

  {
    tag: "FINAL WARNING",
    text: "Some of the most ordinary-looking foods in the world are perfectly safe only because humans learned which part to eat, when to harvest it, and how to prepare it."
  }
];

export default weirdFacts;