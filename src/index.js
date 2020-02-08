const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

registerFont("../public/fonts/TradeGothicNextLTProBdCn.ttf", {
  family: "Trade Gothic Next LT Pro BdCn"
});

const templatesDirectory = "../public/images";
const fontName = "Trade Gothic Next LT Pro BdCn";
const minFontSize = 40;
const fontSize = 70;
const quoteFontSize = 200;
const inputText = process.argv[2] || "";
const inputX = process.argv[3] || 325;
const inputY = process.argv[4] || 0;
const topBottomMargin = 100;
const leftRightMargin = 200;

fs.readdir(templatesDirectory, function(err, files) {
  if (err) {
    console.error("Could not list the directory: ", err);
  } else {
    files.forEach(function(file, index) {
      loadImage(path.join(templatesDirectory, file)).then(image => {
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        fitText(
          ctx,
          {
            text: inputText,
            fontSize: fontSize,
            fontColor: index === 1 ? "#000000" : "#ffffff",
            x: Number(inputX),
            y: Number(inputY)
          },
          { width: canvas.width, height: canvas.height }
        );
        canvas
          .createPNGStream()
          .pipe(
            fs.createWriteStream(
              path.join(__dirname, "stats" + (index + 1) + ".png")
            )
          );
        canvas
          .createJPEGStream()
          .pipe(
            fs.createWriteStream(
              path.join(__dirname, "stats" + (index + 1) + ".jpg")
            )
          );
      });
    });
  }
});

//fitText() is based on http://jsfiddle.net/squeral/Tq87W/

function fitText(ctx, textProperties, canvasSize) {
  const textWidth = canvasSize.width - leftRightMargin * 2;
  const textHeight = canvasSize.height - topBottomMargin * 2;
  const maxNumberOfLines = textProperties.text.indexOf("\\n") > -1 ? 6 : 8;
  ctx.font = "normal " + textProperties.fontSize + "px " + fontName;
  ctx.fillStyle = textProperties.fontColor;
  let metrics = ctx.measureText(textProperties.text);
  if (metrics.width <= textWidth) {
    const yPosition = getYPositionOfText(
      ctx,
      textProperties.text,
      canvasSize.height
    );
    ctx.fillText(textProperties.text, textProperties.x, yPosition);
    textProperties.yPosition = yPosition;
    addQuotes(ctx, textProperties, canvasSize);
    return;
  }
  const words = textProperties.text.split(" ");
  let line = "",
    lines = [];
  for (let n = 0; n < words.length; n++) {
    const isNewLineWord = words[n].indexOf("\\n") > -1;
    const word = isNewLineWord
      ? words[n].substring(words[n].indexOf("\n") + 3, words[n].length)
      : words[n];
    const testLine = line + word + " ";
    metrics = ctx.measureText(testLine);
    if ((isNewLineWord || metrics.width > textWidth) && n > 0) {
      lines.push(line);
      line = word + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  if (lines.length > maxNumberOfLines) {
    textProperties.fontSize--;
    if (textProperties.fontSize > minFontSize) {
      return fitText(ctx, textProperties, canvasSize);
    }
  }
  let lineYPosition =
    textProperties.y + textHeight - textProperties.fontSize / 4;
  if (lines && lines.length > 0) {
    lineYPosition =
      textProperties.y + getYPositionOfText(ctx, lines, canvasSize.height);
    textProperties.endYPosition = lineYPosition;
  }
  for (let i = lines.length - 1; i >= 0; i--) {
    ctx.fillText(lines[i], textProperties.x - 25, lineYPosition);
    lineYPosition -= textProperties.fontSize;
  }
  textProperties.yPosition = lineYPosition + textProperties.fontSize;
  textProperties.text = lines;
  addQuotes(ctx, textProperties, canvasSize);
}

function getYPositionOfText(ctx, text, height) {
  const contentHeight = getTextHeight(ctx, text);
  return contentHeight + (height - contentHeight) * 0.5;
}

function getTextHeight(ctx, text) {
  let metrics;
  if (Array.isArray(text) && text.length > 0) {
    metrics = ctx.measureText(text[0]);
    return (
      (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) *
      text.length
    );
  } else {
    metrics = ctx.measureText(text);
    return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  }
}

function addQuotes(ctx, textProperties, canvasSize) {
  ctx.font = quoteFontSize + "px " + textProperties.fontName;
  const beginQuoteYPosition = Array.isArray(textProperties.text)
    ? textProperties.yPosition
    : textProperties.yPosition - 100;
  ctx.fillText("“", 200, beginQuoteYPosition);
  const endQuoteYPosition = Array.isArray(textProperties.text)
    ? textProperties.endYPosition + 175
    : textProperties.yPosition + 150;
  ctx.fillText("”", canvasSize.width - 175, endQuoteYPosition);
}
