function setup() {
    noCanvas();
    classifier = ml5.imageClassifier('MobileNet', modelLoaded);
    const dropArea = select('#dropArea');
    dropArea.dragOver(() => dropArea.style('background-color', '#ccc'));
    dropArea.dragLeave(() => dropArea.style('background-color', '#fff'));
    dropArea.drop(handleFile, () => dropArea.style('background-color', '#fff'));
}

function modelLoaded() {
    console.log('Model geladen!');
}

function handleFile(file) {
    if (file.type === 'image') {
        imageElement = createImg(file.data, '').hide();
        imageElement.size(400, 400);
        const dropArea = select('#dropArea');
        dropArea.html('');
        imageElement.parent(dropArea);
        imageElement.show();
    } else {
        console.log('Nicht unterstützter Dateityp');
    }
}

function classifyImage() {
    if (imageElement) {
        classifier.classify(imageElement, gotResult);
        imageElement.hide();
    }
}

function gotResult(error, results) {
    if (error) {
        console.error(error);
    } else {
        const confidence = results[0].confidence * 100;
        const label = results[0].label;

        if (imageThumbnail) {
            imageThumbnail.remove();
        }
        imageThumbnail = createImg(imageElement.elt.src, '').hide();
        imageThumbnail.size(100, 100);
        imageThumbnail.parent('imageSection');
        imageThumbnail.show();

        lastResult = { src: imageElement.elt.src, label: label, confidence: confidence };
        const resultContainer = select('#resultContainer');
        resultContainer.html(generateResultTable(label, confidence));

        select('#interactionButtons').style('display', 'block');
    }
}

function generateResultTable(label, confidence) {
    return `
        <table>
            <tr>
                <td><img src="${imageElement.elt.src}" style="width: 100px;"></td>
                <td>
                    <div>${label}</div>
                    <div class="custom-bar">
                        <div class="confidence-bar" style="width:${confidence * 4}px;"></div>
                        <div class="confidence-text">${Math.round(confidence)}%</div>
                    </div>
                </td>
            </tr>
        </table>
    `;
}

function markCorrect() {
    if (correctClassifications.length >= 3) correctClassifications.shift();
    correctClassifications.push(lastResult);
    updateClassificationsDisplay();
}

function markIncorrect() {
    if (incorrectClassifications.length >= 3) incorrectClassifications.shift();
    incorrectClassifications.push(lastResult);
    updateClassificationsDisplay();
}

function updateClassificationsDisplay() {
    updateClassificationTable('#classifiedCorrectly', correctClassifications);
    updateClassificationTable('#classifiedIncorrectly', incorrectClassifications);
}

function updateClassificationTable(selector, classifications) {
    const section = select(selector);
    section.html('<h2>' + (selector.includes('Correct') ? 'Richtig' : 'Falsch') + ' klassifizierte Bilder</h2>');
    classifications.forEach(result => {
        section.child(createElement('table', generateResultTable(result.label, result.confidence)).style('width', '100%'));
    });
}
