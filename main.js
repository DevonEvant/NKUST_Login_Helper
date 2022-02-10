// ==UserScript==
// @name         webapLogin
// @namespace    https://github.com/takidog/NKUST_Login_Helper
// @version      1.5
// @description  自動辨識高科webap登入驗證碼，讓自己更像機器人
// @author       Takidog
// @match        *://webap0.nkust.edu.tw/nkust/index_main.html
// @match        *://webap0.nkust.edu.tw/nkust/index.html
// @match        *://webap0.nkust.edu.tw/nkust/
// @match        *://webap.nkust.edu.tw/nkust/index_main.html
// @match        *://webap.nkust.edu.tw/nkust/index.html
// @match        *://webap.nkust.edu.tw/nkust/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://cdnjs.cloudflare.com/ajax/libs/axios/0.24.0/axios.min.js
// @require      https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.12.0/dist/tf.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min.js
// @grant        none
// ==/UserScript==

// -----config-----

const TF_LOAD_MODEL_URL = "https://raw.githubusercontent.com/takidog/NKUST_Login_Helper/main/model.json";



// -----init-----

if (window.location.pathname == "/nkust/index.html" || window.location.pathname == "/nkust/") {
    // 奇怪的頁面，用一層iframe套起來不知道在幹嘛
    // 會導致document抓不到
    window.location = '/nkust/index_main.html';
}

// -----start-----

async function main() {

    let verifyImgEl = document.querySelector("#verifyCode");
    let captchaCodeInputEl = document.querySelector("[name = etxt_code]");
    captchaCodeInputEl.value = ""

    let notify = (msg, state) => {
        $.notify(msg, { className: state });
        // $(document.querySelectorAll(".ctr")[2].firstChild)
        //     .notify(msg, attr, { position: "left" });
    };

    notify("正在載入圖像辨識系統...", "info");
    window.model = await tf.loadLayersModel(TF_LOAD_MODEL_URL);



    notify("辨識中...", "info");
    await captchaImage(verifyImgEl, (captchaCode, captchaImg) => {

        notify("成功", "success");
        captchaCodeInputEl.style.backgroundColor = "#adff2f"
        captchaCodeInputEl.value = captchaCode;
        console.log(captchaImg);
    })

}




// -----API-----

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

async function captchaImage(imgEl, callback) {

    if (document.getElementById("imageProcess")) {
        document.getElementById("imageProcess").remove();
    }

    // get captcha image
    let captchaImageEl = imgEl;

    // create canvas
    let cnv = document.createElement("canvas");
    cnv = document.getElementsByTagName("head")[0].appendChild(cnv)
    cnv.width = 85;
    cnv.height = 40;
    let cnx = cnv.getContext("2d");

    async function captchaImageIng() {

        // get pixels data
        cnx.drawImage(captchaImageEl, 0, 0);
        let pixels = cnx
            .getImageData(0, 0, cnx.canvas.width, cnx.canvas.height)
            .data;

        // convert grayscale
        let grayscaleImg = [];
        for (var i = 0; i < pixels.length; i += 4) {
            let lightness = parseInt((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
            //pixels[i] = lightness;
            //pixels[i + 1] = lightness;
            //pixels[i + 2] = lightness;
            grayscaleImg.push(lightness / 255);
        }

        // reshape pixels(tensor1d:85*40) -> image(width:85,height:40)
        let image = []
        while (grayscaleImg.length) image.push(grayscaleImg.splice(0, 85));

        // split char (pixel)
        let charDataList = [[], [], [], []];
        image.forEach((imagePixelLine) => {
            charDataList.forEach((charPixel) => {
                charPixel.push(imagePixelLine.splice(0, 21));
            })
        });

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
            let a = await window.model
                .predict(tf.tensor2d(charDataList[i], [40, 21]).reshape([1, 40, 21, 1]))
                .data();
            captchaCode += charResult[maxIndex(a)];
        }
        callback(captchaCode, cnv.toDataURL())

    };

    if (captchaImageEl.complete)
        captchaImageIng()
    else
        captchaImageEl.onload = captchaImageIng()
}


// -----run-----

(async () => await main())()






