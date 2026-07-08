// Avatar-Optionen (Katalog). Klassisches Script wie story-data.js,
// damit der 2D-Editor die Daten synchron lesen kann; das 3D-Modul
// js/avatar3d.js liest denselben Katalog über window.AVATAR_OPTIONS.

window.AVATAR_OPTIONS = {
  skin: [
    { id:"hell",       label:"Hell",        color:"#f6d7b8" },
    { id:"beige",      label:"Beige",       color:"#eebf99" },
    { id:"goldbraun",  label:"Goldbraun",   color:"#d9a066" },
    { id:"braun",      label:"Braun",       color:"#a9714b" },
    { id:"dunkel",     label:"Dunkelbraun", color:"#7c4f33" }
  ],
  hair: [
    { id:"kurz",          label:"Kurz",          emoji:"💇" },
    { id:"bob",           label:"Bob",           emoji:"👧" },
    { id:"zoepfe",        label:"Zöpfe",         emoji:"👩‍🦰" },
    { id:"pferdeschwanz", label:"Pferdeschwanz", emoji:"🐴" },
    { id:"locken",        label:"Locken",        emoji:"🌀" },
    { id:"lang",          label:"Lang",          emoji:"👸" },
    { id:"wuschel",       label:"Wuschelkopf",   emoji:"☁️" }
  ],
  hairColor: [
    { id:"schwarz",    label:"Schwarz",     color:"#2c2126" },
    { id:"braun",      label:"Braun",       color:"#5b3a24" },
    { id:"dunkelblond",label:"Dunkelblond", color:"#a0793f" },
    { id:"blond",      label:"Blond",       color:"#e8c56b" },
    { id:"rot",        label:"Rot",         color:"#b34a26" },
    { id:"lila",       label:"Zauberlila",  color:"#9c69dd" }
  ],
  eyes: [
    { id:"braun", label:"Braun", color:"#5b3a24" },
    { id:"blau",  label:"Blau",  color:"#3f7fca" },
    { id:"gruen", label:"Grün",  color:"#3f9a5f" },
    { id:"grau",  label:"Grau",  color:"#7a8087" }
  ],
  topColor: [
    { id:"lila",   label:"Lila",       color:"#9c69dd" },
    { id:"blau",   label:"Blau",       color:"#5a8fd6" },
    { id:"gruen",  label:"Grün",       color:"#5fae76" },
    { id:"rosa",   label:"Rosa",       color:"#e58cb6" },
    { id:"gold",   label:"Gold",       color:"#dfae4e" },
    { id:"tuerkis",label:"Türkis",     color:"#4fb2b2" }
  ],
  pantsColor: [
    { id:"dunkelblau", label:"Dunkelblau", color:"#3b4a7d" },
    { id:"braun",      label:"Braun",      color:"#7a5236" },
    { id:"gruen",      label:"Waldgrün",   color:"#4a6b4f" },
    { id:"lila",       label:"Lila",       color:"#6f4fc0" },
    { id:"grau",       label:"Grau",       color:"#5d6069" },
    { id:"rot",        label:"Beerenrot",  color:"#a04a5e" }
  ],
  accessory: [
    { id:"keins",      label:"Ohne",                emoji:"✖️" },
    { id:"umhang",     label:"Zauberumhang",        emoji:"🦸" },
    { id:"hut",        label:"Magierhut",           emoji:"🎩" },
    { id:"zauberstab", label:"Zauberstab-Anhänger", emoji:"🪄" }
  ]
};

window.AVATAR_DEFAULT = {
  skin:"beige", hair:"bob", hairColor:"braun", eyes:"braun",
  topColor:"lila", pantsColor:"dunkelblau", accessory:"keins"
};
