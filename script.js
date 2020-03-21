var modLvl = 0;
var carFrq = 600;
var modFrq = 0;

var mlvDiff = 0;
var cfDiff = 0;
var mfDiff = 0;

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

async function setParams(){
    while(true){
        if(mlvDiff != 0 || cfDiff != 0 || mfDiff != 0){

            if(Math.abs(mlvDiff) > 3){
                mlvDiff = 0;
            }
            if(Math.abs(cfDiff) > 3){
                cfDiff = 0;
            }
            if(Math.abs(mfDiff) > 3){
                mfDiff = 0;
            }

            document.getElementById("mlv_val").innerHTML = modLvl;
            document.getElementById("cf_val").innerHTML = carFrq;
            document.getElementById("mf_val").innerHTML = modFrq;

            if(modLvl <= 100 && modLvl >= 0){
                modLvl = Math.floor((modLvl + mlvDiff) * 10) / 10;
            }
            if(modLvl > 100){
                modLvl = 100;
                mlvDiff = 0;
            }
            if(modLvl < 0){
                modLvl = 0;
                mlvDiff = 0;
            }
    
            if(carFrq <= 8000 && carFrq >= 0){
                carFrq = Math.floor((carFrq + cfDiff) * 10) / 10;
            }
            if(carFrq > 8000){
                carFrq = 8000;
                cfDiff = 0;
            }
            if(carFrq < 0){
                carFrq = 0;
                cfDiff = 0;
            }

            if(modFrq <= 100 && modFrq >= 0){
                modFrq = Math.floor((modFrq + mfDiff) * 10) / 10;
            }
            if(modFrq > 100){
                modFrq = 100;
                mfDiff = 0;
            }
            if(modFrq < 0){
                modFrq = 0;
                mfDiff = 0;
            }

        }
        
        await sleep(100);
    }
};

setParams();

async function sendMsg(osc){
    while(true){
        if(mlvDiff != 0 || cfDiff != 0 || mfDiff != 0){
            osc.parameters.get('voltage').value += mlvDiff;
            osc.parameters.get('car_freq').value += cfDiff;
            osc.parameters.get('mod_freq').value += mfDiff;
        }
        await sleep(100);
    }
};

const context = new AudioContext();

context.audioWorklet.addModule("inverter.js").then(() => {
    const osc = new AudioWorkletNode(context, 'vvvf-oscillator');
    osc.connect(context.destination);
    osc.parameters.get('random_mod').value = 50;
    sendMsg(osc);
});

function buttonClick(type, val){
    if(type == 'mlv'){
        mlvDiff += (Math.abs(mlvDiff) < 3) ? Math.floor(val * 10) / 10 : 0;
    }else if(type == 'cf'){
        cfDiff += (Math.abs(cfDiff) < 3) ? Math.floor(val * 10) / 10 : 0;
    }else if(type == 'mf'){
        mfDiff += (Math.abs(mfDiff) < 3) ? Math.floor(val * 10) / 10 : 0;
    }
}

function resumeAudio(){
    context.resume();
}