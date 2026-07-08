// Story-Daten: "Der erloschene Sternenstall" (10 Kapitel).
// Klassisches Script (kein Modul), damit die Haupt-App die Daten
// synchron über window.* lesen kann – läuft ohne Build-Schritt.

window.STORY_PROLOG =
  "Vor langer Zeit leuchtete das magische Gestüt im Licht von zwölf " +
  "Sternenlaternen. Doch ein trauriger Nebelgeist hat ihre Magie " +
  "eingesammelt, weil er selbst noch nie einen Freund hatte. Nur ein Kind " +
  "mit Mut, Klugheit und einem treuen Pferd kann das Licht zurückbringen – " +
  "Laterne für Laterne.";

// Jedes Kapitel: eine Laterne, ein neues Gebiet, eine kleine Aufgabe des
// Nebelgeists und ein herzlicher Moment mit dem Pferd.
// "unlocks" ist die Struktur für spätere Phasen (Gebiete, Aktivitäten,
// Ausrüstung) – Inhalte folgen, deshalb überall comingSoon:true.
window.STORY_CHAPTERS = [
  {
    id: 1,
    title: "Die Laterne am Stalltor",
    area: "Der Stallhof",
    areaEmoji: "🚪",
    scene: "Früh am Morgen stehst du mit Funkelstern am großen Stalltor. Die erste Sternenlaterne hängt dort ganz dunkel und still, und feiner Nebel kriecht über den Hof. An der Laterne klebt ein Zettel aus grauem Nebelpapier: \"Ich habe das Licht mitgenommen. Aber wer klug ist, darf es sich zurückverdienen.\" Funkelstern schnaubt leise und stellt sich ganz dicht neben dich. Du nimmst all deinen Mut zusammen und nickst: Ihr fangt an – Laterne für Laterne.",
    geistAufgabe: "Aus dem Nebel flüstert es: \"Zeig mir, was du kannst. Für jede kluge Antwort gebe ich einen Funken Magie zurück.\"",
    heartMoment: "Als die Laterne wieder leuchtet, stupst Funkelstern dich sanft mit der weichen Nase an. Es fühlt sich an wie ein Versprechen: Zusammen schaffen wir alles.",
    unlocks: [
      { type: "gebiet", id: "stallhof", label: "Der Stallhof", comingSoon: true }
    ]
  },
  {
    id: 2,
    title: "Die Laterne in der Apfelwiese",
    area: "Die Apfelwiese",
    areaEmoji: "🍎",
    scene: "Hinter dem Stall liegt die Apfelwiese, auf der sonst die süßesten Zauberäpfel wachsen. Heute hängen die Äpfel grau und müde an den Zweigen, denn auch hier ist die Laterne erloschen. Zwischen den Bäumen siehst du zum ersten Mal den Nebelgeist: eine weiche, graue Wolke mit zwei traurigen Augen. \"Niemand hat je einen Apfel mit mir geteilt\", seufzt er und verschwindet hinter einem Baumstamm. Funkelstern schaut dir tief in die Augen, als wollte sie sagen: Der ist gar nicht böse – der ist einsam.",
    geistAufgabe: "Der Nebelgeist lugt hinter dem Baum hervor: \"Wenn du meine Rätsel löst, gebe ich der Wiese ihr Licht zurück. Versprochen.\"",
    heartMoment: "Die Äpfel leuchten wieder rot und golden. Funkelstern pflückt vorsichtig einen mit den Lippen und legt ihn dir in die Hand – der erste Zauberapfel ist für dich.",
    unlocks: [
      { type: "gebiet", id: "apfelwiese", label: "Die Apfelwiese", comingSoon: true },
      { type: "aktivitaet", id: "aepfel_sammeln", label: "Äpfel sammeln", comingSoon: true }
    ]
  },
  {
    id: 3,
    title: "Die Laterne am Flüsterbach",
    area: "Der Flüsterbach",
    areaEmoji: "🌊",
    scene: "Der Flüsterbach plätschert normalerweise fröhliche Geschichten vor sich hin, wenn man genau hinhört. Doch heute murmelt er nur leise und traurig, denn seine Laterne am Steg ist dunkel. Im Wasser treiben kleine Nebelfetzen wie vergessene Wattewölkchen. \"Ich wollte den Bach nur ein bisschen für mich behalten\", flüstert der Nebelgeist vom anderen Ufer herüber, \"er erzählt so schöne Geschichten.\" Funkelstern taucht vorsichtig einen Huf ins Wasser und horcht. Vielleicht könnt ihr dem Geist zeigen, dass Geschichten schöner sind, wenn man sie teilt.",
    geistAufgabe: "\"Der Bach stellt dir Fragen, und ich höre zu\", raunt der Nebelgeist. \"Antworte klug, dann darf seine Laterne wieder leuchten.\"",
    heartMoment: "Als das Licht zurückkehrt, erzählt der Bach seine allerschönste Geschichte – von einem Kind und einem Pferd, die niemals aufgeben. Funkelstern legt den Kopf auf deine Schulter und hört mit dir zu.",
    unlocks: [
      { type: "gebiet", id: "fluesterbach", label: "Der Flüsterbach", comingSoon: true },
      { type: "ausruestung", id: "gluehwuermchen_glas", label: "Glühwürmchen-Glas", comingSoon: true }
    ]
  },
  {
    id: 4,
    title: "Die Laterne im Glühwürmchenwald",
    area: "Der Glühwürmchenwald",
    areaEmoji: "✨",
    scene: "Im Glühwürmchenwald tanzen sonst tausend winzige Lichter zwischen den Bäumen. Heute sitzen die Glühwürmchen still auf den Blättern und trauen sich nicht zu leuchten, weil die große Waldlaterne dunkel ist. \"Sie haben mich ausgelacht, als ich klein war\", sagt der Nebelgeist leise aus einer Baumhöhle, \"da habe ich ihr Licht versteckt.\" Du setzt dich auf eine Wurzel und erzählst ihm, dass Lachen manchmal gar nicht gemein gemeint ist. Der Geist kommt ein kleines Stückchen näher als sonst. Funkelstern bleibt ruhig stehen und wedelt freundlich mit dem Schweif.",
    geistAufgabe: "\"Vielleicht hast du recht\", murmelt der Nebelgeist. \"Löse meine Aufgaben, dann lasse ich die Würmchen wieder funkeln.\"",
    heartMoment: "Tausend Lichter steigen gleichzeitig in die Luft und setzen sich in Funkelsterns Mähne – für einen Moment sieht dein Pferd aus wie der Sternenhimmel selbst. Ihr lacht beide, und sogar der Nebelgeist kichert ganz leise.",
    unlocks: [
      { type: "gebiet", id: "gluehwuermchenwald", label: "Der Glühwürmchenwald", comingSoon: true },
      { type: "aktivitaet", id: "leuchtspur_folgen", label: "Der Leuchtspur folgen", comingSoon: true }
    ]
  },
  {
    id: 5,
    title: "Die Laterne der alten Windmühle",
    area: "Die alte Windmühle",
    areaEmoji: "🌬️",
    scene: "Auf dem Hügel steht die alte Windmühle, die früher Sternenmehl für die Zauberäpfel gemahlen hat. Ihre Flügel hängen schlaff herunter, denn ohne Laternenlicht mag der Wind nicht mit ihr spielen. Der Nebelgeist sitzt oben auf dem Mühlendach und baumelt mit den Nebelfüßen. \"Ich wollte nur einmal zuschauen, wie sie sich dreht\", ruft er herunter, \"aber alle sind immer weggerannt, wenn ich kam.\" Du rufst zurück: \"Wir rennen nicht weg!\" Funkelstern nickt kräftig mit dem Kopf, und der Geist macht vor Überraschung einen kleinen Purzelbaum in der Luft.",
    geistAufgabe: "\"Dann zeig mir, dass ihr wirklich bleibt\", ruft der Nebelgeist. \"Eine Aufgabe nach der anderen – und die Mühle bekommt ihr Licht zurück!\"",
    heartMoment: "Die Flügel drehen sich wieder, und feiner goldener Sternenmehl-Staub rieselt herab. Funkelstern niest davon so niedlich, dass du lachen musst – und sie lacht auf Pferdeart einfach mit.",
    unlocks: [
      { type: "gebiet", id: "windmuehle", label: "Die alte Windmühle", comingSoon: true },
      { type: "ausruestung", id: "sternenmehl_beutel", label: "Sternenmehl-Beutel", comingSoon: true }
    ]
  },
  {
    id: 6,
    title: "Die Laterne am Kristallsee",
    area: "Der Kristallsee",
    areaEmoji: "💎",
    scene: "Der Kristallsee ist so klar, dass man normalerweise die Sterne darin doppelt sehen kann. Ohne seine Laterne ist das Wasser heute grau wie ein Regentag. Am Ufer entdeckst du den Nebelgeist, der vorsichtig in den See schaut. \"Ich habe noch nie mein Spiegelbild gesehen\", sagt er traurig, \"Nebel kann sich nicht spiegeln.\" Da hast du eine Idee: Wenn der See wieder leuchtet, leuchtet vielleicht auch der Geist ein kleines bisschen mit. Funkelstern scharrt aufgeregt mit dem Huf – sie glaubt an deinen Plan.",
    geistAufgabe: "\"Du willst mir wirklich helfen?\", staunt der Nebelgeist. \"Dann lös meine Rätsel – ich gebe dem See sein Licht, versprochen ist versprochen.\"",
    heartMoment: "Im leuchtenden See erscheint zum ersten Mal ein zartes, silbriges Spiegelbild des Nebelgeists – er strahlt vor Freude. Funkelstern und du, ihr spiegelt euch direkt daneben: schon fast wie drei Freunde.",
    unlocks: [
      { type: "gebiet", id: "kristallsee", label: "Der Kristallsee", comingSoon: true },
      { type: "aktivitaet", id: "spiegelbilder_raten", label: "Spiegelbilder raten", comingSoon: true }
    ]
  },
  {
    id: 7,
    title: "Die Laterne auf der Nebelwiese",
    area: "Die Nebelwiese",
    areaEmoji: "🌫️",
    scene: "Die Nebelwiese ist das Zuhause des Nebelgeists – hier ist der Nebel so dicht wie Zuckerwatte. \"Hierher kommt sonst nie jemand\", sagt der Geist leise, und es klingt ein bisschen stolz und ein bisschen einsam zugleich. Er zeigt euch sein Nebelbett, seine Nebelkissen und einen Stapel gesammelter Laternenlichter, die er wie Schätze hütet. \"Ich wollte sie nicht stehlen\", murmelt er, \"ich wollte nur, dass es bei mir auch mal hell ist.\" Du versprichst ihm: Wenn alle Laternen wieder leuchten, leuchten sie auch für ihn. Funkelstern baut aus Stroh ein kleines, weiches Nest – mitten auf der Nebelwiese, als Zeichen, dass ihr wiederkommt.",
    geistAufgabe: "\"Für ein Versprechen brauche ich einen Beweis\", sagt der Nebelgeist ernst. \"Zeig mir dein Können, dann gebe ich das Wiesenlicht zurück.\"",
    heartMoment: "Als die Laterne angeht, sieht die Nebelwiese plötzlich wunderschön aus – wie ein Wolkenmeer voller Glitzer. Der Geist wispert: \"So schön war es hier noch nie.\" Funkelstern wiehert fröhlich, und das klingt fast wie Applaus.",
    unlocks: [
      { type: "gebiet", id: "nebelwiese", label: "Die Nebelwiese", comingSoon: true },
      { type: "ausruestung", id: "nebelumhang", label: "Nebelumhang", comingSoon: true }
    ]
  },
  {
    id: 8,
    title: "Die Laterne auf dem Sternenhügel",
    area: "Der Sternenhügel",
    areaEmoji: "🌠",
    scene: "Vom Sternenhügel aus kann man das ganze Gestüt sehen – und nachts fallen hier die Sternschnuppen besonders tief. Der Nebelgeist wartet schon auf euch, und zum ersten Mal versteckt er sich nicht. \"Ich habe dir etwas mitgebracht\", sagt er schüchtern und öffnet seine Nebelhände: Darin liegt ein winziger Lichtfunke, den er ganz allein zurückgebracht hat. Es ist das erste Mal, dass er etwas verschenkt, und seine Augen funkeln dabei wie kleine Sterne. Funkelstern verbeugt sich tief vor ihm, so wie Pferde sich nur vor echten Freunden verbeugen.",
    geistAufgabe: "\"Die Hügellaterne ist besonders stark\", erklärt der Geist. \"Dafür brauche ich deine allerbesten Antworten!\"",
    heartMoment: "Ihr drei sitzt nebeneinander auf dem Hügel und schaut den Sternschnuppen zu. Funkelstern legt ihren warmen Kopf in deinen Schoß, und der Nebelgeist wünscht sich zum allerersten Mal etwas: dass dieser Abend nie aufhört.",
    unlocks: [
      { type: "gebiet", id: "sternenhuegel", label: "Der Sternenhügel", comingSoon: true },
      { type: "aktivitaet", id: "sternschnuppen_zaehlen", label: "Sternschnuppen zählen", comingSoon: true }
    ]
  },
  {
    id: 9,
    title: "Die Laterne an der Wolkenbrücke",
    area: "Die Wolkenbrücke",
    areaEmoji: "🌈",
    scene: "Die Wolkenbrücke verbindet den Sternenhügel mit dem höchsten Turm des Gestüts – sie trägt nur den, der an sich glaubt. Die vorletzte Laterne hängt genau in ihrer Mitte, dunkel und ein bisschen verloren. \"Ich traue mich nicht auf die Brücke\", gesteht der Nebelgeist, \"was, wenn sie mich nicht trägt?\" Du streckst ihm die Hand hin: \"Wir gehen zusammen. Freunde tragen einander.\" Der Geist wird ganz still – das Wort \"Freunde\" hat noch nie jemand zu ihm gesagt. Dann legt er seine kühle Nebelhand in deine, und Funkelstern geht mit festen Schritten voran.",
    geistAufgabe: "Mitten auf der Brücke flüstert der Geist: \"Lass uns die Aufgaben diesmal zusammen anschauen. Ich will lernen, wie man mutig ist.\"",
    heartMoment: "Die Brücke trägt euch alle drei, und die Laterne flammt heller auf als alle anderen zuvor. Funkelstern wiehert in den Himmel, und der Nebelgeist ruft zum ersten Mal in seinem Leben: \"Wir haben es geschafft – WIR!\"",
    unlocks: [
      { type: "gebiet", id: "wolkenbruecke", label: "Die Wolkenbrücke", comingSoon: true },
      { type: "ausruestung", id: "wolkenhufeisen", label: "Wolkenhufeisen", comingSoon: true }
    ]
  },
  {
    id: 10,
    title: "Das Herz des Nebels",
    area: "Das Herz des Nebels",
    areaEmoji: "💜",
    scene: "Ganz oben im Turm liegt der Ort, an dem der Nebelgeist all die gesammelte Magie aufbewahrt hat – sie schwebt dort wie eine leuchtende Kugel aus tausend Funken. \"Nimm sie\", sagt der Geist leise, \"sie gehört euch. Ich brauche sie nicht mehr, denn jetzt habe ich etwas Besseres.\" Er schaut dich und Funkelstern an, und seine Nebelaugen leuchten von ganz allein – ohne geliehenes Licht. Gemeinsam tragt ihr die Magie hinaus, und sie verteilt sich wie warmer Sommerregen über das ganze Gestüt. Die letzte Laterne entzündet sich – und dann, wie durch ein Wunder, leuchten auch die elfte und zwölfte Laterne von selbst auf. Denn das hellste Licht, so sagt man im Gestüt, macht eine neue Freundschaft.",
    geistAufgabe: "\"Eine letzte Runde\", lacht der Nebelgeist, \"aber nicht als Prüfung – nur weil Rätseln mit Freunden Spaß macht!\"",
    heartMoment: "Am Abend feiern alle zusammen ein Fest im leuchtenden Sternenstall. Funkelstern bekommt eine Krone aus Glühwürmchen, der Nebelgeist bekommt den Ehrenplatz am warmen Ofen – und du bekommst das schönste Geschenk von allen: zwei Freunde für immer.",
    unlocks: [
      { type: "gebiet", id: "herz_des_nebels", label: "Das Herz des Nebels", comingSoon: true },
      { type: "aktivitaet", id: "freundschaftsfest", label: "Das Freundschaftsfest", comingSoon: true }
    ]
  }
];
