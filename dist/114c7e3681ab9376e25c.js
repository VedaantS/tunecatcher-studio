!function(){"use strict";const e=new class{enabled=!0;log(...e){this.enabled&&console.log(...e)}warn(...e){this.enabled&&console.warn(...e)}error(...e){this.enabled&&console.error(...e)}};e.enabled=!1;class t{samples={};addSample(e,t,s,n,a){for(let i=n[0];i<=n[1];i++)void 0===this.samples[t]&&(this.samples[t]={}),void 0===this.samples[t][s]&&(this.samples[t][s]={}),void 0===this.samples[t][s][i]&&(this.samples[t][s][i]=[]),this.samples[t][s][i].push({...e,velRange:a})}getSamples(e,t,s,n){const a=this.samples?.[e]?.[t]?.[s];return a?.filter((e=>n>=e.velRange[0]&&n<=e.velRange[1]))??[]}}var s;!function(){function e(){this.data=[],this.position=0}Object.defineProperty(e.prototype,"length",{get:function(){return this.data.length},enumerable:!1,configurable:!0}),e.prototype.writeByte=function(e){this.data.push(e),this.position++},e.prototype.writeStr=function(e){this.writeBytes(function(e){for(var t=[],s=0;s<e.length;s++)t.push(e.charCodeAt(s));return t}(e))},e.prototype.writeInt32=function(e){this.writeByte(e>>24&255),this.writeByte(e>>16&255),this.writeByte(e>>8&255),this.writeByte(255&e)},e.prototype.writeInt16=function(e){this.writeByte(e>>8&255),this.writeByte(255&e)},e.prototype.writeBytes=function(e){var t=this;e.forEach((function(e){return t.writeByte(e)}))},e.prototype.writeChunk=function(t,s){this.writeStr(t);var n=new e;s(n),this.writeInt32(n.length),this.writeBytes(n.data)},e.prototype.toBytes=function(){return new Uint8Array(this.data)}}();class n{processor;scheduledEvents=[];currentEvents=[];rpnEvents={};bankSelectMSB={};constructor(e){this.processor=e}get currentFrame(){return this.processor.currentFrame}addEvent(t){e.log(t),"delayTime"in t?function(e,t,s){let n,a=0,i=e.length;for(;a<i;)n=a+i>>>1,e[n][s]<t[s]?a=n+1:i=n;e.splice(a,0,t)}(this.scheduledEvents,{...t,scheduledFrame:this.currentFrame+t.delayTime},"scheduledFrame"):this.handleImmediateEvent(t)}processScheduledEvents(){if(0!==this.scheduledEvents.length){for(;;){const e=this.scheduledEvents[0];if(void 0===e||e.scheduledFrame>this.currentFrame)break;this.scheduledEvents.shift(),this.currentEvents.push(e)}for(;;){const e=this.currentEvents.pop();if(void 0===e)break;this.handleDelayableEvent(e.midi)}}}handleImmediateEvent(e){"loadSample"===e.type&&this.processor.loadSample(e.sample,e.bank,e.instrument,e.keyRange,e.velRange)}handleDelayableEvent(t){if(e.log("handle delayable event",t),"channel"===t.type)switch(t.subtype){case"noteOn":this.processor.noteOn(t.channel,t.noteNumber,t.velocity);break;case"noteOff":this.processor.noteOff(t.channel,t.noteNumber);break;case"pitchBend":this.processor.pitchBend(t.channel,t.value);break;case"programChange":this.processor.programChange(t.channel,t.value);break;case"controller":switch(t.controllerType){case 99:case 98:delete this.rpnEvents[t.channel];break;case 101:127===t.value?delete this.rpnEvents[t.channel]:this.rpnEvents[t.channel]={...this.rpnEvents[t.channel],rpnMSB:t};break;case 100:127===t.value?delete this.rpnEvents[t.channel]:this.rpnEvents[t.channel]={...this.rpnEvents[t.channel],rpnLSB:t};break;case 6:{const e={...this.rpnEvents[t.channel],dataMSB:t};this.rpnEvents[t.channel]=e,0===e.rpnLSB?.value&&this.processor.setPitchBendSensitivity(t.channel,e.dataMSB.value);break}case 38:this.rpnEvents[t.channel]={...this.rpnEvents[t.channel],dataLSB:t};break;case 7:this.processor.setMainVolume(t.channel,t.value);break;case 11:this.processor.expression(t.channel,t.value);break;case 120:this.removeScheduledEvents(t.channel),this.processor.allSoundsOff(t.channel);break;case 123:this.processor.allNotesOff(t.channel);break;case 64:this.processor.hold(t.channel,t.value);break;case 10:this.processor.setPan(t.channel,t.value);break;case 1:this.processor.modulation(t.channel,t.value);break;case 0:this.bankSelectMSB[t.channel]=t.value;break;case 32:{const e=this.bankSelectMSB[t.channel];if(void 0!==e){const s=(e<<7)+t.value;this.processor.bankSelect(t.channel,s)}break}case 121:this.processor.resetChannel(t.channel)}}}removeScheduledEvents(e){this.scheduledEvents=this.scheduledEvents.filter((t=>t.midi.channel!==e)),this.currentEvents=this.currentEvents.filter((t=>t.midi.channel!==e))}}!function(e){e[e.attack=0]="attack",e[e.decay=1]="decay",e[e.sustain=2]="sustain",e[e.release=3]="release",e[e.forceStop=4]="forceStop",e[e.stopped=5]="stopped"}(s||(s={}));class a{parameter;phase=s.attack;lastAmplitude=0;sampleRate;constructor(e,t){this.parameter=e,this.sampleRate=t}noteOn(){this.phase=s.attack}noteOff(){this.phase!==s.forceStop&&(this.phase=s.release)}forceStop(){this.phase=s.forceStop}getAmplitude(e){const{attackTime:t,decayTime:n,sustainLevel:a,releaseTime:i}=this.parameter,{sampleRate:l}=this;switch(this.phase){case s.attack:{const n=1/(t*l)*e,a=this.lastAmplitude+n;return a>=1?(this.phase=s.decay,this.lastAmplitude=1,1):(this.lastAmplitude=a,a)}case s.decay:{const t=1/(n*l)*e,i=this.lastAmplitude-t;return i<=a?a<=0?(this.phase=s.stopped,this.lastAmplitude=0,0):(this.phase=s.sustain,this.lastAmplitude=a,a):(this.lastAmplitude=i,i)}case s.sustain:return a;case s.release:{const t=1/(i*l)*e,n=this.lastAmplitude-t;return n<=0?(this.phase=s.stopped,this.lastAmplitude=0,0):(this.lastAmplitude=n,n)}case s.forceStop:{const t=1/(.1*l)*e,n=this.lastAmplitude-t;return n<=0?(this.phase=s.stopped,this.lastAmplitude=0,0):(this.lastAmplitude=n,n)}case s.stopped:return 0}}get isPlaying(){return this.phase!==s.stopped}}class i{frequency=5;phase=0;sampleRate;constructor(e){this.sampleRate=e}getValue(e){const t=this.phase;return this.phase+=2*Math.PI*this.frequency/this.sampleRate*e,Math.sin(t)}}class l{sample;sampleIndex=0;_isPlaying=!1;_isNoteOff=!1;baseSpeed=1;envelope;pitchLFO;sampleRate;speed=1;velocity=1;volume=1;modulation=0;modulationDepthRange=50;pan=0;isHold=!1;constructor(e,t){this.sample=e,this.sampleRate=t,this.envelope=new a(e.amplitudeEnvelope,t),this.pitchLFO=new i(t)}noteOn(e,t){this.velocity=t,this._isPlaying=!0,this.sampleIndex=this.sample.sampleStart,this.baseSpeed=Math.pow(2,(e-this.sample.pitch)/12*this.sample.scaleTuning),this.pitchLFO.frequency=5,this.envelope.noteOn()}noteOff(){this.envelope.noteOff(),this._isNoteOff=!0}forceStop(){this.envelope.forceStop()}process(e){if(!this._isPlaying)return;const t=this.baseSpeed*this.speed*this.sample.sampleRate/this.sampleRate,s=this.velocity*this.volume*this.sample.volume,n=(Math.min(1,Math.max(-1,this.pan+this.sample.pan))+1)*Math.PI/4,a=Math.cos(n),i=Math.sin(n),l=this.envelope.getAmplitude(e[0].length),o=l*s*a,r=l*s*i,h=t*(1+this.pitchLFO.getValue(e[0].length)*this.modulation*(this.modulationDepthRange/1200));for(let t=0;t<e[0].length;++t){const s=Math.floor(this.sampleIndex),n=this.sampleIndex+h;let a=null;null!==this.sample.loop&&n>=this.sample.loop.end&&(a=this.sample.loop.start+(n-Math.floor(n)));const i=null!==a?Math.floor(a):Math.min(s+1,this.sample.sampleEnd-1),l=this.sample.buffer[s],c=l+(this.sample.buffer[i]-l)*(this.sampleIndex-s);if(e[0][t]+=c*o,e[1][t]+=c*r,this.sampleIndex=a??n,this.sampleIndex>=this.sample.sampleEnd){this._isPlaying=!1;break}}}get isPlaying(){return this._isPlaying&&this.envelope.isPlaying}get isNoteOff(){return this._isNoteOff}get exclusiveClass(){return this.sample.exclusiveClass}}class o{sampleTable=new t;channels={};eventHandler;sampleRate;getCurrentFrame;constructor(e,t){this.eventHandler=new n(this),this.sampleRate=e,this.getCurrentFrame=t}get currentFrame(){return this.getCurrentFrame()}getSamples(e,t,s){const n=this.getChannelState(e),a=9===e?128:n.bank;return this.sampleTable.getSamples(a,n.instrument,t,s)}loadSample(e,t,s,n,a){const i={...e,buffer:new Float32Array(e.buffer)};this.sampleTable.addSample(i,t,s,n,a)}addEvent(e){this.eventHandler.addEvent(e)}noteOn(t,s,n){const a=this.getChannelState(t),i=this.getSamples(t,s,n);if(0!==i.length)for(const e of i){const t=new l(e,this.sampleRate),i=n/128;if(t.noteOn(s,i),void 0===a.oscillators[s]&&(a.oscillators[s]=[]),void 0!==e.exclusiveClass)for(const t in a.oscillators)for(const s of a.oscillators[t])s.exclusiveClass===e.exclusiveClass&&s.forceStop();a.oscillators[s].push(t)}else e.warn(`There is no sample for noteNumber ${s} in instrument ${a.instrument} in bank ${a.bank}`)}noteOff(e,t){const s=this.getChannelState(e);if(void 0!==s.oscillators[t])for(const e of s.oscillators[t])e.isNoteOff||(s.hold?e.isHold=!0:e.noteOff())}pitchBend(e,t){const s=this.getChannelState(e);s.pitchBend=(t/8192-1)*s.pitchBendSensitivity}programChange(e,t){this.getChannelState(e).instrument=t}setPitchBendSensitivity(e,t){this.getChannelState(e).pitchBendSensitivity=t}setMainVolume(e,t){this.getChannelState(e).volume=t/128}expression(e,t){this.getChannelState(e).expression=t/128}allSoundsOff(e){const t=this.getChannelState(e);for(const e in t.oscillators)for(const s of t.oscillators[e])s.forceStop()}allNotesOff(e){const t=this.getChannelState(e);for(const e in t.oscillators)for(const s of t.oscillators[e])s.noteOff()}hold(e,t){const s=t>=64,n=this.getChannelState(e);if(n.hold=s,!s)for(const e in n.oscillators)for(const t of n.oscillators[e])t.isHold&&t.noteOff()}setPan(e,t){this.getChannelState(e).pan=2*(t/127-.5)}bankSelect(e,t){this.getChannelState(e).bank=t}modulation(e,t){this.getChannelState(e).modulation=t/128}resetChannel(e){delete this.channels[e]}getChannelState(e){const t=this.channels[e];if(void 0!==t)return t;const s={volume:1,bank:0,instrument:0,pitchBend:0,pitchBendSensitivity:2,oscillators:{},expression:1,pan:0,modulation:0,hold:!1};return this.channels[e]=s,s}process(e){this.eventHandler.processScheduledEvents();for(const t in this.channels){const s=this.channels[t];for(let t in s.oscillators)s.oscillators[t]=s.oscillators[t].filter((t=>(t.speed=Math.pow(2,s.pitchBend/12),t.volume=s.volume*s.expression,t.pan=s.pan,t.modulation=s.modulation,t.process([e[0],e[1]]),!!t.isPlaying)))}for(let t=0;t<e[0].length;++t)e[0][t]*=.3,e[1][t]*=.3}}class r extends AudioWorkletProcessor{synth=new o(sampleRate,(()=>currentFrame));constructor(){super(),this.port.onmessage=e=>{this.synth.addEvent(e.data)}}process(e,t){return this.synth.process(t[0]),!0}}registerProcessor("synth-processor",r)}();