const express = require('express');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const app = express();
registerFont('../public/fonts/TradeGothicNextLTProBdCn.ttf', { family: 'Trade Gothic Next LT Pro BdCn' });


app.get('/', (req, res) => {    
    const canvas = createCanvas(1124, 1124);
    const ctx = canvas.getContext('2d');
    const inputText = process.argv[2] || "";
    loadImage('../public/images/template1.png').then((image) => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        ctx.font = '100px "Trade Gothic Next LT Pro BdCn"';
        fitText(ctx, inputText, 250, 0, canvas.width - 400, canvas.height - 200, 70);
        canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'stats.png')));
        const createImage = canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(__dirname, 'stats.jpg')));
        createImage.on("finish", function(){
            res.download(path.join(__dirname, 'stats.jpg'));
        });
    });
});
 

function fitText(ctx, text, x, y, width, height, fontSize) {
    ctx.font = 'normal ' + fontSize + 'px Times New Roman';
    var metrics = ctx.measureText(text);
    
    if (metrics.width <= width) {
        ctx.fillText(text, x, y + height - fontSize/4);
        return;
    }
    
    // Wrap text
    var words = text.split(' '),
        line = '',
        lines = [];
    
    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        metrics = ctx.measureText(testLine);
        if (metrics.width > width && n > 0) {
            lines.push(line);
            line = words[n] + ' ';  // next line
        }
        else {
            line = testLine;
        }
    }
    lines.push(line);
    if (lines.length > 10) {
        console.log('fontSize', fontSize);
        return fitText(ctx, text, x, y, width, height, fontSize -1);
    }
    
    var line_y = y + height - fontSize/4;
    for(var i=lines.length -1; i >= 0; i--) {
        ctx.fillText(lines[i], x, line_y);
        line_y -= fontSize * 1.1;
    }
}

/* function wrapText(context, text, x, y, maxWidth, lineHeight){
    const words = text.split(' ');
    let line = '';
    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
} */


app.listen(8000, () => {
  console.log('App listening on port 8000');
});