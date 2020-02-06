const express = require('express');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const app = express();
registerFont('../public/fonts/TradeGothicNextLTProBdCn.ttf', { family: 'Trade Gothic Next LT Pro BdCn' });


const fontName = "Trade Gothic Next LT Pro BdCn";


app.get('/', (req, res) => {    
    const inputText = process.argv[2] || "";
    const templatesFolder = '../public/images';
    fs.readdir(templatesFolder, function(err, files){
        if (err) {
            console.error("Could not list the directory: ", err);
        } else {
            files.forEach(function(file, index){
                loadImage(path.join(templatesFolder, file)).then((image) => {
                    const canvas = createCanvas(1124, 1124);
                    const ctx = canvas.getContext('2d');
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0);
                    fitText(ctx, inputText, 300, 0, canvas.width, canvas.height, {fontSize: 100, fontColor: index === 1 ? "#000000" : "#ffffff"});
                    canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'stats'+ index + '.png')));
                    const createImage = canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(__dirname, 'stats'+ index + '.jpg')));
                    /* createImage.on("finish", function(){
                        res.download(path.join(__dirname, 'stats.jpg'));
                    }); */
                });
            });
        }
    });
});
 

function fitText(ctx, text, x, y, width, height, fontProperties) {
    const textWidth = width - 400;
    const textHeight = height - 200;
    const canvasSize = {width: width, height: height};
    const textProperties = {fontSize: fontProperties.fontSize, fontName: fontProperties.fontName};
    ctx.font = 'normal ' + fontProperties.fontSize + 'px ' + fontName;
    ctx.fillStyle = fontProperties.fontColor;
    var metrics = ctx.measureText(text);    
    if (metrics.width <= textWidth) {
        const yPosition = getYPositionOfText(ctx, text, 1, height);
        ctx.fillText(text, x, yPosition);
        textProperties.yPosition = yPosition;
        textProperties.text = text;
        addQuotes(ctx, textProperties, canvasSize);
        return;
    }
    var words = text.split(' '),
        line = '',
        lines = [];
    
    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        metrics = ctx.measureText(testLine);
        if (metrics.width > textWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';  
        }
        else {
            line = testLine;
        }
    }
    lines.push(line);
    if (lines.length > 10) {
        return fitText(ctx, text, x, y, width, height, fontProperties.fontSize -1);
    }
    console.log("fontSize: " + fontProperties.fontSize);
    let line_y = y + textHeight - fontProperties.fontSize/4;
    if(lines && lines.length > 0){        
        line_y = getYPositionOfText(ctx, lines[0], lines.length, height);
        textProperties.endYPosition = line_y;
    }
    for(var i=lines.length -1; i >= 0; i--) {
        ctx.fillText(lines[i], x - 25, line_y);
        line_y -= fontProperties.fontSize * 1.1;
    }
    textProperties.yPosition = line_y;
    textProperties.text = lines;
    addQuotes(ctx, textProperties, canvasSize);
}

function getYPositionOfText(ctx, text, numberOfLines, height){
    const contentHeight = getTextHeight(ctx, text, numberOfLines);
    console.log("y: ",contentHeight + (height - contentHeight)/2);
    return contentHeight + (height - contentHeight)/2;
}

function getTextHeight(ctx, text, numberOfLines){
    const metrics = ctx.measureText(text);
    return (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * numberOfLines;
}

function addQuotes(ctx, textProperties, canvasSize){
    ctx.font = (textProperties.fontSize*2) + 'px ' + textProperties.fontName;
    const beginQuoteYPosition = Array.isArray(textProperties.text) ? textProperties.yPosition + 50 : textProperties.yPosition - 100;
    ctx.fillText("“", 200, beginQuoteYPosition);
    const endQuoteYPosition = Array.isArray(textProperties.text) ? textProperties.endYPosition + 150 : textProperties.yPosition + 150;
    ctx.fillText("”", canvasSize.width - 175, endQuoteYPosition);
}


app.listen(8000, () => {
  console.log('App listening on port 8000');
});