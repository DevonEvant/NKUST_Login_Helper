function reshape(arr, reX) {
    let newArr = []
    while (arr.length) newArr.push(arr.splice(0, reX));
    return newArr;
}


async function tf(charDataList) {

    const TF_LOAD_MODEL_URL = "https://raw.githubusercontent.com/takidog/NKUST_Login_Helper/main/model.json";

    model = await tf.loadLayersModel(TF_LOAD_MODEL_URL);



    let charResult = [
        "A", "B", "C", "D", "E",
        "F", "G", "H", "I", "J",
        "K", "L", "M", "N", "O",
        "P", "Q", "R", "S", "T",
        "U", "V", "W", "X", "Y",
        "Z", "0", "1", "2", "3",
        "4", "5", "6", "7", "8",
        "9",
    ];



    let captchaCode = "";
    for (i = 0; i < charDataList.length; i++) {
        let a = await model
            .predict(tf.tensor2d(charDataList[i], [40, 21]).reshape([1, 40, 21, 1]))
            .data();
        captchaCode += charResult[maxIndex(a)];
    }

    return captchaCode
}

let captchaImageInfo = {
    "path": "./測試集/validateCode.12.jpg",
    "width": 85,
    "height": 40
}

let img = new Image();

let cavEl = document.createElement("canvas");
cavEl.width = captchaImageInfo.width
cavEl.height = captchaImageInfo.height

cavEl = document.body.appendChild(cavEl);
let cavElAPI = cavEl.getContext("2d");



img.onload = async () => {
    console.log("loaded");
    cavElAPI.drawImage(img, 0, 0, cavEl.width, cavEl.height);

    let imgData = cavElAPI.getImageData(0, 0, cavEl.width, cavEl.height);
    let pixelData = imgData.data;

    let avgImg = [];

    for (let i = 0; i < pixelData.length; i += 4) {
        let avg = (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 3
        pixelData[i] = avg // red
        pixelData[i + 1] = avg // green
        pixelData[i + 2] = avg // blue

        avgImg.push(avg);
    }
    cavElAPI.putImageData(imgData, 0, 0);

    let charDataList = [[], [], [], []];
    avgImg = reshape(avgImg, 85);
    avgImg.forEach((imgPixelLine) => {
        charDataList.forEach((charPixel) => {
            charPixel.push(imgPixelLine.splice(0, 21));
        })
    });





    function maxIndex(data) {
        var _maxValue = -1;
        var _maxIndex = -1;
        for (var i = 0; i < data.length; i++) {
            if (data[i] > _maxValue) {
                _maxValue = data[i];
                _maxIndex = i;
            }
        }
        return _maxIndex;
    }


    const TF_LOAD_MODEL_URL = "https://raw.githubusercontent.com/takidog/NKUST_Login_Helper/main/model.json";

    let model = await tf.loadLayersModel(TF_LOAD_MODEL_URL);

    let charResult = [
        "A", "B", "C", "D", "E",
        "F", "G", "H", "I", "J",
        "K", "L", "M", "N", "O",
        "P", "Q", "R", "S", "T",
        "U", "V", "W", "X", "Y",
        "Z", "0", "1", "2", "3",
        "4", "5", "6", "7", "8",
        "9",
    ];

    let captchaCode = "";
    for (i = 0; i < charDataList.length; i++) {
        let a = await model.predict(tf.tensor2d(charDataList[i], [40, 21])
            .reshape([1, 40, 21, 1])).data();
        captchaCode += charResult[maxIndex(a)];
    }


    console.log(captchaCode);
};




img.src = captchaImageInfo.path;

document.body.appendChild(img);


