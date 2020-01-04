const saw = v => v - Math.floor(v);
var car_ofs = 0;
var mod_ofs = 0;

class vvvfOscillator extends AudioWorkletProcessor {
    static get parameterDescriptors(){
        return[
            {
                name: 'voltage',
                defaultValue: 0,
                max: 100,
                min: 0,
                automationRate: 'a-rate'
            },
            {
                name: 'car_freq',
                defaultValue: 600,
                min: 1
            },
            {
                name: 'mod_freq',
                defaultValue: 60,
                min: 1,
                max: 100
            }
        ];
    }
    constructor(){
        super();

        this.port.onmessage = event => {
            if(event.data.voltage){
                this.voltage = event.data.voltage;
            }
            if(event.data.car_freq){
                this.car_freq = event.data.car_freq;
            }
            if(event.data.modfreq){
                this.modfreq = event.data.modfreq;
            }
        }
        this.port.start();
    }
    process(inputs, outputs, parameters){
        const out = outputs[0][0];
        const outlen = out.length;
        for (let x = 0; x < outlen; x++){
            const voltage = parameters.voltage[0] / 100;
            const car_clk = (parameters.car_freq[0] * x) / sampleRate;
            const mod_clk = (parameters.mod_freq[0] * x) / sampleRate;

            const car_tri = [];
            car_tri[x] = 2 * Math.abs(saw((car_ofs + car_clk)) - 1 / 2) ;

            const mod_sin = [[],[],[]];
            mod_sin[0][x] = (Math.sin((mod_ofs + mod_clk) * 2 * Math.PI) + 1) / 2 * voltage;
            mod_sin[1][x] = (Math.sin(2 * Math.PI / 3 + (mod_ofs + mod_clk) * 2 * Math.PI) + 1) / 2 * voltage;
            mod_sin[2][x] = (Math.sin(4 * Math.PI / 3 + (mod_ofs + mod_clk) * 2 * Math.PI) + 1) / 2 * voltage;

            const pls = [[],[],[]];
            pls[0][x] = (car_tri[x] < mod_sin[0][x]) ? 1 : 0;
            pls[1][x] = (car_tri[x] < mod_sin[1][x]) ? 1 : 0;
            pls[2][x] = (car_tri[x] < mod_sin[2][x]) ? 1 : 0;

            out[x] = pls[0][x] - pls[1][x] * 2 + pls[2][x];
        }
        car_ofs += (parameters.car_freq[0] * (outlen)) / sampleRate;
        car_ofs %= 1;
        mod_ofs += (parameters.mod_freq[0] * (outlen)) / sampleRate;
        mod_ofs %= 1;

        return true;
    }
}

registerProcessor("vvvf-oscillator", vvvfOscillator);