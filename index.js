const { promises: fs } = require("fs");
const { exit } = require("process");
const { exec } = require("node:child_process");
const svg_to_png = require("svg-to-png");


const svgFolder = '/Users/festiz/gitstuff/anki/svgs/'
const pngFolder = '/Users/festiz/gitstuff/anki/pngs/'

const writeAnalogClock = async (svg, time, hour, minute) => {
  console.log("writeAnalogClock")
  const minuteRotation = minute * 6
  const hourRotation = hour * 30 + 0.5 * minute
  originalMinuteText = '<g id="Minutvisare" transform="rotate(0, 775, 775)">'
  originalHourText = '<g id="Timvisare" transform="rotate(0, 775, 775)">'
  newMinuteText = `<g id="Minutvisare" transform="rotate(${minuteRotation}, 775, 775)">`;
  newHourText = `<g id="Timvisare" transform="rotate(${hourRotation}, 775, 775)">`
  svg = svg.replace(originalMinuteText, newMinuteText);
  svg = svg.replace(originalHourText, newHourText);
  const filename = `${svgFolder}clocks_analog_swedish_${time.replace(':','.')}.svg`
  try {
    await fs.writeFile(filename, svg, "utf-8")
  } catch (error) {
    console.error(error)
  }
};

const writeDigitalClock = async (svg, time) => {
  console.log("writeDigitalClock")
  svg = svg.replace('00:00', time);
  const filename = `${svgFolder}clocks_digital_swedish_${time.replace(':','.')}.svg`
  try {
    await fs.writeFile(filename, svg, "utf-8")
  } catch (error) {
    console.error(error)
  }
};

const cardContent = (time, hour, minute) => {
  console.log("cardContent")
  const am_pm = hour >= 12 ? "eftermiddag" : "förmiddag";
  // CSV FORMAT: QUESTION ; HINT ; ANSWER ; EXPLANATION ; TAGS ; ; IMG SRC
  return `Vad är klockan på bilden.<br><br>Det är ${am_pm}<br><br> Svara digitalt<br><br> <img src="clocks_analog_swedish_${time.replace(':','.')}.png">;;${time};<img src="clocks_digital_swedish_${time.replace(':','.')}.png">;Swedish Clock DigitalClock;;<img src="clocks_analog_swedish_${time.replace(':','.')}.png">;`;
};

const transformSvgs = () => {
  console.log("transformSVGs")
  return svg_to_png.convert(svgFolder, pngFolder, { debug: true })
};

const formatTime = (hour, minute) => {
  let time =
    hour.toString().padStart(2, "0") + ":" + minute.toString().padStart(2, "0")
  return time
};

const writeDeck = (cards) => {
  console.log("writeDeck")
  const deck = cards.join("\n")
  try {
    fs.writeFile("deck.csv", deck, "utf-8")
  } catch (error) {
    console.error(error)
  }
}

function shuffleArray(array) {
  let curId = array.length;
  // There remain elements to shuffle
  while (0 !== curId) {
    // Pick a remaining element
    let randId = Math.floor(Math.random() * curId);
    curId -= 1;
    // Swap it with the current element.
    let tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
  return array;
}

const loopClockMinutes = async () => {
  let hour = 0;
  let minute = 0;
  let time;
  let analogClockSvg
  let digitalClockSvg
  try {
    analogClockSvg = await fs.readFile("analog_clock.svg", "utf-8")
    digitalClockSvg = await fs.readFile("digital_clock.svg", "utf-8")
  } catch (error) {
    console.error(error)
  }
  const cards = []
  while (hour < 24) {
    while (minute < 60) {
      const rand = Math.random()
      const randTrue = rand <= 0.08;
      if ((minute % 5 === 0 && rand <= 0.5) || randTrue) {
        time = formatTime(hour, minute);
        console.log(time, rand, minute % 5 === 0);
        await writeAnalogClock(analogClockSvg, time, hour, minute);
        await writeDigitalClock(digitalClockSvg, time);
        cards.push(cardContent(time, hour, minute));
      }
      minute = minute + 1;
    }
    minute = 0;
    hour = hour + 1;
  }
  cards = shuffleArray(cards)
  writeDeck(cards);
  await transformSvgs();
}

loopClockMinutes();

// readWriteAsync();
// readWriteSync();
